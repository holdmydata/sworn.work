import type { PageServerLoad } from './$types';
import { listPublicOpenTasks } from '$lib/server/tasks/public';

export const load: PageServerLoad = async ({ locals }) => {
	const tasks = await listPublicOpenTasks();

	return {
		tasks,
		isLoggedIn: Boolean(locals.user)
	};
};
