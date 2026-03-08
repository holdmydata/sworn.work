import type { Handle } from '@sveltejs/kit';

// Temporary pass-through while better-auth package resolution is unstable in this workspace.
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
