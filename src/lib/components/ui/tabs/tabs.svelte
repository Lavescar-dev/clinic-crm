<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';

	let { children, ...restProps }: TabsPrimitive.RootProps = $props();
</script>

<TabsPrimitive.Root {...restProps}>
	{@render children?.()}
</TabsPrimitive.Root>
