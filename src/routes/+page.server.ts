import type { PageServerLoad } from './$types';
import { listPublicOpenTasks } from '$lib/server/tasks/public';

export const load: PageServerLoad = async () => {
	try {
		const tasks = await listPublicOpenTasks(6);
		return { tasks };
	} catch {
		// Keep homepage functional even if DB is temporarily unavailable.
		return { tasks: [] };
	}
};
