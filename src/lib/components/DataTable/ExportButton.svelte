<script lang="ts" generics="TData">
	import { exportTable, type ExportFormat, type ExportOptions } from '$lib/utils/export';
	import type { Table } from '@tanstack/svelte-table';
	import { t } from '$lib/i18n';
	import { ChevronDown, Download } from 'lucide-svelte';

	interface ExportButtonProps {
		table: Table<TData>;
		filename?: string;
		selectedRowsOnly?: boolean;
	}

	let { table, filename = 'export', selectedRowsOnly = false }: ExportButtonProps = $props();

	let showDropdown = $state(false);

	function handleExport(format: ExportFormat) {
		const options: ExportOptions = {
			filename,
			includeHeaders: true,
			selectedRowsOnly
		};

		exportTable(table, format, options);
		showDropdown = false;
	}

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.export-dropdown-container')) {
			showDropdown = false;
		}
	}

	$effect(() => {
		if (showDropdown) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div class="export-dropdown-container relative w-full sm:w-auto">
	<button
		onclick={toggleDropdown}
		class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] px-4 text-[color:var(--mf-ink-strong)] shadow-[var(--mf-shadow-soft)] transition hover:-translate-y-0.5 hover:border-[color:var(--mf-line-strong)] hover:bg-white sm:w-auto"
	>
		<Download class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
		<span>{$t('datatable.export')}</span>
		<ChevronDown class={`h-4 w-4 text-[color:var(--mf-ink-faint)] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
	</button>

	{#if showDropdown}
		<div
			class="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] shadow-[var(--mf-shadow-lg)]"
		>
			<div class="py-1.5">
				<button
					onclick={() => handleExport('csv')}
					class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[color:var(--mf-ink)] transition hover:bg-[color:var(--mf-surface-muted)]"
				>
					<span>{$t('datatable.exportCSV')}</span>
					<span class="mf-chip px-2 py-0.5 text-[0.65rem]">CSV</span>
				</button>
				<button
					onclick={() => handleExport('excel')}
					class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[color:var(--mf-ink)] transition hover:bg-[color:var(--mf-surface-muted)]"
				>
					<span>{$t('datatable.exportExcel')}</span>
					<span class="mf-chip px-2 py-0.5 text-[0.65rem]">XLSX</span>
				</button>
				<button
					onclick={() => handleExport('pdf')}
					class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[color:var(--mf-ink)] transition hover:bg-[color:var(--mf-surface-muted)]"
				>
					<span>{$t('datatable.exportPDF')}</span>
					<span class="mf-chip px-2 py-0.5 text-[0.65rem]">PDF</span>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.export-dropdown-container {
		display: inline-block;
	}
</style>
