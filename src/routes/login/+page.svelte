<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<section class="mx-auto grid min-h-screen max-w-5xl place-items-center px-6 py-12">
	<div class="grid w-full gap-6 lg:grid-cols-2">
		<article class="card hidden lg:block">
			<p class="eyebrow">Welcome Back</p>
			<h1 class="mt-3 text-4xl font-bold tracking-tight">Log in to your workspace</h1>
			<p class="mt-4 text-sm text-[var(--muted)]">Manage jobs, bids, and messages from one dashboard.</p>
		</article>

		<form method="post" action="?/signInEmail" use:enhance class="card space-y-4">
			<h2 class="text-2xl font-semibold">Login</h2>
			<label class="block text-sm font-medium">
				Email
				<input name="email" type="email" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
			<label class="block text-sm font-medium">
				Password
				<input
					name="password"
					type="password"
					required
					class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white"
				/>
			</label>
			{#if form?.message}
				<p class="text-sm text-red-700">{form.message}</p>
			{/if}
			<button class="btn btn-solid w-full" type="submit">Sign In</button>
			<p class="text-sm text-[var(--muted)]">New here? <a href="/signup" class="underline">Create an account</a></p>
		</form>
	</div>
</section>
