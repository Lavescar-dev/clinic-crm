<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	interface CardProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: any;
	}

	let { class: className = '', children, ...restProps }: CardProps = $props();
</script>

<div
	class={cn(
		'mf-glass rounded-[26px] text-[color:var(--mf-ink)] shadow-[var(--mf-shadow-soft)]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
