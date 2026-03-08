import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

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
			t.deadline
		from tasks t
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
			descriptionPreview: description.length > 140 ? `${description.slice(0, 140)}...` : description,
			verificationType: String(row.verification_type) as PublicTaskCard['verificationType']
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
