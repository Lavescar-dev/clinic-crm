<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import * as Lucide from 'lucide-svelte';
	import { formatCurrency } from '$utils/currency';
	import { get } from 'svelte/store';
	import { language } from '$i18n';

	export let title: string;
	export let value: number;
	export let icon: keyof typeof Lucide;
	export let description: string;
	export let format: 'currency' | 'number' = 'number';

	$: formattedValue = format === 'currency' ? formatCurrency(value, undefined, get(language).locale) : value.toLocaleString(get(language).locale);
	const IconComponent = Lucide[icon];
</script>

<Card>
	<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
		<CardTitle class="text-sm font-medium">{title}</CardTitle>
		<svelte:component this={IconComponent} class="h-4 w-4 text-muted-foreground" />
	</CardHeader>
	<CardContent>
		<div class="text-2xl font-bold">{formattedValue}</div>
		<p class="text-xs text-muted-foreground">{description}</p>
	</CardContent>
</Card>
