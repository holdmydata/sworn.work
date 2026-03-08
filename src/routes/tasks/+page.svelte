<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
</script>

<section class="mx-auto max-w-6xl px-6 py-12">
	<header class="mb-8 flex flex-wrap items-end justify-between gap-3">
		<div>
			<p class="eyebrow">Task Board</p>
			<h1 class="text-4xl font-bold tracking-tight">Open Bounties</h1>
			<p class="mt-2 text-sm text-[var(--muted)]">
				{#if data.isLoggedIn}
					Public board shows city/state. Exact address remains private until assignment.
				{:else}
					You are viewing public task previews. Sign in for full workflow access.
				{/if}
			</p>
		</div>
		{#if data.isLoggedIn}
			<a href="/tasks/create" class="btn btn-solid">Post Task</a>
		{:else}
			<a href="/signup" class="btn btn-solid">Sign Up to Post</a>
		{/if}
	</header>

	{#if data.tasks.length === 0}
		<article class="card">
			<h2 class="text-xl font-semibold">No open tasks yet</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Seed sample tasks or post the first one to populate this board.</p>
		</article>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.tasks as task}
				<article class="card">
					<p class="eyebrow">{task.category}</p>
					<h2 class="mt-2 text-xl font-semibold">{task.title}</h2>
					<p class="mt-1 text-sm text-[var(--muted)]">
						{money.format(task.budgetCents / 100)} • {task.city}, {task.state}
					</p>
					<p class="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">Verification: {task.verificationType}</p>
					<p class="mt-3 text-sm text-[var(--muted)]">{task.descriptionPreview}</p>
					<a href={`/tasks/${task.id}`} class="mt-4 inline-block text-sm font-semibold underline">View details</a>
				</article>
			{/each}
		</div>
	{/if}
</section>
