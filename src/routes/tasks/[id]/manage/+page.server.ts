import { error, fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { toRows } from '$lib/server/db/result';
import { getTaskWorkflowData } from '$lib/server/tasks/workflow';
import { findAppUserIdByEmail } from '$lib/server/tasks/users';
import type { Actions, PageServerLoad } from './$types';

type ManageMode = 'full' | 'limited' | 'read_only';

const REQUIREMENTS_MARKER = 'Requirements / notes:\n';

function splitDescription(raw: string): { coreDescription: string; requirementsNotes: string } {
	const markerIndex = raw.indexOf(REQUIREMENTS_MARKER);
	if (markerIndex === -1) {
		return { coreDescription: raw.trim(), requirementsNotes: '' };
	}

	const corePart = raw.slice(0, markerIndex).trim();
	const notesPart = raw.slice(markerIndex + REQUIREMENTS_MARKER.length).trim();
	return { coreDescription: corePart, requirementsNotes: notesPart };
}

function composeDescription(coreDescription: string, requirementsNotes: string): string {
	const core = coreDescription.trim();
	const notes = requirementsNotes.trim();
	if (!notes) return core;
	return `${core}\n\n${REQUIREMENTS_MARKER}${notes}`;
}

function parseBudgetToCents(raw: string): number {
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) return 0;
	return Math.round(value * 100);
}

function parseDeadline(raw: string): string | null | 'invalid' {
	const value = raw.trim();
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'invalid';
	return date.toISOString();
}

function modeForStatus(status: string): ManageMode {
	const normalized = status.trim().toLowerCase();
	if (normalized === 'open') return 'full';
	if (normalized === 'accepted' || normalized === 'in_progress') return 'limited';
	return 'read_only';
}

async function requirePoster(taskId: number, email: string) {
	const workflow = await getTaskWorkflowData(taskId);
	if (!workflow) throw error(404, 'Task not found');

	const appUserId = await findAppUserIdByEmail(email);
	if (!appUserId || appUserId !== workflow.creatorId) {
		throw error(403, 'Only the task poster can manage this task');
	}

	return workflow;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const taskId = Number(params.id);
	if (!Number.isInteger(taskId) || taskId <= 0) throw error(404, 'Task not found');
	if (!locals.user?.email) throw redirect(302, '/login');

	const workflow = await requirePoster(taskId, locals.user.email);
	const { coreDescription, requirementsNotes } = splitDescription(workflow.task.description);
	const manageMode = modeForStatus(workflow.task.status);

	return {
		task: workflow.task,
		acceptedWorkerName: workflow.acceptedWorkerName,
		manageMode,
		formValues: {
			title: workflow.task.title,
			category: workflow.task.category,
			rewardDollars: Math.max(0, Math.round(workflow.task.budgetCents / 100)),
			coreDescription,
			requirementsNotes,
			city: workflow.task.city,
			state: workflow.task.state,
			addressLine1: workflow.task.addressLine1 ?? '',
			addressLine2: workflow.task.addressLine2 ?? '',
			postalCode: workflow.task.postalCode ?? '',
			deadline: workflow.task.deadline ?? ''
		}
	};
};

export const actions: Actions = {
	updateTask: async ({ params, request, locals }) => {
		const taskId = Number(params.id);
		if (!Number.isInteger(taskId) || taskId <= 0) return fail(404, { message: 'Task not found.' });
		if (!locals.user?.email) return fail(401, { message: 'You must be logged in to manage tasks.' });

		const workflow = await requirePoster(taskId, locals.user.email);
		const manageMode = modeForStatus(workflow.task.status);
		if (manageMode === 'read_only') {
			return fail(400, { message: 'Completed or cancelled tasks are view-only.' });
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim() ?? '';
		const category = formData.get('category')?.toString().trim() ?? '';
		const rewardDollars = formData.get('budget')?.toString().trim() ?? '';
		const fullDescription = formData.get('full_description')?.toString().trim() ?? '';
		const requirementsNotes = formData.get('requirements_notes')?.toString().trim() ?? '';
		const city = formData.get('city')?.toString().trim() ?? '';
		const state = formData.get('state')?.toString().trim().toUpperCase() ?? '';
		const addressLine1 = formData.get('address_line1')?.toString().trim() ?? '';
		const addressLine2 = formData.get('address_line2')?.toString().trim() ?? '';
		const postalCode = formData.get('postal_code')?.toString().trim() ?? '';
		const deadlineRaw = formData.get('deadline_at')?.toString() ?? '';
		const parsedDeadline = parseDeadline(deadlineRaw);

		if (parsedDeadline === 'invalid') {
			return fail(400, { message: 'Invalid timing value.' });
		}
		if (!city || !state) {
			return fail(400, { message: 'City and state are required.' });
		}

		if (manageMode === 'full') {
			const budgetCents = parseBudgetToCents(rewardDollars);
			if (!title || !category || !fullDescription || budgetCents <= 0) {
				return fail(400, { message: 'Please complete all required fields for this task.' });
			}

			const mergedDescription = composeDescription(fullDescription, requirementsNotes);
			const publicLocation = `${city}, ${state}`;
			await db.execute(sql`
				update tasks
				set
					title = ${title},
					description = ${mergedDescription},
					category = ${category},
					budget = ${budgetCents},
					city = ${city},
					state = ${state},
					location = ${publicLocation},
					address_line1 = ${addressLine1 || null},
					address_line2 = ${addressLine2 || null},
					postal_code = ${postalCode || null},
					deadline = ${parsedDeadline}
				where id = ${taskId}
					and creator_id = ${workflow.creatorId}
					and status = 'open'
			`);

			return { success: true, message: 'Task updated.' };
		}

		const { coreDescription } = splitDescription(workflow.task.description);
		const mergedDescription = composeDescription(coreDescription, requirementsNotes);
		const publicLocation = `${city}, ${state}`;
		await db.execute(sql`
			update tasks
			set
				description = ${mergedDescription},
				city = ${city},
				state = ${state},
				location = ${publicLocation},
				address_line1 = ${addressLine1 || null},
				address_line2 = ${addressLine2 || null},
				postal_code = ${postalCode || null},
				deadline = ${parsedDeadline}
			where id = ${taskId}
				and creator_id = ${workflow.creatorId}
				and status::text in ('accepted', 'in_progress')
		`);

		return { success: true, message: 'Task clarifications updated.' };
	},

	cancelTask: async ({ params, locals }) => {
		const taskId = Number(params.id);
		if (!Number.isInteger(taskId) || taskId <= 0) return fail(404, { message: 'Task not found.' });
		if (!locals.user?.email) return fail(401, { message: 'You must be logged in to manage tasks.' });

		const workflow = await requirePoster(taskId, locals.user.email);
		if (workflow.task.status !== 'open') {
			return fail(400, { message: 'Only open tasks can be cancelled.' });
		}

		await db.execute(sql`
			update tasks
			set status = 'cancelled'
			where id = ${taskId}
				and creator_id = ${workflow.creatorId}
				and status = 'open'
		`);

		throw redirect(303, '/dashboard');
	}
};
