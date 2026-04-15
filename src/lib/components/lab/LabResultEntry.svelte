<script lang="ts">
	import { LAB_TEST_CATALOG, type LabTest, type ResultFlag } from '$lib/types/lab';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Button from '$components/ui/button/button.svelte';
	import { AlertTriangle, Info } from 'lucide-svelte';

	interface ResultData {
		testId: string;
		value: string;
		numericValue?: number;
		unit: string;
		flag: ResultFlag;
		notes?: string;
	}

	interface Props {
		testIds: string[];
		orderId: string;
		onSubmit?: (results: ResultData[]) => void;
	}

	let { testIds, orderId, onSubmit }: Props = $props();

	function createResultMap(ids: string[], previous: Record<string, ResultData> = {}) {
		return Object.fromEntries(
			ids.map((testId) => {
				const test = LAB_TEST_CATALOG[testId];
				return [
					testId,
					previous[testId] ?? {
						testId,
						value: '',
						numericValue: undefined,
						unit: test?.referenceRange.unit || '',
						flag: 'normal' as ResultFlag,
						notes: ''
					}
				];
			})
		);
	}

	let results = $state<Record<string, ResultData>>({});
	let testIdsSignature = $state('');

	$effect(() => {
		const nextSignature = testIds.join('|');
		if (nextSignature !== testIdsSignature) {
			results = createResultMap(testIds, results);
			testIdsSignature = nextSignature;
		}
	});

	function getTest(testId: string): LabTest | undefined {
		return LAB_TEST_CATALOG[testId];
	}

	function getReferenceRangeDisplay(test: LabTest, gender?: 'male' | 'female'): string {
		const range = test.referenceRange;

		if (range.male && range.female && gender) {
			const genderRange = gender === 'male' ? range.male : range.female;
			return `${genderRange.min || ''}-${genderRange.max || ''} ${range.unit}`;
		}

		if (range.min !== undefined && range.max !== undefined) {
			return `${range.min}-${range.max} ${range.unit}`;
		}

		if (range.min !== undefined) {
			return `≥${range.min} ${range.unit}`;
		}

		if (range.max !== undefined) {
			return `≤${range.max} ${range.unit}`;
		}

		return range.unit;
	}

	function validateResult(testId: string, value: string): ResultFlag {
		const test = getTest(testId);
		if (!test) return 'normal';

		const numericValue = parseFloat(value);
		if (isNaN(numericValue)) return 'normal';

		const range = test.referenceRange;

		// Get min and max (use gender-specific if available)
		let min = range.min;
		let max = range.max;

		// For simplicity, we're not handling gender-specific ranges here
		// In a real implementation, you'd pass patient gender

		// Check if critical (>20% outside range)
		if (min !== undefined && numericValue < min) {
			const percentBelow = ((min - numericValue) / min) * 100;
			return percentBelow > 20 ? 'critical' : 'low';
		}

		if (max !== undefined && numericValue > max) {
			const percentAbove = ((numericValue - max) / max) * 100;
			return percentAbove > 20 ? 'critical' : 'high';
		}

		return 'normal';
	}

	function handleValueChange(testId: string, value: string) {
		const numericValue = parseFloat(value);
		const flag = validateResult(testId, value);

		results[testId] = {
			...results[testId],
			value,
			numericValue: isNaN(numericValue) ? undefined : numericValue,
			flag
		};
	}

	function handleSubmit() {
		const resultData = Object.values(results).filter((r) => r.value.trim() !== '');

		if (onSubmit) {
			onSubmit(resultData);
		}
	}

	function getFlagColor(flag: ResultFlag): string {
		switch (flag) {
			case 'normal':
				return 'text-green-600';
			case 'low':
			case 'high':
				return 'text-amber-600';
			case 'critical':
				return 'text-red-600';
		}
	}

	function getFlagBadgeVariant(flag: ResultFlag) {
		switch (flag) {
			case 'normal':
				return 'success';
			case 'low':
			case 'high':
				return 'warning';
			case 'critical':
				return 'destructive';
			default:
				return 'default';
		}
	}

	let allResultsEntered = $derived(Object.values(results).every((r) => r.value.trim() !== ''));
	let hasAbnormalResults = $derived(Object.values(results).some((r) => r.flag !== 'normal'));
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Lab Result Entry</CardTitle>
			<p class="text-sm text-muted-foreground">
				Enter test results for order {orderId}
			</p>
		</CardHeader>
		<CardContent class="space-y-6">
			{#each testIds as testId (testId)}
				{@const test = getTest(testId)}
				{@const result = results[testId]}
				{#if test}
					<div class="space-y-3 p-4 border rounded-lg">
						<div class="flex items-start justify-between">
							<div>
								<h4 class="font-semibold">{test.name}</h4>
								<p class="text-sm text-muted-foreground">{test.code}</p>
							</div>
							{#if result.value}
								<Badge variant={getFlagBadgeVariant(result.flag)}>
									{result.flag}
								</Badge>
							{/if}
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for={`value-${testId}`}>Result Value</Label>
								<div class="flex gap-2">
									<Input
										id={`value-${testId}`}
										type="text"
										placeholder="Enter value"
										value={result.value}
										oninput={(e) => {
											const target = e.currentTarget as HTMLInputElement;
											handleValueChange(testId, target.value);
										}}
										class="flex-1"
									/>
									<Input
										type="text"
										value={result.unit}
										disabled
										class="w-24"
									/>
								</div>
							</div>

							<div class="space-y-2">
								<Label>Reference Range</Label>
								<div class="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
									<span class="text-sm">{getReferenceRangeDisplay(test)}</span>
								</div>
							</div>
						</div>

						{#if result.value && result.flag !== 'normal'}
							<div class={`flex items-start gap-2 p-3 rounded-lg ${
								result.flag === 'critical'
									? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
									: 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
							}`}>
								{#if result.flag === 'critical'}
									<AlertTriangle class={`h-5 w-5 ${getFlagColor(result.flag)} mt-0.5`} />
								{:else}
									<Info class={`h-5 w-5 ${getFlagColor(result.flag)} mt-0.5`} />
								{/if}
								<div>
									<p class={`font-medium text-sm ${getFlagColor(result.flag)}`}>
										{result.flag === 'critical' ? 'Critical Result' : 'Abnormal Result'}
									</p>
									<p class="text-sm text-muted-foreground mt-1">
										Value is {result.flag === 'low' ? 'below' : result.flag === 'high' ? 'above' : 'critically outside'} the normal reference range
									</p>
								</div>
							</div>
						{/if}

						<div class="space-y-2">
							<Label for={`notes-${testId}`}>Notes (Optional)</Label>
							<Textarea
								id={`notes-${testId}`}
								placeholder="Add any additional notes about this result..."
								bind:value={result.notes}
								rows={2}
							/>
						</div>
					</div>
				{/if}
			{/each}
		</CardContent>
	</Card>

	{#if hasAbnormalResults}
		<Card class="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
			<CardContent class="pt-6">
				<div class="flex items-start gap-2">
					<AlertTriangle class="h-5 w-5 text-amber-600 mt-0.5" />
					<div>
						<p class="font-medium text-amber-900 dark:text-amber-100">Abnormal Results Detected</p>
						<p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
							This order contains abnormal results that may require doctor review before releasing to patient.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<div class="flex justify-end gap-3">
		<Button variant="outline" onclick={() => window.history.back()}>
			Cancel
		</Button>
		<Button
			onclick={handleSubmit}
			disabled={!allResultsEntered}
		>
			Submit Results
		</Button>
	</div>
</div>
