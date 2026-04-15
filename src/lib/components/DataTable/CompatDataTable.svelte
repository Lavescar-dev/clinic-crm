<script lang="ts" generics="TData">
	import { t } from '$lib/i18n';
	import { language } from '$lib/i18n';
	import type { Snippet } from 'svelte';

	type ColumnDefLike<T> = {
		id?: string;
		accessorKey?: keyof T | string;
		accessorFn?: (row: T) => unknown;
		header?: string;
		cell?: (info: { row: { original: T }; getValue: () => unknown }) => unknown;
		enableSorting?: boolean;
	};

	interface DataTableProps {
		data: TData[];
		columns: ColumnDefLike<TData>[];
		enableSorting?: boolean;
		enableFiltering?: boolean;
		enablePagination?: boolean;
		pageSize?: number;
		onTableCreate?: (table: unknown) => void;
		loading?: boolean;
		error?: string;
		emptyMessage?: string;
		toolbar?: Snippet;
		enableVirtualization?: boolean;
		estimatedRowHeight?: number;
		maxHeight?: string;
	}

	let {
		data = [],
		columns,
		enableSorting = true,
		enableFiltering = true,
		enablePagination = true,
		pageSize = 10,
		onTableCreate,
		loading = false,
		error = '',
		emptyMessage = '',
		toolbar
	}: DataTableProps = $props();

	let globalFilter = $state('');
	let sortColumnId = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let currentPage = $state(1);

	const normalizedFilter = $derived(globalFilter.trim().toLowerCase());

	function getColumnId(column: ColumnDefLike<TData>, index: number): string {
		if (typeof column.id === 'string' && column.id.length > 0) return column.id;
		if (typeof column.accessorKey === 'string' && column.accessorKey.length > 0) return column.accessorKey;
		return `column-${index}`;
	}

	function getRawValue(row: TData, column: ColumnDefLike<TData>) {
		if (column.accessorFn) {
			return column.accessorFn(row);
		}

		if (typeof column.accessorKey === 'string') {
			return (row as Record<string, unknown>)[column.accessorKey];
		}

		if (typeof column.id === 'string') {
			return (row as Record<string, unknown>)[column.id];
		}

		return undefined;
	}

	function createCellInfo(row: TData, column: ColumnDefLike<TData>) {
		return {
			row: { original: row },
			getValue: () => getRawValue(row, column)
		};
	}

	function getCellOutput(row: TData, column: ColumnDefLike<TData>) {
		if (!column.cell) {
			return getRawValue(row, column);
		}

		return column.cell(createCellInfo(row, column));
	}

	function isRenderableObject(value: unknown): value is { render: () => string } {
		return Boolean(value) && typeof value === 'object' && typeof (value as { render?: unknown }).render === 'function';
	}

	function matchesFilter(row: TData) {
		if (!normalizedFilter) return true;

		return columns.some((column) => {
			const value = getRawValue(row, column);
			return String(value ?? '').toLowerCase().includes(normalizedFilter);
		});
	}

	function compareValues(a: unknown, b: unknown) {
		if (typeof a === 'number' && typeof b === 'number') {
			return a - b;
		}

		if (a instanceof Date && b instanceof Date) {
			return a.getTime() - b.getTime();
		}

		return String(a ?? '').localeCompare(String(b ?? ''), 'tr');
	}

	function toggleSort(column: ColumnDefLike<TData>, index: number) {
		if (!enableSorting || column.enableSorting === false) return;

		const columnId = getColumnId(column, index);
		if (sortColumnId === columnId) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumnId = columnId;
			sortDirection = 'asc';
		}
	}

	const filteredRows = $derived(enableFiltering ? data.filter(matchesFilter) : data);

	const sortedRows = $derived.by(() => {
		if (!enableSorting || !sortColumnId) return filteredRows;

		const columnIndex = columns.findIndex((column, index) => getColumnId(column, index) === sortColumnId);
		if (columnIndex === -1) return filteredRows;

		const column = columns[columnIndex];
		const rows = [...filteredRows];
		rows.sort((left, right) => {
			const comparison = compareValues(getRawValue(left, column), getRawValue(right, column));
			return sortDirection === 'asc' ? comparison : -comparison;
		});
		return rows;
	});

	const totalRows = $derived(sortedRows.length);
	const pageCount = $derived(enablePagination ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1);

	$effect(() => {
		if (currentPage > pageCount) {
			currentPage = pageCount;
		}
	});

	const paginatedRows = $derived.by(() => {
		if (!enablePagination) return sortedRows;
		const start = (currentPage - 1) * pageSize;
		return sortedRows.slice(start, start + pageSize);
	});

	const startRow = $derived(totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	const endRow = $derived(enablePagination ? Math.min(currentPage * pageSize, totalRows) : totalRows);
	const resolvedEmptyMessage = $derived(emptyMessage || $t('datatable.noData'));
	const hasActiveFilter = $derived(normalizedFilter.length > 0);
	const clearFilterLabel = $derived($language === 'tr' ? 'Temizle' : 'Clear');

	function clearFilter() {
		globalFilter = '';
	}
</script>

<div class="w-full space-y-4">
	{#if enableFiltering || toolbar}
		<div class="mf-toolbar flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
				<div class="flex flex-wrap items-center gap-2">
					<div class="mf-table-summary">
						<span>{totalRows}</span>
						<span>{$t('datatable.results')}</span>
					</div>
					{#if hasActiveFilter}
						<button
							type="button"
							onclick={clearFilter}
							class="mf-chip px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--mf-accent-strong)] transition hover:bg-[color:var(--mf-accent-soft)]"
						>
							{clearFilterLabel}
						</button>
					{/if}
				</div>

				{#if enableFiltering}
					<div class="w-full min-w-0 sm:max-w-sm">
						<div class="mf-control-shell h-12">
							<svg class="h-4 w-4 text-[color:var(--mf-ink-faint)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.3-4.3"></path>
						</svg>
						<input
							type="text"
							bind:value={globalFilter}
							placeholder={$t('datatable.search')}
								class="w-full border-0 bg-transparent px-0 py-0 text-sm text-[color:var(--mf-ink)] outline-none placeholder:text-[color:var(--mf-ink-faint)]"
							/>
						</div>
					</div>
				{/if}
			</div>

			{#if toolbar}
				<div class="w-full sm:ml-auto sm:w-auto">
					{@render toolbar()}
				</div>
			{/if}
		</div>
	{/if}

	{#if error}
		<div class="rounded-2xl border border-red-200/70 bg-[color:var(--mf-danger-soft)] p-4">
			<p class="text-sm text-red-600">{error}</p>
		</div>
	{/if}

	<div class="mf-workbench-frame">
		{#if loading}
			<div class="flex items-center justify-center p-12">
				<div class="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
			</div>
		{:else if totalRows === 0}
			<div class="p-5 sm:p-6">
				<div class="mf-empty-state text-sm">
					{resolvedEmptyMessage}
				</div>
			</div>
		{:else}
			<div class="space-y-3 p-3 md:hidden">
				{#each paginatedRows as row}
					<article class="mf-soft-card mf-interactive-row overflow-hidden rounded-[1.35rem]">
						{#each columns as column, index}
							{@const cellOutput = getCellOutput(row, column)}
							<div class="border-b border-[color:var(--mf-line-soft)] px-4 py-3 last:border-b-0">
								<p class="mf-kicker text-[0.68rem] font-semibold">
									{column.header ?? getColumnId(column, index)}
								</p>
								<div class="mt-2 break-words text-sm leading-6 text-[color:var(--mf-ink)]">
									{#if isRenderableObject(cellOutput)}
										{@html cellOutput.render()}
									{:else}
										{cellOutput ?? '-'}
									{/if}
								</div>
							</div>
						{/each}
					</article>
				{/each}
			</div>

			<div class="hidden overflow-x-auto md:block">
				<table class="min-w-[44rem] w-full">
					<thead class="border-b border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)]">
						<tr>
							{#each columns as column, index}
								<th class="px-5 py-4 text-left">
									<button
										type="button"
										class="flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--mf-ink-soft)]"
										disabled={!enableSorting || column.enableSorting === false}
										onclick={() => toggleSort(column, index)}
									>
										{column.header ?? getColumnId(column, index)}
										{#if enableSorting && column.enableSorting !== false}
											<span class="text-[color:var(--mf-ink-faint)]">
												{sortColumnId === getColumnId(column, index)
													? sortDirection === 'asc' ? '↑' : '↓'
													: '⇅'}
											</span>
										{/if}
									</button>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedRows as row, rowIndex}
						<tr class={`${rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-[color:var(--mf-surface-muted)]/55'} border-b border-[color:var(--mf-line-soft)] last:border-b-0 transition-colors hover:bg-[color:var(--mf-surface-muted)] motion-safe:hover:translate-y-[-1px]`}>
								{#each columns as column}
									{@const cellOutput = getCellOutput(row, column)}
									<td class="px-5 py-4 align-top text-[0.95rem] leading-6 text-[color:var(--mf-ink-strong)]">
										{#if isRenderableObject(cellOutput)}
											{@html cellOutput.render()}
										{:else}
											{cellOutput ?? '-'}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	{#if enablePagination && totalRows > 0 && !loading}
		<div class="mf-toolbar flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="text-sm text-[color:var(--mf-ink-soft)]">
				{$t('datatable.showing')} {startRow} {$t('datatable.to')} {endRow} {$t('datatable.of')}
				{totalRows} {$t('datatable.results')}
			</div>

			<div class="flex flex-wrap items-center gap-2 sm:justify-end">
				<button
					type="button"
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					class="rounded-xl border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] px-3 py-2 text-sm text-[color:var(--mf-ink)] transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
				>
					{$t('datatable.previous')}
				</button>

				<div class="flex flex-wrap items-center gap-2">
					{#each Array.from({ length: pageCount }, (_, index) => index + 1) as page}
						<button
							type="button"
							onclick={() => (currentPage = page)}
							class={page === currentPage
								? 'rounded-xl border border-border bg-accent px-3 py-2 text-sm text-white'
								: 'rounded-xl border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] px-3 py-2 text-sm text-[color:var(--mf-ink)] transition hover:border-accent'}
						>
							{page}
						</button>
					{/each}
				</div>

				<button
					type="button"
					onclick={() => (currentPage = Math.min(pageCount, currentPage + 1))}
					disabled={currentPage === pageCount}
					class="rounded-xl border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] px-3 py-2 text-sm text-[color:var(--mf-ink)] transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
				>
					{$t('datatable.next')}
				</button>
			</div>
		</div>
	{/if}
</div>
