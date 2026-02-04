<script lang="ts">
	import { Label } from '$components/ui/label';

	interface Props {
		label: string;
		error?: string;
		required?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { label, error, required = false, class: className = '', children }: Props = $props();
</script>

<div class={`space-y-2 ${className}`}>
	<Label>
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</Label>
	{@render children?.()}
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
