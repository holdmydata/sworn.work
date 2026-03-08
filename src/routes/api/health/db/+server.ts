import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export async function GET() {
	try {
		await db.execute(sql`select 1 as ok`);
		return json({ ok: true, database: 'reachable', timestamp: new Date().toISOString() });
	} catch (error) {
		return json(
			{
				ok: false,
				database: 'unreachable',
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 503 }
		);
	}
}
