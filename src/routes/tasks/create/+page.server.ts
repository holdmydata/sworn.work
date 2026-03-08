import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { getOrCreateAppUserId } from '$lib/server/tasks/users';
import type { Actions, PageServerLoad } from './$types';

function toRows<T>(result: unknown): T[] {
	if (Array.isArray(result)) return result as T[];
	if (result && typeof result === 'object' && 'rows' in result) {
		return ((result as { rows?: T[] }).rows ?? []) as T[];
	}
	return [];
}

function toCents(value: string): number {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) return 0;
	return Math.round(numeric * 100);
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
};

export const actions: Actions = {
	createTask: async ({ request, locals }) => {
		if (!locals.user?.email) {
			return fail(401, { message: 'You must be logged in to post tasks.' });
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() ?? '';
		const category = formData.get('category')?.toString().trim() ?? '';
		const city = formData.get('city')?.toString().trim() ?? '';
		const state = formData.get('state')?.toString().trim().toUpperCase() ?? '';
		const addressLine1 = formData.get('address_line1')?.toString().trim() ?? '';
		const addressLine2 = formData.get('address_line2')?.toString().trim() ?? '';
		const postalCode = formData.get('postal_code')?.toString().trim() ?? '';
		const verificationType = formData.get('verification_type')?.toString().trim() ?? 'photo';
		const budgetDollars = formData.get('budget')?.toString().trim() ?? '';
		const deadlineText = formData.get('deadline')?.toString().trim() ?? '';

		if (!title || !description || !category || !city || !state || !addressLine1) {
			return fail(400, { message: 'Please fill all required fields.' });
		}

		if (!['photo', 'video', 'both'].includes(verificationType)) {
			return fail(400, { message: 'Invalid verification type.' });
		}

		const budget = toCents(budgetDollars);
		if (budget <= 0) {
			return fail(400, { message: 'Budget must be greater than 0.' });
		}

		const deadline = deadlineText ? new Date(`${deadlineText}T23:59:59`) : null;
		if (deadline && Number.isNaN(deadline.getTime())) {
			return fail(400, { message: 'Invalid deadline date.' });
		}

		const userId = await getOrCreateAppUserId(locals.user.email, locals.user.name || 'Poster');
		const publicLocation = `${city}, ${state}`;

		const inserted = await db.execute(sql`
			insert into tasks (
				creator_id, title, description, category, budget, location,
				city, state, address_line1, address_line2, postal_code, verification_type, deadline, accepted_bid_id
			)
			values (
				${userId}, ${title}, ${description}, ${category}, ${budget}, ${publicLocation},
				${city}, ${state}, ${addressLine1}, ${addressLine2 || null}, ${postalCode || null},
				${verificationType}, ${deadline ? deadline.toISOString() : null}, null
			)
			returning id
		`);

		const insertedRows = toRows<Record<string, unknown>>(inserted);
		const taskId = Number(insertedRows[0].id);
		throw redirect(302, `/tasks/${taskId}`);
	}
};
