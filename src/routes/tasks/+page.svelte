<script lang="ts">
	import QuestCard from '$lib/components/quests/QuestCard.svelte';
	import type { QuestDifficulty } from '$lib/components/quests/QuestCard.svelte';
	import type { QuestStatus } from '$lib/components/quests/QuestStatusBadge.svelte';
	import Badge, { type BadgeTone } from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import FilterChip from '$lib/components/ui/FilterChip.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const quickFilters = ['All', 'Open now', 'Remote', 'Easy', 'Medium', 'Hard'] as const;
	let selectedFilter = $state<(typeof quickFilters)[number]>('All');
	let searchQuery = $state('');

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

	function mapCategoryTone(category: string): BadgeTone {
		const normalized = category.trim().toLowerCase();
		if (/(pet|dog|cat|animal)/.test(normalized)) return 'amber';
		if (/(yard|outdoor|garden|landscape)/.test(normalized)) return 'emerald';
		if (/(tech|computer|it|support)/.test(normalized)) return 'blue';
		if (/(business|office|admin|finance)/.test(normalized)) return 'zinc';
		return 'slate';
	}

	function categoryDisplayLabel(category: string): string {
		const normalized = category.trim().toLowerCase();
		if (normalized === 'business' || normalized === 'business tasks') return 'Business';
		if (normalized === 'pet care' || normalized === 'pets' || normalized === 'pet-care') return 'Pets';
		if (normalized === 'errands & support' || normalized === 'errands') return 'Errands';
		if (normalized === 'home & yard' || normalized === 'yard') return 'Yard';
		if (normalized === 'skilled trades' || normalized === 'trades') return 'Trades';
		return category || 'General';
	}

	function mapCategoryIcon(category: string): string | null {
		const normalized = category.trim().toLowerCase();
		if (normalized === 'business' || normalized === 'business tasks') return '🏢';
		if (normalized === 'pet care' || normalized === 'pets' || normalized === 'pet-care') return '🐕';
		if (normalized === 'errands & support' || normalized === 'errands') return '🛍';
		if (normalized === 'home & yard' || normalized === 'yard') return '🌿';
		if (normalized === 'skilled trades' || normalized === 'trades') return '🛠';
		return null;
	}

	function taskSearchText(task: PageData['tasks'][number]): string {
		const location =
			task.city && task.state ? `${task.city} ${task.state}` : `${task.city} ${task.state}`;
		return `${task.title} ${task.descriptionPreview || ''} ${task.category || ''} ${location}`.toLowerCase();
	}

	function matchesFilter(task: PageData['tasks'][number]): boolean {
		if (selectedFilter === 'All') return true;
		if (selectedFilter === 'Open now') return mapStatus(task.status) === 'Open';
		if (selectedFilter === 'Remote') return false;
		return mapDifficulty(task.budgetCents) === selectedFilter;
	}

	const normalizedQuery = $derived(searchQuery.trim().toLowerCase());
	const visibleTasks = $derived(
		data.tasks.filter((task) => {
			const filterOk = matchesFilter(task);
			const searchOk = !normalizedQuery || taskSearchText(task).includes(normalizedQuery);
			return filterOk && searchOk;
		})
	);
	const recentlyPostedTasks = $derived(data.tasks.slice(0, 3));
</script>

<PageContainer>
	<Card
		as="header"
		tone="dark"
		className="mb-7 border-slate-700/80 bg-slate-900/85 p-5 text-slate-100 sm:mb-8 sm:p-6"
	>
		<div class="flex flex-col gap-4 sm:gap-5">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<p class="eyebrow text-slate-300">Task Board</p>
					<h1 class="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Open Bounties
					</h1>
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
				<Badge tone="slate" className="px-3 text-slate-200">{visibleTasks.length} open tasks</Badge>
				<Badge tone="slate" className="px-3 text-slate-200">NWA local board</Badge>
			</div>

			<div>
				<label for="task-search" class="sr-only">Search quests</label>
				<input
					id="task-search"
					type="search"
					bind:value={searchQuery}
					placeholder="Search title, description, category, or location"
					class="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-orange-300 focus:ring-1 focus:ring-orange-300 focus:outline-none"
				/>
			</div>

			<div
				aria-label="Quick filters"
				class="-mx-1 overflow-x-auto pb-1 md:mx-0 md:overflow-visible"
			>
				<div class="flex min-w-max gap-2 px-1 md:min-w-0 md:flex-wrap md:px-0">
					{#each quickFilters as label}
						<FilterChip active={selectedFilter === label} on:click={() => (selectedFilter = label)}>
							{label}
						</FilterChip>
					{/each}
				</div>
			</div>
		</div>
	</Card>

		{#if recentlyPostedTasks.length > 0}
			<section class="mb-7 sm:mb-8">
				<div class="mb-4">
					<p class="eyebrow">Open Bounties</p>
					<h2 class="text-3xl font-bold tracking-tight text-slate-900">Recently Posted</h2>
					<p class="mt-1 text-sm text-slate-500">New quests posted to the board</p>
				</div>
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{#each recentlyPostedTasks as task}
					<QuestCard
						id={task.id}
						title={task.title}
						reward={task.budgetCents / 100}
						description={task.descriptionPreview || null}
						location={task.city && task.state
							? `${task.city}, ${task.state}`
							: task.city || task.state || 'Location TBD'}
						isRemote={false}
						category={categoryDisplayLabel(task.category || 'General')}
						categoryTone={mapCategoryTone(task.category || 'General')}
						categoryIcon={mapCategoryIcon(task.category || 'General')}
						difficulty={mapDifficulty(task.budgetCents)}
						status={mapStatus(task.status)}
						postedAt={formatPostedAt(task.createdAt)}
						posterName={task.posterName}
						posterAvatarUrl={task.posterAvatarUrl}
						posterAverageRating={task.posterAverageRating}
						posterLevel={task.posterLevel}
						posterLevelTitle={task.posterLevelTitle}
						posterCompletedQuests={task.posterCompletedQuests}
						href={`/tasks/${task.id}`}
						ctaLabel="View details"
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.tasks.length === 0}
		<Card as="article" tone="light" className="p-4">
			<h2 class="text-xl font-semibold">No open tasks yet</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">
				Seed sample tasks or post the first one to populate this board.
			</p>
		</Card>
	{:else if visibleTasks.length === 0}
		<Card as="article" tone="light" className="p-4">
			<h2 class="text-xl font-semibold">No matching quests found.</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Try another keyword or browse all open tasks.</p>
		</Card>
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each visibleTasks as task}
				<QuestCard
					id={task.id}
					title={task.title}
					reward={task.budgetCents / 100}
					description={task.descriptionPreview || null}
					location={task.city && task.state
						? `${task.city}, ${task.state}`
						: task.city || task.state || 'Location TBD'}
					isRemote={false}
					category={categoryDisplayLabel(task.category || 'General')}
					categoryTone={mapCategoryTone(task.category || 'General')}
					categoryIcon={mapCategoryIcon(task.category || 'General')}
					difficulty={mapDifficulty(task.budgetCents)}
					status={mapStatus(task.status)}
					postedAt={formatPostedAt(task.createdAt)}
					posterName={task.posterName}
					posterAvatarUrl={task.posterAvatarUrl}
					posterAverageRating={task.posterAverageRating}
					posterLevel={task.posterLevel}
					posterLevelTitle={task.posterLevelTitle}
					posterCompletedQuests={task.posterCompletedQuests}
					href={`/tasks/${task.id}`}
					ctaLabel="View details"
				/>
			{/each}
		</div>
	{/if}
</PageContainer>
