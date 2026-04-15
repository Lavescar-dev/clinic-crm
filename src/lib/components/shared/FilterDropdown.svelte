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

<div class={`mf-control-shell h-12 w-full min-w-0 sm:w-auto sm:min-w-[12rem] ${className}`}>
	<Filter class="h-4 w-4 text-[color:var(--mf-ink-faint)]" />
	<Select {value} {options} placeholder={label} {onChange} class="w-full min-w-0" />
</div>
