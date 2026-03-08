<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: import('svelte').Snippet } = $props();
</script>

<section class="mx-auto max-w-6xl px-6 py-10">
	<header class="card mb-6 flex flex-wrap items-center justify-between gap-3">
		<div>
			<p class="eyebrow">Dashboard</p>
			<h1 class="text-2xl font-bold tracking-tight">{data.user.name}</h1>
			<p class="text-sm text-[var(--muted)]">{data.user.email}</p>
		</div>
		<form method="post" action="?/signOut" use:enhance>
			<button class="btn btn-ghost" type="submit">Sign out</button>
		</form>
	</header>

	<nav class="mb-6 flex flex-wrap gap-2">
		<a class="btn btn-ghost" href="/dashboard">Overview</a>
		<a class="btn btn-ghost" href="/dashboard/tasks">My Tasks</a>
		<a class="btn btn-ghost" href="/dashboard/messages">Messages</a>
		<a class="btn btn-ghost" href="/dashboard/profile">Profile</a>
		<a class="btn btn-solid" href="/tasks/create">Post New Task</a>
	</nav>

	{@render children()}
</section>
