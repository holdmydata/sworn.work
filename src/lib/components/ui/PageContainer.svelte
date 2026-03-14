<script lang="ts">
	export let as: 'section' | 'main' | 'div' = 'section';
	export let className = '';
</script>

<svelte:element this={as} class={`mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 ${className}`} {...$$restProps}>
	<slot />
</svelte:element>
