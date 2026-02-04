<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className = '', children }: { class?: string; children?: any } = $props();
</script>

<h3 class={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
	{@render children?.()}
</h3>
