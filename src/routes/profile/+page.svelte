<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import UserAvatar from '$lib/components/ui/UserAvatar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function memberSinceLabel(value: string | null): string {
		if (!value) return 'Recently';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'Recently';
		return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
	}

	function ratingLabel(value: number | null): string {
		if (value === null || !Number.isFinite(value)) return 'No ratings yet';
		return `${value.toFixed(2)} / 5`;
	}

	function shortDate(value: string): string {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'Recently';
		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function levelLabel(level: number, title: string | null): string {
		return title ? `Level ${level} - ${title}` : `Level ${level}`;
	}

	function xpRequiredForLevel(level: number): number {
		const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
		return 20 * (safeLevel - 1) * (safeLevel - 1);
	}

	function progressMetrics(level: number, xp: number) {
		const currentLevelXP = xpRequiredForLevel(level);
		const nextLevel = level + 1;
		const nextLevelXP = xpRequiredForLevel(nextLevel);
		const rawProgress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
		const progressFraction = Math.min(1, Math.max(0, rawProgress));
		const remainingXP = Math.max(0, nextLevelXP - xp);
		return { nextLevel, nextLevelXP, progressFraction, remainingXP };
	}

	function badgeTextFallback(name: string): string {
		const words = (name || '').trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return 'BG';
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`.toUpperCase();
	}
</script>

<PageContainer className="max-w-4xl space-y-5 sm:space-y-6">
	<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5 sm:p-6">
		<p class="eyebrow text-slate-300">Identity</p>
		<div class="mt-3 flex items-center gap-4">
			<div class="relative h-16 w-16">
				<UserAvatar
					name={data.displayName}
					avatarUrl={data.avatarUrl}
					className="h-16 w-16"
					textClassName="text-2xl"
				/>
				<div
					class="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900"
					aria-label={`User Level ${data.level}`}
				>
					{data.level}
				</div>
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">{data.displayName}</h1>
				<p class="mt-1 text-sm text-slate-300">{data.email}</p>
				<p class="mt-1 text-xs text-slate-400">Member since {memberSinceLabel(data.memberSince)}</p>
			</div>
		</div>
	</Card>

	<Card as="section" tone="dark" className="border-slate-700/80 p-5">
		<h2 class="text-lg font-semibold text-white">Progress</h2>
		{@const metrics = progressMetrics(data.level, data.xp)}
		<div class="mt-3 space-y-2">
			<p class="text-sm font-semibold text-slate-100">{levelLabel(data.level, data.levelTitle)}</p>
			<div class="h-2 w-full overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
				<div
					class="h-full rounded-full bg-amber-400 transition-all duration-500"
					style={`width: ${metrics.progressFraction * 100}%`}
				></div>
			</div>
			<p class="text-xs text-slate-300">{data.xp} / {metrics.nextLevelXP} XP</p>
			<p class="text-xs text-slate-400">{metrics.remainingXP} XP to Level {metrics.nextLevel}</p>
		</div>
	</Card>

	<Card as="section" tone="dark" className="border-slate-700/80 p-5">
		<h2 class="text-lg font-semibold text-white">Reputation</h2>
		<div class="mt-3 grid gap-2 sm:grid-cols-3">
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs tracking-wide text-slate-400 uppercase">Completed Quests</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{data.completedQuestsCount}</p>
			</div>
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs tracking-wide text-slate-400 uppercase">Average Rating</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{ratingLabel(data.averageRating)}</p>
			</div>
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs tracking-wide text-slate-400 uppercase">Reviews Received</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{data.reviewsReceivedCount}</p>
			</div>
		</div>
		{#if data.recentReview}
			<div
				class="mt-3 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-300"
			>
				<p>
					<span class="font-semibold text-slate-100">Recent review:</span>
					{data.recentReview.rating}/5 from {data.recentReview.reviewerName}
				</p>
				{#if data.recentReview.comment}
					<p class="mt-1 line-clamp-2">{data.recentReview.comment}</p>
				{/if}
				<p class="mt-1 text-xs text-slate-400">{shortDate(data.recentReview.createdAt)}</p>
			</div>
		{/if}
	</Card>

	<Card as="section" tone="dark" className="border-slate-700/80 p-5">
		<h2 class="text-lg font-semibold text-white">Badges</h2>
		{#if data.badges.length === 0}
			<p class="mt-2 text-sm text-slate-300">
				Badges will appear here as you build your reputation.
			</p>
		{:else}
			<div class="mt-3 flex flex-wrap gap-2">
				{#each data.badges as badge}
					<div
						class="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200"
						title={badge.description}
					>
						{#if badge.imageUrl}
							<img
								src={badge.imageUrl}
								alt={badge.name}
								class="h-5 w-5 rounded-full object-cover"
								loading="lazy"
							/>
						{:else if badge.iconValue}
							<span class="text-sm" aria-hidden="true">{badge.iconValue}</span>
						{:else}
							<span class="text-[10px] font-semibold tracking-wide text-slate-300">
								{badgeTextFallback(badge.name)}
							</span>
						{/if}
						<span class="font-medium">{badge.name}</span>
					</div>
				{/each}
			</div>
		{/if}
	</Card>

	<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
		<h2 class="text-lg font-semibold text-white">Activity</h2>
		<p class="mt-2 text-sm text-slate-300">Quick links to the activity areas you use most.</p>
		<div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
			<Button href="/dashboard#my-posted-tasks" variant="secondary" className="w-full sm:w-auto"
				>My Posted Tasks</Button
			>
			<Button href="/dashboard#my-active-quests" variant="primary" className="w-full sm:w-auto"
				>My Active Quests</Button
			>
			<Button href="/dashboard" variant="ghost" className="w-full sm:w-auto">Dashboard</Button>
		</div>
	</Card>

	<Card as="section" tone="dark" className="border-slate-700/80 p-5">
		<h2 class="text-lg font-semibold text-white">Account</h2>
		<p class="mt-2 text-sm text-slate-300">Session and account-level controls.</p>
		<div class="mt-4">
			<form method="post" action="/logout" class="w-full sm:w-auto">
				<Button type="submit" variant="ghost" className="w-full sm:w-auto">Sign out</Button>
			</form>
		</div>
	</Card>
</PageContainer>
