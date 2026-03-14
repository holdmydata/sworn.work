<script context="module" lang="ts">
	export type CardTone = 'dark' | 'light';
</script>

<script lang="ts">
	export let as: 'article' | 'div' | 'section' | 'header' = 'div';
	export let tone: CardTone = 'dark';
	export let className = '';

	const TONE_CLASSES: Record<CardTone, string> = {
		dark: 'border-slate-700/80 bg-slate-900 text-slate-100',
		light: 'border-[var(--line)] bg-white/72 text-[var(--ink)]'
	};
</script>

<svelte:element
	this={as}
	class={`overflow-hidden rounded-2xl border p-5 shadow-lg ${TONE_CLASSES[tone]} ${className}`}
	{...$$restProps}
>
	<slot />
</svelte:element>
