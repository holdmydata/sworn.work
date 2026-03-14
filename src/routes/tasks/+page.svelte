<script lang="ts">
import QuestCard from '$lib/components/quests/QuestCard.svelte';
import type { QuestDifficulty } from '$lib/components/quests/QuestCard.svelte';
import type { QuestStatus } from '$lib/components/quests/QuestStatusBadge.svelte';
import Badge from '$lib/components/ui/Badge.svelte';
import Button from '$lib/components/ui/Button.svelte';
import Card from '$lib/components/ui/Card.svelte';
import FilterChip from '$lib/components/ui/FilterChip.svelte';
import PageContainer from '$lib/components/ui/PageContainer.svelte';
import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const quickFilters = ['All', 'Open now', 'Remote', 'Easy', 'Medium', 'Hard', 'High reward'];

	function mapStatus(value: string): QuestStatus {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'open') return 'Open';
		if (normalized === 'accepted') return 'Accepted';
		if (normalized === 'in_progress' || normalized === 'in progress') return 'In Progress';
		if (normalized === 'completed') return 'Completed';
		if (normalized === 'paid') return 'Paid';
		return 'Open';
	}

	function mapDifficulty(budgetCents: number): QuestDifficulty {
		// Temporary approximation until difficulty is modeled explicitly in DB.
		if (budgetCents >= 20000) return 'Hard';
		if (budgetCents >= 8000) return 'Medium';
		return 'Easy';
	}

	function formatPostedAt(iso: string): string {
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return 'Recently';

		const now = new Date();
		const dayMs = 24 * 60 * 60 * 1000;
		const diffDays = Math.floor((date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / dayMs);
		if (diffDays === 0) return 'Today';
		if (diffDays === -1) return 'Yesterday';
		return date.toLocaleDateString();
	}
</script>

<PageContainer>
	<Card
		as="header"
		tone="dark"
		className="mb-10 border-slate-700/80 bg-slate-900/85 p-5 text-slate-100 sm:mb-12 sm:p-6"
	>
		<div class="flex flex-col gap-4 sm:gap-5">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<p class="eyebrow text-slate-300">Task Board</p>
					<h1 class="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Open Bounties</h1>
					<p class="mt-2 max-w-2xl text-sm text-slate-300">
						{#if data.isLoggedIn}
							Public board shows city/state. Exact address remains private until assignment.
						{:else}
							You are viewing public task previews. Sign in for full workflow access.
						{/if}
					</p>
				</div>
				{#if data.isLoggedIn}
					<Button href="/tasks/create" variant="primary" className="w-full sm:w-auto">
						Post Task
					</Button>
				{:else}
					<Button href="/signup" variant="primary" className="w-full sm:w-auto">
						Sign Up to Post
					</Button>
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Badge tone="slate" className="px-3 text-slate-200">{data.tasks.length} open tasks</Badge>
				<Badge tone="slate" className="px-3 text-slate-200">NWA local board</Badge>
			</div>

			<div aria-label="Quick filters" class="-mx-1 overflow-x-auto pb-1 md:mx-0 md:overflow-visible">
				<div class="flex min-w-max gap-2 px-1 md:min-w-0 md:flex-wrap md:px-0">
					{#each quickFilters as label, index}
						<FilterChip active={index === 0}>
							{label}
						</FilterChip>
					{/each}
				</div>
			</div>
		</div>
	</Card>

	{#if data.tasks.length === 0}
		<Card as="article" tone="light" className="p-4">
			<h2 class="text-xl font-semibold">No open tasks yet</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Seed sample tasks or post the first one to populate this board.</p>
		</Card>
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each data.tasks as task}
				<QuestCard
					id={task.id}
					title={task.title}
					reward={task.budgetCents / 100}
					description={task.descriptionPreview || null}
					location={task.city && task.state ? `${task.city}, ${task.state}` : task.city || task.state || 'Location TBD'}
					isRemote={false}
					category={task.category || 'General'}
					difficulty={mapDifficulty(task.budgetCents)}
					status={mapStatus(task.status)}
					postedAt={formatPostedAt(task.createdAt)}
					href={`/tasks/${task.id}`}
					ctaLabel="View details"
				/>
			{/each}
		</div>
	{/if}
</PageContainer>
