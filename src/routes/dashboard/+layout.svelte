<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: import('svelte').Snippet } = $props();

	const secondaryNav = [
		{ label: 'Overview', href: '/dashboard' },
		{ label: 'Profile', href: '/dashboard/profile' }
	];
</script>

<PageContainer className="max-w-6xl space-y-5 sm:space-y-6">
	<Card as="header" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-4 sm:p-5">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="eyebrow text-slate-300">My Dashboard</p>
				<h1 class="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{data.user.name}</h1>
				<p class="text-sm text-slate-300">{data.user.email}</p>
			</div>
			<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
				<Button href="/tasks/create" variant="primary" className="w-full sm:w-auto">Post Task</Button>
				<form method="post" action="/logout" class="w-full sm:w-auto">
					<Button type="submit" variant="ghost" className="w-full sm:w-auto">Sign out</Button>
				</form>
			</div>
		</div>

		<nav class="mt-4 flex flex-wrap gap-2" aria-label="Dashboard sections">
			{#each secondaryNav as item}
				<a
					href={item.href}
					class={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
						page.url.pathname === item.href
							? 'border-slate-400 bg-slate-800 text-slate-100'
							: 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
					}`}
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</Card>

	{@render children()}
</PageContainer>
