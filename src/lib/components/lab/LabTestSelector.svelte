<script lang="ts">
	import { LAB_TEST_CATALOG, type LabTest, type TestCategory } from '$lib/types/lab';
	import Input from '$components/ui/input/input.svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Button from '$components/ui/button/button.svelte';
	import { Search, X, Check } from 'lucide-svelte';

	interface Props {
		selectedTests?: string[];
		onSelectionChange?: (tests: string[]) => void;
		maxSelection?: number;
	}

	let { selectedTests = $bindable([]), onSelectionChange, maxSelection }: Props = $props();

	let searchQuery = $state('');
	let selectedCategory: TestCategory | 'all' = $state('all');

	const allTests = Object.values(LAB_TEST_CATALOG);

	const categories: { value: TestCategory | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Categories' },
		{ value: 'hematology', label: 'Hematology' },
		{ value: 'chemistry', label: 'Chemistry' },
		{ value: 'lipid', label: 'Lipid Panel' },
		{ value: 'thyroid', label: 'Thyroid' },
		{ value: 'liver', label: 'Liver Function' },
		{ value: 'kidney', label: 'Kidney Function' },
		{ value: 'diabetes', label: 'Diabetes' },
		{ value: 'cardiac', label: 'Cardiac' }
	];

	// Commonly grouped test panels
	const testPanels = [
		{
			name: 'Complete Blood Count (CBC)',
			tests: ['CBC-WBC', 'CBC-RBC', 'CBC-HGB', 'CBC-HCT', 'CBC-PLT']
		},
		{
			name: 'Comprehensive Metabolic Panel (CMP)',
			tests: ['CMP-GLU', 'CMP-BUN', 'CMP-CREAT', 'CMP-NA', 'CMP-K', 'CMP-CL', 'CMP-CO2', 'CMP-CA']
		},
		{
			name: 'Lipid Panel',
			tests: ['LIPID-CHOL', 'LIPID-HDL', 'LIPID-LDL', 'LIPID-TRIG']
		},
		{
			name: 'Thyroid Panel',
			tests: ['THY-TSH', 'THY-T4', 'THY-T3']
		},
		{
			name: 'Liver Function Tests',
			tests: ['LFT-ALT', 'LFT-AST', 'LFT-ALP', 'LFT-BILI-T', 'LFT-BILI-D', 'LFT-ALB']
		}
	];

	let filteredTests = $derived(allTests.filter(test => {
		const matchesSearch = searchQuery === '' ||
			test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			test.code.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;

		return matchesSearch && matchesCategory;
	}));

	function isTestSelected(testId: string): boolean {
		return selectedTests.includes(testId);
	}

	function toggleTest(testId: string) {
		if (isTestSelected(testId)) {
			selectedTests = selectedTests.filter(id => id !== testId);
		} else {
			if (maxSelection && selectedTests.length >= maxSelection) {
				return; // Don't allow more selections
			}
			selectedTests = [...selectedTests, testId];
		}

		if (onSelectionChange) {
			onSelectionChange(selectedTests);
		}
	}

	function selectPanel(panelTests: string[]) {
		// Add all tests from the panel that aren't already selected
		const newTests = panelTests.filter(testId => !selectedTests.includes(testId));

		if (maxSelection && selectedTests.length + newTests.length > maxSelection) {
			return; // Don't allow selection if it exceeds max
		}

		selectedTests = [...selectedTests, ...newTests];

		if (onSelectionChange) {
			onSelectionChange(selectedTests);
		}
	}

	function clearSelection() {
		selectedTests = [];
		if (onSelectionChange) {
			onSelectionChange(selectedTests);
		}
	}

	function getCategoryLabel(category: TestCategory): string {
		const found = categories.find(c => c.value === category);
		return found ? found.label : category;
	}
</script>

<div class="space-y-4">
	<!-- Search and Filters -->
	<div class="flex flex-col md:flex-row gap-3">
		<div class="flex-1 relative">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Search tests by name or code..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
		<div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
			{#each categories as category}
				<Button
					variant={selectedCategory === category.value ? 'default' : 'outline'}
					size="sm"
					onclick={() => selectedCategory = category.value}
					class="whitespace-nowrap"
				>
					{category.label}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Selected Tests Summary -->
	{#if selectedTests.length > 0}
		<Card>
			<CardHeader class="pb-3">
				<div class="flex items-center justify-between">
					<CardTitle class="text-base">
						Selected Tests ({selectedTests.length}{maxSelection ? `/${maxSelection}` : ''})
					</CardTitle>
					<Button variant="ghost" size="sm" onclick={clearSelection}>
						<X class="h-4 w-4 mr-1" />
						Clear All
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each selectedTests as testId (testId)}
						{@const test = LAB_TEST_CATALOG[testId]}
						{#if test}
							<Badge variant="secondary" class="px-3 py-1">
								{test.code}
								<button
									onclick={() => toggleTest(testId)}
									class="ml-2 hover:text-destructive"
									aria-label="Remove test"
								>
									<X class="h-3 w-3" />
								</button>
							</Badge>
						{/if}
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Quick Panels -->
	<Card>
		<CardHeader>
			<CardTitle class="text-base">Quick Test Panels</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
				{#each testPanels as panel}
					{@const allSelected = panel.tests.every(testId => selectedTests.includes(testId))}
					<Button
						variant="outline"
						size="sm"
						onclick={() => selectPanel(panel.tests)}
						disabled={allSelected}
						class="justify-start h-auto py-2 {allSelected ? 'opacity-50' : ''}"
					>
						<div class="flex items-center gap-2 w-full">
							{#if allSelected}
								<Check class="h-4 w-4 text-green-600" />
							{/if}
							<div class="text-left flex-1">
								<p class="text-sm font-medium">{panel.name}</p>
								<p class="text-xs text-muted-foreground">{panel.tests.length} tests</p>
							</div>
						</div>
					</Button>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Available Tests List -->
	<Card>
		<CardHeader>
			<CardTitle class="text-base">Available Tests</CardTitle>
		</CardHeader>
		<CardContent>
			{#if filteredTests.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
					{#each filteredTests as test (test.id)}
						{@const isSelected = isTestSelected(test.id)}
						<button
							onclick={() => toggleTest(test.id)}
							class="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left {isSelected ? 'border-primary bg-primary/5' : ''}"
							disabled={Boolean(maxSelection && selectedTests.length >= maxSelection && !isSelected)}
						>
							<div class="mt-0.5">
								{#if isSelected}
									<div class="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
										<Check class="h-3 w-3 text-primary-foreground" />
									</div>
								{:else}
									<div class="w-5 h-5 rounded border-2 border-muted-foreground"></div>
								{/if}
							</div>
							<div class="flex-1 min-w-0">
								<p class="font-medium text-sm">{test.name}</p>
								<div class="flex items-center gap-2 mt-1">
									<Badge variant="outline" class="text-xs">{test.code}</Badge>
									<Badge variant="outline" class="text-xs">{getCategoryLabel(test.category)}</Badge>
									{#if test.requiresFasting}
										<Badge variant="warning" class="text-xs">Fasting Required</Badge>
									{/if}
								</div>
								<p class="text-xs text-muted-foreground mt-1">
									Turnaround: {test.turnaroundTime}h | ${test.price}
								</p>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-center text-muted-foreground py-8">
					No tests found matching your search criteria
				</p>
			{/if}
		</CardContent>
	</Card>
</div>
