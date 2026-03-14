<script lang="ts">
	import QuestCard from '$lib/components/quests/QuestCard.svelte';
	import type { QuestDifficulty } from '$lib/components/quests/QuestCard.svelte';
	import type { QuestStatus } from '$lib/components/quests/QuestStatusBadge.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const fallbackTasks = [
		{
			id: 'sample-1',
			title: 'Move Couch Upstairs',
			category: 'Home & yard',
			budgetCents: 8500,
			city: 'Fayetteville',
			state: 'AR',
			status: 'open',
			createdAt: new Date().toISOString(),
			descriptionPreview: 'Need one strong helper for a 30-minute move. Stair access only.',
			verificationType: 'photo'
		},
		{
			id: 'sample-2',
			title: 'Weekend Dog Walking',
			category: 'Pet care',
			budgetCents: 6000,
			city: 'Springdale',
			state: 'AR',
			status: 'open',
			createdAt: new Date().toISOString(),
			descriptionPreview: 'Walk two friendly dogs Saturday morning near downtown.',
			verificationType: 'both'
		},
		{
			id: 'sample-3',
			title: 'Assemble IKEA Desk',
			category: 'Errands & support',
			budgetCents: 7000,
			city: 'Rogers',
			state: 'AR',
			status: 'open',
			createdAt: new Date().toISOString(),
			descriptionPreview: 'Need careful assembly with cleanup. Tools preferred but not required.',
			verificationType: 'video'
		}
	];

	const steps = [
		{
			title: 'Post a task',
			text: 'Describe the work, set reward, and publish it to the local board.',
			icon: '📝'
		},
		{
			title: 'Accept a task',
			text: 'Workers browse open bounties and submit interest to help.',
			icon: '🤝'
		},
		{
			title: 'Verify completion',
			text: 'Proof and review flow confirm the work before payout release.',
			icon: '✅'
		}
	];

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

	function previewTasks() {
		return data.tasks.length > 0 ? data.tasks : fallbackTasks;
	}
</script>

<PageContainer className="max-w-6xl space-y-14 sm:space-y-20">
	<section
		class="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-5 py-12 text-slate-100 sm:px-8 sm:py-16"
		style="box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255,255,255,0.04) inset;"
	>
		<div class="pointer-events-none absolute inset-0">
			<div class="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl"></div>
			<div class="absolute right-0 top-10 h-80 w-80 rounded-full bg-amber-200/10 blur-3xl"></div>
			<div class="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-slate-200/10 blur-2xl"></div>
			<div class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_35%,rgba(255,255,255,0.03))]"></div>
		</div>

		<div class="relative z-10 max-w-3xl">
			<p class="eyebrow text-slate-300">Quest Board For Real Life</p>
			<h1 class="mt-2 max-w-2xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
				Post local tasks. Find trusted help.
			</h1>
			<p class="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:mt-4 sm:max-w-2xl sm:text-lg">
				A practical task board with quest-board energy: clear rewards, proof-based completion,
				and a trust-first workflow.
			</p>
			<div class="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
				<Button href="/tasks" variant="primary" className="w-full sm:w-auto">Browse Bounties</Button>
				<Button href="/tasks/create" variant="ghost" className="w-full sm:w-auto">Post a Task</Button>
			</div>
		</div>
	</section>

	<section class="space-y-6">
		<div>
			<p class="eyebrow">Open Bounties</p>
			<h2 class="text-3xl font-bold tracking-tight text-slate-900">Featured Bounties</h2>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each previewTasks().slice(0, 6) as task}
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
					href={typeof task.id === 'number' ? `/tasks/${task.id}` : '/tasks'}
					ctaLabel="View details"
				/>
			{/each}
		</div>
		<div class="pt-1">
			<Button href="/tasks" variant="secondary" className="w-full sm:w-auto">View All Tasks</Button>
		</div>
	</section>

	<section class="space-y-6">
		<div>
			<p class="eyebrow">How Sworn Works</p>
			<h2 class="text-3xl font-bold tracking-tight text-slate-900">Simple, transparent flow</h2>
		</div>
		<div class="grid gap-6 md:grid-cols-3">
			{#each steps as step, i}
				<Card as="article" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5">
					<div class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-lg">{step.icon}</div>
					<p class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-300">Step {i + 1}</p>
					<h3 class="mt-1 text-xl font-semibold text-white">{step.title}</h3>
					<p class="mt-2 text-sm text-slate-300">{step.text}</p>
				</Card>
			{/each}
		</div>
	</section>

	<section>
		<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5 sm:p-6">
			<div class="flex flex-wrap items-center gap-2">
				<Badge tone="orange">Trust Model</Badge>
				<Badge tone="slate">Verification-first</Badge>
			</div>
			<h2 class="mt-3 text-3xl font-bold tracking-tight text-white">Built for trust, not just listings</h2>
			<ul class="mt-4 space-y-2 text-sm text-slate-300">
				<li>Escrow-funded tasks are the intended payout model.</li>
				<li>Proof-based completion confirms work before release.</li>
				<li>Exact addresses stay private until assignment.</li>
			</ul>
		</Card>
	</section>

	<section>
		<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900 p-6 text-center sm:p-8">
			<h2 class="text-3xl font-bold tracking-tight text-white">Ready to start a quest?</h2>
			<p class="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
				Browse live bounties or post work now and get matched with local help.
			</p>
			<div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
				<Button href="/tasks" variant="primary" className="w-full sm:w-auto">Browse Bounties</Button>
				<Button href="/tasks/create" variant="ghost" className="w-full sm:w-auto">Post a Task</Button>
			</div>
		</Card>
	</section>
</PageContainer>
