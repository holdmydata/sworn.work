import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { findAppUserIdByEmail, getOrCreateAppUserId } from '$lib/server/tasks/users';
import { toRows } from '$lib/server/db/result';

export async function GET({ url, locals }) {
	if (!locals.user?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const taskId = Number(url.searchParams.get('taskId') ?? 0);
	if (!taskId) return json({ error: 'taskId is required' }, { status: 400 });

	const appUserId = await findAppUserIdByEmail(locals.user.email);
	if (!appUserId) return json({ messages: [] });

	const result = await db.execute(sql`
		select m.id, m.sender_id, m.recipient_id, m.content, m.created_at,
			s.name as sender_name, r.name as recipient_name
		from messages m
		inner join users s on s.id = m.sender_id
		inner join users r on r.id = m.recipient_id
		where m.task_id = ${taskId} and (m.sender_id = ${appUserId} or m.recipient_id = ${appUserId})
		order by m.created_at asc
	`);
	const rows = toRows<Record<string, unknown>>(result);
	return json({
		messages: rows.map((r) => ({
			id: Number(r.id),
			senderId: Number(r.sender_id),
			recipientId: Number(r.recipient_id),
			senderName: String(r.sender_name),
			recipientName: String(r.recipient_name),
			content: String(r.content),
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
	const content = String(body.content ?? '').trim();
	if (!taskId || !content) return json({ error: 'taskId and content are required' }, { status: 400 });

	const senderId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'User');
	const taskResult = await db.execute(sql`
		select t.creator_id, b.worker_id as accepted_worker_id
		from tasks t
		left join bids b on b.id = t.accepted_bid_id
		where t.id = ${taskId}
		limit 1
	`);
	const taskRows = toRows<Record<string, unknown>>(taskResult);
	if (taskRows.length === 0) return json({ error: 'Task not found' }, { status: 404 });

	const creatorId = Number(taskRows[0].creator_id);
	const acceptedWorkerId = taskRows[0].accepted_worker_id ? Number(taskRows[0].accepted_worker_id) : null;

	let recipientId: number;
	if (senderId === creatorId) {
		if (!acceptedWorkerId) return json({ error: 'No accepted worker to message yet' }, { status: 400 });
		recipientId = acceptedWorkerId;
	} else {
		recipientId = creatorId;
	}

	const inserted = await db.execute(sql`
		insert into messages (sender_id, recipient_id, task_id, content)
		values (${senderId}, ${recipientId}, ${taskId}, ${content})
		returning id
	`);
	const rows = toRows<Record<string, unknown>>(inserted);
	return json({ id: Number(rows[0].id) }, { status: 201 });
}
