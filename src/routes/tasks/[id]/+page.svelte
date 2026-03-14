<script lang="ts">
	import { enhance } from '$app/forms';
	import QuestReward from '$lib/components/quests/QuestReward.svelte';
	import Badge, { type BadgeTone } from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let isAccepting = $state(false);

	function normalizedTaskStatus(): string {
		return data.task.status.trim().toLowerCase();
	}

	function latestCompletionUpdate() {
		return data.proofs.length > 0 ? data.proofs[0] : null;
	}

	function latestReviewDecision() {
		return data.decisions.length > 0 ? data.decisions[0] : null;
	}

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

	function memberSince(value: string | null | undefined): string {
		if (!value) return 'Unknown';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'Unknown';
		return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
	}

	function ratingSummary(value: number | null): string {
		if (value === null || !Number.isFinite(value)) return '⭐ New user';
		return `⭐ ${value.toFixed(1)}`;
	}

	function levelSummary(level: number, title: string | null): string {
		return title ? `Level ${level} ${title}` : `Level ${level}`;
	}

	function badgeTextFallback(name: string): string {
		const words = (name || '').trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return 'BG';
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`.toUpperCase();
	}

	function nextStepMessage(data: PageData): string {
		const status = data.task.status.toLowerCase();
		if (!data.isLoggedIn)
			return 'Sign in to accept quests, submit completion updates, and review status.';
		if (data.isPoster) {
			if (status === 'open') return 'Your quest is live and awaiting acceptance.';
			if (status === 'completed')
				return 'Your quest is marked completed. Review the timeline below.';
			if (status === 'accepted') return 'Worker has accepted the quest. Waiting for them to begin.';
			return data.acceptedWorkerName
				? `Accepted by ${data.acceptedWorkerName}. Review completion updates and confirm when done.`
				: 'Your quest is in progress. Monitor completion updates below.';
		}
		if (data.isAssignedWorker) {
			if (status === 'accepted') return 'Next step: Start the quest when you begin the work.';
			if (status === 'in_progress') return 'Next step: Submit a completion update when finished.';
			return `You're assigned to this quest. Share completion updates for ${data.task.creatorName}.`;
		}
		if (data.hasAcceptedWorker) {
			return data.acceptedWorkerName
				? `This quest is already accepted by ${data.acceptedWorkerName}.`
				: 'This quest has already been accepted.';
		}
		return 'This quest is open and awaiting acceptance.';
	}

	function completionGuidance(): string {
		if (normalizedTaskStatus() === 'completed') {
			return 'This task is complete. Review history is available below.';
		}
		if (latestReviewDecision()?.decision === 'disputed') {
			return latestReviewDecision()?.reason
				? `Latest completion update was disputed: ${latestReviewDecision()?.reason}`
				: 'Latest completion update was disputed. Additional clarification or work is needed.';
		}
		if (latestReviewDecision()?.decision === 'approved') {
			return 'A completion update was approved and the task is complete.';
		}
		if (latestCompletionUpdate()) {
			return `Latest completion update was submitted by ${latestCompletionUpdate()?.submittedByName} on ${fmtDate(String(latestCompletionUpdate()?.createdAt))}.`;
		}
		if (data.hasAcceptedWorker) {
			return 'No completion update submitted yet. The accepted worker can submit a completion note when work is finished.';
		}
		return 'Completion starts after a worker accepts this task.';
	}

	function stars(value: number): string {
		const safe = Math.max(1, Math.min(5, Math.round(value)));
		return '★'.repeat(safe) + '☆'.repeat(5 - safe);
	}

	const enhanceAcceptQuest = () => {
		isAccepting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isAccepting = false;
		};
	};

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
				{#if data.isPoster}
					<Badge tone="slate">Your Quest</Badge>
				{/if}
				{#if data.acceptedWorkerName}
					<Badge tone="blue">Accepted by {data.acceptedWorkerName}</Badge>
				{:else}
					<Badge tone="slate">Awaiting acceptance</Badge>
				{/if}
			</div>
			<div class="mt-4">
				<QuestReward reward={data.task.budgetCents / 100} />
			</div>
			<h1 class="mt-4 text-3xl leading-tight font-bold text-white sm:text-4xl">
				{data.task.title || 'Untitled Task'}
			</h1>
			<p class="mt-2 text-sm text-slate-300">
				{#if data.task.deadline}
					Complete by {fmtDate(data.task.deadline)}.
				{:else}
					Completion notes are required. Optional attachments can support final review.
				{/if}
			</p>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">Task Details</h2>
			<p class="mt-3 text-sm leading-relaxed whitespace-pre-line text-slate-300">
				{data.task.description || 'No detailed description provided yet.'}
			</p>

			<div class="mt-4 flex flex-wrap items-center gap-2">
				<Badge tone="slate">{data.task.category || 'General'}</Badge>
				<Badge tone={difficultyTone(difficultyFromBudget(data.task.budgetCents))}
					>{difficultyFromBudget(data.task.budgetCents)}</Badge
				>
				<Badge tone="slate">Optional supporting proof: {data.task.verificationType}</Badge>
			</div>

			<div class="mt-5 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
				<h3 class="text-sm font-semibold tracking-wide text-slate-200 uppercase">
					Requirements / Notes
				</h3>
				<ul class="mt-3 space-y-2 text-sm text-slate-300">
					<li>Submit a completion note when work is done (attachments optional).</li>
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
				<div
					class="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-300"
				>
					<p class="font-medium text-slate-100">Address visibility</p>
					{#if data.canViewExactAddress}
						<p class="mt-1">
							{data.task.addressLine1 || 'Address unavailable'}{#if data.task.addressLine2}, {data
									.task.addressLine2}{/if}, {locationFrom(
								data.task.city,
								data.task.state
							)}{#if data.task.postalCode}
								{data.task.postalCode}{/if}
						</p>
					{:else}
						<p class="mt-1">Exact street address is hidden until assignment.</p>
					{/if}
				</div>
			</Card>

			<Card as="section" tone="dark" className="border-slate-700/80 p-5">
				<h2 class="text-lg font-semibold text-white">People & Trust</h2>
				<div class="mt-3 space-y-4">
					<div class="space-y-1 text-sm text-slate-300">
						<p>
							<span class="font-semibold text-slate-100">Posted by:</span>
							{data.posterTrust?.displayName ?? data.task.creatorName ?? 'Poster'}
						</p>
						{#if data.posterTrust}
							<p>
								{ratingSummary(data.posterTrust.averageRating)} • {levelSummary(
									data.posterTrust.level,
									data.posterTrust.levelTitle
								)}
							</p>
							<p>Member since {memberSince(data.posterTrust.memberSince)}</p>
							{#if data.posterTrust.badges.length > 0}
								<div class="pt-1">
									<p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Badges</p>
									<div class="mt-2 flex flex-wrap gap-2">
										{#each data.posterTrust.badges as badge}
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
								</div>
							{/if}
						{/if}
					</div>

					<div class="border-t border-slate-700/70 pt-4">
						{#if data.acceptedWorkerTrust}
							<div class="space-y-1 text-sm text-slate-300">
								<p>
									<span class="font-semibold text-slate-100">Accepted worker:</span>
									{data.acceptedWorkerTrust.displayName}
								</p>
								<p>
									{ratingSummary(data.acceptedWorkerTrust.averageRating)} • {levelSummary(
										data.acceptedWorkerTrust.level,
										data.acceptedWorkerTrust.levelTitle
									)}
								</p>
								<p>Member since {memberSince(data.acceptedWorkerTrust.memberSince)}</p>
								{#if data.acceptedWorkerTrust.badges.length > 0}
									<div class="pt-1">
										<p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
											Badges
										</p>
										<div class="mt-2 flex flex-wrap gap-2">
											{#each data.acceptedWorkerTrust.badges as badge}
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
									</div>
								{/if}
							</div>
						{:else}
							<p class="text-sm text-slate-300">No worker assigned yet.</p>
						{/if}
					</div>
				</div>
			</Card>
		</div>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-lg font-semibold text-white">Next Step</h2>
			<p class="mt-2 text-sm text-slate-300">{nextStepMessage(data)}</p>
			<div class="mt-4">
				{#if data.isPoster}
					<div class="flex flex-wrap items-center gap-2">
						<Badge tone="slate">Your Quest</Badge>
						<Button
							href={`/tasks/${data.task.id}/manage`}
							variant="secondary"
							className="w-full sm:w-auto">Manage Task</Button
						>
					</div>
				{:else if data.isAssignedWorker && normalizedTaskStatus() === 'accepted'}
					<form method="post" action="?/startQuest">
						<Button type="submit" variant="primary" className="w-full sm:w-auto">Start Quest</Button
						>
					</form>
				{:else if data.hasAcceptedWorker}
					<Badge tone={statusTone(data.task.status)}>{statusLabel(data.task.status)}</Badge>
				{:else if data.isLoggedIn}
					<form method="post" action="?/acceptQuest" use:enhance={enhanceAcceptQuest}>
						<Button
							type="submit"
							variant="primary"
							className="w-full sm:w-auto"
							disabled={isAccepting}
						>
							{isAccepting ? 'Accepting Quest...' : 'Accept Quest'}
						</Button>
					</form>
				{:else}
					<Button
						href={actionHrefFor(data.isLoggedIn)}
						variant="primary"
						className="w-full sm:w-auto"
					>
						{actionLabelFor(data.isLoggedIn, data.isPoster, data.task.status)}
					</Button>
				{/if}
			</div>
			{#if !data.isLoggedIn}
				<div class="mt-3 flex flex-col gap-2 sm:flex-row">
					<Button href="/login" variant="ghost" className="w-full sm:w-auto">Login</Button>
					<Button href="/signup" variant="secondary" className="w-full sm:w-auto"
						>Create account</Button
					>
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
			<h2 class="text-xl font-semibold text-white">Completion Updates</h2>
			<p class="text-sm text-slate-300">
				Completion notes are the primary submission method. Supporting proof is optional.
			</p>
			<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-3">
				<p class="text-sm text-slate-200">{completionGuidance()}</p>
			</Card>
			{#if data.isLoggedIn}
				<div class="grid gap-4 sm:grid-cols-2">
					{#if data.isAssignedWorker && normalizedTaskStatus() === 'in_progress'}
						<form method="post" action="?/submitProof" use:enhance>
							<Card
								as="div"
								tone="dark"
								className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4"
							>
								<h3 class="font-semibold text-white">Submit completion update</h3>
								<label class="block text-sm font-medium text-slate-200">
									Completion note
									<textarea
										name="note"
										required
										rows="3"
										class={workflowControlClass}
										placeholder="What you completed, what was done, and any important details"
									></textarea>
								</label>
								<label class="block text-sm font-medium text-slate-200">
									Attachment type (optional)
									<select name="attachment_type" class={workflowControlClass}>
										<option value="photo">Photo</option>
										<option value="video">Video</option>
									</select>
								</label>
								<label class="block text-sm font-medium text-slate-200">
									Attachment URL (optional)
									<input
										name="attachment_url"
										class={workflowControlClass}
										placeholder="https://..."
									/>
								</label>
								<p class="text-xs text-slate-400">
									Optional supporting proof can be a photo or video link.
								</p>
								<Button type="submit" variant="primary">Submit Completion Update</Button>
							</Card>
						</form>
					{:else if data.isAssignedWorker && normalizedTaskStatus() === 'accepted'}
						<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
							<p class="text-sm text-slate-300">
								Start the quest first, then submit completion updates when finished.
							</p>
						</Card>
					{:else if !data.isPoster}
						<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
							<p class="text-sm text-slate-300">
								Only the accepted worker can submit completion updates.
							</p>
						</Card>
					{/if}

					{#if data.isPoster && normalizedTaskStatus() === 'in_progress'}
						<form method="post" action="?/approveProof" use:enhance>
							<Card
								as="div"
								tone="dark"
								className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4"
							>
								<h3 class="font-semibold text-white">Poster review</h3>
								{#if data.proofs.length === 0}
									<p class="text-sm text-slate-300">
										No completion updates have been submitted yet.
									</p>
								{:else}
									<label class="block text-sm font-medium text-slate-200">
										Update to approve
										<select name="proof_id" class={workflowControlClass}>
											<option value="">Most recent (or leave blank)</option>
											{#each data.proofs as proof}
												<option value={proof.id}
													>Update #{proof.id} by {proof.submittedByName}</option
												>
											{/each}
										</select>
									</label>
									<Button type="submit" variant="primary">Approve Update</Button>
								{/if}
							</Card>
						</form>
					{/if}
				</div>

				{#if data.isPoster && normalizedTaskStatus() === 'in_progress' && data.proofs.length > 0}
					<form method="post" action="?/disputeProof" use:enhance>
						<Card
							as="div"
							tone="dark"
							className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4"
						>
							<h3 class="font-semibold text-white">Dispute update</h3>
							<div class="grid gap-3 sm:grid-cols-[1fr_2fr]">
								<label class="block text-sm font-medium text-slate-200">
									Update
									<select name="proof_id" class={workflowControlClass}>
										<option value="">Most recent (or leave blank)</option>
										{#each data.proofs as proof}
											<option value={proof.id}>Update #{proof.id}</option>
										{/each}
									</select>
								</label>
								<label class="block text-sm font-medium text-slate-200">
									Reason
									<input
										name="reason"
										required
										class={workflowControlClass}
										placeholder="Why this completion update is disputed"
									/>
								</label>
							</div>
							<Button type="submit" variant="ghost">Submit Dispute</Button>
						</Card>
					</form>
				{/if}
			{:else}
				<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<p class="text-sm text-slate-300">
						Sign in to submit completion updates and track review decisions.
					</p>
				</Card>
			{/if}

			<div class="grid gap-4 sm:grid-cols-2">
				<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<h3 class="font-semibold text-white">Completion timeline</h3>
					{#if data.proofs.length === 0}
						<p class="mt-2 text-sm text-slate-300">
							No completion updates yet. The accepted worker can submit a completion note when work
							is done.
						</p>
					{:else}
						<ul class="mt-3 space-y-2 text-sm text-slate-300">
							{#each data.proofs as proof}
								<li>
									<strong>Update #{proof.id}</strong> by {proof.submittedByName}<br />
									{#if proof.proofUrl !== 'about:blank'}
										<a href={proof.proofUrl} class="underline" target="_blank" rel="noreferrer"
											>Open attachment</a
										>
										<span> ({proof.proofType})</span>
									{:else}
										<span>No attachment included</span>
									{/if}
									{#if proof.note}<div>{proof.note}</div>{/if}
									<div class="text-xs">{fmtDate(proof.createdAt)}</div>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>

				<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<h3 class="font-semibold text-white">Review timeline</h3>
					{#if data.decisions.length === 0}
						<p class="mt-2 text-sm text-slate-300">No decision updates yet.</p>
					{:else}
						<ul class="mt-3 space-y-2 text-sm text-slate-300">
							{#each data.decisions as decision}
								<li>
									<strong>{decision.decision}</strong> by {decision.decidedByName}
									{#if decision.proofId}<span> (update #{decision.proofId})</span>{/if}
									{#if decision.reason}<div>{decision.reason}</div>{/if}
									<div class="text-xs">{fmtDate(decision.createdAt)}</div>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>
			</div>
		</Card>

		{#if normalizedTaskStatus() === 'completed'}
			<Card
				as="section"
				tone="dark"
				className="space-y-4 border-slate-700/80 bg-slate-900/85 p-5 sm:p-6"
			>
				<h2 class="text-xl font-semibold text-white">How did the quest go?</h2>
				<p class="text-sm text-slate-300">
					Leave a quick review to help build trust between posters and workers.
				</p>

				{#if data.canLeaveReview}
					<form method="post" action="?/submitReview" use:enhance>
						<Card
							as="div"
							tone="dark"
							className="space-y-3 border-slate-700/80 bg-slate-800/70 p-4"
						>
							<p class="text-sm text-slate-300">
								You're reviewing: <span class="font-semibold text-slate-100"
									>{data.reviewTargetName}</span
								>
							</p>
							<label class="block text-sm font-medium text-slate-200">
								Star rating
								<select name="rating" required class={workflowControlClass}>
									<option value="5">5 - Excellent</option>
									<option value="4">4 - Great</option>
									<option value="3">3 - Good</option>
									<option value="2">2 - Fair</option>
									<option value="1">1 - Poor</option>
								</select>
							</label>
							<label class="block text-sm font-medium text-slate-200">
								Comment (optional)
								<textarea
									name="comment"
									rows="3"
									maxlength="280"
									class={workflowControlClass}
									placeholder="Short feedback on communication, quality, and reliability"
								></textarea>
							</label>
							<Button type="submit" variant="primary">Submit Review</Button>
						</Card>
					</form>
				{:else if data.reviews.length === 0}
					<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
						<p class="text-sm text-slate-300">No reviews submitted yet.</p>
					</Card>
				{:else}
					<Card as="div" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
						<p class="text-sm text-slate-300">Your review for this task is already submitted.</p>
					</Card>
				{/if}

				<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-800/70 p-4">
					<h3 class="font-semibold text-white">Review history</h3>
					{#if data.reviews.length === 0}
						<p class="mt-2 text-sm text-slate-300">No reviews yet for this quest.</p>
					{:else}
						<ul class="mt-3 space-y-3 text-sm text-slate-300">
							{#each data.reviews as review}
								<li>
									<p>
										<span class="font-semibold text-slate-100">{review.reviewerName}</span>
										<span> reviewed </span>
										<span class="font-semibold text-slate-100">{review.revieweeName}</span>
									</p>
									<p class="text-amber-300">{stars(review.rating)} ({review.rating}/5)</p>
									{#if review.comment}<p>{review.comment}</p>{/if}
									<p class="text-xs">{fmtDate(review.createdAt)}</p>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>
			</Card>
		{/if}
	</div>
</PageContainer>
