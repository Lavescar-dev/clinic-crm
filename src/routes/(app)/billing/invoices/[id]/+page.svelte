<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import CardFooter from '$components/ui/card/card-footer.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Select from '$components/ui/select/select.svelte';
	import SelectContent from '$components/ui/select/select-content.svelte';
	import SelectItem from '$components/ui/select/select-item.svelte';
	import SelectTrigger from '$components/ui/select/select-trigger.svelte';
	import SelectValue from '$components/ui/select/select-value.svelte';
	import Dialog from '$components/ui/dialog/dialog.svelte';
	import DialogContent from '$components/ui/dialog/dialog-content.svelte';
	import DialogDescription from '$components/ui/dialog/dialog-description.svelte';
	import DialogFooter from '$components/ui/dialog/dialog-footer.svelte';
	import DialogHeader from '$components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$components/ui/dialog/dialog-title.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import { DatePicker } from '$components/shared';
	import { billing as billingStore } from '$stores/billing';
	import { patients as patientStore } from '$stores/patients';
	import { users as userStore } from '$stores/users';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import type { Invoice, InvoiceStatus, PaymentMethod, Payment } from '$types';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { language } from '$i18n';

	export let data;

	let invoice: Invoice | undefined;
	let patientName: string = '';
	let loading = true;
	let confirmDelete = false;
	let showRecordPaymentDialog = false;

	let paymentAmount: number = 0;
	let paymentMethod: PaymentMethod = 'cash';
	let paymentDate: Date = new Date();
	let paymentNotes: string = '';
	let paymentReference: string = '';

	$: currentLocale = get(language).locale; // Get current locale reactively

	$: patient = $patientStore.data.find((p) => p.id === invoice?.patientId);
	$: if (patient) patientName = patient.fullName;

	onMount(async () => {
		const invoiceId = $page.params.id;
		invoice = await billingStore.getInvoiceById(invoiceId);
		loading = false;
		if (!invoice) {
			toast.error($t('billing.invoice.invoiceNotFound'));
			goto('/billing');
		} else {
			paymentAmount = invoice.remainingAmount;
		}
	});

	async function handleDelete() {
		if (invoice) {
			await billingStore.deleteInvoice(invoice.id);
			toast.success($t('billing.invoice.deleteSuccess', { invoiceNumber: invoice.invoiceNumber }));
			goto('/billing');
		}
	}

	async function handleRecordPayment() {
		if (!invoice) return;

		const currentUser = get(userStore).currentUser; // Assuming current user is available
		if (!currentUser) {
			toast.error($t('common.notAuthorized'));
			return;
		}

		if (paymentAmount <= 0 || paymentAmount > invoice.remainingAmount) {
			toast.error($t('billing.payment.invalidPaymentAmount'));
			return;
		}

		const newPayment: Payment = {
			id: 'pay_' + Date.now().toString(),
			invoiceId: invoice.id,
			paymentDate: paymentDate,
			amount: paymentAmount,
			method: paymentMethod,
			referenceNumber: paymentReference || undefined,
			notes: paymentNotes || undefined,
			receivedBy: currentUser.fullName,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const updatedInvoice = await billingStore.recordPayment(invoice.id, newPayment);
		if (updatedInvoice) {
			invoice = updatedInvoice;
			toast.success($t('billing.payment.recordPaymentSuccess', { amount: formatCurrency(paymentAmount) }));
			showRecordPaymentDialog = false;
			// Reset payment form
			paymentAmount = invoice.remainingAmount;
			paymentMethod = 'cash';
			paymentDate = new Date();
			paymentNotes = '';
			paymentReference = '';
		} else {
			toast.error($t('billing.payment.recordPaymentFailed'));
		}
	}

	function getStatusVariant(status: InvoiceStatus) {
		switch (status) {
			case 'draft':
				return 'secondary';
			case 'pending':
				return 'warning';
			case 'paid':
				return 'success';
			case 'overdue':
				return 'destructive';
			case 'cancelled':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function printInvoice() {
		// Implement printing logic (e.g., open a new window with a printable version)
		toast.info($t('billing.invoice.printFunctionalityComingSoon'));
		console.log('Printing invoice:', invoice);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if invoice}
	<div class="space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{$t('billing.invoice.invoiceDetailsTitle', { invoiceNumber: invoice.invoiceNumber })}</h1>
			<div class="flex gap-2">
				<Button variant="outline" on:click={printInvoice}>
					{$t('billing.invoice.print')}
				</Button>
				<Button variant="outline" on:click={() => goto(`/billing/invoices/${invoice?.id}/edit`)}>
					{$t('common.edit')}
				</Button>
				<Button variant="destructive" on:click={() => (confirmDelete = true)}>
					{$t('common.delete')}
				</Button>
				{#if invoice.remainingAmount > 0}
					<Button on:click={() => (showRecordPaymentDialog = true)}>
						{$t('billing.payment.recordPayment')}
					</Button>
				{/if}
			</div>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>{$t('billing.invoice.overview')}</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<p><strong>{$t('billing.invoice.invoiceNumber')}:</strong> {invoice.invoiceNumber}</p>
				<p>
					<strong>{$t('billing.invoice.patient')}:</strong>
					<a href="/patients/{invoice.patientId}" class="text-primary hover:underline">{invoice.patientName}</a>
				</p>
				<p><strong>{$t('billing.invoice.issueDate')}:</strong> {formatDate(invoice.issueDate)}</p>
				<p><strong>{$t('billing.invoice.dueDate')}:</strong> {formatDate(invoice.dueDate)}</p>
				<p>
					<strong>{$t('billing.invoice.status')}:</strong>
					<Badge variant={getStatusVariant(invoice.status)}>{$t(`billing.status.${invoice.status}`)}</Badge>
				</p>
				<p><strong>{$t('billing.invoice.total')}:</strong> {formatCurrency(invoice.total, undefined, currentLocale)}</p>
				<p><strong>{$t('billing.invoice.paidAmount')}:</strong> {formatCurrency(invoice.paidAmount, undefined, currentLocale)}</p>
				<p><strong>{$t('billing.invoice.remainingAmount')}:</strong> {formatCurrency(invoice.remainingAmount, undefined, currentLocale)}</p>
				<p class="md:col-span-2"><strong>{$t('billing.invoice.notes')}:</strong> {invoice.notes || '-'}</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{$t('billing.invoice.items')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="border rounded-md">
					<table class="w-full text-left">
						<thead>
							<tr class="border-b">
								<th class="p-4">{$t('billing.invoice.description')}</th>
								<th class="p-4">{$t('billing.invoice.quantity')}</th>
								<th class="p-4">{$t('billing.invoice.unitPrice')}</th>
								<th class="p-4">{$t('billing.invoice.taxRate')}</th>
								<th class="p-4">{$t('billing.invoice.taxAmount')}</th>
								<th class="p-4 text-right">{$t('billing.invoice.itemTotal')}</th>
							</tr>
						</thead>
						<tbody>
							{#each invoice.items as item (item.id)}
								<tr class="border-b last:border-b-0">
									<td class="p-4">{item.description}</td>
									<td class="p-4">{item.quantity}</td>
														<td class="p-4">{formatCurrency(item.unitPrice, undefined, currentLocale)}</td>
														<td class="p-4">{item.taxRate}%</td>
														<td class="p-4">{formatCurrency(item.taxAmount, undefined, currentLocale)}</td>
														<td class="p-4 text-right">{formatCurrency(item.total, undefined, currentLocale)}</td>								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
			<CardFooter class="flex flex-col items-end gap-2 text-lg font-semibold">
				<p>{$t('billing.invoice.subtotal')}: {formatCurrency(invoice.subtotal, undefined, currentLocale)}</p>
				<p>{$t('billing.invoice.taxTotal')}: {formatCurrency(invoice.taxTotal, undefined, currentLocale)}</p>
				<p>{$t('billing.invoice.total')}: {formatCurrency(invoice.total, undefined, currentLocale)}</p>
			</CardFooter>
		</Card>

		<ConfirmDialog
			bind:open={confirmDelete}
			title={$t('billing.invoice.confirmDeleteTitle')}
			description={$t('billing.invoice.confirmDeleteDescription', { invoiceNumber: invoice.invoiceNumber })}
			on:confirm={handleDelete}
			on:cancel={() => (confirmDelete = false)}
		/>

		<Dialog bind:open={showRecordPaymentDialog}>
			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{$t('billing.payment.recordPayment')}</DialogTitle>
					<DialogDescription>
						{$t('billing.payment.recordPaymentDescription')}
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="paymentAmount" class="text-right">{$t('billing.payment.amount')}</Label>
						<Input id="paymentAmount" type="number" step="0.01" min="0" bind:value={paymentAmount} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="paymentMethod" class="text-right">{$t('billing.payment.method')}</Label>
						<Select bind:value={paymentMethod}>
							<SelectTrigger class="col-span-3">
								<SelectValue placeholder={$t('billing.payment.selectMethod')} />
							</SelectTrigger>
							<SelectContent>
								{#each ['cash', 'credit-card', 'debit-card', 'bank-transfer', 'insurance'] as method}
									<SelectItem value={method}>{$t(`billing.payment.method.${method}`)}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="paymentDate" class="text-right">{$t('billing.payment.date')}</Label>
						<div class="col-span-3">
							<DatePicker bind:date={paymentDate} />
						</div>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="referenceNumber" class="text-right">{$t('billing.payment.referenceNumber')}</Label>
						<Input id="referenceNumber" bind:value={paymentReference} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="paymentNotes" class="text-right">{$t('billing.payment.notes')}</Label>
						<Textarea id="paymentNotes" bind:value={paymentNotes} class="col-span-3" />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" on:click={() => (showRecordPaymentDialog = false)}>{$t('common.cancel')}</Button>
					<Button type="submit" on:click={handleRecordPayment}>{$t('billing.payment.record')}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('billing.invoice.invoiceNotFound')}</p>
	</div>
{/if}
