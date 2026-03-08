<script lang="ts">
	const trustSteps = [
		{ title: 'Post + fund', text: 'Create a task with budget and deadline.', icon: '/graphics/trust/post.svg' },
		{ title: 'Bid + accept', text: 'Workers bid, poster picks best fit.', icon: '/graphics/trust/verify.svg' },
		{ title: 'Submit proof', text: 'Photo/video evidence confirms completion.', icon: '/graphics/trust/verify.svg' },
		{ title: 'Release payment', text: 'Approval releases payout; disputes get review window.', icon: '/graphics/trust/payout.svg' }
	];

	const categories = [
		{ label: 'Home & yard', icon: '/graphics/categories/home-yard.svg' },
		{ label: 'Errands & support', icon: '/graphics/categories/errands.svg' },
		{ label: 'Pet care', icon: '/graphics/categories/pet-care.svg' },
		{ label: 'Skilled trades', icon: '/graphics/categories/skilled-trades.svg' },
		{ label: 'Tutoring & teaching', icon: '/graphics/categories/tutoring.svg' },
		{ label: 'Business tasks', icon: '/graphics/categories/business.svg' }
	];
</script>

<section class="mx-auto max-w-6xl px-6 py-14 sm:py-20">
	<header class="mb-16">
		<p class="eyebrow">Hyperlocal Task Marketplace</p>
		<h1 class="mt-3 max-w-4xl text-5xl font-bold tracking-tight text-[var(--ink)] sm:text-6xl">
			Real work for real people in Northwest Arkansas.
		</h1>
		<p class="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
			Sworn connects posters and workers with verified completion, transparent bids, and fair-pay culture. Start local, move fast, and keep trust at the center.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a href="/signup" class="btn btn-solid">Create Account</a>
			<a href="/how-it-works" class="btn btn-ghost">See How It Works</a>
		</div>
	</header>

	<section class="mb-10 grid gap-4 sm:grid-cols-3">
		<article class="card">
			<p class="eyebrow">Problem</p>
			<h2 class="mt-2 text-2xl font-semibold">Displaced workers need options</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Automation and layoffs are pushing skilled people into oversaturated fallback gigs.</p>
		</article>
		<article class="card">
			<p class="eyebrow">Gap</p>
			<h2 class="mt-2 text-2xl font-semibold">Craigslist has no trust layer</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Existing local channels lack verification, ratings, and reliable payout flow.</p>
		</article>
		<article class="card">
			<p class="eyebrow">Approach</p>
			<h2 class="mt-2 text-2xl font-semibold">Verification-first marketplace</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Proof of completion + mutual ratings before payment release.</p>
		</article>
	</section>

	<section class="mb-10 card">
		<p class="eyebrow">How Sworn Works</p>
		<div class="mt-4 grid gap-4 sm:grid-cols-4">
			{#each trustSteps as step, i}
				<div>
					<img src={step.icon} alt={step.title} class="mb-2 h-11 w-11" loading="lazy" />
					<h3 class="font-semibold">{i + 1}. {step.title}</h3>
					<p class="mt-1 text-sm text-[var(--muted)]">{step.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="mb-10">
		<p class="eyebrow">Task Categories</p>
		<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each categories as category}
				<div class="card flex items-center gap-3">
					<img src={category.icon} alt={category.label} class="h-10 w-10" loading="lazy" />
					<span class="font-semibold">{category.label}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="mb-10 grid gap-4 sm:grid-cols-2">
		<a class="card block" href="/for-workers">
			<p class="eyebrow">For Workers</p>
			<h2 class="mt-2 text-2xl font-semibold text-[var(--ink)]">No upfront worker fees</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Build local reputation with verified jobs and fair bidding.</p>
		</a>
		<a class="card block" href="/how-it-works">
			<p class="eyebrow">Trust System</p>
			<h2 class="mt-2 text-2xl font-semibold text-[var(--ink)]">Proof before payout</h2>
			<p class="mt-2 text-sm text-[var(--muted)]">Photo/video proof + ratings keep both sides accountable.</p>
		</a>
	</section>

	<section class="card text-center">
		<h2 class="text-3xl font-bold tracking-tight">Ready to post or find work?</h2>
		<p class="mx-auto mt-3 max-w-2xl text-[var(--muted)]">Join the first version of Sworn and help build a fair local marketplace in NWA.</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<a href="/signup" class="btn btn-solid">Get Started</a>
			<a href="/tasks" class="btn btn-ghost">Browse Tasks</a>
		</div>
	</section>
</section>
