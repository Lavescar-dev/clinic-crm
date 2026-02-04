<script lang="ts">
	import { Input } from '$components/ui/input';

	interface Props {
		date?: string; // Renamed from value
		min?: string;
		max?: string;
		disabled?: boolean;
		class?: string;
		onChange?: (date: string) => void; // Updated parameter name
	}

	let {
		date = $bindable(''), // Renamed from value
		min,
		max,
		disabled = false,
		class: className = '',
		onChange
	}: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		date = target.value; // Renamed from value
		onChange?.(target.value);
	}
</script>

	<Input
		type="date"
		{date}
		{min}
		{max}
		{disabled}
		onchange={handleChange}
		class={className}
	/>
