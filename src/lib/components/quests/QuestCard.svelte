<script context="module" lang="ts">
	export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard';
</script>

<script lang="ts">
	import QuestMetaRow from './QuestMetaRow.svelte';
	import QuestReward from './QuestReward.svelte';
	import QuestStatusBadge, { type QuestStatus } from './QuestStatusBadge.svelte';
	import Badge, { type BadgeTone } from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	export let id: string | number;
	export let title: string;
	export let reward: number | string;
	export let description: string | null | undefined = null;
	export let location: string | null | undefined = null;
	export let isRemote = false;
	export let category: string;
	export let difficulty: QuestDifficulty;
	export let status: QuestStatus;
	export let postedAt: string;
	export let href: string | null | undefined = null;
	export let ctaLabel: string | null | undefined = null;

	const DIFFICULTY_TONES: Record<QuestDifficulty, BadgeTone> = {
		Easy: 'emerald',
		Medium: 'amber',
		Hard: 'red'
	};

	$: preview = (description ?? '').trim();
	$: actionLabel = (ctaLabel ?? '').trim() || (status === 'Open' ? 'Accept Quest' : 'View Quest');
</script>

<!--
Example usage:
<QuestCard
	id={task.id}
	title={task.title}
	reward={task.reward}
	description={task.description}
	location={task.location}
	isRemote={task.isRemote}
	category={task.category}
	difficulty={task.difficulty}
	status={task.status}
	postedAt={task.postedAt}
	href={`/tasks/${task.id}`}
	ctaLabel="Accept Quest"
/>
-->
<Card
	as="article"
	tone="dark"
	className="group relative border-slate-700/80 p-5 text-slate-100 transition-colors duration-150 hover:border-slate-500/80"
	data-quest-id={id}
>
	{#if href}
		<a
			href={href}
			aria-label={`Open task: ${title}`}
			class="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/90"
		></a>
	{/if}

	<div class="relative z-20 space-y-3">
		<QuestReward {reward} />

		<h3 class="text-xl font-bold leading-tight text-white">{title}</h3>

		{#if preview}
			<p class="line-clamp-2 text-sm text-slate-300">{preview}</p>
		{/if}

		<QuestMetaRow {location} {isRemote} {postedAt} />

		<div class="flex flex-wrap items-center gap-2">
			<Badge tone="slate">
				{category}
			</Badge>
			<Badge tone={DIFFICULTY_TONES[difficulty]}>
				{difficulty}
			</Badge>
			<QuestStatusBadge {status} />
		</div>

		{#if href}
			<Button
				href={href}
				variant="primary"
				className="relative z-30"
			>
				{actionLabel}
			</Button>
		{:else}
			<Button
				type="button"
				variant="primary"
			>
				{actionLabel}
			</Button>
		{/if}
	</div>
</Card>
