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
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
>
	{@render children?.()}
</label>
