<script lang="ts">
	import { t } from '$i18n';
	import Button from '$components/ui/button/button.svelte';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { Invoice, InvoiceStatus } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import { billing as billingStore } from '$stores/billing';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let statusFilter: InvoiceStatus | 'all' = 'all';

	const statuses: { value: InvoiceStatus | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'draft', label: $t('billing.status.draft') },
		{ value: 'pending', label: $t('billing.status.pending') },
		{ value: 'paid', label: $t('billing.status.paid') },
		{ value: 'overdue', label: $t('billing.status.overdue') },
		{ value: 'cancelled', label: $t('billing.status.cancelled') }
	];

	$: filteredInvoices = $billingStore.data.filter((invoice) => {
		const matchesSearch =
			invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const columns = [
		{
			key: 'invoiceNumber',
			header: $t('billing.invoice.invoiceNumber'),
			cell: (invoice: Invoice) => invoice.invoiceNumber
		},
		{
			key: 'patientName',
			header: $t('billing.invoice.patient'),
			cell: (invoice: Invoice) => invoice.patientName || '-'
		},
		{
			key: 'issueDate',
			header: $t('billing.invoice.issueDate'),
			cell: (invoice: Invoice) => formatDate(invoice.issueDate)
		},
		{
			key: 'dueDate',
			header: $t('billing.invoice.dueDate'),
			cell: (invoice: Invoice) => formatDate(invoice.dueDate)
		},
		{
			key: 'total',
			header: $t('billing.invoice.total'),
			cell: (invoice: Invoice) => formatCurrency(invoice.total, undefined, get(language).locale)
		},
		{
			key: 'status',
			header: $t('billing.invoice.status'),
			cell: (invoice: Invoice) => ({ component: StatusBadge, props: { status: invoice.status } })
		},
		{
			key: 'actions',
			header: $t('common.actions'),
			cell: (invoice: Invoice) => ({ type: 'actions', id: invoice.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/billing/invoices/${id}`);
		} else if (action === 'edit') {
			goto(`/billing/invoices/${id}/edit`);
		}
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('billing.title')}</h1>
		<Button on:click={() => goto('/billing/invoices/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('billing.invoice.createInvoice')}
		</Button>
	</div>

	<div class="flex flex-col md:flex-row items-center gap-4">
		<SearchBar bind:searchTerm />
		<FilterDropdown bind:value={statusFilter} options={statuses} label={$t('billing.invoice.filterByStatus')} />
	</div>

	<DataTable {columns} data={filteredInvoices} on:action={handleAction} />
</div>