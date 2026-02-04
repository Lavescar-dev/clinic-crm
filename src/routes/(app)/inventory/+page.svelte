<script lang="ts">
	import { t, language } from '$i18n';
	import { Button } from '$components/ui/button';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { InventoryItem, ItemCategory, ItemStatus } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import { inventory as inventoryStore } from '$stores/inventory';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let categoryFilter: ItemCategory | 'all' = 'all';
	let statusFilter: ItemStatus | 'all' = 'all';

	const categories: { value: ItemCategory | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'medication', label: $t('inventory.category.medication') },
		{ value: 'equipment', label: $t('inventory.category.equipment') },
		{ value: 'consumable', label: $t('inventory.category.consumable') },
		{ value: 'other', label: $t('inventory.category.other') }
	];

	const statuses: { value: ItemStatus | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'in-stock', label: $t('inventory.status.inStock') },
		{ value: 'low-stock', label: $t('inventory.status.lowStock') },
		{ value: 'out-of-stock', label: $t('inventory.status.outOfStock') },
		{ value: 'expired', label: $t('inventory.status.expired') }
	];

	$: filteredItems = $inventoryStore.data.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
		const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	$: currentLocale = get(language).locale; // Reactive current locale

	const columns = [
		{
			key: 'name',
			header: $t('inventory.item.name'),
			cell: (item: InventoryItem) => item.name
		},
		{
			key: 'category',
			header: $t('inventory.item.category'),
			cell: (item: InventoryItem) => $t(`inventory.category.${item.category}`)
		},
		{
			key: 'currentStock',
			header: $t('inventory.item.currentStock'),
			cell: (item: InventoryItem) => item.currentStock
		},
		{
			key: 'unitPrice',
			header: $t('inventory.item.unitPrice'),
			cell: (item: InventoryItem) => formatCurrency(item.unitPrice, undefined, currentLocale)
		},
		{
			key: 'expiryDate',
			header: $t('inventory.item.expiryDate'),
			cell: (item: InventoryItem) => (item.expiryDate ? formatDate(item.expiryDate) : '-')
		},
		{
			key: 'status',
			header: $t('inventory.item.status'),
			cell: (item: InventoryItem) => ({ component: StatusBadge, props: { status: item.status } })
		},
		{
			key: 'actions',
			header: $t('common.actions'),
			cell: (item: InventoryItem) => ({ type: 'actions', id: item.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/inventory/${id}`); // Assuming a detail page for inventory items
		} else if (action === 'edit') {
			goto(`/inventory/${id}/edit`); // Assuming an edit page for inventory items
		}
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('inventory.title')}</h1>
		<Button on:click={() => goto('/inventory/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('inventory.item.addNewItem')}
		</Button>
	</div>

	<div class="flex flex-col md:flex-row items-center gap-4">
		<SearchBar bind:searchTerm />
		<FilterDropdown bind:value={categoryFilter} options={categories} label={$t('inventory.item.filterByCategory')} />
		<FilterDropdown bind:value={statusFilter} options={statuses} label={$t('inventory.item.filterByStatus')} />
	</div>

	<DataTable {columns} data={filteredItems} on:action={handleAction} />
</div>