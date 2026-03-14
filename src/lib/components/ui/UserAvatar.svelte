<script lang="ts">
	export let name: string;
	export let avatarUrl: string | null | undefined = null;
	export let className = 'h-8 w-8';
	export let textClassName = 'text-sm';

	function avatarInitials(value: string): string {
		const parts = (value || 'Sworn Member').trim().split(/\s+/).filter(Boolean);

		if (parts.length === 0) return 'SM';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
	}
</script>

<div class={`${className} overflow-hidden rounded-full border border-slate-600 bg-slate-800`}>
	{#if avatarUrl}
		<img src={avatarUrl} alt={`${name} avatar`} class="h-full w-full object-cover" loading="lazy" />
	{:else}
		<div
			class={`flex h-full w-full items-center justify-center font-bold text-slate-100 ${textClassName}`}
			aria-hidden="true"
		>
			{avatarInitials(name)}
		</div>
	{/if}
</div>
