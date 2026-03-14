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
	import UserAvatar from '$lib/components/ui/UserAvatar.svelte';

	export let id: string | number;
	export let title: string;
	export let reward: number | string;
	export let description: string | null | undefined = null;
	export let location: string | null | undefined = null;
	export let isRemote = false;
	export let category: string;
	export let categoryTone: BadgeTone = 'slate';
	export let categoryIcon: string | null = null;
	export let difficulty: QuestDifficulty;
	export let status: QuestStatus;
	export let postedAt: string;
	export let posterName = 'Member';
	export let posterAvatarUrl: string | null | undefined = null;
	export let posterAverageRating: number | null = null;
	export let posterLevel = 1;
	export let posterLevelTitle: string | null = null;
	export let posterCompletedQuests = 0;
	export let href: string | null | undefined = null;
	export let ctaLabel: string | null | undefined = null;

	const DIFFICULTY_TONES: Record<QuestDifficulty, BadgeTone> = {
		Easy: 'emerald',
		Medium: 'amber',
		Hard: 'red'
	};

	$: preview = (description ?? '').trim();
	$: actionLabel = (ctaLabel ?? '').trim() || (status === 'Open' ? 'Accept Quest' : 'View Quest');
	$: ratingLabel = posterAverageRating === null ? 'New user' : posterAverageRating.toFixed(1);
	$: levelLabel = posterLevelTitle
		? `Level ${posterLevel} ${posterLevelTitle}`
		: `Level ${posterLevel}`;
	$: questsLabel = `${posterCompletedQuests} ${posterCompletedQuests === 1 ? 'quest' : 'quests'}`;
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
	className="group relative border-slate-700/80 p-5 text-slate-100 transition-all duration-200 hover:-translate-y-1 hover:border-slate-500/80 hover:shadow-xl"
	data-quest-id={id}
>
	{#if href}
		<a
			{href}
			aria-label={`Open task: ${title}`}
			class="absolute inset-0 z-10 rounded-2xl focus-visible:ring-2 focus-visible:ring-orange-300/90 focus-visible:outline-none"
		></a>
	{/if}

	<div class="relative z-20 space-y-3">
		<QuestReward {reward} />

		<h3 class="text-xl leading-tight font-bold text-white">{title}</h3>

		<div class="space-y-1">
			<div class="flex items-center gap-2 text-sm text-slate-300">
				<UserAvatar
					name={posterName}
					avatarUrl={posterAvatarUrl}
					className="h-7 w-7"
					textClassName="text-xs"
				/>
				<span class="font-medium">{posterName}</span>
			</div>
			<p class="flex items-center gap-2 text-sm text-slate-400">
				<span>⭐ {ratingLabel}</span>
				<span aria-hidden="true">•</span>
				<span>{levelLabel}</span>
				<span aria-hidden="true">•</span>
				<span>{questsLabel}</span>
			</p>
		</div>

		{#if preview}
			<p class="line-clamp-2 text-sm text-slate-300">{preview}</p>
		{/if}

		<QuestMetaRow {location} {isRemote} {postedAt} />

		<div class="flex flex-wrap items-center gap-2">
			<Badge tone={categoryTone}>
				{#if categoryIcon}
					<span aria-hidden="true" class="mr-1">{categoryIcon}</span>
				{/if}
				{category}
			</Badge>
			<Badge tone={DIFFICULTY_TONES[difficulty]}>
				{difficulty}
			</Badge>
			<QuestStatusBadge {status} />
		</div>

		{#if href}
			<Button
				{href}
				variant="primary"
				className="relative z-30 transition-all duration-150 hover:bg-orange-500 active:scale-95"
			>
				{actionLabel}
			</Button>
		{:else}
			<Button
				type="button"
				variant="primary"
				className="transition-all duration-150 hover:bg-orange-500 active:scale-95"
			>
				{actionLabel}
			</Button>
		{/if}
	</div>
</Card>
