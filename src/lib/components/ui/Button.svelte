<script context="module" lang="ts">
	export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
	export type ButtonSize = 'sm' | 'md';
</script>

<script lang="ts">
	export let variant: ButtonVariant = 'primary';
	export let size: ButtonSize = 'md';
	export let href: string | null | undefined = null;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let className = '';

	const VARIANT_CLASSES: Record<ButtonVariant, string> = {
		primary: 'bg-orange-500 text-white hover:bg-orange-400',
		secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
		ghost: 'border border-slate-500 bg-slate-800/80 text-slate-100 hover:border-slate-400',
		danger: 'bg-red-600 text-white hover:bg-red-500'
	};

	const SIZE_CLASSES: Record<ButtonSize, string> = {
		sm: 'min-h-10 px-3.5 py-1.5 text-sm',
		md: 'min-h-11 px-4 py-2 text-sm'
	};
</script>

{#if href}
	<a
		href={href}
		class={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/90 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
		{...$$restProps}
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		class={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/90 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
		{...$$restProps}
	>
		<slot />
	</button>
{/if}
