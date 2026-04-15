<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let { class: className = '', children }: { class?: string; children?: any } = $props();
</script>

<h3 class={cn('mf-heading text-lg font-semibold leading-[1.12] tracking-[-0.025em]', className)}>
	{@render children?.()}
</h3>
