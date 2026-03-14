<script context="module" lang="ts">
	export type QuestStatus = 'Open' | 'Accepted' | 'In Progress' | 'Completed' | 'Paid';
</script>

<script lang="ts">
	import Badge, { type BadgeTone } from '$lib/components/ui/Badge.svelte';

	export let status: QuestStatus;

	const STATUS_TONES: Record<QuestStatus, BadgeTone> = {
		Open: 'emerald',
		Accepted: 'blue',
		'In Progress': 'yellow',
		Completed: 'zinc',
		Paid: 'purple'
	};
</script>

<Badge tone={STATUS_TONES[status]}>
	{status}
</Badge>
