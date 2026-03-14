<script lang="ts">
	export let active = false;
	export let className = '';
</script>

<button
	type="button"
	class={`min-h-10 shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
		active
			? 'border-orange-300/70 bg-orange-500/20 text-orange-100'
			: 'border-slate-600 bg-slate-800/80 text-slate-200 hover:border-slate-400'
	} ${className}`}
	{...$$restProps}
>
	<slot />
</button>
