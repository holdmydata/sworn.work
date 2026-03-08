<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<section class="mx-auto grid min-h-screen max-w-5xl place-items-center px-6 py-12">
	<div class="grid w-full gap-6 lg:grid-cols-2">
		<article class="card hidden lg:block">
			<p class="eyebrow">New Account</p>
			<h1 class="mt-3 text-4xl font-bold tracking-tight">Start building your local reputation</h1>
			<p class="mt-4 text-sm text-[var(--muted)]">Post work, bid on jobs, and track everything from one place.</p>
		</article>

		<form method="post" action="?/signUpEmail" use:enhance class="card space-y-4">
			<h2 class="text-2xl font-semibold">Create Account</h2>
			<label class="block text-sm font-medium">
				Name
				<input name="name" type="text" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
			<label class="block text-sm font-medium">
				Email
				<input name="email" type="email" required class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white" />
			</label>
			<label class="block text-sm font-medium">
				Password
				<input
					name="password"
					type="password"
					minlength="8"
					required
					class="mt-1 block w-full rounded-xl border-[var(--line)] bg-white"
				/>
			</label>
			{#if form?.message}
				<p class="text-sm text-red-700">{form.message}</p>
			{/if}
			<button class="btn btn-solid w-full" type="submit">Sign Up</button>
			<p class="text-sm text-[var(--muted)]">Already registered? <a href="/login" class="underline">Log in</a></p>
		</form>
	</div>
</section>
