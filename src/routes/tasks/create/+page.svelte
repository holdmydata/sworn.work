<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let rewardAmount = $state('');

	const controlClass =
		'mt-1 block min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300';

	const sectionContentClass = 'mt-4 space-y-4';

	function rewardPreview(value: string): string | null {
		const amount = Number(value);
		if (!Number.isFinite(amount) || amount <= 0) return null;
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<PageContainer className="max-w-5xl">
	<form method="post" action="?/createTask" use:enhance class="space-y-5 sm:space-y-6">
		<Card as="section" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5 sm:p-6">
			<p class="eyebrow text-slate-300">Post Task</p>
			<h1 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Create a New Bounty</h1>
			<p class="mt-2 text-sm text-slate-300">
				Share clear details so the right worker can accept your task quickly.
			</p>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">1. Task Basics</h2>
			<div class={sectionContentClass}>
				<label class="block text-sm font-medium text-slate-200">
					Title
					<input
						name="title"
						required
						placeholder="Move couch upstairs"
						class={controlClass}
					/>
				</label>

				<label class="block text-sm font-medium text-slate-200">
					Category
					<select name="category" required class={controlClass}>
						<option value="">Select a category</option>
						<option value="Home & yard">Home & yard</option>
						<option value="Errands & support">Errands & support</option>
						<option value="Pet care">Pet care</option>
						<option value="Skilled trades">Skilled trades</option>
						<option value="Tutoring & teaching">Tutoring & teaching</option>
						<option value="Business tasks">Business tasks</option>
					</select>
				</label>

				<label class="block text-sm font-medium text-slate-200">
					Short description
					<textarea
						name="short_description"
						required
						rows="2"
						placeholder="One quick sentence workers can scan"
						class={controlClass}
					></textarea>
				</label>
			</div>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">2. Details</h2>
			<div class={sectionContentClass}>
				<label class="block text-sm font-medium text-slate-200">
					Full description
					<textarea
						name="full_description"
						required
						rows="5"
						placeholder="What needs to be done, what to bring, and what done looks like"
						class={controlClass}
					></textarea>
				</label>

				<label class="block text-sm font-medium text-slate-200">
					Requirements / notes
					<textarea
						name="requirements_notes"
						rows="3"
						placeholder="Optional access, safety, or prep notes"
						class={controlClass}
					></textarea>
				</label>

				<label class="block text-sm font-medium text-slate-200">
					Verification type
					<select name="verification_type" required class={controlClass}>
						<option value="photo">Photo proof</option>
						<option value="video">Video proof</option>
						<option value="both">Photo + video proof</option>
						<option value="photo" disabled>Link proof (coming soon)</option>
					</select>
				</label>
			</div>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">3. Location</h2>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="block text-sm font-medium text-slate-200">
					City
					<input name="city" required placeholder="Fayetteville" class={controlClass} />
				</label>
				<label class="block text-sm font-medium text-slate-200">
					State
					<input name="state" maxlength="2" required value="AR" class={controlClass} />
				</label>
			</div>
			<div class="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
				<p class="text-sm font-medium text-slate-100">Optional private address (hidden until assignment)</p>
				<div class="mt-3 grid gap-4">
					<label class="block text-sm font-medium text-slate-200">
						Street address
						<input
							name="address_line1"
							placeholder="123 Main St (optional)"
							class={controlClass}
						/>
					</label>
					<label class="block text-sm font-medium text-slate-200">
						Address line 2
						<input name="address_line2" placeholder="Apt, unit, gate code" class={controlClass} />
					</label>
					<label class="block text-sm font-medium text-slate-200">
						Postal code
						<input name="postal_code" placeholder="72701" class={controlClass} />
					</label>
				</div>
			</div>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">4. Reward</h2>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="block text-sm font-medium text-slate-200">
					Reward amount (USD)
					<input
						name="budget"
						bind:value={rewardAmount}
						type="number"
						min="1"
						step="1"
						required
						placeholder="75"
						class={controlClass}
					/>
				</label>

				<label class="block text-sm font-medium text-slate-200">
					Difficulty (optional)
					<select name="difficulty" class={controlClass}>
						<option value="">Not set</option>
						<option value="Easy">Easy</option>
						<option value="Medium">Medium</option>
						<option value="Hard">Hard</option>
					</select>
				</label>
			</div>
			<div class="mt-4 flex flex-wrap gap-2">
				{#if rewardPreview(rewardAmount)}
					<Badge tone="orange">{rewardPreview(rewardAmount)} will be highlighted on the task board</Badge>
				{:else}
					<Badge tone="orange">Reward will be highlighted on the task board</Badge>
				{/if}
				<Badge tone="slate">Difficulty is a placeholder for now</Badge>
			</div>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">5. Timing</h2>
			<label class="mt-4 block text-sm font-medium text-slate-200">
				Preferred completion date/time
				<input name="preferred_completion_at" type="datetime-local" class={controlClass} />
			</label>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">6. Trust & Confirmation</h2>
			<p class="mt-3 text-sm text-slate-300">
				Tasks are designed to be escrow funded and verified before completion confirmation.
			</p>
			<ul class="mt-3 space-y-2 text-sm text-slate-300">
				<li>Exact address details stay private until assignment.</li>
				<li>Clear instructions improve acceptance speed and work quality.</li>
			</ul>
		</Card>

		<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
			<h2 class="text-xl font-semibold text-white">7. Submit</h2>
			<p class="mt-2 text-sm text-slate-300">Review your details, then publish your task to the board.</p>

			{#if form?.message}
				<div class="mt-4 rounded-xl border border-red-300/40 bg-red-500/10 p-3 text-sm text-red-200">
					{form.message}
				</div>
			{/if}

			<div class="mt-4">
				<Button type="submit" variant="primary" className="w-full sm:w-auto">Post Task</Button>
			</div>
		</Card>
	</form>
</PageContainer>
