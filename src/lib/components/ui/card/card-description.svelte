<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className = '', children }: { class?: string; children?: any } = $props();
</script>

<p class={cn('text-sm text-muted-foreground', className)}>
	{@render children?.()}
</p>
