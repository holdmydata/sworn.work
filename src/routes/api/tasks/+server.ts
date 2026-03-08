import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { getOrCreateAppUserId } from '$lib/server/tasks/users';
import { toRows } from '$lib/server/db/result';

export async function GET() {
	const result = await db.execute(sql`
		select id, title, category, budget, city, state, verification_type, status, created_at
		from tasks
		where status = 'open'
		order by created_at desc
		limit 50
	`);

	const rows = toRows<Record<string, unknown>>(result);
	return json({
		tasks: rows.map((r) => ({
			id: Number(r.id),
			title: String(r.title),
			category: String(r.category),
			budgetCents: Number(r.budget),
			city: String(r.city ?? ''),
			state: String(r.state ?? ''),
			verificationType: String(r.verification_type ?? 'photo'),
			status: String(r.status),
			createdAt: String(r.created_at)
		}))
	});
}

export async function POST({ request, locals }) {
	if (!locals.user?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid JSON body' }, { status: 400 });

	const title = String(body.title ?? '').trim();
	const description = String(body.description ?? '').trim();
	const category = String(body.category ?? '').trim();
	const city = String(body.city ?? '').trim();
	const state = String(body.state ?? '').trim().toUpperCase();
	const addressLine1 = String(body.addressLine1 ?? '').trim();
	const addressLine2 = String(body.addressLine2 ?? '').trim();
	const postalCode = String(body.postalCode ?? '').trim();
	const verificationType = String(body.verificationType ?? 'photo').trim();
	const budgetCents = Number(body.budgetCents ?? 0);

	if (!title || !description || !category || !city || !state || !addressLine1 || budgetCents <= 0) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}
	if (!['photo', 'video', 'both'].includes(verificationType)) {
		return json({ error: 'Invalid verificationType' }, { status: 400 });
	}

	const appUserId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'Poster');
	const publicLocation = `${city}, ${state}`;

	const inserted = await db.execute(sql`
		insert into tasks (
			creator_id, title, description, category, budget, location,
			city, state, address_line1, address_line2, postal_code,
			verification_type, accepted_bid_id
		)
		values (
			${appUserId}, ${title}, ${description}, ${category}, ${budgetCents}, ${publicLocation},
			${city}, ${state}, ${addressLine1}, ${addressLine2 || null}, ${postalCode || null},
			${verificationType}, null
		)
		returning id
	`);
	const rows = toRows<Record<string, unknown>>(inserted);
	return json({ id: Number(rows[0].id) }, { status: 201 });
}
