import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	signInEmail: async (event) => {
		if (!auth) {
			return fail(503, { message: 'Auth is not configured yet. Add ORIGIN and BETTER_AUTH_SECRET.' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/dashboard'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Unable to sign in' });
			}
			return fail(500, { message: 'Unexpected server error' });
		}

		throw redirect(302, '/dashboard');
	}
};
