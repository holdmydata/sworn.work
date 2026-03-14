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

<header class="sticky top-0 z-40 border-b border-[var(--line)] bg-white/85 backdrop-blur">
	<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-3">
		<a href="/" class="text-lg font-semibold tracking-tight text-[var(--ink)]">sworn.work</a>
		<nav class="flex flex-wrap items-center gap-2">
			<a href="/" class={navClass('/')}>Home</a>
			<a href="/tasks" class={navClass('/tasks', 'ghost', true)}>Tasks</a>
			{#if data.user}
				<a href="/dashboard" class={navClass('/dashboard')}>Dashboard</a>
				<a href="/tasks/create" class={navClass('/tasks/create', 'solid')} aria-current={page.url.pathname.startsWith('/tasks/create') ? 'page' : undefined}>Post Task</a>
			{:else}
				<a href="/how-it-works" class={navClass('/how-it-works')}>How It Works</a>
				<a href="/for-workers" class={navClass('/for-workers')}>For Workers</a>
				<a href="/login" class={navClass('/login')}>Login</a>
				<a href="/signup" class={navClass('/signup', 'solid')}>Sign Up</a>
			{/if}
		</nav>
	</div>
</header>

<main>{@render children()}</main>
