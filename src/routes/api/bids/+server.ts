import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { findAppUserIdByEmail, getOrCreateAppUserId } from '$lib/server/tasks/users';
import { toRows } from '$lib/server/db/result';

export async function GET({ url }) {
	const taskId = Number(url.searchParams.get('taskId') ?? 0);
	if (!taskId) return json({ error: 'taskId is required' }, { status: 400 });

	const result = await db.execute(sql`
		select b.id, b.task_id, b.proposed_price, b.message, b.status, b.created_at, u.name as worker_name
		from bids b
		inner join users u on u.id = b.worker_id
		where b.task_id = ${taskId}
		order by b.created_at desc
	`);
	const rows = toRows<Record<string, unknown>>(result);
	return json({
		bids: rows.map((r) => ({
			id: Number(r.id),
			taskId: Number(r.task_id),
			proposedPriceCents: Number(r.proposed_price),
			message: r.message ? String(r.message) : null,
			status: String(r.status),
			workerName: String(r.worker_name),
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

	const taskId = Number(body.taskId ?? 0);
	const proposedPriceCents = Number(body.proposedPriceCents ?? 0);
	const message = String(body.message ?? '').trim();
	if (!taskId || proposedPriceCents <= 0) {
		return json({ error: 'taskId and proposedPriceCents are required' }, { status: 400 });
	}

	const workerId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'Worker');
	const taskResult = await db.execute(sql`select creator_id, status from tasks where id = ${taskId} limit 1`);
	const taskRows = toRows<Record<string, unknown>>(taskResult);
	if (taskRows.length === 0) return json({ error: 'Task not found' }, { status: 404 });
	if (String(taskRows[0].status) !== 'open') return json({ error: 'Task is not open' }, { status: 400 });
	if (Number(taskRows[0].creator_id) === workerId) return json({ error: 'Poster cannot bid on own task' }, { status: 400 });

	const inserted = await db.execute(sql`
		insert into bids (task_id, worker_id, proposed_price, message, status)
		values (${taskId}, ${workerId}, ${proposedPriceCents}, ${message || null}, 'pending')
		returning id
	`);
	const rows = toRows<Record<string, unknown>>(inserted);
	return json({ id: Number(rows[0].id) }, { status: 201 });
}
