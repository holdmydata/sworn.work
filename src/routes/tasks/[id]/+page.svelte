<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	function fmtDate(value: string) {
		return new Date(value).toLocaleString();
	}
</script>

<section class="mx-auto max-w-4xl px-6 py-12">
	<article class="card">
		<p class="eyebrow">Task Detail</p>
		<h1 class="mt-2 text-3xl font-bold tracking-tight">{data.task.title}</h1>
		<p class="mt-3 text-sm text-[var(--muted)]">
			{data.task.category} • {money.format(data.task.budgetCents / 100)} • {data.task.city}, {data.task.state}
		</p>
		<p class="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">Verification required: {data.task.verificationType}</p>

		<div class="mt-6 space-y-4">
			<div>
				<h2 class="text-lg font-semibold">Description</h2>
				<p class="mt-2 text-sm text-[var(--muted)]">{data.task.description}</p>
			</div>

			<div>
				<h2 class="text-lg font-semibold">Posted by</h2>
				<p class="mt-2 text-sm text-[var(--muted)]">{data.task.creatorName}</p>
			</div>
		</div>

		<div class="mt-6 rounded-xl border border-[var(--line)] bg-white/70 p-4">
			<p class="text-sm font-medium text-[var(--ink)]">Address visibility</p>
			{#if data.canViewExactAddress}
				<p class="mt-2 text-sm text-[var(--muted)]">
					{data.task.addressLine1}{#if data.task.addressLine2}, {data.task.addressLine2}{/if}, {data.task.city}, {data.task.state}{#if data.task.postalCode} {data.task.postalCode}{/if}
				</p>
			{:else}
				<p class="mt-2 text-sm text-[var(--muted)]">Exact street address is hidden until a bid is accepted.</p>
			{/if}
		</div>

		{#if form?.message}
			<p class="mt-4 text-sm text-[var(--muted)]">{form.message}</p>
		{/if}

		{#if data.isLoggedIn}
			<div class="mt-8 grid gap-4 sm:grid-cols-2">
				{#if !data.isPoster}
					<form method="post" action="?/submitProof" use:enhance class="rounded-xl border border-[var(--line)] bg-white/70 p-4 space-y-3">
						<h3 class="font-semibold">Submit proof</h3>
						<label class="block text-sm font-medium">
							Proof type
							<select name="proof_type" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white">
								<option value="photo">Photo</option>
								<option value="video">Video</option>
							</select>
						</label>
						<label class="block text-sm font-medium">
							Proof URL
							<input name="proof_url" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
						</label>
						<label class="block text-sm font-medium">
							Note
							<textarea name="note" rows="2" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white"></textarea>
						</label>
						<button type="submit" class="btn btn-solid">Submit Proof</button>
					</form>
				{/if}

				{#if data.isPoster}
					<form method="post" action="?/approveProof" use:enhance class="rounded-xl border border-[var(--line)] bg-white/70 p-4 space-y-3">
						<h3 class="font-semibold">Poster decision</h3>
						<label class="block text-sm font-medium">
							Proof to approve
							<select name="proof_id" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white">
								<option value="">Most recent / general</option>
								{#each data.proofs as proof}
									<option value={proof.id}>#{proof.id} {proof.proofType} by {proof.submittedByName}</option>
								{/each}
							</select>
						</label>
						<button type="submit" class="btn btn-solid">Approve Proof</button>
					</form>
				{/if}
			</div>

			{#if data.isPoster}
				<form method="post" action="?/disputeProof" use:enhance class="mt-4 rounded-xl border border-[var(--line)] bg-white/70 p-4 space-y-3">
					<h3 class="font-semibold">Dispute proof</h3>
					<div class="grid gap-3 sm:grid-cols-[1fr_2fr]">
						<label class="block text-sm font-medium">
							Proof
							<select name="proof_id" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white">
								<option value="">Most recent / general</option>
								{#each data.proofs as proof}
									<option value={proof.id}>#{proof.id} {proof.proofType}</option>
								{/each}
							</select>
						</label>
						<label class="block text-sm font-medium">
							Reason
							<input name="reason" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
						</label>
					</div>
					<button type="submit" class="btn btn-ghost">Submit Dispute</button>
				</form>
			{/if}
		{:else}
			<div class="mt-8 rounded-xl border border-[var(--line)] bg-white/70 p-4">
				<p class="text-sm text-[var(--muted)]">
					Sign in to place bids, submit proof, and message the poster.
				</p>
				<div class="mt-3 flex gap-3">
					<a href="/login" class="btn btn-ghost">Login</a>
					<a href="/signup" class="btn btn-solid">Create account</a>
				</div>
			</div>
		{/if}

		<div class="mt-8 grid gap-4 sm:grid-cols-2">
			<section class="rounded-xl border border-[var(--line)] bg-white/70 p-4">
				<h3 class="font-semibold">Proof timeline</h3>
				{#if data.proofs.length === 0}
					<p class="mt-2 text-sm text-[var(--muted)]">No proofs submitted yet.</p>
				{:else}
					<ul class="mt-3 space-y-2 text-sm text-[var(--muted)]">
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
			</section>

			<section class="rounded-xl border border-[var(--line)] bg-white/70 p-4">
				<h3 class="font-semibold">Decision timeline</h3>
				{#if data.decisions.length === 0}
					<p class="mt-2 text-sm text-[var(--muted)]">No decisions recorded yet.</p>
				{:else}
					<ul class="mt-3 space-y-2 text-sm text-[var(--muted)]">
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
			</section>
		</div>
	</article>
</section>
