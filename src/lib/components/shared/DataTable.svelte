<script lang="ts">
	import { Card } from '$components/ui/card';
	import { Eye, Pencil } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';
	import type { ComponentType, SvelteComponent } from 'svelte';

	interface Column {
		key: string;
		header: string;
		cell?: (row: any, value?: any) => any;
		component?: ComponentType<SvelteComponent>;
		props?: (row: any) => Record<string, any>;
	}

	interface Props {
		columns: Column[];
		data: any[];
		keyField?: string;
		class?: string;
	}

	let { columns, data, keyField = 'id', class: className = '' }: Props = $props();
const dispatch = createEventDispatcher<{ action: { action: 'view' | 'edit'; id: string } }>();
const viewLabel = $derived($t('common.view'));
const editLabel = $derived($t('common.edit'));
const noDataLabel = $derived($t('datatable.noData'));

	function getCellValue(column: Column, row: any) {
		if (column.component) {
			return {
				component: column.component,
				props: column.props ? column.props(row) : {}
			};
		}

		if (column.cell) {
			return column.cell(row, row[column.key]);
		}

		return row[column.key];
	}

	function isRenderableObject(value: any): value is { render: () => string } {
		return Boolean(value) && typeof value === 'object' && typeof value.render === 'function';
	}

	function isComponentObject(
		value: any
	): value is { component: ComponentType<SvelteComponent>; props?: Record<string, any>; content?: string } {
		return Boolean(value) && typeof value === 'object' && 'component' in value;
	}

	function isActionObject(value: any): value is { type: 'actions'; id: string } {
		return Boolean(value) && typeof value === 'object' && value.type === 'actions' && typeof value.id === 'string';
	}
</script>

<Card class={`mf-workbench-frame ${className}`}>
	{#if data.length === 0}
		<div class="p-5 sm:p-6">
			<div class="mf-empty-state text-sm">
			{noDataLabel}
			</div>
		</div>
	{:else}
		<div class="space-y-3 p-3 md:hidden">
			{#each data as row (row[keyField])}
				<article class="mf-soft-card mf-interactive-row overflow-hidden rounded-[1.4rem]">
					<div class="space-y-0">
						{#each columns as column}
							{@const cellValue = getCellValue(column, row)}
							<div class="border-b border-[color:var(--mf-line-soft)] px-4 py-3 last:border-b-0">
								<p class="mf-kicker text-[0.68rem] font-semibold">
									{column.header}
								</p>
								<div class="mt-2 min-w-0 text-sm leading-6 text-[color:var(--mf-ink)]">
									{#if isActionObject(cellValue)}
										<div class="flex flex-wrap items-center gap-2">
											<button
												type="button"
												class="inline-flex items-center gap-2 rounded-xl border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)] px-3 py-2 text-sm font-medium text-[color:var(--mf-ink)] transition hover:border-[color:var(--mf-line-strong)] hover:bg-[color:var(--mf-surface-strong)]"
												onclick={() => dispatch('action', { action: 'view', id: cellValue.id })}
											>
												<Eye class="h-4 w-4" />
												{viewLabel}
											</button>
											<button
												type="button"
												class="inline-flex items-center gap-2 rounded-xl border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)] px-3 py-2 text-sm font-medium text-[color:var(--mf-ink)] transition hover:border-[color:var(--mf-line-strong)] hover:bg-[color:var(--mf-surface-strong)]"
												onclick={() => dispatch('action', { action: 'edit', id: cellValue.id })}
											>
												<Pencil class="h-4 w-4" />
												{editLabel}
											</button>
										</div>
									{:else if isComponentObject(cellValue)}
										{@const CellComponent = cellValue.component}
										<CellComponent {...(cellValue.props ?? {})}>
											{cellValue.content ?? ''}
										</CellComponent>
									{:else if isRenderableObject(cellValue)}
										<div class="break-words">
											{@html cellValue.render()}
										</div>
									{:else}
										<div class="break-words">{cellValue ?? '-'}</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</article>
			{/each}
		</div>

		<div class="hidden overflow-x-auto md:block">
			<table class="min-w-[44rem] w-full">
				<thead class="border-b border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)]">
					<tr>
						{#each columns as column}
							<th class="px-5 py-4 text-left text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--mf-ink-soft)]">
								{column.header}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-[color:var(--mf-line-soft)]">
					{#each data as row, rowIndex (row[keyField])}
						<tr class={`${rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-[color:var(--mf-surface-muted)]/55'} transition-colors hover:bg-[color:var(--mf-surface-muted)]`}>
							{#each columns as column}
								{@const cellValue = getCellValue(column, row)}
								<td class="px-5 py-4 align-top text-[0.95rem] leading-6 text-[color:var(--mf-ink-strong)]">
									{#if isActionObject(cellValue)}
										<div class="flex items-center gap-2">
											<button
												type="button"
												class="rounded-xl p-1.5 text-[color:var(--mf-ink-faint)] transition-colors hover:bg-[color:var(--mf-surface-contrast)] hover:text-[color:var(--mf-ink-strong)]"
												aria-label={viewLabel}
												title={viewLabel}
												onclick={() => dispatch('action', { action: 'view', id: cellValue.id })}
											>
												<Eye class="h-4 w-4" />
											</button>
											<button
												type="button"
												class="rounded-xl p-1.5 text-[color:var(--mf-ink-faint)] transition-colors hover:bg-[color:var(--mf-surface-contrast)] hover:text-[color:var(--mf-ink-strong)]"
												aria-label={editLabel}
												title={editLabel}
												onclick={() => dispatch('action', { action: 'edit', id: cellValue.id })}
											>
												<Pencil class="h-4 w-4" />
											</button>
										</div>
									{:else if isComponentObject(cellValue)}
										{@const CellComponent = cellValue.component}
										<CellComponent {...(cellValue.props ?? {})}>
											{cellValue.content ?? ''}
										</CellComponent>
									{:else if isRenderableObject(cellValue)}
										{@html cellValue.render()}
									{:else}
										{cellValue ?? '-'}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Card>
