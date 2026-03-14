<script lang="ts">
	export let reward: number | string;

	function formatReward(value: number | string): string {
		if (typeof value === 'number' && Number.isFinite(value)) {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				maximumFractionDigits: 0
			}).format(value);
		}

		const text = String(value).trim();
		return text.startsWith('$') ? text : `$${text}`;
	}
</script>

<p class="text-4xl font-bold leading-none tracking-tight text-amber-400 sm:text-5xl">{formatReward(reward)}</p>
