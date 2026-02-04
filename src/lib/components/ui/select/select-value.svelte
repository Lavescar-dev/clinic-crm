<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface SelectValueProps {
		class?: string;
		placeholder?: string;
		children?: any;
	}

	let {
		class: className,
		placeholder = '',
		children
	}: SelectValueProps = $props();
</script>

<span class={cn('pointer-events-none', className)} data-slot="select-value">
	{#if children}
		{@render children?.()}
	{:else}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>
