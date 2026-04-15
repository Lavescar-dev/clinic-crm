<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';

	interface Props {
		value?: string;
		disabled?: boolean;
		onValueChange?: (value: string | undefined) => void;
		children?: any;
	}

	let {
		value = $bindable(''),
		disabled = false,
		onValueChange,
		children,
		...restProps
	}: Props & Record<string, unknown> = $props();

	function handleValueChange(nextValue: string | string[] | undefined) {
		const resolved = Array.isArray(nextValue) ? nextValue[0] : nextValue;
		value = resolved ?? '';
		onValueChange?.(resolved);
	}

	const rootProps = $derived(
		({
			value,
			type: 'single',
			disabled,
			onValueChange: handleValueChange,
			...restProps
		}) as any
	);
</script>

<SelectPrimitive.Root {...rootProps}>
	{@render children?.()}
</SelectPrimitive.Root>
