<script lang="ts" generics="TData">
	import type { Column } from '@tanstack/svelte-table';
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import SortableColumnItem from './SortableColumnItem.svelte';

	interface ColumnSettingsProps {
		columns: Column<TData, any>[];
		tableId: string;
		onVisibilityChange?: (columnId: string, visible: boolean) => void;
		onOrderChange?: (newOrder: string[]) => void;
		onWidthChange?: (columnId: string, width: number) => void;
		onReset?: () => void;
		open?: boolean;
		onClose?: () => void;
	}

	let {
		columns,
		tableId,
		onVisibilityChange,
		onOrderChange,
		onWidthChange,
		onReset,
		open = false,
		onClose
	}: ColumnSettingsProps = $props();

	interface ColumnConfig {
		id: string;
		label: string;
		visible: boolean;
		width?: number;
		order: number;
	}

	let columnConfigs = $state<ColumnConfig[]>([]);
	let isResizing = $state(false);
	let resizingColumnId = $state<string | null>(null);
	let resizeStartX = $state(0);
	let resizeStartWidth = $state(0);
	let draggedIndex = $state<number | null>(null);

	// Storage key for this table
	const storageKey = $derived(`datatable_column_settings_${tableId}`);

	// Initialize column configs from columns and localStorage
	onMount(() => {
		loadColumnConfigs();
	});

	function loadColumnConfigs() {
		// Try to load from localStorage
		const saved = localStorage.getItem(storageKey);
		let savedConfigs: Record<string, Partial<ColumnConfig>> = {};

		if (saved) {
			try {
				savedConfigs = JSON.parse(saved);
			} catch (e) {
				console.error('Failed to parse saved column settings:', e);
			}
		}

		// Build column configs from current columns
		columnConfigs = columns
			.filter((col) => col.id !== 'select') // Exclude row selection column
			.map((col, index) => {
				const saved = savedConfigs[col.id || ''];
				return {
					id: col.id || '',
					label: String(col.columnDef.header || col.id || ''),
					visible: saved?.visible ?? true,
					width: saved?.width,
					order: saved?.order ?? index
				};
			})
			.sort((a, b) => a.order - b.order);
	}

	function saveColumnConfigs() {
		const configMap: Record<string, Partial<ColumnConfig>> = {};
		columnConfigs.forEach((config) => {
			configMap[config.id] = {
				visible: config.visible,
				width: config.width,
				order: config.order
			};
		});
		localStorage.setItem(storageKey, JSON.stringify(configMap));
	}

	function toggleVisibility(columnId: string) {
		const config = columnConfigs.find((c) => c.id === columnId);
		if (config) {
			config.visible = !config.visible;
			saveColumnConfigs();
			if (onVisibilityChange) {
				onVisibilityChange(columnId, config.visible);
			}
		}
	}

	function handleDragStart(index: number) {
		draggedIndex = index;
	}

	function handleDragOver(event: DragEvent, targetIndex: number) {
		event.preventDefault();
		if (draggedIndex !== null && draggedIndex !== targetIndex) {
			const newConfigs = [...columnConfigs];
			const [draggedItem] = newConfigs.splice(draggedIndex, 1);
			newConfigs.splice(targetIndex, 0, draggedItem);

			// Update order values
			newConfigs.forEach((config, index) => {
				config.order = index;
			});

			columnConfigs = newConfigs;
			draggedIndex = targetIndex;
		}
	}

	function handleDragEnd() {
		draggedIndex = null;
		saveColumnConfigs();

		if (onOrderChange) {
			onOrderChange(columnConfigs.map((c) => c.id));
		}
	}

	function startResize(columnId: string, event: MouseEvent) {
		isResizing = true;
		resizingColumnId = columnId;
		resizeStartX = event.clientX;
		const config = columnConfigs.find((c) => c.id === columnId);
		resizeStartWidth = config?.width || 150;

		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (isResizing && resizingColumnId) {
			const delta = event.clientX - resizeStartX;
			const newWidth = Math.max(50, resizeStartWidth + delta);

			const config = columnConfigs.find((c) => c.id === resizingColumnId);
			if (config) {
				config.width = newWidth;
			}
		}
	}

	function handleMouseUp() {
		if (isResizing && resizingColumnId) {
			const config = columnConfigs.find((c) => c.id === resizingColumnId);
			if (config && config.width && onWidthChange) {
				onWidthChange(resizingColumnId, config.width);
			}
			saveColumnConfigs();
		}
		isResizing = false;
		resizingColumnId = null;
	}

	function resetToDefaults() {
		localStorage.removeItem(storageKey);
		loadColumnConfigs();
		if (onReset) {
			onReset();
		}
	}

	function showAll() {
		columnConfigs.forEach((config) => {
			config.visible = true;
		});
		saveColumnConfigs();
		if (onVisibilityChange) {
			columnConfigs.forEach((config) => {
				onVisibilityChange(config.id, true);
			});
		}
	}

	function hideAll() {
		columnConfigs.forEach((config) => {
			config.visible = false;
		});
		saveColumnConfigs();
		if (onVisibilityChange) {
			columnConfigs.forEach((config) => {
				onVisibilityChange(config.id, false);
			});
		}
	}
</script>

<svelte:window
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
/>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
		onclick={(e) => e.target === e.currentTarget && onClose?.()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b border-border">
				<h2 class="text-xl font-medium">{$t('datatable.columnSettings')}</h2>
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

			<!-- Actions -->
			<div class="flex items-center gap-2 p-4 border-b border-border">
				<button
					onclick={showAll}
					class="px-3 py-1 text-sm border border-border rounded hover:border-accent transition-colors"
				>
					{$t('datatable.showAll')}
				</button>
				<button
					onclick={hideAll}
					class="px-3 py-1 text-sm border border-border rounded hover:border-accent transition-colors"
				>
					{$t('datatable.hideAll')}
				</button>
				<button
					onclick={resetToDefaults}
					class="px-3 py-1 text-sm border border-border rounded hover:border-accent transition-colors ml-auto"
				>
					{$t('datatable.resetDefaults')}
				</button>
			</div>

			<!-- Column list -->
			<div class="flex-1 overflow-y-auto p-4">
				<div class="space-y-2">
					{#each columnConfigs as config, index (config.id)}
						<SortableColumnItem
							{config}
							{index}
							{isResizing}
							{resizingColumnId}
							isDragging={draggedIndex === index}
							onToggleVisibility={() => toggleVisibility(config.id)}
							onStartResize={(e) => startResize(config.id, e)}
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDragEnd={handleDragEnd}
						/>
					{/each}
				</div>
			</div>

			<!-- Footer -->
			<div class="p-4 border-t border-border flex justify-end gap-2">
				<button
					onclick={onClose}
					class="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
				>
					{$t('common.close')}
				</button>
			</div>
		</div>
	</div>
{/if}
