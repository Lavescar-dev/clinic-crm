<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className = '', children }: { class?: string; children?: any } = $props();
</script>

<div class={cn('flex items-center p-6 pt-0', className)}>
	{@render children?.()}
</div>
