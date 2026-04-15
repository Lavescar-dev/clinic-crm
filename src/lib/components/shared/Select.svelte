<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		value?: string;
		options: Option[];
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		onChange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		options,
		placeholder = 'Seçin...',
		disabled = false,
		class: className = '',
		onChange
	}: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		value = target.value;
		onChange?.(target.value);
	}
</script>

<select
	{value}
	{disabled}
	onchange={handleChange}
	class={`mf-control-select h-9 w-full disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
>
	{#if placeholder}
		<option value="">{placeholder}</option>
	{/if}
	{#each options as option}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
