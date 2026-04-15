<script lang="ts">
	import { t, language } from '$i18n';
	import { Badge } from '$components/ui/badge';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { PlusCircle, ArrowRight, PackageSearch, ShieldAlert, Warehouse } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import type { InventoryItem, ItemCategory, ItemStatus } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import {
		inventory as inventoryStore,
		inventoryStats,
		stockAlerts as stockAlertsStore,
		itemsNeedingReorder
	} from '$stores/inventory';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let categoryFilter: ItemCategory | 'all' = 'all';
	let statusFilter: ItemStatus | 'all' = 'all';

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	function categoryLabel(category: ItemCategory) {
		return translate(`inventory.category.${category}`, category, category);
	}

	function stockHealthLabel(status: ItemStatus) {
		const labels: Record<ItemStatus, { tr: string; en: string }> = {
			'in-stock': { tr: 'Güvenli stok', en: 'Healthy stock' },
			'low-stock': { tr: 'Düşük stok', en: 'Low stock' },
			'out-of-stock': { tr: 'Tükendi', en: 'Out of stock' },
			expired: { tr: 'SKT riski', en: 'Expired' }
		};

		return get(language) === 'tr' ? labels[status].tr : labels[status].en;
	}

	const categories: { value: ItemCategory | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'medication', label: translate('inventory.category.medication', 'İlaç', 'Medication') },
		{ value: 'equipment', label: translate('inventory.category.equipment', 'Ekipman', 'Equipment') },
		{ value: 'consumable', label: translate('inventory.category.consumable', 'Sarf', 'Consumable') },
		{ value: 'other', label: translate('inventory.category.other', 'Diğer', 'Other') }
	];

	const statuses: { value: ItemStatus | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'in-stock', label: translate('inventory.status.inStock', 'Stokta', 'In stock') },
		{ value: 'low-stock', label: translate('inventory.status.lowStock', 'Düşük stok', 'Low stock') },
		{ value: 'out-of-stock', label: translate('inventory.status.outOfStock', 'Tükendi', 'Out of stock') },
		{ value: 'expired', label: translate('inventory.status.expired', 'SKT geçti', 'Expired') }
	];

	$: currentLocale = get(language) === 'tr' ? 'tr-TR' : 'en-US';

	$: filteredItems = $inventoryStore.data.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
		const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	$: criticalAlerts = [...$stockAlertsStore].slice(0, 5);

	const columns = [
		{
			key: 'name',
			header: translate('inventory.item.name', 'Ürün Adı', 'Item name'),
			cell: (item: InventoryItem) => item.name
		},
		{
			key: 'category',
			header: translate('inventory.item.category', 'Kategori', 'Category'),
			cell: (item: InventoryItem) => categoryLabel(item.category)
		},
		{
			key: 'currentStock',
			header: translate('inventory.item.currentStock', 'Stok', 'Stock'),
			cell: (item: InventoryItem) => `${item.currentStock} ${item.unit}`
		},
		{
			key: 'unitPrice',
			header: translate('inventory.item.unitPrice', 'Birim fiyat', 'Unit price'),
			cell: (item: InventoryItem) => formatCurrency(item.unitPrice, undefined, currentLocale)
		},
		{
			key: 'expiryDate',
			header: translate('inventory.item.expiryDate', 'Son kullanım', 'Expiry date'),
			cell: (item: InventoryItem) => (item.expiryDate ? formatDate(item.expiryDate) : '-')
		},
		{
			key: 'status',
			header: translate('inventory.item.status', 'Durum', 'Status'),
			cell: (item: InventoryItem) => ({ component: StatusBadge, props: { status: item.status } })
		},
		{
			key: 'actions',
			header: translate('common.actions', 'İşlemler', 'Actions'),
			cell: (item: InventoryItem) => ({ type: 'actions', id: item.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/inventory/${id}`);
			return;
		}

		if (action === 'edit') {
			goto(`/inventory/${id}/edit`);
		}
	}
</script>

<div class="mf-page-shell space-y-5 sm:space-y-6">
	<PageHero
		eyebrow="Tedarik Kontrolü"
		title={translate('inventory.title', 'Stok ve Tedarik Masası', 'Inventory')}
		description={translate(
			'inventory.description',
			'Kritik ürünleri, sipariş önerilerini ve stok riskini operasyonel bir workbench üzerinden yönetin.',
			'Manage critical items, reorder suggestions, and stock risk from an operational workbench.'
		)}
	>
		<Button class="w-full sm:w-auto" onclick={() => goto('/inventory/new')}>
			<PlusCircle class="h-4 w-4" />
			{translate('inventory.item.addNewItem', 'Yeni Ürün', 'Add item')}
		</Button>
	</PageHero>

	<div class="grid gap-6">
		<Card class="mf-glass">
			<CardHeader class="space-y-3">
				<p class="mf-kicker text-[0.72rem] font-semibold">
					{get(language) === 'tr' ? 'RİSK PANOSU' : 'RISK BOARD'}
				</p>
				<CardTitle class="text-2xl tracking-[-0.04em]">
					{get(language) === 'tr'
						? 'Yakından izlenmesi gereken kalemler.'
						: 'Items that need close monitoring.'}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if criticalAlerts.length > 0}
					{#each criticalAlerts as alert}
						<button
							type="button"
							class="mf-soft-card flex w-full items-start justify-between gap-4 rounded-[1.35rem] p-4 text-left transition hover:border-cyan-200/40"
							onclick={() => goto(`/inventory/${alert.item.id}`)}
						>
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<p class="truncate text-sm font-semibold text-[color:var(--mf-ink-strong)]">
										{alert.item.name}
									</p>
									<Badge variant={alert.priority === 'urgent' ? 'destructive' : 'warning'}>
										{alert.priority === 'urgent'
											? get(language) === 'tr'
												? 'Kritik'
												: 'Urgent'
											: get(language) === 'tr'
												? 'Yüksek'
												: 'High'}
									</Badge>
								</div>
								<p class="mt-2 text-sm text-[color:var(--mf-ink)]">{alert.message}</p>
								<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
									{categoryLabel(alert.item.category)} · {alert.item.location ?? (get(language) === 'tr' ? 'Merkez depo' : 'Main storage')}
								</p>
							</div>
							<ShieldAlert class="h-5 w-5 shrink-0 text-rose-500" />
						</button>
					{/each}
				{:else}
					<div class="mf-soft-card rounded-[1.35rem] border-dashed p-5 text-sm text-[color:var(--mf-ink-soft)]">
						{get(language) === 'tr'
							? 'Aktif stok alarmı görünmüyor.'
							: 'No active stock alerts at the moment.'}
					</div>
				{/if}

				<div class="grid gap-3 lg:grid-cols-2">
					<div class="mf-soft-card rounded-[1.25rem] p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
								<PackageSearch class="h-4.5 w-4.5" />
							</div>
							<div>
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{get(language) === 'tr' ? 'Düşük stok' : 'Low stock'}
								</p>
								<p class="mf-copy text-sm">{$inventoryStats.byStatus.lowStock}</p>
							</div>
						</div>
					</div>
					<div class="mf-soft-card rounded-[1.25rem] p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
								<Warehouse class="h-4.5 w-4.5" />
							</div>
							<div>
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{get(language) === 'tr' ? 'Tükenen ürün' : 'Stockouts'}
								</p>
								<p class="mf-copy text-sm">{$inventoryStats.byStatus.outOfStock}</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="mf-toolbar grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:items-center">
		<SearchBar
			bind:searchTerm
			placeholder={translate('common.search', 'Ürün, barkod veya SKU ara', 'Search items, barcode, or SKU')}
		/>
		<FilterDropdown
			bind:value={categoryFilter}
			options={categories}
			label={translate('inventory.item.filterByCategory', 'Kategoriye göre filtrele', 'Filter by category')}
		/>
		<FilterDropdown
			bind:value={statusFilter}
			options={statuses}
			label={translate('inventory.item.filterByStatus', 'Duruma göre filtrele', 'Filter by status')}
		/>
	</div>

	<DataTable {columns} data={filteredItems} on:action={handleAction} />
</div>
