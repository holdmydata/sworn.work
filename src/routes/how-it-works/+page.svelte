<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';

	const steps = [
		{
			title: 'Post a local task',
			text: 'Describe the job, set the reward, and share the general location so nearby people can decide if it fits.',
			label: 'Step 1'
		},
		{
			title: 'Connect with a worker',
			text: 'A worker accepts the task and coordinates details directly with the poster through the platform workflow.',
			label: 'Step 2'
		},
		{
			title: 'Complete and verify the work',
			text: 'Photos, videos, and profile examples can be used to show completed work and build trust over time.',
			label: 'Step 3'
		},
		{
			title: 'Pay directly and leave feedback',
			text: 'sworn.work does not process payments or hold escrow. Posters and workers handle payment directly between themselves.',
			label: 'Step 4'
		}
	];
</script>

<PageContainer className="max-w-6xl">
	<section class="relative mb-10 overflow-hidden rounded-3xl border border-slate-700/80 bg-[linear-gradient(140deg,#0b1220_0%,#172033_55%,#33231d_100%)] px-5 py-10 text-slate-100 sm:px-8 sm:py-14">
		<div class="pointer-events-none absolute inset-0">
			<div class="absolute -left-12 top-0 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"></div>
			<div class="absolute right-0 top-8 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl"></div>
			<div class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_35%,rgba(255,255,255,0.02))]"></div>
		</div>

		<div class="relative z-10 max-w-3xl">
			<div class="flex flex-wrap gap-2">
				<Badge tone="orange">Direct user payments</Badge>
				<Badge tone="slate">No escrow</Badge>
				<Badge tone="slate">Verification-first</Badge>
			</div>
			<p class="eyebrow mt-5 text-slate-300">How It Works</p>
			<h1 class="mt-2 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
				Post the work. Verify the result. Handle payment directly.
			</h1>
			<p class="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg">
				sworn.work helps local posters and workers find each other, coordinate small tasks, and use proof-based
				completion media to build trust. The platform connects users, but payments happen directly between them.
			</p>
		</div>
	</section>

	<section class="mb-10">
		<div class="mb-5">
			<p class="eyebrow inline-flex rounded-full border border-(--line) bg-white/80 px-2.5 py-1 text-slate-600">
				Simple Flow
			</p>
			<h2 class="text-3xl font-bold tracking-tight text-slate-900">How sworn.work works today</h2>
		</div>

		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{#each steps as step}
				<Card as="article" tone="light" className="h-full border-(--line) bg-white/80 p-5">
					<p class="eyebrow text-slate-500">{step.label}</p>
					<h3 class="mt-2 text-xl font-semibold text-slate-900">{step.title}</h3>
					<p class="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
				</Card>
			{/each}
		</div>
	</section>

	<section class="mb-10 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
		<Card as="section" tone="light" className="border-(--line) bg-white/80 p-5 sm:p-6">
			<p class="eyebrow text-slate-500">Verification Media</p>
			<h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">Photos and videos support trust</h2>
			<p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
				Users may upload photos or videos to show that a task was completed. These uploads may be visible to the
				people involved in the task and may appear on a user profile as examples of completed work.
			</p>
			<ul class="mt-4 space-y-2 text-sm leading-7 text-slate-600 sm:text-base">
				<li>Only upload media you have permission to share.</li>
				<li>Avoid showing sensitive personal details, addresses, or unrelated people.</li>
				<li>Media may be reviewed to improve verification, safety monitoring, and platform quality.</li>
			</ul>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900/92 p-5 sm:p-6">
			<p class="eyebrow text-slate-300">Important</p>
			<h2 class="mt-2 text-2xl font-bold tracking-tight text-white">What sworn.work does not do</h2>
			<ul class="mt-4 space-y-2 text-sm leading-7 text-slate-300">
				<li>Does not process payments</li>
				<li>Does not provide escrow</li>
				<li>Does not guarantee task quality or outcomes</li>
				<li>Does not replace your judgment when meeting or hiring someone</li>
			</ul>
		</Card>
	</section>

	<section>
		<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900 p-6 text-center sm:p-8">
			<h2 class="text-3xl font-bold tracking-tight text-white">Ready to post or accept a task?</h2>
			<p class="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
				Browse current bounties, post your own task, and use clear verification to build trust as the network grows.
			</p>
			<div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
				<Button href="/tasks" variant="primary" className="w-full sm:w-auto">Browse Bounties</Button>
				<Button href="/tasks/create" variant="ghost" className="w-full sm:w-auto">Post a Task</Button>
			</div>
		</Card>
	</section>
</PageContainer>
