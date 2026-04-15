<script lang="ts" generics="TData">
	import { t } from '$lib/i18n';
	import type { Table } from '@tanstack/svelte-table';

	interface BulkAction<TData> {
		id: string;
		label: string;
		icon?: string;
		variant?: 'default' | 'danger' | 'success';
		confirmMessage?: string;
		requiresConfirmation?: boolean;
		handler: (selectedRows: TData[], onProgress?: (current: number, total: number) => void) => Promise<void>;
	}

	export type { BulkAction };

	interface BulkActionsProps {
		table: Table<TData>;
		actions: BulkAction<TData>[];
		onActionComplete?: () => void;
		onActionError?: (error: Error) => void;
	}

	let {
		table,
		actions,
		onActionComplete,
		onActionError
	}: BulkActionsProps = $props();

	// State
	let isExecuting = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let showConfirmDialog = $state(false);
	let pendingAction = $state<BulkAction<TData> | null>(null);

	// Derived state
	const selectedRows = $derived(table.getSelectedRowModel().rows.map(row => row.original));
	const selectedCount = $derived(selectedRows.length);
	const hasSelection = $derived(selectedCount > 0);

	// Execute action
	async function executeAction(action: BulkAction<TData>) {
		if (isExecuting) return;

		// Check if confirmation is required
		if (action.requiresConfirmation) {
			pendingAction = action;
			showConfirmDialog = true;
			return;
		}

		await performAction(action);
	}

	// Confirm and execute pending action
	async function confirmAndExecute() {
		showConfirmDialog = false;
		if (pendingAction) {
			await performAction(pendingAction);
			pendingAction = null;
		}
	}

	// Cancel confirmation
	function cancelConfirmation() {
		showConfirmDialog = false;
		pendingAction = null;
	}

	// Perform the actual action
	async function performAction(action: BulkAction<TData>) {
		isExecuting = true;
		progress = { current: 0, total: selectedCount };

		try {
			// Execute the action with progress callback
			await action.handler(selectedRows, (current, total) => {
				progress = { current, total };
			});

			// Clear selection after successful completion
			table.resetRowSelection();

			// Notify parent
			if (onActionComplete) {
				onActionComplete();
			}
		} catch (error) {
			console.error('Bulk action failed:', error);
			if (onActionError) {
				onActionError(error as Error);
			}
		} finally {
			isExecuting = false;
			progress = { current: 0, total: 0 };
		}
	}

	// Get button variant classes
	function getVariantClasses(variant?: string) {
		switch (variant) {
			case 'danger':
				return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
			case 'success':
				return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
			default:
				return 'bg-accent hover:bg-accent-hover text-white border-accent';
		}
	}
</script>

{#if hasSelection}
	<!-- Bulk Actions Toolbar -->
	<div class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-lg z-50 animate-slide-up">
		<div class="max-w-7xl mx-auto px-4 py-3">
			<div class="flex items-center justify-between gap-4">
				<!-- Selection Info -->
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={true}
							onchange={() => table.resetRowSelection()}
							class="w-4 h-4 accent-accent"
						/>
						<span class="text-sm font-medium">
							{selectedCount} {$t('bulkActions.selected')}
						</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2">
					{#if isExecuting}
						<!-- Progress Indicator -->
						<div class="flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent rounded">
							<div class="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
							<span class="text-sm">
								{$t('bulkActions.processing')} {progress.current} / {progress.total}
							</span>
						</div>
					{:else}
						<!-- Action Buttons -->
						{#each actions as action}
							<button
								onclick={() => executeAction(action)}
								class="flex items-center gap-2 px-4 py-2 border rounded transition-colors {getVariantClasses(action.variant)}"
							>
								{#if action.icon}
									<span class="text-lg">{action.icon}</span>
								{/if}
								<span class="text-sm font-medium">{action.label}</span>
							</button>
						{/each}

						<!-- Clear Selection Button -->
						<button
							onclick={() => table.resetRowSelection()}
							class="px-4 py-2 border border-border rounded hover:border-accent transition-colors"
						>
							<span class="text-sm">{$t('bulkActions.clearSelection')}</span>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Confirmation Dialog -->
{#if showConfirmDialog && pendingAction}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface border border-border rounded-lg shadow-xl max-w-md w-full">
			<div class="p-6">
				<h3 class="text-lg font-semibold mb-4">{$t('bulkActions.confirmAction')}</h3>
				<p class="text-text-secondary mb-6">
					{pendingAction.confirmMessage || $t('bulkActions.defaultConfirmMessage', { count: selectedCount })}
				</p>
				<div class="flex gap-3 justify-end">
					<button
						onclick={cancelConfirmation}
						class="px-4 py-2 border border-border rounded hover:border-accent transition-colors"
					>
						{$t('common.cancel')}
					</button>
					<button
						onclick={confirmAndExecute}
						class="px-4 py-2 rounded transition-colors {getVariantClasses(pendingAction.variant)}"
					>
						{$t('common.confirm')}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
