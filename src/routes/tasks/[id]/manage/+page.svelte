<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function statusLabel(raw: string): string {
		const normalized = raw.trim().toLowerCase().replace(/_/g, ' ');
		if (normalized === 'in progress') return 'In Progress';
		return normalized ? normalized.replace(/\b\w/g, (x) => x.toUpperCase()) : 'Open';
	}

	function statusTone(raw: string): 'emerald' | 'yellow' | 'zinc' | 'slate' {
		const normalized = raw.trim().toLowerCase();
		if (normalized === 'open') return 'emerald';
		if (normalized === 'in_progress') return 'yellow';
		if (normalized === 'completed') return 'zinc';
		return 'slate';
	}

	function deadlineInputValue(iso: string): string {
		if (!iso) return '';
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return '';
		const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
		return local.toISOString().slice(0, 16);
	}

	const controlClass =
		'mt-1 block min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300';
</script>

<PageContainer className="max-w-4xl space-y-5 sm:space-y-6">
	<Card as="header" tone="dark" className="border-slate-700/80 bg-slate-900/90 p-5 sm:p-6">
		<p class="eyebrow text-slate-300">Manage Task</p>
		<div class="mt-2 flex flex-wrap items-center gap-2">
			<Badge tone={statusTone(data.task.status)}>{statusLabel(data.task.status)}</Badge>
			{#if data.acceptedWorkerName}
				<Badge tone="blue">Accepted by {data.acceptedWorkerName}</Badge>
			{/if}
		</div>
		<h1 class="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">{data.task.title}</h1>
		<p class="mt-2 text-sm text-slate-300">
			{#if data.manageMode === 'full'}
				This task is open. You can edit full details or cancel it.
			{:else if data.manageMode === 'limited'}
				This task is accepted. You can update clarifying details only.
			{:else}
				This task is completed or cancelled. It is view-only.
			{/if}
		</p>
	</Card>

	{#if form?.message}
		<Card as="section" tone="light" className="p-4">
			<p class="text-sm text-[var(--muted)]">{form.message}</p>
		</Card>
	{/if}

	<Card as="section" tone="dark" className="border-slate-700/80 p-5 sm:p-6">
		<h2 class="text-lg font-semibold text-white">Edit Details</h2>
		{#if data.manageMode === 'read_only'}
			<p class="mt-3 text-sm text-slate-300">No edits available for this task status.</p>
		{:else}
			<form method="post" action="?/updateTask" class="mt-4 space-y-4">
				{#if data.manageMode === 'full'}
					<label class="block text-sm font-medium text-slate-200">
						Title
						<input name="title" required value={data.formValues.title} class={controlClass} />
					</label>

					<label class="block text-sm font-medium text-slate-200">
						Category
						<input name="category" required value={data.formValues.category} class={controlClass} />
					</label>

					<label class="block text-sm font-medium text-slate-200">
						Reward (USD)
						<input
							name="budget"
							required
							type="number"
							min="1"
							step="1"
							value={data.formValues.rewardDollars}
							class={controlClass}
						/>
					</label>

					<label class="block text-sm font-medium text-slate-200">
						Description
						<textarea name="full_description" required rows="5" class={controlClass}>{data.formValues.coreDescription}</textarea>
					</label>
				{:else}
					<div class="rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-300">
						Core scope fields are locked after acceptance (title, category, reward, and broad description).
					</div>
				{/if}

				<label class="block text-sm font-medium text-slate-200">
					Requirements / notes
					<textarea name="requirements_notes" rows="3" class={controlClass}>{data.formValues.requirementsNotes}</textarea>
				</label>

				<label class="block text-sm font-medium text-slate-200">
					Timing clarification
					<input
						name="deadline_at"
						type="datetime-local"
						value={deadlineInputValue(data.formValues.deadline)}
						class={controlClass}
					/>
				</label>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block text-sm font-medium text-slate-200">
						City
						<input name="city" required value={data.formValues.city} class={controlClass} />
					</label>
					<label class="block text-sm font-medium text-slate-200">
						State
						<input name="state" required maxlength="2" value={data.formValues.state} class={controlClass} />
					</label>
				</div>

				<label class="block text-sm font-medium text-slate-200">
					Address line 1 (optional)
					<input name="address_line1" value={data.formValues.addressLine1} class={controlClass} />
				</label>
				<label class="block text-sm font-medium text-slate-200">
					Address line 2 (optional)
					<input name="address_line2" value={data.formValues.addressLine2} class={controlClass} />
				</label>
				<label class="block text-sm font-medium text-slate-200">
					Postal code (optional)
					<input name="postal_code" value={data.formValues.postalCode} class={controlClass} />
				</label>

				<div class="pt-1">
					<Button type="submit" variant="primary" className="w-full sm:w-auto">
						{data.manageMode === 'full' ? 'Save Task Updates' : 'Save Clarifications'}
					</Button>
				</div>
			</form>
		{/if}
	</Card>

	{#if data.task.status === 'in_progress'}
		<Card as="section" tone="dark" className="border-slate-700/80 p-5">
			<h2 class="text-lg font-semibold text-white">Completion Review</h2>
			<p class="mt-2 text-sm text-slate-300">
				Approve or dispute worker completion updates from the task detail review section.
			</p>
			<div class="mt-4">
				<Button href={`/tasks/${data.task.id}#verification-workflow`} variant="secondary" className="w-full sm:w-auto">
					Review Completion Updates
				</Button>
			</div>
		</Card>
	{/if}

	{#if data.manageMode === 'full'}
		<Card as="section" tone="dark" className="border-slate-700/80 p-5">
			<h2 class="text-lg font-semibold text-white">Cancel Task</h2>
			<p class="mt-2 text-sm text-slate-300">
				Cancel this open task if it is no longer needed. Cancelled tasks will not appear on the main board.
			</p>
			<form method="post" action="?/cancelTask" class="mt-4">
				<Button type="submit" variant="ghost" className="w-full sm:w-auto">Cancel Task</Button>
			</form>
		</Card>
	{/if}
</PageContainer>
