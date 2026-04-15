<script lang="ts">
	import { t } from '$lib/i18n';

	export interface EditableCellOption {
		label: string;
		value: string | number;
	}

	export type EditableCellType = 'text' | 'number' | 'select' | 'date';

	export interface EditableCellValidator {
		validate: (value: any) => { valid: boolean; error?: string };
	}

	interface EditableCellProps {
		value: any;
		type?: EditableCellType;
		options?: EditableCellOption[];
		validator?: EditableCellValidator;
		onSave: (newValue: any) => Promise<void>;
		disabled?: boolean;
		placeholder?: string;
		required?: boolean;
	}

	let {
		value = '',
		type = 'text',
		options = [],
		validator,
		onSave,
		disabled = false,
		placeholder = '',
		required = false
	}: EditableCellProps = $props();

	let isEditing = $state(false);
	let editValue = $state<any>('');
	let error = $state<string | null>(null);
	let isSaving = $state(false);
	let inputRef = $state<HTMLInputElement | HTMLSelectElement | null>(null);

	// Update editValue when value prop changes
	$effect(() => {
		if (!isEditing) {
			editValue = value;
		}
	});

	function startEditing() {
		if (disabled) return;
		isEditing = true;
		editValue = value;
		error = null;

		// Focus the input after it's rendered
		setTimeout(() => {
			if (inputRef) {
				inputRef.focus();
				if (inputRef instanceof HTMLInputElement && type === 'text') {
					inputRef.select();
				}
			}
		}, 0);
	}

	function cancel() {
		isEditing = false;
		editValue = value;
		error = null;
	}

	async function save() {
		// Validate required field
		if (required && (editValue === '' || editValue === null || editValue === undefined)) {
			error = $t('datatable.inline.required');
			return;
		}

		// Run custom validator if provided
		if (validator) {
			const result = validator.validate(editValue);
			if (!result.valid) {
				error = result.error || $t('datatable.inline.invalidValue');
				return;
			}
		}

		// Check if value actually changed
		if (editValue === value) {
			cancel();
			return;
		}

		try {
			isSaving = true;
			error = null;
			await onSave(editValue);
			isEditing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : $t('datatable.inline.saveFailed');
		} finally {
			isSaving = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && type !== 'text') {
			e.preventDefault();
			save();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancel();
		}
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			save();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancel();
		}
	}

	// Format display value based on type
	function formatDisplayValue(val: any): string {
		if (val === null || val === undefined || val === '') return '-';

		switch (type) {
			case 'date':
				try {
					const date = new Date(val);
					return date.toLocaleDateString();
				} catch {
					return String(val);
				}
			case 'select':
				const option = options.find((opt) => opt.value === val);
				return option ? option.label : String(val);
			default:
				return String(val);
		}
	}
</script>

{#if isEditing}
	<div class="editable-cell-edit">
		<div class="flex items-center gap-2">
			{#if type === 'text'}
				<input
					bind:this={inputRef}
					type="text"
					bind:value={editValue}
					onkeydown={handleInputKeydown}
					{placeholder}
					{disabled}
					class="flex-1 px-2 py-1 text-sm bg-background border border-accent rounded focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			{:else if type === 'number'}
				<input
					bind:this={inputRef}
					type="number"
					bind:value={editValue}
					onkeydown={handleKeydown}
					{placeholder}
					{disabled}
					class="flex-1 px-2 py-1 text-sm bg-background border border-accent rounded focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			{:else if type === 'date'}
				<input
					bind:this={inputRef}
					type="date"
					bind:value={editValue}
					onkeydown={handleKeydown}
					{disabled}
					class="flex-1 px-2 py-1 text-sm bg-background border border-accent rounded focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			{:else if type === 'select'}
				<select
					bind:this={inputRef}
					bind:value={editValue}
					onkeydown={handleKeydown}
					{disabled}
					class="flex-1 px-2 py-1 text-sm bg-background border border-accent rounded focus:outline-none focus:ring-1 focus:ring-accent"
				>
					{#if !required}
						<option value="">-</option>
					{/if}
					{#each options as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{/if}

			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={save}
					disabled={isSaving || disabled}
					class="p-1 text-green-400 hover:bg-green-400/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					title={$t('common.save')}
				>
					{#if isSaving}
						<svg
							class="animate-spin h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>
				<button
					type="button"
					onclick={cancel}
					disabled={isSaving || disabled}
					class="p-1 text-red-400 hover:bg-red-400/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					title={$t('common.cancel')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>

		{#if error}
			<div class="mt-1 text-xs text-red-400">{error}</div>
		{/if}
	</div>
{:else}
	<button
		type="button"
		onclick={startEditing}
		disabled={disabled}
		class="editable-cell-view w-full text-left px-0 hover:bg-accent/5 rounded transition-colors {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer'}"
		title={disabled ? '' : $t('datatable.inline.clickToEdit')}
	>
		<span class="block">{formatDisplayValue(value)}</span>
	</button>
{/if}

<style>
	.editable-cell-view {
		min-height: 1.5rem;
	}
</style>
