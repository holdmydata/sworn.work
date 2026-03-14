import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { levelTitleFor } from '$lib/server/progression';

function toRows<T>(result: unknown): T[] {
	if (Array.isArray(result)) return result as T[];
	if (result && typeof result === 'object' && 'rows' in result) {
		return ((result as { rows?: T[] }).rows ?? []) as T[];
	}
	return [];
}

export type PublicTaskCard = {
	id: number;
	title: string;
	category: string;
	budgetCents: number;
	city: string;
	state: string;
	status: string;
	createdAt: string;
	deadline: string | null;
	descriptionPreview: string;
	verificationType: 'photo' | 'video' | 'both';
	posterName: string;
	posterAvatarUrl: string | null;
	posterAverageRating: number | null;
	posterLevel: number;
	posterLevelTitle: string | null;
	posterCompletedQuests: number;
};

export type TaskDetail = {
	id: number;
	title: string;
	description: string;
	category: string;
	budgetCents: number;
	city: string;
	state: string;
	addressLine1: string | null;
	addressLine2: string | null;
	postalCode: string | null;
	verificationType: 'photo' | 'video' | 'both';
	status: string;
	createdAt: string;
	deadline: string | null;
	creatorName: string;
};

export async function listPublicOpenTasks(limit = 24): Promise<PublicTaskCard[]> {
	const result = await db.execute(sql`
		select
			t.id,
			t.title,
			t.description,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.verification_type,
			t.status,
			t.created_at,
			t.deadline,
			u.name as creator_name,
			u.avatar_url as creator_avatar_url,
			coalesce(us.level, 1) as poster_level,
			coalesce(us.quests_completed, 0) as poster_completed_quests,
			case
				when coalesce(us.reviews_received, 0) > 0 then us.average_rating
				else null
			end as poster_average_rating
		from tasks t
		inner join users u on u.id = t.creator_id
		left join user_stats us on us.user_id = u.id
		where t.status = 'open'
		order by t.created_at desc
		limit ${limit}
	`);

	const rows = toRows<Record<string, unknown>>(result);
	return rows.map((row) => {
		const description = String(row.description ?? '');
		return {
			id: Number(row.id),
			title: String(row.title),
			category: String(row.category),
			budgetCents: Number(row.budget),
			city: String(row.city),
			state: String(row.state),
			status: String(row.status),
			createdAt: new Date(String(row.created_at)).toISOString(),
			deadline: row.deadline ? new Date(String(row.deadline)).toISOString() : null,
			descriptionPreview:
				description.length > 140 ? `${description.slice(0, 140)}...` : description,
			verificationType: String(row.verification_type) as PublicTaskCard['verificationType'],
			posterName: String(row.creator_name ?? 'Member'),
			posterAvatarUrl: row.creator_avatar_url ? String(row.creator_avatar_url) : null,
			posterAverageRating:
				row.poster_average_rating === null || row.poster_average_rating === undefined
					? null
					: Number(row.poster_average_rating),
			posterLevel: Number(row.poster_level ?? 1),
			posterLevelTitle: levelTitleFor(Number(row.poster_level ?? 1)),
			posterCompletedQuests: Number(row.poster_completed_quests ?? 0)
		};
	});
}

export async function getTaskDetail(taskId: number): Promise<TaskDetail | null> {
	const result = await db.execute(sql`
		select
			t.id,
			t.title,
			t.description,
			t.category,
			t.budget,
			t.city,
			t.state,
			t.address_line1,
			t.address_line2,
			t.postal_code,
			t.verification_type,
			t.status,
			t.created_at,
			t.deadline,
			u.name as creator_name
		from tasks t
		inner join users u on u.id = t.creator_id
		where t.id = ${taskId}
		limit 1
	`);

	const rows = toRows<Record<string, unknown>>(result);
	if (rows.length === 0) {
		return null;
	}

	const row = rows[0];
	return {
		id: Number(row.id),
		title: String(row.title),
		description: String(row.description),
		category: String(row.category),
		budgetCents: Number(row.budget),
		city: String(row.city),
		state: String(row.state),
		addressLine1: row.address_line1 ? String(row.address_line1) : null,
		addressLine2: row.address_line2 ? String(row.address_line2) : null,
		postalCode: row.postal_code ? String(row.postal_code) : null,
		verificationType: String(row.verification_type) as TaskDetail['verificationType'],
		status: String(row.status),
		createdAt: new Date(String(row.created_at)).toISOString(),
		deadline: row.deadline ? new Date(String(row.deadline)).toISOString() : null,
		creatorName: String(row.creator_name)
	};
}
