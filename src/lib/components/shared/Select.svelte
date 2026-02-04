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
		placeholder = 'Select...',
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
	class={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
>
	{#if placeholder}
		<option value="">{placeholder}</option>
	{/if}
	{#each options as option}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
