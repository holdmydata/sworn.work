<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';
	import type { LayoutServerData } from './$types';

	const { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();

	function navClass(target: string, activeMode: 'ghost' | 'solid' = 'ghost', exact = false) {
		const isActive = exact
			? page.url.pathname === target
			: page.url.pathname === target || page.url.pathname.startsWith(`${target}/`);
		if (!isActive) return activeMode === 'solid' ? 'btn btn-solid' : 'btn btn-ghost';
		return 'btn btn-ghost border-[var(--brand)] bg-[color:rgba(176,74,42,0.14)] text-[var(--ink)]';
	}
</script>

<header class="sticky top-0 z-40 border-b border-(--line) bg-white/90 backdrop-blur">
	<div class="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
		<a href="/" class="text-lg font-semibold tracking-tight text-(--ink)">sworn.work</a>
		<nav class="-mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0 sm:pb-0">
			<a href="/" class={`shrink-0 ${navClass('/')}`}>Home</a>
			<a href="/tasks" class={`shrink-0 ${navClass('/tasks', 'ghost', true)}`}>Tasks</a>
			{#if data.user}
				<a href="/dashboard" class={`shrink-0 ${navClass('/dashboard')}`}>Dashboard</a>
				<a href="/profile" class={`shrink-0 ${navClass('/profile')}`}>Profile</a>
				<a href="/tasks/create" class={`shrink-0 ${navClass('/tasks/create', 'solid')}`} aria-current={page.url.pathname.startsWith('/tasks/create') ? 'page' : undefined}>Post Task</a>
			{:else}
				<a href="/how-it-works" class={`shrink-0 ${navClass('/how-it-works')}`}>How It Works</a>
				<a href="/for-workers" class={`shrink-0 ${navClass('/for-workers')}`}>For Workers</a>
				<a href="/login" class={`shrink-0 ${navClass('/login')}`}>Login</a>
				<a href="/signup" class={`shrink-0 ${navClass('/signup', 'solid')}`}>Sign Up</a>
			{/if}
		</nav>
	</div>
</header>

<main>{@render children()}</main>

<footer class="mt-10 border-t border-(--line) bg-white/55">
	<div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-600 sm:px-6 text-center"	>
		<p>Post local tasks. Find trusted help.</p>
		<nav aria-label="Legal" class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-center">
			<a href="/terms" class="transition-colors hover:text-slate-900">Terms</a>
			<a href="/privacy" class="transition-colors hover:text-slate-900">Privacy</a>
			<a href="/safety" class="transition-colors hover:text-slate-900">Safety</a>
		</nav>
	</div>
</footer>
