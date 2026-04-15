<script lang="ts" generics="TData">
	import { t } from '$lib/i18n';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	export interface FilterCondition {
		id: string;
		field: string;
		operator: FilterOperator;
		value: any;
		type: FilterType;
	}

	export interface FilterGroup {
		id: string;
		logic: 'AND' | 'OR';
		conditions: FilterCondition[];
	}

	export interface FilterPreset {
		id: string;
		name: string;
		group: FilterGroup;
	}

	export type FilterType = 'text' | 'number' | 'date' | 'select';
	export type FilterOperator =
		| 'contains'
		| 'equals'
		| 'not_equals'
		| 'starts_with'
		| 'ends_with'
		| 'greater_than'
		| 'less_than'
		| 'between'
		| 'in'
		| 'not_in';

	interface FilterField {
		id: string;
		label: string;
		type: FilterType;
		options?: { label: string; value: any }[];
	}

	interface TableFiltersProps {
		fields: FilterField[];
		tableId: string;
		open?: boolean;
		onClose?: () => void;
		onApply?: (group: FilterGroup) => void;
		onReset?: () => void;
	}

	let {
		fields = [],
		tableId,
		open = false,
		onClose,
		onApply,
		onReset
	}: TableFiltersProps = $props();

	// Current filter group being built
	let filterGroup = $state<FilterGroup>({
		id: crypto.randomUUID(),
		logic: 'AND',
		conditions: []
	});

	// Saved filter presets
	let presets = $state<FilterPreset[]>([]);
	let selectedPresetId = $state<string | null>(null);
	let showPresetDialog = $state(false);
	let presetName = $state('');

	const storageKey = $derived(`datatable_filters_${tableId}`);

	onMount(() => {
		loadPresets();
	});

	function loadPresets() {
		const saved = localStorage.getItem(storageKey);
		if (saved) {
			try {
				presets = JSON.parse(saved);
			} catch (e) {
				console.error('Failed to parse saved filter presets:', e);
			}
		}
	}

	function savePresets() {
		localStorage.setItem(storageKey, JSON.stringify(presets));
	}

	function addCondition() {
		const firstField = fields[0];
		if (!firstField) return;

		const newCondition: FilterCondition = {
			id: crypto.randomUUID(),
			field: firstField.id,
			operator: getDefaultOperator(firstField.type),
			value: '',
			type: firstField.type
		};

		filterGroup.conditions = [...filterGroup.conditions, newCondition];
	}

	function removeCondition(conditionId: string) {
		filterGroup.conditions = filterGroup.conditions.filter((c) => c.id !== conditionId);
	}

	function updateCondition(conditionId: string, updates: Partial<FilterCondition>) {
		filterGroup.conditions = filterGroup.conditions.map((c) => {
			if (c.id === conditionId) {
				// If field changes, update type and operator
				if (updates.field && updates.field !== c.field) {
					const field = fields.find((f) => f.id === updates.field);
					if (field) {
						return {
							...c,
							...updates,
							type: field.type,
							operator: getDefaultOperator(field.type),
							value: ''
						};
					}
				}
				return { ...c, ...updates };
			}
			return c;
		});
	}

	function getDefaultOperator(type: FilterType): FilterOperator {
		switch (type) {
			case 'text':
				return 'contains';
			case 'number':
				return 'equals';
			case 'date':
				return 'equals';
			case 'select':
				return 'in';
			default:
				return 'equals';
		}
	}

	function getOperatorsForType(type: FilterType): { value: FilterOperator; label: string }[] {
		switch (type) {
			case 'text':
				return [
					{ value: 'contains', label: $t('filters.operators.contains') },
					{ value: 'equals', label: $t('filters.operators.equals') },
					{ value: 'not_equals', label: $t('filters.operators.notEquals') },
					{ value: 'starts_with', label: $t('filters.operators.startsWith') },
					{ value: 'ends_with', label: $t('filters.operators.endsWith') }
				];
			case 'number':
				return [
					{ value: 'equals', label: $t('filters.operators.equals') },
					{ value: 'not_equals', label: $t('filters.operators.notEquals') },
					{ value: 'greater_than', label: $t('filters.operators.greaterThan') },
					{ value: 'less_than', label: $t('filters.operators.lessThan') },
					{ value: 'between', label: $t('filters.operators.between') }
				];
			case 'date':
				return [
					{ value: 'equals', label: $t('filters.operators.equals') },
					{ value: 'not_equals', label: $t('filters.operators.notEquals') },
					{ value: 'greater_than', label: $t('filters.operators.after') },
					{ value: 'less_than', label: $t('filters.operators.before') },
					{ value: 'between', label: $t('filters.operators.between') }
				];
			case 'select':
				return [
					{ value: 'in', label: $t('filters.operators.in') },
					{ value: 'not_in', label: $t('filters.operators.notIn') }
				];
			default:
				return [];
		}
	}

	function renderValueInput(condition: FilterCondition) {
		const field = fields.find((f) => f.id === condition.field);
		if (!field) return null;

		switch (field.type) {
			case 'text':
				return 'text';
			case 'number':
				return condition.operator === 'between' ? 'number-range' : 'number';
			case 'date':
				return condition.operator === 'between' ? 'date-range' : 'date';
			case 'select':
				return 'select';
			default:
				return 'text';
		}
	}

	function handleApply() {
		if (onApply) {
			onApply(filterGroup);
		}
		onClose?.();
	}

	function handleReset() {
		filterGroup = {
			id: crypto.randomUUID(),
			logic: 'AND',
			conditions: []
		};
		if (onReset) {
			onReset();
		}
	}

	function saveAsPreset() {
		if (!presetName.trim()) return;

		const preset: FilterPreset = {
			id: crypto.randomUUID(),
			name: presetName.trim(),
			group: structuredClone(filterGroup)
		};

		presets = [...presets, preset];
		savePresets();
		presetName = '';
		showPresetDialog = false;
	}

	function loadPreset(presetId: string) {
		const preset = presets.find((p) => p.id === presetId);
		if (preset) {
			filterGroup = structuredClone(preset.group);
			selectedPresetId = presetId;
		}
	}

	function deletePreset(presetId: string) {
		presets = presets.filter((p) => p.id !== presetId);
		savePresets();
		if (selectedPresetId === presetId) {
			selectedPresetId = null;
		}
	}
</script>

{#if open}
	<!-- Main Filter Dialog -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
		onclick={(e) => e.target === e.currentTarget && onClose?.()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="bg-surface border border-border rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b border-border">
				<h2 class="text-xl font-medium">{$t('filters.title')}</h2>
				<button
					onclick={onClose}
					class="text-text-secondary hover:text-text transition-colors"
					aria-label="Close dialog"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Filter Logic Toggle & Presets -->
			<div class="flex items-center justify-between gap-4 p-4 border-b border-border">
				<div class="flex items-center gap-2">
					<span class="text-sm text-text-secondary">{$t('filters.matchLogic')}:</span>
					<div class="flex border border-border rounded overflow-hidden">
						<button
							onclick={() => (filterGroup.logic = 'AND')}
							class="{filterGroup.logic === 'AND' ? 'px-3 py-1 text-sm bg-accent text-white' : 'px-3 py-1 text-sm hover:bg-accent/10'}"
						>
							{$t('filters.and')}
						</button>
						<button
							onclick={() => (filterGroup.logic = 'OR')}
							class="{filterGroup.logic === 'OR' ? 'px-3 py-1 text-sm bg-accent text-white' : 'px-3 py-1 text-sm hover:bg-accent/10'}"
						>
							{$t('filters.or')}
						</button>
					</div>
				</div>

				<div class="flex items-center gap-2">
					{#if presets.length > 0}
						<select
							value={selectedPresetId || ''}
							onchange={(e) => {
								const value = e.currentTarget.value;
								if (value) loadPreset(value);
							}}
							class="px-3 py-1 text-sm bg-background border border-border rounded hover:border-accent"
						>
							<option value="">{$t('filters.selectPreset')}</option>
							{#each presets as preset}
								<option value={preset.id}>{preset.name}</option>
							{/each}
						</select>
					{/if}
					<button
						onclick={() => (showPresetDialog = true)}
						class="px-3 py-1 text-sm border border-border rounded hover:border-accent transition-colors"
						disabled={filterGroup.conditions.length === 0}
					>
						{$t('filters.savePreset')}
					</button>
				</div>
			</div>

			<!-- Conditions List -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if filterGroup.conditions.length === 0}
					<div class="text-center py-12 text-text-secondary">
						<p>{$t('filters.noConditions')}</p>
						<p class="text-sm mt-2">{$t('filters.addConditionHint')}</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each filterGroup.conditions as condition, index (condition.id)}
							<div class="flex items-start gap-2 p-3 bg-background border border-border rounded">
								{#if index > 0}
									<div class="flex-shrink-0 px-2 py-1 text-xs font-medium text-accent bg-accent/10 rounded">
										{filterGroup.logic}
									</div>
								{/if}

								<!-- Field Selection -->
								<select
									value={condition.field}
									onchange={(e) => updateCondition(condition.id, { field: e.currentTarget.value })}
									class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent"
								>
									{#each fields as field}
										<option value={field.id}>{field.label}</option>
									{/each}
								</select>

								<!-- Operator Selection -->
								<select
									value={condition.operator}
									onchange={(e) => updateCondition(condition.id, { operator: e.currentTarget.value as FilterOperator })}
									class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent"
								>
									{#each getOperatorsForType(condition.type) as op}
										<option value={op.value}>{op.label}</option>
									{/each}
								</select>

								<!-- Value Input -->
								{#if renderValueInput(condition) === 'text'}
									<input
										type="text"
										value={condition.value}
										oninput={(e) => updateCondition(condition.id, { value: e.currentTarget.value })}
										placeholder={$t('filters.valuePlaceholder')}
										class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
									/>
								{:else if renderValueInput(condition) === 'number'}
									<input
										type="number"
										value={condition.value}
										oninput={(e) => updateCondition(condition.id, { value: Number(e.currentTarget.value) })}
										placeholder={$t('filters.valuePlaceholder')}
										class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
									/>
								{:else if renderValueInput(condition) === 'date'}
									<input
										type="date"
										value={condition.value}
										oninput={(e) => updateCondition(condition.id, { value: e.currentTarget.value })}
										class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
									/>
								{:else if renderValueInput(condition) === 'number-range'}
									<div class="flex-1 flex items-center gap-2">
										<input
											type="number"
											value={condition.value?.min || ''}
											oninput={(e) => updateCondition(condition.id, { value: { ...condition.value, min: Number(e.currentTarget.value) } })}
											placeholder={$t('filters.min')}
											class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
										/>
										<span class="text-text-secondary">-</span>
										<input
											type="number"
											value={condition.value?.max || ''}
											oninput={(e) => updateCondition(condition.id, { value: { ...condition.value, max: Number(e.currentTarget.value) } })}
											placeholder={$t('filters.max')}
											class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
										/>
									</div>
								{:else if renderValueInput(condition) === 'date-range'}
									<div class="flex-1 flex items-center gap-2">
										<input
											type="date"
											value={condition.value?.start || ''}
											oninput={(e) => updateCondition(condition.id, { value: { ...condition.value, start: e.currentTarget.value } })}
											class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
										/>
										<span class="text-text-secondary">-</span>
										<input
											type="date"
											value={condition.value?.end || ''}
											oninput={(e) => updateCondition(condition.id, { value: { ...condition.value, end: e.currentTarget.value } })}
											class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
										/>
									</div>
								{:else if renderValueInput(condition) === 'select'}
									{@const field = fields.find((f) => f.id === condition.field)}
									{#if field?.options}
										<select
											multiple
											value={condition.value || []}
											onchange={(e) => {
												const selected = Array.from(e.currentTarget.selectedOptions).map((opt) => opt.value);
												updateCondition(condition.id, { value: selected });
											}}
											class="flex-1 px-3 py-2 bg-surface border border-border rounded hover:border-accent focus:border-accent focus:outline-none"
											size="3"
										>
											{#each field.options as option}
												<option value={option.value}>{option.label}</option>
											{/each}
										</select>
									{/if}
								{/if}

								<!-- Remove Button -->
								<button
									onclick={() => removeCondition(condition.id)}
									class="flex-shrink-0 p-2 text-red-400 hover:text-red-300 transition-colors"
									aria-label="Remove condition"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add Condition Button -->
				<button
					onclick={addCondition}
					class="w-full mt-4 px-4 py-2 border-2 border-dashed border-border rounded hover:border-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					{$t('filters.addCondition')}
				</button>
			</div>

			<!-- Footer Actions -->
			<div class="p-4 border-t border-border flex justify-between gap-2">
				<button
					onclick={handleReset}
					class="px-4 py-2 border border-border rounded hover:border-accent transition-colors"
					disabled={filterGroup.conditions.length === 0}
				>
					{$t('filters.reset')}
				</button>
				<div class="flex gap-2">
					<button
						onclick={onClose}
						class="px-4 py-2 border border-border rounded hover:border-accent transition-colors"
					>
						{$t('common.cancel')}
					</button>
					<button
						onclick={handleApply}
						class="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
					>
						{$t('filters.apply')}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Preset Save Dialog -->
{#if showPresetDialog}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
		onclick={(e) => e.target === e.currentTarget && (showPresetDialog = false)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="bg-surface border border-border rounded-lg w-full max-w-md p-6">
			<h3 class="text-lg font-medium mb-4">{$t('filters.savePreset')}</h3>
			<input
				type="text"
				bind:value={presetName}
				placeholder={$t('filters.presetNamePlaceholder')}
				class="w-full px-4 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none mb-4"
				onkeydown={(e) => e.key === 'Enter' && saveAsPreset()}
			/>
			<div class="flex justify-end gap-2">
				<button
					onclick={() => (showPresetDialog = false)}
					class="px-4 py-2 border border-border rounded hover:border-accent transition-colors"
				>
					{$t('common.cancel')}
				</button>
				<button
					onclick={saveAsPreset}
					disabled={!presetName.trim()}
					class="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{$t('common.save')}
				</button>
			</div>

			<!-- Existing Presets -->
			{#if presets.length > 0}
				<div class="mt-6 pt-6 border-t border-border">
					<h4 class="text-sm font-medium mb-3">{$t('filters.savedPresets')}</h4>
					<div class="space-y-2">
						{#each presets as preset}
							<div class="flex items-center justify-between p-2 bg-background rounded">
								<button
									onclick={() => {
										loadPreset(preset.id);
										showPresetDialog = false;
									}}
									class="flex-1 text-left text-sm hover:text-accent transition-colors"
								>
									{preset.name}
								</button>
								<button
									onclick={() => deletePreset(preset.id)}
									class="p-1 text-red-400 hover:text-red-300 transition-colors"
									aria-label="Delete preset"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
