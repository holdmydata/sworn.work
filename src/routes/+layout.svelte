<script lang="ts">
	import './layout.css';
	import type { LayoutServerData } from './$types';

	const { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();
</script>

<header class="sticky top-0 z-40 border-b border-[var(--line)] bg-white/85 backdrop-blur">
	<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-3">
		<a href="/" class="text-lg font-semibold tracking-tight text-[var(--ink)]">sworn.work</a>
		<nav class="flex flex-wrap items-center gap-2">
			<a href="/" class="btn btn-ghost">Home</a>
			<a href="/tasks" class="btn btn-ghost">Tasks</a>
			{#if data.user}
				<a href="/dashboard" class="btn btn-ghost">Dashboard</a>
				<a href="/tasks/create" class="btn btn-solid">Post Task</a>
			{:else}
				<a href="/how-it-works" class="btn btn-ghost">How It Works</a>
				<a href="/for-workers" class="btn btn-ghost">For Workers</a>
				<a href="/login" class="btn btn-ghost">Login</a>
				<a href="/signup" class="btn btn-solid">Sign Up</a>
			{/if}
		</nav>
	</div>
</header>

<main>{@render children()}</main>
