import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toRows } from '$lib/server/db/result';
import { findAppUserIdByEmail } from '$lib/server/tasks/users';

type DashboardQuest = {
	id: number;
	title: string;
	category: string;
	budgetCents: number;
	city: string;
	state: string;
	status: string;
	createdAt: string;
	descriptionPreview: string;
};

function mapRows(result: unknown): DashboardQuest[] {
	const rows = toRows<Record<string, unknown>>(result);
	return rows.map((row) => ({
		id: Number(row.id),
		title: String(row.title ?? 'Untitled task'),
		category: String(row.category ?? 'General'),
		budgetCents: Number(row.budget ?? 0),
		city: String(row.city ?? ''),
		state: String(row.state ?? ''),
		status: String(row.status ?? 'open'),
		createdAt: new Date(String(row.created_at ?? new Date().toISOString())).toISOString(),
		descriptionPreview: String(row.description_preview ?? '')
	}));
}

function sampleData() {
	const now = new Date().toISOString();
	return {
		activeQuests: [
			{
				id: -1,
				title: 'Sample: Furniture Move Support',
				category: 'Home & yard',
				budgetCents: 9000,
				city: 'Fayetteville',
				state: 'AR',
				status: 'in_progress',
				createdAt: now,
				descriptionPreview: 'This placeholder appears until user-task relationships are fully wired.'
			}
		],
		awaitingConfirmationQuests: [
			{
				id: -2,
				title: 'Sample: Proof Submitted Task',
				category: 'Errands & support',
				budgetCents: 6500,
				city: 'Springdale',
				state: 'AR',
				status: 'in_progress',
				createdAt: now,
				descriptionPreview: 'Awaiting poster confirmation placeholder for MVP dashboard state.'
			}
		],
		completedQuests: [
			{
				id: -3,
				title: 'Sample: Completed Yard Cleanup',
				category: 'Home & yard',
				budgetCents: 12000,
				city: 'Rogers',
				state: 'AR',
				status: 'completed',
				createdAt: now,
				descriptionPreview: 'Completed quest placeholder for dashboard visualization.'
			}
		],
		usesFallback: true
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.email) {
		return {
			activeQuests: [],
			awaitingConfirmationQuests: [],
			completedQuests: [],
			usesFallback: false
		};
	}

	const appUserId = await findAppUserIdByEmail(locals.user.email);
	if (!appUserId) {
		return sampleData();
	}

	// NOTE: This is an MVP relationship query based on accepted_bid_id -> bids.worker_id.
	// As dashboard ownership/history matures, this should move into dedicated task-workflow queries.
	const activeResult = await db.execute(sql`
		select
			t.id,
			t.title,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.status,
			t.created_at,
			left(t.description, 140) as description_preview
		from tasks t
		inner join bids b on b.id = t.accepted_bid_id
		where b.worker_id = ${appUserId}
			and t.status = 'in_progress'
			and not exists (
				select 1
				from task_proofs tp
				where tp.task_id = t.id and tp.submitted_by_user_id = ${appUserId}
			)
		order by t.created_at desc
		limit 24
	`);

	const awaitingResult = await db.execute(sql`
		select
			t.id,
			t.title,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.status,
			t.created_at,
			left(t.description, 140) as description_preview
		from tasks t
		inner join bids b on b.id = t.accepted_bid_id
		where b.worker_id = ${appUserId}
			and t.status = 'in_progress'
			and exists (
				select 1
				from task_proofs tp
				where tp.task_id = t.id and tp.submitted_by_user_id = ${appUserId}
			)
			and not exists (
				select 1
				from verification_decisions vd
				where vd.task_id = t.id and vd.decision = 'approved'
			)
		order by t.created_at desc
		limit 24
	`);

	const completedResult = await db.execute(sql`
		select
			t.id,
			t.title,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.status,
			t.created_at,
			left(t.description, 140) as description_preview
		from tasks t
		inner join bids b on b.id = t.accepted_bid_id
		where b.worker_id = ${appUserId}
			and t.status = 'completed'
		order by t.created_at desc
		limit 24
	`);

	const activeQuests = mapRows(activeResult);
	const awaitingConfirmationQuests = mapRows(awaitingResult);
	const completedQuests = mapRows(completedResult);

	if (activeQuests.length === 0 && awaitingConfirmationQuests.length === 0 && completedQuests.length === 0) {
		return sampleData();
	}

	return {
		activeQuests,
		awaitingConfirmationQuests,
		completedQuests,
		usesFallback: false
	};
};
