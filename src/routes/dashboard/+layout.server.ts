import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions, LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	signOut: async (event) => {
		if (!auth) {
			throw redirect(302, '/login');
		}

		await auth.api.signOut({ headers: event.request.headers });
		throw redirect(302, '/login');
	}
};
