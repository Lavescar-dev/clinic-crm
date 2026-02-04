<script lang="ts">
	import { Filter } from 'lucide-svelte';
	import Select from './Select.svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		label: string;
		value?: string;
		options: Option[];
		onChange?: (value: string) => void;
		class?: string;
	}

	let { label, value = $bindable(''), options, onChange, class: className = '' }: Props = $props();
</script>

<div class={`flex items-center gap-2 ${className}`}>
	<Filter class="h-4 w-4 text-muted-foreground" />
	<Select {value} {options} placeholder={label} {onChange} />
</div>
