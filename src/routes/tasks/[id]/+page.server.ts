import { error, fail } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { getTaskWorkflowData } from '$lib/server/tasks/workflow';
import { findAppUserIdByEmail, getOrCreateAppUserId } from '$lib/server/tasks/users';
import type { Actions, PageServerLoad } from './$types';

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

	return {
		task: workflow.task,
		proofs: workflow.proofs,
		decisions: workflow.decisions,
		isLoggedIn: Boolean(locals.user),
		isPoster,
		isAssignedWorker,
		canViewExactAddress
	};
};

export const actions: Actions = {
	submitProof: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to submit proof.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'Worker');
		if (appUserId === workflow.creatorId) {
			return fail(403, { message: 'Task posters cannot submit completion proof.' });
		}

		const formData = await request.formData();
		const proofType = formData.get('proof_type')?.toString().trim() ?? '';
		const proofUrl = formData.get('proof_url')?.toString().trim() ?? '';
		const note = formData.get('note')?.toString().trim() ?? '';

		if (!['photo', 'video'].includes(proofType)) {
			return fail(400, { message: 'Invalid proof type.' });
		}
		if (!proofUrl) {
			return fail(400, { message: 'Proof URL is required.' });
		}
		if (workflow.task.verificationType !== 'both' && workflow.task.verificationType !== proofType) {
			return fail(400, { message: `This task requires ${workflow.task.verificationType} proof.` });
		}

		await db.execute(sql`
			insert into task_proofs (task_id, submitted_by_user_id, proof_type, proof_url, note)
			values (${taskId}, ${appUserId}, ${proofType}, ${proofUrl}, ${note || null})
		`);

		return { success: true, message: 'Proof submitted successfully.' };
	},

	approveProof: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to approve proof.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await findAppUserIdByEmail(locals.user.email);
		if (!appUserId || appUserId !== workflow.creatorId) {
			return fail(403, { message: 'Only the task poster can approve proof.' });
		}

		const formData = await request.formData();
		const proofIdRaw = formData.get('proof_id')?.toString() ?? '';
		const proofId = proofIdRaw ? Number(proofIdRaw) : null;
		if (proofId && !workflow.proofs.some((proof) => proof.id === proofId)) {
			return fail(400, { message: 'Selected proof was not found for this task.' });
		}

		await db.execute(sql`
			insert into verification_decisions (task_id, proof_id, decided_by_user_id, decision, reason)
			values (${taskId}, ${proofId}, ${appUserId}, 'approved', null)
		`);

		await db.execute(sql`
			update tasks
			set status = 'completed', completed_at = now()
			where id = ${taskId}
		`);

		return { success: true, message: 'Proof approved. Task marked as completed.' };
	},

	disputeProof: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to dispute proof.' });
		}

		const workflow = await getTaskWorkflowData(taskId);
		if (!workflow) {
			return fail(404, { message: 'Task not found.' });
		}

		const appUserId = await findAppUserIdByEmail(locals.user.email);
		if (!appUserId || appUserId !== workflow.creatorId) {
			return fail(403, { message: 'Only the task poster can dispute proof.' });
		}

		const formData = await request.formData();
		const proofIdRaw = formData.get('proof_id')?.toString() ?? '';
		const proofId = proofIdRaw ? Number(proofIdRaw) : null;
		const reason = formData.get('reason')?.toString().trim() ?? '';
		if (proofId && !workflow.proofs.some((proof) => proof.id === proofId)) {
			return fail(400, { message: 'Selected proof was not found for this task.' });
		}

		if (!reason) {
			return fail(400, { message: 'Dispute reason is required.' });
		}

		await db.execute(sql`
			insert into verification_decisions (task_id, proof_id, decided_by_user_id, decision, reason)
			values (${taskId}, ${proofId}, ${appUserId}, 'disputed', ${reason})
		`);

		return { success: true, message: 'Dispute submitted.' };
	}
};
