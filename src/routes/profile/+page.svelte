<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function memberSinceLabel(value: string | null): string {
		if (!value) return 'Recently';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'Recently';
		return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
	}

	function avatarInitial(name: string): string {
		return (name || 'S').trim().charAt(0).toUpperCase() || 'S';
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
</script>

<PageContainer className="max-w-4xl space-y-5 sm:space-y-6">
	<Card as="header" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5 sm:p-6">
		<p class="eyebrow text-slate-300">Profile</p>
		<div class="mt-3 flex items-center gap-4">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-2xl font-bold text-slate-100"
				aria-hidden="true"
			>
				{avatarInitial(data.displayName)}
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
		<div class="mt-3 grid gap-2 sm:grid-cols-2">
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs uppercase tracking-wide text-slate-400">Level</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{data.levelLabel}</p>
			</div>
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs uppercase tracking-wide text-slate-400">Completed</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{data.completedQuestsCount} quests</p>
			</div>
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs uppercase tracking-wide text-slate-400">Average Rating</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{ratingLabel(data.averageRating)}</p>
			</div>
			<div class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
				<p class="text-xs uppercase tracking-wide text-slate-400">Reviews Received</p>
				<p class="mt-1 text-sm font-semibold text-slate-100">{data.reviewsReceivedCount}</p>
			</div>
		</div>
		<div class="mt-3">
			<Badge tone="slate">Badges coming soon</Badge>
		</div>
		{#if data.recentReview}
			<div class="mt-3 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-300">
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

	<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
		<h2 class="text-lg font-semibold text-white">Your Activity</h2>
		<p class="mt-2 text-sm text-slate-300">Quick links to the activity areas you use most.</p>
		<div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
			<Button href="/dashboard#my-active-quests" variant="primary" className="w-full sm:w-auto">My Active Quests</Button>
			<Button href="/dashboard#my-posted-tasks" variant="secondary" className="w-full sm:w-auto">My Posted Tasks</Button>
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
