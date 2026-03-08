import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

function toRows<T>(result: unknown): T[] {
	if (Array.isArray(result)) return result as T[];
	if (result && typeof result === 'object' && 'rows' in result) {
		return ((result as { rows?: T[] }).rows ?? []) as T[];
	}
	return [];
}

export async function findAppUserIdByEmail(email: string): Promise<number | null> {
	const existing = await db.execute(sql`select id from users where email = ${email} limit 1`);
	const rows = toRows<Record<string, unknown>>(existing);
	if (rows.length === 0) return null;
	return Number(rows[0].id);
}

export async function getOrCreateAppUserId(email: string, name: string): Promise<number> {
	const existingId = await findAppUserIdByEmail(email);
	if (existingId) return existingId;

	const created = await db.execute(sql`
		insert into users (email, password_hash, name, role)
		values (${email}, ${'placeholder_auth_managed'}, ${name}, 'poster')
		returning id
	`);
	const createdRows = toRows<Record<string, unknown>>(created);
	return Number(createdRows[0].id);
}
