<script lang="ts">
	import QuestCard from '$lib/components/quests/QuestCard.svelte';
	import type { QuestDifficulty } from '$lib/components/quests/QuestCard.svelte';
	import type { QuestStatus } from '$lib/components/quests/QuestStatusBadge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

<section class="space-y-6 sm:space-y-7">
	<header class="space-y-2">
		<p class="eyebrow">My Dashboard</p>
		<h1 class="text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">Quest Activity</h1>
		<p class="max-w-2xl text-sm text-[var(--muted)]">
			Track what you're currently working on, what is awaiting confirmation, and what you already completed.
		</p>
		{#if data.usesFallback}
			<Card as="div" tone="light" className="max-w-2xl border-[var(--line)] bg-white/65 p-3">
				<p class="text-xs text-[var(--muted)]">
					Showing sample quest activity until user-task relationships are fully populated.
				</p>
			</Card>
		{/if}
	</header>

	<section class="space-y-3">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight text-[var(--ink)]">Active Quests</h2>
			<p class="mt-1 text-sm text-[var(--muted)]">Quests you accepted and are currently working on.</p>
		</div>
		{#if data.activeQuests.length === 0}
			<Card as="article" tone="light" className="p-4">
				<p class="text-sm text-[var(--muted)]">No active quests right now.</p>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{#each data.activeQuests as task}
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
						href={task.id > 0 ? `/tasks/${task.id}` : '/tasks'}
						ctaLabel="View Task"
					/>
				{/each}
			</div>
		{/if}
	</section>

	<section class="space-y-3">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight text-[var(--ink)]">Awaiting Confirmation</h2>
			<p class="mt-1 text-sm text-[var(--muted)]">Quests completed by you and waiting for poster approval.</p>
		</div>
		{#if data.awaitingConfirmationQuests.length === 0}
			<Card as="article" tone="light" className="p-4">
				<p class="text-sm text-[var(--muted)]">No quests awaiting confirmation.</p>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{#each data.awaitingConfirmationQuests as task}
					<QuestCard
						id={task.id}
						title={task.title}
						reward={task.budgetCents / 100}
						description={task.descriptionPreview || null}
						location={task.city && task.state ? `${task.city}, ${task.state}` : task.city || task.state || 'Location TBD'}
						isRemote={false}
						category={task.category || 'General'}
						difficulty={mapDifficulty(task.budgetCents)}
						status="In Progress"
						postedAt={formatPostedAt(task.createdAt)}
						href={task.id > 0 ? `/tasks/${task.id}` : '/tasks'}
						ctaLabel="View Proof Status"
					/>
				{/each}
			</div>
		{/if}
	</section>

	<section class="space-y-3">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight text-[var(--ink)]">Completed Quests</h2>
			<p class="mt-1 text-sm text-[var(--muted)]">Quests you successfully finished.</p>
		</div>
		{#if data.completedQuests.length === 0}
			<Card as="article" tone="light" className="p-4">
				<p class="text-sm text-[var(--muted)]">No completed quests yet.</p>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{#each data.completedQuests as task}
					<QuestCard
						id={task.id}
						title={task.title}
						reward={task.budgetCents / 100}
						description={task.descriptionPreview || null}
						location={task.city && task.state ? `${task.city}, ${task.state}` : task.city || task.state || 'Location TBD'}
						isRemote={false}
						category={task.category || 'General'}
						difficulty={mapDifficulty(task.budgetCents)}
						status="Completed"
						postedAt={formatPostedAt(task.createdAt)}
						href={task.id > 0 ? `/tasks/${task.id}` : '/tasks'}
						ctaLabel="View Details"
					/>
				{/each}
			</div>
		{/if}
	</section>
</section>
