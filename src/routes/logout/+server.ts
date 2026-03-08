import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	if (auth) {
		await auth.api.signOut({ headers: request.headers });
	}

	throw redirect(302, '/login');
};
