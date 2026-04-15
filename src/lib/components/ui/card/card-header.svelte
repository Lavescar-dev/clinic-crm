<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className = '', children }: { class?: string; children?: any } = $props();
</script>

<div class={cn('flex flex-col gap-2 p-6 sm:p-7', className)}>
	{@render children?.()}
</div>
