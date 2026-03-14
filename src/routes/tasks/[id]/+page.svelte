<script lang="ts">
	import { enhance } from '$app/forms';
	import QuestReward from '$lib/components/quests/QuestReward.svelte';
	import Badge, { type BadgeTone } from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function fmtDate(value: string) {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'Unknown date';
		return date.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function statusLabel(raw: string): string {
		const normalized = raw.trim().toLowerCase().replace(/_/g, ' ');
		if (normalized === 'in progress') return 'In Progress';
		return normalized ? normalized.replace(/\b\w/g, (x) => x.toUpperCase()) : 'Open';
	}

	function statusTone(raw: string): BadgeTone {
		const normalized = raw.trim().toLowerCase().replace(/_/g, ' ');
		if (normalized === 'open') return 'emerald';
		if (normalized === 'accepted') return 'blue';
		if (normalized === 'in progress') return 'yellow';
		if (normalized === 'completed') return 'zinc';
		if (normalized === 'paid') return 'purple';
		return 'slate';
	}

	function difficultyFromBudget(budgetCents: number): 'Easy' | 'Medium' | 'Hard' {
		// Temporary approximation until difficulty is modeled explicitly in DB.
		if (budgetCents >= 20000) return 'Hard';
		if (budgetCents >= 8000) return 'Medium';
		return 'Easy';
	}

	function difficultyTone(value: 'Easy' | 'Medium' | 'Hard'): BadgeTone {
		if (value === 'Easy') return 'emerald';
		if (value === 'Medium') return 'amber';
		return 'red';
	}

	function locationFrom(city: string, state: string): string {
		return [city, state].filter(Boolean).join(', ') || 'Location TBD';
	}

	function actionLabelFor(isLoggedIn: boolean, isPoster: boolean, status: string): string {
		if (!isLoggedIn) return 'Sign In to Accept';
		if (isPoster) return 'Manage Verification';
		return status.toLowerCase() === 'open' ? 'View Interest Flow' : 'View Task Workflow';
	}

	function actionHrefFor(isLoggedIn: boolean): string {
		return !isLoggedIn ? '/login' : '#verification-workflow';
	}

	const workflowControlClass =
		'mt-1 block w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300';
</script>

<PageContainer className="max-w-5xl">
	<div class="space-y-6 sm:space-y-8">
		<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5 sm:p-6">
			<p class="eyebrow text-slate-300">Task Summary</p>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<Badge tone={statusTone(data.task.status)}>{statusLabel(data.task.status)}</Badge>
				<Badge tone="slate">{data.task.category || 'General'}</Badge>
			</div>
			<div class="mt-4">
				<QuestReward reward={data.task.budgetCents / 100} />
			</div>
			<h1 class="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
				{data.task.title || 'Untitled Task'}
			</h1>
			<p class="mt-2 text-sm text-slate-300">
				{#if data.task.deadline}
					Complete by {fmtDate(data.task.deadline)}.
				{:else}
					Verification required: {data.task.verificationType}. Review details before accepting.
				{/if}
			</p>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">Task Details</h2>
			<p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
				{data.task.description || 'No detailed description provided yet.'}
			</p>

			<div class="mt-4 flex flex-wrap items-center gap-2">
				<Badge tone="slate">{data.task.category || 'General'}</Badge>
				<Badge tone={difficultyTone(difficultyFromBudget(data.task.budgetCents))}
					>{difficultyFromBudget(data.task.budgetCents)}</Badge
				>
				<Badge tone="slate">Verification: {data.task.verificationType}</Badge>
			</div>

			<div class="mt-5 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
				<h3 class="text-sm font-semibold uppercase tracking-wide text-slate-200">Requirements / Notes</h3>
				<ul class="mt-3 space-y-2 text-sm text-slate-300">
					<li>Submit {data.task.verificationType} proof for completion review.</li>
					{#if data.task.deadline}
						<li>Preferred completion window ends {fmtDate(data.task.deadline)}.</li>
					{:else}
						<li>No explicit deadline provided yet.</li>
					{/if}
				</ul>
			</div>
		</Card>

		<div class="grid gap-4 md:grid-cols-2">
			<Card as="section" tone="dark" className="border-slate-700/80 p-5">
				<h2 class="text-lg font-semibold text-white">Location & Privacy</h2>
				<ul class="mt-3 space-y-2 text-sm text-slate-300">
					<li>
						<span class="font-semibold text-slate-100">Location:</span>
						{locationFrom(data.task.city, data.task.state)}
					</li>
					<li>
						<span class="font-semibold text-slate-100">Posted:</span>
						{fmtDate(data.task.createdAt)}
					</li>
					<li>
						<span class="font-semibold text-slate-100">Mode:</span>
						Local (remote indicator not yet modeled)
					</li>
				</ul>
				<div class="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-300">
					<p class="font-medium text-slate-100">Address visibility</p>
					{#if data.canViewExactAddress}
						<p class="mt-1">
							{data.task.addressLine1 || 'Address unavailable'}{#if data.task.addressLine2}, {data.task.addressLine2}{/if}, {locationFrom(data.task.city, data.task.state)}{#if data.task.postalCode} {data.task.postalCode}{/if}
						</p>
					{:else}
						<p class="mt-1">Exact street address is hidden until assignment.</p>
					{/if}
				</div>
			</Card>

			<Card as="section" tone="dark" className="border-slate-700/80 p-5">
				<h2 class="text-lg font-semibold text-white">Poster Trust</h2>
				<p class="mt-3 text-sm text-slate-300">
					<span class="font-semibold text-slate-100">Display name:</span>
					{data.task.creatorName || 'Poster'}
				</p>
				<p class="mt-2 text-sm text-slate-300">
					<span class="font-semibold text-slate-100">Join date:</span>
					Not available yet
				</p>
				<p class="mt-2 text-sm text-slate-300">
					<span class="font-semibold text-slate-100">Reputation:</span>
					Trust history and completion stats are coming soon.
				</p>
			</Card>
		</div>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-lg font-semibold text-white">Next Step</h2>
			<p class="mt-2 text-sm text-slate-300">
				{#if data.isLoggedIn}
					Review workflow details and submit the next action.
				{:else}
					Sign in to bid, submit proof, and message the poster.
				{/if}
			</p>
			<div class="mt-4">
				<Button href={actionHrefFor(data.isLoggedIn)} variant="primary" className="w-full sm:w-auto">
					{actionLabelFor(data.isLoggedIn, data.isPoster, data.task.status)}
				</Button>
			</div>
			{#if !data.isLoggedIn}
				<div class="mt-3 flex flex-col gap-2 sm:flex-row">
					<Button href="/login" variant="ghost" className="w-full sm:w-auto">Login</Button>
					<Button href="/signup" variant="secondary" className="w-full sm:w-auto">Create account</Button>
				</div>
			{/if}
		</Card>

		{#if form?.message}
			<Card as="section" tone="light" className="p-4">
				<p class="text-sm text-[var(--muted)]">{form.message}</p>
			</Card>
		{/if}

		<Card
			id="verification-workflow"
			as="section"
			tone="dark"
			className="space-y-4 border-slate-700/80 bg-slate-900/85 p-5 sm:p-6"
		>
			<h2 class="text-xl font-semibold text-white">Verification & Completion</h2>
			<p class="text-sm text-slate-300">Track proof submissions and approval updates in one place.</p>
			{#if data.isLoggedIn}
				<div class="grid gap-4 sm:grid-cols-2">
					{#if !data.isPoster}
						<form method="post" action="?/submitProof" use:enhance>
							<Card as="div" tone="dark" className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4">
								<h3 class="font-semibold text-white">Submit proof</h3>
								<label class="block text-sm font-medium text-slate-200">
									Proof type
									<select name="proof_type" class={workflowControlClass}>
										<option value="photo">Photo</option>
										<option value="video">Video</option>
									</select>
								</label>
								<label class="block text-sm font-medium text-slate-200">
									Proof URL
									<input name="proof_url" required class={workflowControlClass} placeholder="https://..." />
								</label>
								<label class="block text-sm font-medium text-slate-200">
									Note
									<textarea
										name="note"
										rows="2"
										class={workflowControlClass}
										placeholder="Optional context for the reviewer"
									></textarea>
								</label>
								<Button type="submit" variant="primary">Submit Proof</Button>
							</Card>
						</form>
					{/if}

					{#if data.isPoster}
						<form method="post" action="?/approveProof" use:enhance>
							<Card as="div" tone="dark" className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4">
								<h3 class="font-semibold text-white">Poster decision</h3>
								<label class="block text-sm font-medium text-slate-200">
									Proof to approve
									<select name="proof_id" class={workflowControlClass}>
										<option value="">Most recent (or leave blank)</option>
										{#each data.proofs as proof}
											<option value={proof.id}>#{proof.id} {proof.proofType} by {proof.submittedByName}</option>
										{/each}
									</select>
								</label>
								<Button type="submit" variant="primary">Approve Proof</Button>
							</Card>
						</form>
					{/if}
				</div>

				{#if data.isPoster}
					<form method="post" action="?/disputeProof" use:enhance>
						<Card as="div" tone="dark" className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4">
							<h3 class="font-semibold text-white">Dispute proof</h3>
							<div class="grid gap-3 sm:grid-cols-[1fr_2fr]">
								<label class="block text-sm font-medium text-slate-200">
									Proof
									<select name="proof_id" class={workflowControlClass}>
										<option value="">Most recent (or leave blank)</option>
										{#each data.proofs as proof}
											<option value={proof.id}>#{proof.id} {proof.proofType}</option>
										{/each}
									</select>
								</label>
								<label class="block text-sm font-medium text-slate-200">
									Reason
									<input name="reason" required class={workflowControlClass} placeholder="Why the proof is disputed" />
								</label>
							</div>
							<Button type="submit" variant="ghost">Submit Dispute</Button>
						</Card>
					</form>
				{/if}
			{:else}
				<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<p class="text-sm text-slate-300">Sign in to submit proof updates and message the poster.</p>
				</Card>
			{/if}

			<div class="grid gap-4 sm:grid-cols-2">
				<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<h3 class="font-semibold text-white">Proof timeline</h3>
					{#if data.proofs.length === 0}
						<p class="mt-2 text-sm text-slate-300">No proof submissions yet.</p>
					{:else}
						<ul class="mt-3 space-y-2 text-sm text-slate-300">
							{#each data.proofs as proof}
								<li>
									<strong>#{proof.id} {proof.proofType}</strong> by {proof.submittedByName}<br />
									<a href={proof.proofUrl} class="underline" target="_blank" rel="noreferrer">Open proof</a>
									{#if proof.note}<span> • {proof.note}</span>{/if}
									<div class="text-xs">{fmtDate(proof.createdAt)}</div>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>

				<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<h3 class="font-semibold text-white">Decision timeline</h3>
					{#if data.decisions.length === 0}
						<p class="mt-2 text-sm text-slate-300">No decision updates yet.</p>
					{:else}
						<ul class="mt-3 space-y-2 text-sm text-slate-300">
							{#each data.decisions as decision}
								<li>
									<strong>{decision.decision}</strong> by {decision.decidedByName}
									{#if decision.proofId}<span> (proof #{decision.proofId})</span>{/if}
									{#if decision.reason}<div>{decision.reason}</div>{/if}
									<div class="text-xs">{fmtDate(decision.createdAt)}</div>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>
			</div>
		</Card>
	</div>
</PageContainer>
