<script lang="ts">
	import { Input } from '$components/ui/input';

	interface Props {
		date?: string | Date;
		min?: string;
		max?: string;
		disabled?: boolean;
		class?: string;
		placeholder?: string;
		onChange?: (date: string) => void;
	}

	let {
		date = $bindable(''), // Renamed from value
		min,
		max,
		disabled = false,
		class: className = '',
		placeholder = '',
		onChange
	}: Props = $props();

	let inputValue = $derived.by(() => {
		if (!date) return '';
		const value = date instanceof Date ? date : new Date(date);
		return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
	});

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		date = target.value ? new Date(`${target.value}T00:00:00`) : '';
		onChange?.(target.value);
	}
</script>

	<Input
		type="date"
		value={inputValue}
		{min}
		{max}
		{disabled}
		{placeholder}
		onchange={handleChange}
		class={className}
	/>
