import { error, fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { toRows } from '$lib/server/db/result';
import { getTaskWorkflowData } from '$lib/server/tasks/workflow';
import { findAppUserIdByEmail, getOrCreateAppUserId } from '$lib/server/tasks/users';
import type { Actions, PageServerLoad } from './$types';

async function hasAcceptedTaskStatus(): Promise<boolean> {
	const result = await db.execute(sql`
		select exists (
			select 1
			from pg_enum e
			inner join pg_type t on t.oid = e.enumtypid
			where t.typname = 'task_status'
				and e.enumlabel = 'accepted'
		) as has_accepted
	`);
	const rows = toRows<Record<string, unknown>>(result);
	return Boolean(rows[0]?.has_accepted);
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const taskId = Number(params.id);

	if (!Number.isInteger(taskId) || taskId <= 0) {
		throw error(404, 'Task not found');
	}

	const workflow = await getTaskWorkflowData(taskId);
	if (!workflow) {
		throw error(404, 'Task not found');
	}

	let appUserId: number | null = null;
	if (locals.user?.email) {
		appUserId = await findAppUserIdByEmail(locals.user.email);
	}

	const isPoster = Boolean(appUserId && appUserId === workflow.creatorId);
	const isAssignedWorker = Boolean(appUserId && workflow.acceptedWorkerId && appUserId === workflow.acceptedWorkerId);
	const canViewExactAddress = isPoster || isAssignedWorker;
	const hasAcceptedWorker = Boolean(workflow.acceptedWorkerId);

	const reviewsResult = await db.execute(sql`
		select
			r.id,
			r.reviewer_id,
			r.reviewee_id,
			r.rating,
			r.comment,
			r.created_at,
			reviewer.name as reviewer_name,
			reviewee.name as reviewee_name
		from reviews r
		inner join users reviewer on reviewer.id = r.reviewer_id
		inner join users reviewee on reviewee.id = r.reviewee_id
		where r.task_id = ${taskId}
		order by r.created_at desc
	`);
	const reviewRows = toRows<Record<string, unknown>>(reviewsResult);
	const reviews = reviewRows.map((row) => ({
		id: Number(row.id),
		reviewerId: Number(row.reviewer_id),
		revieweeId: Number(row.reviewee_id),
		rating: Number(row.rating),
		comment: row.comment ? String(row.comment) : null,
		createdAt: new Date(String(row.created_at)).toISOString(),
		reviewerName: String(row.reviewer_name ?? 'Member'),
		revieweeName: String(row.reviewee_name ?? 'Member')
	}));

	const isCompleted = workflow.task.status === 'completed';
	const isParticipant = Boolean(appUserId && (isPoster || isAssignedWorker));
	const hasReviewedAlready = Boolean(appUserId && reviews.some((review) => review.reviewerId === appUserId));
	const canLeaveReview = Boolean(
		isCompleted && isParticipant && workflow.acceptedWorkerId && !hasReviewedAlready
	);
	const reviewTargetName = isPoster ? (workflow.acceptedWorkerName ?? 'Worker') : workflow.task.creatorName;

	return {
		task: workflow.task,
		proofs: workflow.proofs,
		decisions: workflow.decisions,
		creatorJoinedAt: workflow.creatorJoinedAt,
		acceptedWorkerName: workflow.acceptedWorkerName,
		acceptedWorkerJoinedAt: workflow.acceptedWorkerJoinedAt,
		isLoggedIn: Boolean(locals.user),
		isPoster,
		isAssignedWorker,
		hasAcceptedWorker,
		canViewExactAddress,
		reviews,
		canLeaveReview,
		reviewTargetName
	};
};

export const actions: Actions = {
	acceptQuest: async ({ params, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to accept quests.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'Worker');
		if (appUserId === workflow.creatorId) {
			return fail(403, { message: 'You cannot accept your own quest.' });
		}

		if (workflow.acceptedWorkerId || workflow.acceptedBidId || workflow.task.status !== 'open') {
			return fail(409, { message: 'This quest has already been accepted.' });
		}

		const insertedBidResult = await db.execute(sql`
			insert into bids (task_id, worker_id, proposed_price, message, status)
			values (${taskId}, ${appUserId}, ${workflow.task.budgetCents}, ${'Accepted from task detail'}, 'accepted')
			returning id
		`);
		const insertedBidRows = toRows<Record<string, unknown>>(insertedBidResult);
		if (insertedBidRows.length === 0) {
			return fail(500, { message: 'Could not create acceptance record. Please try again.' });
		}
		const acceptedBidId = Number(insertedBidRows[0].id);
		const nextStatus = (await hasAcceptedTaskStatus()) ? 'accepted' : 'in_progress';

		const updateTaskResult = await db.execute(sql`
			update tasks
			set accepted_bid_id = ${acceptedBidId}, status = ${nextStatus}
			where id = ${taskId}
				and accepted_bid_id is null
				and status = 'open'
			returning id
		`);
		const updateTaskRows = toRows<Record<string, unknown>>(updateTaskResult);
		if (updateTaskRows.length === 0) {
			await db.execute(sql`
				update bids
				set status = 'rejected'
				where id = ${acceptedBidId}
			`);
			return fail(409, { message: 'This quest was accepted by someone else just now.' });
		}

		throw redirect(303, '/dashboard');
	},

	startQuest: async ({ params, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to start this quest.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await findAppUserIdByEmail(locals.user.email);
		if (!appUserId || !workflow.acceptedWorkerId || appUserId !== workflow.acceptedWorkerId) {
			return fail(403, { message: 'Only the accepted worker can start this quest.' });
		}
		if (workflow.task.status !== 'accepted') {
			return fail(400, { message: 'This quest is not in accepted status.' });
		}

		await db.execute(sql`
			update tasks
			set status = 'in_progress'
			where id = ${taskId}
				and status::text = 'accepted'
		`);

		return { success: true, message: 'Quest started. You can now submit completion updates when finished.' };
	},

	submitProof: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to submit completion updates.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'Worker');
		if (appUserId === workflow.creatorId) {
			return fail(403, { message: 'Task posters cannot submit worker completion updates.' });
		}
		if (!workflow.acceptedWorkerId || appUserId !== workflow.acceptedWorkerId) {
			return fail(403, { message: 'Only the accepted worker can submit completion updates.' });
		}
		if (workflow.task.status !== 'in_progress') {
			return fail(400, { message: 'Completion updates can only be submitted while the task is in progress.' });
		}

		const formData = await request.formData();
		const attachmentType = formData.get('attachment_type')?.toString().trim() ?? '';
		const attachmentUrl = formData.get('attachment_url')?.toString().trim() ?? '';
		const note = formData.get('note')?.toString().trim() ?? '';

		if (!note) {
			return fail(400, { message: 'Completion note is required.' });
		}
		if (attachmentUrl && !['photo', 'video'].includes(attachmentType)) {
			return fail(400, { message: 'Invalid attachment type.' });
		}
		const proofType =
			attachmentUrl && (attachmentType === 'photo' || attachmentType === 'video')
				? attachmentType
				: workflow.task.verificationType === 'video'
					? 'video'
					: 'photo';
		if (attachmentUrl && workflow.task.verificationType !== 'both' && workflow.task.verificationType !== proofType) {
			return fail(400, { message: `This task expects ${workflow.task.verificationType} attachments.` });
		}
		const proofUrl = attachmentUrl || 'about:blank';

		await db.execute(sql`
			insert into task_proofs (task_id, submitted_by_user_id, proof_type, proof_url, note)
			values (${taskId}, ${appUserId}, ${proofType}, ${proofUrl}, ${note || null})
		`);

		return { success: true, message: 'Completion update submitted successfully.' };
	},

	approveProof: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to approve completion updates.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await findAppUserIdByEmail(locals.user.email);
		if (!appUserId || appUserId !== workflow.creatorId) {
			return fail(403, { message: 'Only the task poster can approve completion updates.' });
		}
		if (workflow.task.status !== 'in_progress') {
			return fail(400, { message: 'This task is not currently awaiting completion review.' });
		}
		if (workflow.proofs.length === 0) {
			return fail(400, { message: 'No completion updates have been submitted yet.' });
		}

		const formData = await request.formData();
		const proofIdRaw = formData.get('proof_id')?.toString() ?? '';
		const selectedProofId = proofIdRaw ? Number(proofIdRaw) : null;
		if (selectedProofId && !workflow.proofs.some((proof) => proof.id === selectedProofId)) {
			return fail(400, { message: 'Selected proof was not found for this task.' });
		}
		const resolvedProofId = selectedProofId ?? workflow.proofs[0]?.id ?? null;
		if (!resolvedProofId) {
			return fail(400, { message: 'No completion update could be selected for review.' });
		}

		await db.execute(sql`
			insert into verification_decisions (task_id, proof_id, decided_by_user_id, decision, reason)
			values (${taskId}, ${resolvedProofId}, ${appUserId}, 'approved', null)
		`);

		await db.execute(sql`
			update tasks
			set status = 'completed', completed_at = now()
			where id = ${taskId}
		`);

		return { success: true, message: 'Completion approved. Task marked as completed.' };
	},

	disputeProof: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to dispute completion updates.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await findAppUserIdByEmail(locals.user.email);
		if (!appUserId || appUserId !== workflow.creatorId) {
			return fail(403, { message: 'Only the task poster can dispute completion updates.' });
		}
		if (workflow.task.status !== 'in_progress') {
			return fail(400, { message: 'This task is not currently awaiting completion review.' });
		}
		if (workflow.proofs.length === 0) {
			return fail(400, { message: 'No completion updates have been submitted yet.' });
		}

		const formData = await request.formData();
		const proofIdRaw = formData.get('proof_id')?.toString() ?? '';
		const selectedProofId = proofIdRaw ? Number(proofIdRaw) : null;
		const reason = formData.get('reason')?.toString().trim() ?? '';
		if (selectedProofId && !workflow.proofs.some((proof) => proof.id === selectedProofId)) {
			return fail(400, { message: 'Selected proof was not found for this task.' });
		}
		const resolvedProofId = selectedProofId ?? workflow.proofs[0]?.id ?? null;
		if (!resolvedProofId) {
			return fail(400, { message: 'No completion update could be selected for review.' });
		}

		if (!reason) {
			return fail(400, { message: 'Dispute reason is required.' });
		}

		await db.execute(sql`
			insert into verification_decisions (task_id, proof_id, decided_by_user_id, decision, reason)
			values (${taskId}, ${resolvedProofId}, ${appUserId}, 'disputed', ${reason})
		`);

		return { success: true, message: 'Dispute submitted.' };
	},

	submitReview: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to leave a review.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}
		if (workflow.task.status !== 'completed') {
			return fail(400, { message: 'Reviews can only be submitted for completed tasks.' });
		}
		if (!workflow.acceptedWorkerId) {
			return fail(400, { message: 'This task has no accepted worker to review.' });
		}

		const appUserId = await findAppUserIdByEmail(locals.user.email);
		if (!appUserId) {
			return fail(403, { message: 'Only task participants can leave reviews.' });
		}

		let reviewedUserId: number | null = null;
		if (appUserId === workflow.creatorId) reviewedUserId = workflow.acceptedWorkerId;
		if (appUserId === workflow.acceptedWorkerId) reviewedUserId = workflow.creatorId;
		if (!reviewedUserId) {
			return fail(403, { message: 'Only task participants can leave reviews.' });
		}

		const existingReviewResult = await db.execute(sql`
			select id from reviews
			where task_id = ${taskId}
				and reviewer_id = ${appUserId}
			limit 1
		`);
		const existingReviewRows = toRows<Record<string, unknown>>(existingReviewResult);
		if (existingReviewRows.length > 0) {
			return fail(409, { message: 'You already submitted a review for this task.' });
		}

		const formData = await request.formData();
		const ratingRaw = formData.get('rating')?.toString() ?? '';
		const comment = formData.get('comment')?.toString().trim() ?? '';
		const rating = Number(ratingRaw);
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, { message: 'Rating must be between 1 and 5 stars.' });
		}
		if (comment.length > 280) {
			return fail(400, { message: 'Comment is too long (max 280 characters).' });
		}

		await db.execute(sql`
			insert into reviews (task_id, reviewer_id, reviewee_id, rating, comment)
			values (${taskId}, ${appUserId}, ${reviewedUserId}, ${rating}, ${comment || null})
		`);

		return { success: true, message: 'Thanks for your review.' };
	}
};
