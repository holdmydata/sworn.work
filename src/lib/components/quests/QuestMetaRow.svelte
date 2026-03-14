<script lang="ts">
	export let location: string | null | undefined = null;
	export let isRemote = false;
	export let postedAt = '';
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
	{#if isRemote}
		<span class="inline-flex items-center gap-1">🌐 Remote</span>
	{:else if location}
		<span class="inline-flex items-center gap-1">📍 {location}</span>
	{:else}
		<span class="inline-flex items-center gap-1">📍 Location TBD</span>
	{/if}
	<span class="inline-flex items-center gap-1">⏱ {postedAt}</span>
</div>
