<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface LabelProps {
		for?: string;
		class?: string;
		children?: any;
	}

	let { for: htmlFor = '', class: className = '', children }: LabelProps = $props();
</script>

<label
	for={htmlFor}
	class={cn(
		'text-[0.72rem] font-bold leading-none tracking-[0.1em] text-[var(--mf-ink-soft)] uppercase peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
>
	{@render children?.()}
</label>
