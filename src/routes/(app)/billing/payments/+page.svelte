<script lang="ts">
	import { t, language } from '$i18n';
	import { Button } from '$components/ui/button';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { Payment, PaymentMethod } from '$types';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import { billing as billingStore } from '$stores/billing';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let methodFilter: PaymentMethod | 'all' = 'all';

	const paymentMethods: { value: PaymentMethod | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'cash', label: $t('billing.payment.method.cash') },
		{ value: 'credit-card', label: $t('billing.payment.method.credit-card') },
		{ value: 'debit-card', label: $t('billing.payment.method.debit-card') },
		{ value: 'bank-transfer', label: $t('billing.payment.method.bank-transfer') },
		{ value: 'insurance', label: $t('billing.payment.method.insurance') }
	];

	$: currentLocale = get(language).locale; // Reactive current locale

	$: filteredPayments = $billingStore.payments.filter((payment) => {
		const matchesSearch =
			payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
		return matchesSearch && matchesMethod;
	});

	const columns = [
		{
			key: 'paymentDate',
			header: $t('billing.payment.date'),
			cell: (payment: Payment) => formatDate(payment.paymentDate)
		},
		{
			key: 'invoiceId',
			header: $t('billing.payment.invoiceNumber'),
			cell: (payment: Payment) => {
				const invoice = $billingStore.data.find(inv => inv.id === payment.invoiceId);
				return invoice ? invoice.invoiceNumber : payment.invoiceId;
			}
		},
		{
			key: 'amount',
			header: $t('billing.payment.amount'),
			cell: (payment: Payment) => formatCurrency(payment.amount, undefined, currentLocale)
		},
		{
			key: 'method',
			header: $t('billing.payment.method'),
			cell: (payment: Payment) => $t(`billing.payment.method.${payment.method}`)
		},
		{
			key: 'receivedBy',
			header: $t('billing.payment.receivedBy'),
			cell: (payment: Payment) => payment.receivedBy
		},
		{
			key: 'actions',
			header: $t('common.actions'),
			cell: (payment: Payment) => ({ type: 'actions', id: payment.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			const payment = $billingStore.payments.find(p => p.id === id);
			if (payment) {
				goto(`/billing/invoices/${payment.invoiceId}`);
			}
		}
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('billing.payments.title')}</h1>
		<!-- No direct "add payment" button, payments are recorded via invoice details -->
	</div>

	<div class="flex flex-col md:flex-row items-center gap-4">
		<SearchBar bind:searchTerm />
		<FilterDropdown bind:value={methodFilter} options={paymentMethods} label={$t('billing.payments.filterByMethod')} />
	</div>

	<DataTable {columns} data={filteredPayments} on:action={handleAction} />
</div>
