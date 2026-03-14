import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { TaskDetail } from './public';

function toRows<T>(result: unknown): T[] {
	if (Array.isArray(result)) return result as T[];
	if (result && typeof result === 'object' && 'rows' in result) {
		return ((result as { rows?: T[] }).rows ?? []) as T[];
	}
	return [];
}

export type TaskProof = {
	id: number;
	proofType: 'photo' | 'video';
	proofUrl: string;
	note: string | null;
	submittedByName: string;
	createdAt: string;
};

export type VerificationDecision = {
	id: number;
	proofId: number | null;
	decision: 'approved' | 'disputed' | 'rejected';
	reason: string | null;
	decidedByName: string;
	createdAt: string;
};

export type TaskWorkflowData = {
	task: TaskDetail;
	creatorId: number;
	creatorJoinedAt: string | null;
	acceptedBidId: number | null;
	acceptedWorkerId: number | null;
	acceptedWorkerName: string | null;
	acceptedWorkerJoinedAt: string | null;
	proofs: TaskProof[];
	decisions: VerificationDecision[];
};

export async function getTaskWorkflowData(taskId: number): Promise<TaskWorkflowData | null> {
	const taskResult = await db.execute(sql`
		select
			t.id,
			t.creator_id,
			t.accepted_bid_id,
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
			u.name as creator_name,
			u.created_at as creator_created_at,
			ab.worker_id as accepted_worker_id,
			aw.name as accepted_worker_name,
			aw.created_at as accepted_worker_created_at
		from tasks t
		inner join users u on u.id = t.creator_id
		left join bids ab on ab.id = t.accepted_bid_id
		left join users aw on aw.id = ab.worker_id
		where t.id = ${taskId}
		limit 1
	`);

	const taskRows = toRows<Record<string, unknown>>(taskResult);
	if (taskRows.length === 0) {
		return null;
	}

	const row = taskRows[0];

	const proofsResult = await db.execute(sql`
		select
			p.id,
			p.proof_type,
			p.proof_url,
			p.note,
			p.created_at,
			u.name as submitted_by_name
		from task_proofs p
		inner join users u on u.id = p.submitted_by_user_id
		where p.task_id = ${taskId}
		order by p.created_at desc
	`);

	const decisionsResult = await db.execute(sql`
		select
			d.id,
			d.proof_id,
			d.decision,
			d.reason,
			d.created_at,
			u.name as decided_by_name
		from verification_decisions d
		inner join users u on u.id = d.decided_by_user_id
		where d.task_id = ${taskId}
		order by d.created_at desc
	`);

	const proofRows = toRows<Record<string, unknown>>(proofsResult);
	const decisionRows = toRows<Record<string, unknown>>(decisionsResult);

	return {
		task: {
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
			verificationType: row.verification_type as TaskDetail['verificationType'],
			status: String(row.status),
			createdAt: new Date(String(row.created_at)).toISOString(),
			deadline: row.deadline ? new Date(String(row.deadline)).toISOString() : null,
			creatorName: String(row.creator_name)
		},
		creatorId: Number(row.creator_id),
		creatorJoinedAt: row.creator_created_at ? new Date(String(row.creator_created_at)).toISOString() : null,
		acceptedBidId: row.accepted_bid_id ? Number(row.accepted_bid_id) : null,
		acceptedWorkerId: row.accepted_worker_id ? Number(row.accepted_worker_id) : null,
		acceptedWorkerName: row.accepted_worker_name ? String(row.accepted_worker_name) : null,
		acceptedWorkerJoinedAt: row.accepted_worker_created_at
			? new Date(String(row.accepted_worker_created_at)).toISOString()
			: null,
		proofs: proofRows.map((proof) => ({
			id: Number(proof.id),
			proofType: proof.proof_type as TaskProof['proofType'],
			proofUrl: String(proof.proof_url),
			note: proof.note ? String(proof.note) : null,
			submittedByName: String(proof.submitted_by_name),
			createdAt: new Date(String(proof.created_at)).toISOString()
		})),
		decisions: decisionRows.map((decision) => ({
			id: Number(decision.id),
			proofId: decision.proof_id ? Number(decision.proof_id) : null,
			decision: decision.decision as VerificationDecision['decision'],
			reason: decision.reason ? String(decision.reason) : null,
			decidedByName: String(decision.decided_by_name),
			createdAt: new Date(String(decision.created_at)).toISOString()
		}))
	};
}
