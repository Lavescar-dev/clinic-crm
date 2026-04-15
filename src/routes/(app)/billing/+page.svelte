<script lang="ts">
	import { t, language } from '$i18n';
	import { Badge } from '$components/ui/badge';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { PlusCircle, ArrowRight, CreditCard, ReceiptText, WalletCards } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import type { Invoice, InvoiceStatus, PaymentMethod } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import { billing as billingStore, billingStats, recentPayments } from '$stores/billing';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let statusFilter: InvoiceStatus | 'all' = 'all';
	let selectedInvoiceId: string | null = null;

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	function paymentMethodLabel(method: PaymentMethod) {
		const labels: Record<PaymentMethod, { tr: string; en: string }> = {
			cash: { tr: 'Nakit', en: 'Cash' },
			'credit-card': { tr: 'Kredi kartı', en: 'Credit card' },
			'debit-card': { tr: 'Banka kartı', en: 'Debit card' },
			'bank-transfer': { tr: 'Havale/EFT', en: 'Bank transfer' },
			insurance: { tr: 'Sigorta', en: 'Insurance' }
		};

		return get(language) === 'tr' ? labels[method].tr : labels[method].en;
	}

	const statuses: { value: InvoiceStatus | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'draft', label: translate('billing.status.draft', 'Taslak', 'Draft') },
		{ value: 'pending', label: translate('billing.status.pending', 'Beklemede', 'Pending') },
		{ value: 'paid', label: translate('billing.status.paid', 'Ödendi', 'Paid') },
		{ value: 'overdue', label: translate('billing.status.overdue', 'Gecikmiş', 'Overdue') },
		{ value: 'cancelled', label: translate('billing.status.cancelled', 'İptal', 'Cancelled') }
	];

	$: currentLocale = get(language) === 'tr' ? 'tr-TR' : 'en-US';

	$: filteredInvoices = [...$billingStore.data].filter((invoice) => {
		const matchesSearch =
			invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	$: selectedInvoice =
		filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? filteredInvoices[0] ?? null;
	$: selectedPayments = selectedInvoice
		? [...$billingStore.payments]
				.filter((payment) => payment.invoiceId === selectedInvoice.id)
				.sort((left, right) => new Date(right.paymentDate).getTime() - new Date(left.paymentDate).getTime())
		: [];

	$: priorityInvoices = filteredInvoices
		.filter((invoice) => invoice.status === 'overdue' || invoice.status === 'pending')
		.sort((left, right) => {
			const statusDelta = Number(right.status === 'overdue') - Number(left.status === 'overdue');
			if (statusDelta !== 0) return statusDelta;
			return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
		})
		.slice(0, 5);

	const columns = [
		{
			key: 'invoiceNumber',
			header: translate('billing.invoice.invoiceNumber', 'Fatura No', 'Invoice no'),
			cell: (invoice: Invoice) => invoice.invoiceNumber
		},
		{
			key: 'patientName',
			header: translate('billing.invoice.patient', 'Hasta', 'Patient'),
			cell: (invoice: Invoice) => invoice.patientName || '-'
		},
		{
			key: 'issueDate',
			header: translate('billing.invoice.issueDate', 'Düzenleme Tarihi', 'Issue date'),
			cell: (invoice: Invoice) => formatDate(invoice.issueDate)
		},
		{
			key: 'dueDate',
			header: translate('billing.invoice.dueDate', 'Vade tarihi', 'Due date'),
			cell: (invoice: Invoice) => formatDate(invoice.dueDate)
		},
		{
			key: 'total',
			header: translate('billing.invoice.total', 'Toplam', 'Total'),
			cell: (invoice: Invoice) => formatCurrency(invoice.total, undefined, currentLocale)
		},
		{
			key: 'status',
			header: translate('billing.invoice.status', 'Durum', 'Status'),
			cell: (invoice: Invoice) => ({ component: StatusBadge, props: { status: invoice.status } })
		},
		{
			key: 'actions',
			header: translate('common.actions', 'İşlemler', 'Actions'),
			cell: (invoice: Invoice) => ({ type: 'actions', id: invoice.id })
		}
	];

	function openInvoicePanel(id: string) {
		selectedInvoiceId = id;
	}

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/billing/invoices/${id}`);
			return;
		}

		if (action === 'edit') {
			goto(`/billing/invoices/${id}/edit`);
		}
	}
</script>

<div class="mf-page-shell space-y-5 sm:space-y-6">
	<PageHero
		eyebrow="Gelir Döngüsü"
		title={translate('billing.title', 'Gelir ve Tahsilat Masası', 'Billing')}
		description={translate(
			'billing.description',
			'Fatura hacmini, geciken alacakları ve ödeme hareketlerini tek iş yüzeyinde yönetin.',
			'Manage invoice volume, overdue balances, and payment movements from one workbench.'
		)}
	>
		<Button class="w-full sm:w-auto" onclick={() => goto('/billing/invoices/new')}>
			<PlusCircle class="h-4 w-4" />
			{translate('billing.invoice.createInvoice', 'Yeni fatura', 'Create invoice')}
		</Button>
	</PageHero>

	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		<div class="mf-tint-cyan rounded-[1.5rem] border p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'TOPLAM FATURA' : 'INVOICES'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">{$billingStats.totalInvoices}</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Aktif gelir havuzundaki toplam fatura kaydı.'
					: 'Total invoice volume in the revenue pipeline.'}
			</p>
		</div>
		<div class="mf-tint-amber rounded-[1.5rem] border p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'BEKLEYEN ALACAK' : 'PENDING'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">
				{formatCurrency($billingStats.pendingAmount, undefined, currentLocale)}
			</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Henüz tahsil edilmemiş ama gecikmeye düşmemiş tutar.'
					: 'Amounts not yet collected but not overdue.'}
			</p>
		</div>
		<div class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-[linear-gradient(180deg,rgba(255,244,244,0.96),rgba(255,252,252,0.92))] p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'GECİKEN' : 'OVERDUE'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">
				{formatCurrency($billingStats.overdueAmount, undefined, currentLocale)}
			</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Bugün kapanması gereken riskli alacak kalemleri.'
					: 'Risky balances that need action today.'}
			</p>
		</div>
		<div class="mf-tint-emerald rounded-[1.5rem] border p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'AYLIK TAHSİLAT' : 'MONTHLY'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">
				{formatCurrency($billingStats.monthlyRevenue, undefined, currentLocale)}
			</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Bu ay kapanan ödemelerin toplam etkisi.'
					: 'Total value of payments closed this month.'}
			</p>
		</div>
	</div>

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
		<Card class="mf-glass">
			<CardHeader class="space-y-3">
				<p class="mf-kicker text-[0.72rem] font-semibold">
					{get(language) === 'tr' ? 'TAHSİLAT ODAĞI' : 'COLLECTION FOCUS'}
				</p>
				<CardTitle class="text-2xl tracking-[-0.04em]">
					{get(language) === 'tr'
						? 'Öncelikli faturaları sırala.'
						: 'Prioritize invoices that need attention.'}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-3">
				{#if priorityInvoices.length > 0}
					{#each priorityInvoices as invoice}
						<button
							type="button"
							class="mf-soft-card flex w-full items-start justify-between gap-4 rounded-[1.35rem] p-4 text-left transition hover:border-cyan-200/40"
							onclick={() => openInvoicePanel(invoice.id)}
						>
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<p class="truncate text-sm font-semibold text-[color:var(--mf-ink-strong)]">
										{invoice.invoiceNumber}
									</p>
									<Badge variant={invoice.status === 'overdue' ? 'destructive' : 'warning'}>
										{invoice.status === 'overdue'
											? translate('billing.status.overdue', 'Gecikmiş', 'Overdue')
											: translate('billing.status.pending', 'Beklemede', 'Pending')}
									</Badge>
								</div>
								<p class="mt-2 text-sm text-[color:var(--mf-ink)]">{invoice.patientName ?? '-'}</p>
								<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
									{translate('billing.invoice.dueDate', 'Vade tarihi', 'Due date')}: {formatDate(invoice.dueDate)}
								</p>
							</div>
							<div class="shrink-0 text-right">
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{formatCurrency(invoice.remainingAmount, undefined, currentLocale)}
								</p>
								<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
									{get(language) === 'tr' ? 'Kalan bakiye' : 'Remaining balance'}
								</p>
							</div>
						</button>
					{/each}
				{:else}
					<div class="mf-soft-card rounded-[1.35rem] border-dashed p-5 text-sm text-[color:var(--mf-ink-soft)]">
						{get(language) === 'tr'
							? 'Öncelikli tahsilat listesinde kayıt yok.'
							: 'No invoices currently need priority follow-up.'}
					</div>
				{/if}

				<div class="grid gap-3 lg:grid-cols-2">
					<div class="mf-soft-card rounded-[1.25rem] p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
								<WalletCards class="h-4.5 w-4.5" />
							</div>
							<div>
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{get(language) === 'tr' ? 'Bugün tahsil edilen' : 'Collected today'}
								</p>
								<p class="mf-copy text-sm">
									{formatCurrency($billingStats.todaysRevenue, undefined, currentLocale)}
								</p>
							</div>
						</div>
					</div>
					<div class="mf-soft-card rounded-[1.25rem] p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
								<CreditCard class="h-4.5 w-4.5" />
							</div>
							<div>
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{get(language) === 'tr' ? 'Son ödemeler' : 'Recent payments'}
								</p>
								<p class="mf-copy text-sm">{$recentPayments.length}</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="mf-glass">
			<CardHeader class="space-y-3">
				<p class="mf-kicker text-[0.72rem] font-semibold">
					{get(language) === 'tr' ? 'FATURA DETAYI' : 'INVOICE DETAIL'}
				</p>
				<CardTitle class="text-2xl tracking-[-0.04em]">
					{selectedInvoice
						? selectedInvoice.invoiceNumber
						: get(language) === 'tr'
							? 'Fatura seçin'
							: 'Select an invoice'}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if selectedInvoice}
					<div class="rounded-[1.35rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] p-4">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">{selectedInvoice.patientName ?? '-'}</p>
								<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
									{formatDate(selectedInvoice.issueDate)} - {formatDate(selectedInvoice.dueDate)}
								</p>
							</div>
							<StatusBadge status={selectedInvoice.status} />
						</div>

						<div class="mt-4 grid gap-3 sm:grid-cols-3">
							<div>
								<p class="text-xs uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
									{get(language) === 'tr' ? 'Toplam' : 'Total'}
								</p>
								<p class="mt-1 text-lg font-semibold text-[color:var(--mf-ink-strong)]">
									{formatCurrency(selectedInvoice.total, undefined, currentLocale)}
								</p>
							</div>
							<div>
								<p class="text-xs uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
									{get(language) === 'tr' ? 'Ödenen' : 'Paid'}
								</p>
								<p class="mt-1 text-lg font-semibold text-[color:var(--mf-ink-strong)]">
									{formatCurrency(selectedInvoice.paidAmount, undefined, currentLocale)}
								</p>
							</div>
							<div>
								<p class="text-xs uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
									{get(language) === 'tr' ? 'Kalan' : 'Remaining'}
								</p>
								<p class="mt-1 text-lg font-semibold text-[color:var(--mf-ink-strong)]">
									{formatCurrency(selectedInvoice.remainingAmount, undefined, currentLocale)}
								</p>
							</div>
						</div>
					</div>

					<div class="space-y-2">
						<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
							{get(language) === 'tr' ? 'Fatura kalemleri' : 'Invoice items'}
						</p>
						{#each selectedInvoice.items as item}
							<div class="mf-soft-card rounded-[1.2rem] p-3">
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class="text-sm font-medium text-[color:var(--mf-ink-strong)]">{item.description}</p>
										<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
											{item.quantity} x {formatCurrency(item.unitPrice, undefined, currentLocale)}
										</p>
									</div>
									<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
										{formatCurrency(item.total, undefined, currentLocale)}
									</p>
								</div>
							</div>
						{/each}
					</div>

					<div class="space-y-2">
						<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
							{get(language) === 'tr' ? 'Ödeme geçmişi' : 'Payment history'}
						</p>
						{#if selectedPayments.length > 0}
							{#each selectedPayments as payment}
								<div class="mf-soft-card rounded-[1.2rem] p-3">
									<div class="flex items-start justify-between gap-3">
										<div>
											<p class="text-sm font-medium text-[color:var(--mf-ink-strong)]">
												{paymentMethodLabel(payment.method)}
											</p>
											<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
												{formatDate(payment.paymentDate)}
											</p>
										</div>
										<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
											{formatCurrency(payment.amount, undefined, currentLocale)}
										</p>
									</div>
								</div>
							{/each}
						{:else}
							<div class="mf-soft-card rounded-[1.2rem] border-dashed p-4 text-sm text-[color:var(--mf-ink-soft)]">
								{get(language) === 'tr'
									? 'Bu faturaya bağlı ödeme kaydı görünmüyor.'
									: 'No payments are recorded for this invoice yet.'}
							</div>
						{/if}
					</div>

					<div class="flex flex-col gap-2 sm:flex-row">
						<Button variant="outline" class="w-full" onclick={() => goto(`/billing/invoices/${selectedInvoice.id}`)}>
							<ReceiptText class="h-4 w-4" />
							{get(language) === 'tr' ? 'Faturayı aç' : 'Open invoice'}
						</Button>
						<Button variant="outline" class="w-full" onclick={() => goto(`/billing/invoices/${selectedInvoice.id}/edit`)}>
							{get(language) === 'tr' ? 'Düzenle' : 'Edit'}
							<ArrowRight class="h-4 w-4" />
						</Button>
					</div>
				{:else}
					<div class="mf-soft-card rounded-[1.35rem] border-dashed p-5 text-sm text-[color:var(--mf-ink-soft)]">
						{get(language) === 'tr'
							? 'Detay panelini doldurmak için bir fatura seçin.'
							: 'Select an invoice to populate the detail panel.'}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<div class="mf-toolbar grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
		<SearchBar
			bind:searchTerm
			placeholder={translate('common.search', 'Fatura veya hasta ara', 'Search invoices or patients')}
		/>
		<FilterDropdown
			bind:value={statusFilter}
			options={statuses}
			label={translate('billing.invoice.filterByStatus', 'Duruma göre filtrele', 'Filter by status')}
		/>
	</div>

	<DataTable {columns} data={filteredInvoices} on:action={handleAction} />
</div>
