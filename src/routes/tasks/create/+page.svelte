<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<section class="mx-auto max-w-3xl px-6 py-12">
	<form method="post" action="?/createTask" use:enhance class="card space-y-4">
		<p class="eyebrow">Create Task</p>
		<h1 class="text-3xl font-bold tracking-tight">Post a new bounty</h1>

		<label class="block text-sm font-medium">
			Title
			<input name="title" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
		</label>

		<label class="block text-sm font-medium">
			Description
			<textarea name="description" rows="4" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white"></textarea>
		</label>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-medium">
				Category
				<select name="category" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white">
					<option value="Home & yard">Home & yard</option>
					<option value="Errands & support">Errands & support</option>
					<option value="Pet care">Pet care</option>
					<option value="Skilled trades">Skilled trades</option>
					<option value="Tutoring & teaching">Tutoring & teaching</option>
					<option value="Business tasks">Business tasks</option>
				</select>
			</label>
			<label class="block text-sm font-medium">
				Verification Type
				<select name="verification_type" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white">
					<option value="photo">Photo proof</option>
					<option value="video">Video proof</option>
					<option value="both">Both photo and video</option>
				</select>
			</label>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-medium">
				Budget (USD)
				<input name="budget" type="number" min="1" step="1" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
			<label class="block text-sm font-medium">
				Deadline
				<input name="deadline" type="date" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-medium">
				City (public)
				<input name="city" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
			<label class="block text-sm font-medium">
				State (public)
				<input name="state" maxlength="2" required value="AR" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
		</div>

		<div class="rounded-xl border border-[var(--line)] bg-white/70 p-4">
			<p class="text-sm font-medium text-[var(--ink)]">Private address (not shown publicly)</p>
			<div class="mt-3 grid gap-4">
				<label class="block text-sm font-medium">
					Street address
					<input name="address_line1" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
				</label>
				<label class="block text-sm font-medium">
					Address line 2
					<input name="address_line2" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
				</label>
				<label class="block text-sm font-medium">
					Postal code
					<input name="postal_code" class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
				</label>
			</div>
		</div>

		{#if form?.message}
			<p class="text-sm text-red-700">{form.message}</p>
		{/if}

		<button type="submit" class="btn btn-solid">Create Task</button>
	</form>
</section>
