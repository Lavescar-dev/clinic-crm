<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface $$Events {
		keydown: KeyboardEvent;
		click: MouseEvent;
		input: Event;
		change: Event;
		focus: FocusEvent;
		blur: FocusEvent;
	}

	interface InputProps extends Omit<HTMLInputAttributes, 'value'> {
		value?: string | number;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		class: className = '',
		id = '',
		name = '',
		disabled = false,
		required = false,
		oninput,
		onchange,
		onblur,
		...restProps
	}: InputProps = $props();
</script>

<input
	{type}
	{id}
	{name}
	{placeholder}
	{disabled}
	{required}
	bind:value
	{oninput}
	{onchange}
	{onblur}
	{...restProps}
	class={cn(
		'flex h-11 w-full rounded-2xl border border-[color:var(--mf-line-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,252,255,0.82))] px-4 py-2 text-[0.95rem] text-[var(--mf-ink)] shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.68)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--mf-ink-faint)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/12 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
/>
