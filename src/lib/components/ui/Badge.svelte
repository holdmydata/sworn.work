<script context="module" lang="ts">
	export type BadgeTone = 'slate' | 'emerald' | 'blue' | 'yellow' | 'zinc' | 'purple' | 'amber' | 'red' | 'orange';
</script>

<script lang="ts">
	export let tone: BadgeTone = 'slate';
	export let className = '';

	const TONE_CLASSES: Record<BadgeTone, string> = {
		slate: 'bg-slate-700/80 text-slate-100 ring-slate-500/60',
		emerald: 'bg-emerald-500/20 text-emerald-200 ring-emerald-300/40',
		blue: 'bg-blue-500/20 text-blue-200 ring-blue-300/40',
		yellow: 'bg-yellow-500/20 text-yellow-100 ring-yellow-300/40',
		zinc: 'bg-zinc-500/20 text-zinc-200 ring-zinc-300/40',
		purple: 'bg-purple-500/20 text-purple-200 ring-purple-300/40',
		amber: 'bg-amber-500/20 text-amber-100 ring-amber-300/40',
		red: 'bg-red-500/20 text-red-200 ring-red-300/40',
		orange: 'bg-orange-500/20 text-orange-100 ring-orange-300/70'
	};
</script>

<span class={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${TONE_CLASSES[tone]} ${className}`}>
	<slot />
</span>
