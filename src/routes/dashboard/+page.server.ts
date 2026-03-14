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
	acceptedBidId: number | null;
	postedByName: string;
	acceptedByName: string | null;
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
		acceptedBidId: row.accepted_bid_id ? Number(row.accepted_bid_id) : null,
		postedByName: String(row.posted_by_name ?? 'Poster'),
		acceptedByName: row.accepted_by_name ? String(row.accepted_by_name) : null,
		createdAt: new Date(String(row.created_at ?? new Date().toISOString())).toISOString(),
		descriptionPreview: String(row.description_preview ?? '')
	}));
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.email) {
		return {
			myPostedTasks: [],
			myActiveQuests: [],
			completedQuests: []
		};
	}

	const appUserId = await findAppUserIdByEmail(locals.user.email);
	if (!appUserId) {
		return {
			myPostedTasks: [],
			myActiveQuests: [],
			completedQuests: []
		};
	}

	const postedResult = await db.execute(sql`
		select
			t.id,
			t.title,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.status,
			t.accepted_bid_id,
			poster.name as posted_by_name,
			worker.name as accepted_by_name,
			t.created_at,
			left(t.description, 140) as description_preview
		from tasks t
		inner join users poster on poster.id = t.creator_id
		left join bids ab on ab.id = t.accepted_bid_id
		left join users worker on worker.id = ab.worker_id
		where t.creator_id = ${appUserId}
			and t.status::text in ('open', 'accepted', 'in_progress')
		order by t.created_at desc
		limit 24
	`);

	const acceptedResult = await db.execute(sql`
		select
			t.id,
			t.title,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.status,
			t.accepted_bid_id,
			poster.name as posted_by_name,
			worker.name as accepted_by_name,
			t.created_at,
			left(t.description, 140) as description_preview
		from tasks t
		inner join bids b on b.id = t.accepted_bid_id
		inner join users poster on poster.id = t.creator_id
		left join users worker on worker.id = b.worker_id
		where b.worker_id = ${appUserId}
			and t.accepted_bid_id is not null
			and t.status <> 'completed'
			and t.status <> 'cancelled'
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
			t.accepted_bid_id,
			poster.name as posted_by_name,
			worker.name as accepted_by_name,
			t.created_at,
			left(t.description, 140) as description_preview
		from tasks t
		inner join bids b on b.id = t.accepted_bid_id
		inner join users poster on poster.id = t.creator_id
		left join users worker on worker.id = b.worker_id
		where b.worker_id = ${appUserId}
			and t.status = 'completed'
		order by t.created_at desc
		limit 24
	`);

	const postedTasks = mapRows(postedResult);
	const acceptedTasks = mapRows(acceptedResult);
	const completedTasks = mapRows(completedResult);

	// Completion attribution currently comes from accepted worker relationship (accepted_bid_id -> bids.worker_id).
	const myPostedTasks = postedTasks;
	const myActiveQuests = acceptedTasks;
	const completedQuests = completedTasks;

	return {
		myPostedTasks,
		myActiveQuests,
		completedQuests
	};
};
