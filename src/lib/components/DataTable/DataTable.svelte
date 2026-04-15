<script lang="ts" generics="TData">
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type ColumnDef,
		type SortingState,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type TableOptions,
		type Table
	} from '@tanstack/svelte-table';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { toStore, writable } from 'svelte/store';
	import { t } from '$lib/i18n';
	import type { Snippet } from 'svelte';

	interface DataTableProps {
		data: TData[];
		columns: ColumnDef<TData, any>[];
		enableSorting?: boolean;
		enableFiltering?: boolean;
		enablePagination?: boolean;
		enableRowSelection?: boolean;
		multiRowSelection?: boolean;
		pageSize?: number;
		onRowSelectionChange?: (selectedRows: TData[]) => void;
		onTableCreate?: (table: Table<TData>) => void;
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
		enableRowSelection = false,
		multiRowSelection = true,
		pageSize = 10,
		onRowSelectionChange,
		onTableCreate,
		loading = false,
		error = '',
		emptyMessage = 'No data available',
		toolbar,
		enableVirtualization = false,
		estimatedRowHeight = 53,
		maxHeight = '600px'
	}: DataTableProps = $props();

	// Table state
	let sorting = writable<SortingState>([]);
	let columnFilters = writable<ColumnFiltersState>([]);
	let pagination = writable<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});
	let rowSelection = writable<RowSelectionState>({});
	let globalFilter = $state('');

	// Virtual scrolling
	let tableContainerRef = $state<HTMLDivElement>();

	// Create table options
	const options = $derived.by(() => {
		const opts: TableOptions<TData> = {
			data,
			columns,
			getCoreRowModel: getCoreRowModel(),
			state: {
				sorting: $sorting,
				columnFilters: $columnFilters,
				pagination: $pagination,
				rowSelection: $rowSelection,
				globalFilter
			},
			onSortingChange: (updater) => {
				if (typeof updater === 'function') {
					sorting.update(updater);
				} else {
					sorting.set(updater);
				}
			},
			onColumnFiltersChange: (updater) => {
				if (typeof updater === 'function') {
					columnFilters.update(updater);
				} else {
					columnFilters.set(updater);
				}
			},
			onPaginationChange: (updater) => {
				if (typeof updater === 'function') {
					pagination.update(updater);
				} else {
					pagination.set(updater);
				}
			},
			onRowSelectionChange: (updater) => {
				if (typeof updater === 'function') {
					rowSelection.update(updater);
				} else {
					rowSelection.set(updater);
				}
			},
			onGlobalFilterChange: (updater) => {
				if (typeof updater === 'function') {
					globalFilter = updater(globalFilter);
				} else {
					globalFilter = updater;
				}
			}
		};

		if (enableSorting) {
			opts.getSortedRowModel = getSortedRowModel();
			opts.enableSorting = true;
			opts.enableMultiSort = true;
		}

		if (enableFiltering) {
			opts.getFilteredRowModel = getFilteredRowModel();
			opts.enableColumnFilters = true;
			opts.enableGlobalFilter = true;
		}

		if (enablePagination) {
			opts.getPaginationRowModel = getPaginationRowModel();
		}

		if (enableRowSelection) {
			opts.enableRowSelection = true;
			opts.enableMultiRowSelection = multiRowSelection;
		}

		return opts;
	});

	const optionsStore = toStore(() => options as any);
	const table = createSvelteTable(optionsStore);

	// Create virtualizer for large datasets
	const rowVirtualizer = $derived(
		enableVirtualization && tableContainerRef
			? createVirtualizer({
					count: $table.getRowModel().rows.length,
					getScrollElement: () => tableContainerRef!,
					estimateSize: () => estimatedRowHeight,
					overscan: 10,
					measureElement:
						typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
							? (element) => element?.getBoundingClientRect().height
							: undefined
				}) as any
			: null
	);

	// Notify parent component when table is created
	$effect(() => {
		pagination.update((current) =>
			current.pageSize === pageSize
				? current
				: {
					...current,
					pageSize,
					pageIndex: 0
				}
		);
	});

	$effect(() => {
		if (onTableCreate) {
			onTableCreate($table as Table<TData>);
		}
	});

	// Watch for row selection changes
	$effect(() => {
		if (onRowSelectionChange && enableRowSelection) {
			const selectedRowModel = $table.getSelectedRowModel();
			const selectedRows = selectedRowModel.rows.map((row) => row.original) as TData[];
			onRowSelectionChange(selectedRows);
		}
	});

	// Pagination helpers
	const pageCount = $derived($table.getPageCount());
	const currentPage = $derived($pagination.pageIndex + 1);
	const totalRows = $derived($table.getFilteredRowModel().rows.length);
	const startRow = $derived($pagination.pageIndex * $pagination.pageSize + 1);
	const endRow = $derived(
		Math.min(($pagination.pageIndex + 1) * $pagination.pageSize, totalRows)
	);

	function goToPage(page: number) {
		pagination.update((old) => ({
			...old,
			pageIndex: page
		}));
	}

	function previousPage() {
		if ($table.getCanPreviousPage()) {
			$table.previousPage();
		}
	}

	function nextPage() {
		if ($table.getCanNextPage()) {
			$table.nextPage();
		}
	}

	function setPageSize(size: number) {
		pagination.update((old) => ({
			...old,
			pageSize: size,
			pageIndex: 0
		}));
	}
</script>

<div class="w-full space-y-4">
	<!-- Table toolbar -->
	{#if enableFiltering}
		<div class="flex items-center justify-between gap-4">
			<div class="flex-1 max-w-sm">
				<input
					type="text"
					bind:value={globalFilter}
					placeholder={$t('datatable.search')}
					class="w-full px-4 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
				/>
			</div>
			{#if toolbar}
				{@render toolbar()}
			{/if}
		</div>
	{/if}

	<!-- Error message -->
	{#if error}
		<div class="bg-red-900/20 border border-red-600 rounded p-4">
			<p class="text-red-400">{error}</p>
		</div>
	{/if}

	<!-- Table -->
	<div class="bg-surface border border-border rounded overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center p-12">
				<div
					class="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"
				></div>
			</div>
		{:else if data.length === 0}
			<div class="p-12 text-center">
				<p class="text-text-secondary">{emptyMessage}</p>
			</div>
		{:else if enableVirtualization}
			<!-- Virtualized table rendering -->
			<div bind:this={tableContainerRef} class="overflow-auto" style="max-height: {maxHeight};">
				<table class="w-full">
					<thead class="bg-background border-b border-border sticky top-0 z-10">
						{#each $table.getHeaderGroups() as headerGroup}
							<tr>
								{#each headerGroup.headers as header}
									<th class="text-left p-4">
									{#if !header.isPlaceholder}
										{@const sortState = header.column.getIsSorted()}
										{@const HeaderComponent = flexRender(header.column.columnDef.header, header.getContext())}
										<button
											class="{header.column.getCanSort() ? 'flex items-center gap-2 font-medium hover:text-accent cursor-pointer select-none' : 'flex items-center gap-2 font-medium hover:text-accent'}"
											onclick={header.column.getToggleSortingHandler()}
											disabled={!header.column.getCanSort()}
										>
											<HeaderComponent />
											{#if header.column.getCanSort()}
													<span class="text-text-secondary">
														{sortState === 'asc' ? '↑' : sortState === 'desc' ? '↓' : '⇅'}
													</span>
												{/if}
											</button>
										{/if}
									</th>
								{/each}
							</tr>
						{/each}
					</thead>
					<tbody>
						{#if $rowVirtualizer}
							{@const virtualRows = $rowVirtualizer.getVirtualItems()}
							{@const totalSize = $rowVirtualizer.getTotalSize()}
							{@const rows = $table.getRowModel().rows}
							<tr style="height: {totalSize}px;">
																<td colspan={columns.length} style="padding: 0; border: none;"></td>
														</tr>
														{#each virtualRows as virtualRow (virtualRow.index)}
															{@const row = rows[virtualRow.index]}
															<tr
									data-index={virtualRow.index}
									style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualRow.start}px);"
									class="{row.getIsSelected() ? 'border-b border-border hover:bg-accent/5 bg-accent/10' : 'border-b border-border hover:bg-accent/5'}"
															>
																{#each row.getVisibleCells() as cell}
																	{@const CellComponent = flexRender(cell.column.columnDef.cell, cell.getContext())}
																	<td class="p-4">
																		<CellComponent />
																	</td>
																{/each}
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{:else}
			<!-- Standard table rendering -->
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-background border-b border-border">
						{#each $table.getHeaderGroups() as headerGroup}
							<tr>
								{#each headerGroup.headers as header}
									<th class="text-left p-4">
									{#if !header.isPlaceholder}
										{@const sortState = header.column.getIsSorted()}
										{@const HeaderComponent = flexRender(header.column.columnDef.header, header.getContext())}
										<button
											class="{header.column.getCanSort() ? 'flex items-center gap-2 font-medium hover:text-accent cursor-pointer select-none' : 'flex items-center gap-2 font-medium hover:text-accent'}"
											onclick={header.column.getToggleSortingHandler()}
											disabled={!header.column.getCanSort()}
										>
											<HeaderComponent />
											{#if header.column.getCanSort()}
													<span class="text-text-secondary">
														{sortState === 'asc' ? '↑' : sortState === 'desc' ? '↓' : '⇅'}
													</span>
												{/if}
											</button>
										{/if}
									</th>
								{/each}
							</tr>
						{/each}
					</thead>
					<tbody>
														{#each $table.getRowModel().rows as row}
															<tr
																class="{row.getIsSelected() ? 'border-b border-border last:border-b-0 hover:bg-accent/5 bg-accent/10' : 'border-b border-border last:border-b-0 hover:bg-accent/5'}"
															>
																{#each row.getVisibleCells() as cell}
																	{@const CellComponent = flexRender(cell.column.columnDef.cell, cell.getContext())}
																	<td class="p-4">
																		<CellComponent />
																	</td>
																{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- Pagination -->
	{#if enablePagination && !enableVirtualization && data.length > 0 && !loading}
		<div class="flex items-center justify-between gap-4">
			<div class="text-sm text-text-secondary">
				{$t('datatable.showing')} {startRow} {$t('datatable.to')} {endRow} {$t('datatable.of')}
				{totalRows} {$t('datatable.results')}
			</div>

			<div class="flex items-center gap-2">
				<button
					onclick={previousPage}
					disabled={!$table.getCanPreviousPage()}
					class="px-3 py-1 border border-border rounded hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{$t('datatable.previous')}
				</button>

				<div class="flex items-center gap-1">
					{#each Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
						if (pageCount <= 5) {
							return i;
						}
						if (currentPage <= 3) {
							return i;
						}
						if (currentPage >= pageCount - 2) {
							return pageCount - 5 + i;
						}
						return currentPage - 3 + i;
					}) as pageNum}
						<button
							onclick={() => goToPage(pageNum)}
							class="{pageNum === $pagination.pageIndex ? 'px-3 py-1 border border-border rounded hover:border-accent bg-accent text-white' : 'px-3 py-1 border border-border rounded hover:border-accent'}"
						>
							{pageNum + 1}
						</button>
					{/each}
				</div>

				<button
					onclick={nextPage}
					disabled={!$table.getCanNextPage()}
					class="px-3 py-1 border border-border rounded hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{$t('datatable.next')}
				</button>

				<select
					value={$pagination.pageSize}
					onchange={(e) => setPageSize(Number(e.currentTarget.value))}
					class="px-3 py-1 bg-background border border-border rounded hover:border-accent"
				>
					{#each [10, 20, 30, 40, 50] as size}
						<option value={size}>{size} / {$t('datatable.page')}</option>
					{/each}
				</select>
			</div>
		</div>
	{/if}
</div>
