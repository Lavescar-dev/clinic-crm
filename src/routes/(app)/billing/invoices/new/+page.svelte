<script lang="ts">
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { nanoid } from 'nanoid';
	import { toast } from 'svelte-sonner';
	import { t, language } from '$i18n';
	import type { Invoice, InvoiceItem, Patient, TaxRate } from '$types';
	import { invoiceSchema } from '$types';
	import { billing as billingStore } from '$stores/billing';
	import { patients as patientStore } from '$stores/patients';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import CardFooter from '$components/ui/card/card-footer.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Select from '$components/ui/select/select.svelte';
	import SelectContent from '$components/ui/select/select-content.svelte';
	import SelectItem from '$components/ui/select/select-item.svelte';
	import SelectTrigger from '$components/ui/select/select-trigger.svelte';
	import SelectValue from '$components/ui/select/select-value.svelte';
	import { DatePicker } from '$components/shared';
	import FormField from '$components/shared/FormField.svelte';
	import { Plus, X } from 'lucide-svelte';
	import { formatCurrency } from '$utils/currency';

	const patients = get(patientStore).data;
	const taxRates: Array<{ value: TaxRate; label: string }> = [
		{ value: 0, label: '0%' },
		{ value: 1, label: '1%' },
		{ value: 8, label: '8%' },
		{ value: 18, label: '18%' }
	];

	let currentLocale = $derived(get(language) === 'tr' ? 'tr-TR' : 'en-US');
	let errors = $state<Record<string, string>>({});

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}
	let invoice: Invoice = {
		id: nanoid(),
		invoiceNumber: `INV-${Date.now()}`,
		patientId: '',
		issueDate: new Date(),
		dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
		status: 'pending',
		items: [],
		subtotal: 0,
		taxTotal: 0,
		total: 0,
		paidAmount: 0,
		remainingAmount: 0,
		notes: '',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	function createEmptyItem(): InvoiceItem {
		return {
			id: nanoid(),
			description: '',
			quantity: 1,
			unitPrice: 0,
			taxRate: 8,
			taxAmount: 0,
			total: 0
		};
	}

	function calculateItemTotals(item: InvoiceItem) {
		const subtotal = item.quantity * item.unitPrice;
		item.taxAmount = subtotal * (item.taxRate / 100);
		item.total = subtotal + item.taxAmount;
		calculateInvoiceTotals();
	}

	function calculateInvoiceTotals() {
		invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
		invoice.taxTotal = invoice.items.reduce((sum, item) => sum + item.taxAmount, 0);
		invoice.total = invoice.subtotal + invoice.taxTotal;
		invoice.remainingAmount = invoice.total - invoice.paidAmount;
		invoice.updatedAt = new Date();
	}

	function addItem() {
		invoice.items = [...invoice.items, createEmptyItem()];
		calculateInvoiceTotals();
	}

	function removeItem(itemId: string) {
		invoice.items = invoice.items.filter((item) => item.id !== itemId);
		calculateInvoiceTotals();
	}

	async function handleSubmit() {
		const selectedPatient = patients.find((entry) => entry.id === invoice.patientId);
		invoice.patientName = selectedPatient?.fullName || `${selectedPatient?.firstName ?? ''} ${selectedPatient?.lastName ?? ''}`.trim();
		calculateInvoiceTotals();

		const result = invoiceSchema.safeParse(invoice);
		if (!result.success) {
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? ''])
			);
			return;
		}

		const response = await billingStore.createInvoice(result.data);
		if (response.success) {
			toast.success(translate('billing.invoice.createSuccess', 'Fatura oluşturuldu.', 'Invoice created.'));
			goto('/billing');
			return;
		}

		toast.error(
			response.error || translate('billing.invoice.createFailed', 'Fatura oluşturulamadı.', 'Failed to create invoice.')
		);
	}

	if (invoice.items.length === 0) {
		addItem();
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{translate('billing.invoice.createInvoiceTitle', 'Yeni Fatura', 'Create invoice')}</h1>

	<form onsubmit={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{translate('billing.invoice.invoiceDetails', 'Fatura Detayları', 'Invoice details')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={translate('billing.invoice.patient', 'Hasta', 'Patient')} error={errors.patientId}>
					<Select bind:value={invoice.patientId}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={translate('billing.invoice.selectPatient', 'Hasta seçin', 'Select patient')} />
						</SelectTrigger>
						<SelectContent>
							{#each patients as patient}
								<SelectItem value={patient.id}>{patient.fullName} ({patient.tcNo})</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={translate('billing.invoice.issueDate', 'Düzenleme Tarihi', 'Issue date')} error={errors.issueDate}>
					<DatePicker bind:date={invoice.issueDate} />
				</FormField>
				<FormField label={translate('billing.invoice.dueDate', 'Vade Tarihi', 'Due date')} error={errors.dueDate}>
					<DatePicker bind:date={invoice.dueDate} />
				</FormField>
				<FormField label={translate('billing.invoice.notes', 'Notlar', 'Notes')} error={errors.notes} class="md:col-span-2">
					<Textarea bind:value={invoice.notes} placeholder={translate('billing.invoice.notesPlaceholder', 'Fatura notu ekleyin', 'Add invoice notes')} />
				</FormField>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle>{translate('billing.invoice.items', 'Kalemler', 'Items')}</CardTitle>
				<Button type="button" variant="outline" size="sm" onclick={addItem}>
					<Plus class="mr-2 h-4 w-4" />
					{translate('billing.invoice.addItem', 'Kalem Ekle', 'Add item')}
				</Button>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each invoice.items as item, i (item.id)}
					<div class="relative space-y-3 rounded-md border p-4">
						<h4 class="font-semibold">{translate('billing.invoice.item', 'Kalem', 'Item')} #{i + 1}</h4>
						<Button type="button" variant="ghost" size="icon" class="absolute right-2 top-2" onclick={() => removeItem(item.id)}>
							<X class="h-4 w-4" />
						</Button>
						<div class="grid gap-4 md:grid-cols-4">
							<FormField class="md:col-span-2" label={translate('billing.invoice.description', 'Açıklama', 'Description')} error={errors[`item.${item.id}.description`]}>
								<Input bind:value={item.description} placeholder={translate('billing.invoice.descriptionPlaceholder', 'Hizmet veya ürün açıklaması', 'Service or item description')} />
							</FormField>
							<FormField label={translate('billing.invoice.quantity', 'Miktar', 'Quantity')} error={errors[`item.${item.id}.quantity`]}>
								<Input bind:value={item.quantity} type="number" min="1" oninput={() => calculateItemTotals(item)} />
							</FormField>
							<FormField label={translate('billing.invoice.unitPrice', 'Birim Fiyat', 'Unit price')} error={errors[`item.${item.id}.unitPrice`]}>
								<Input bind:value={item.unitPrice} type="number" step="0.01" min="0" oninput={() => calculateItemTotals(item)} />
							</FormField>
							<FormField label={translate('billing.invoice.taxRate', 'KDV Oranı', 'Tax rate')} error={errors[`item.${item.id}.taxRate`]}>
								<Select value={String(item.taxRate)} onValueChange={(value) => {
									item.taxRate = Number(value ?? 0) as TaxRate;
									calculateItemTotals(item);
								}}>
									<SelectTrigger class="w-full">
										<SelectValue placeholder={translate('billing.invoice.selectTaxRate', 'KDV seçin', 'Select tax rate')} />
									</SelectTrigger>
									<SelectContent>
										{#each taxRates as rate}
											<SelectItem value={String(rate.value)}>{rate.label}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</FormField>
							<p><strong>{translate('billing.invoice.taxAmount', 'KDV Tutarı', 'Tax amount')}:</strong> {formatCurrency(item.taxAmount, undefined, currentLocale)}</p>
							<p><strong>{translate('billing.invoice.itemTotal', 'Kalem Toplamı', 'Item total')}:</strong> {formatCurrency(item.total, undefined, currentLocale)}</p>
						</div>
					</div>
				{/each}
			</CardContent>
			<CardFooter class="flex flex-col items-end gap-2 text-lg font-semibold">
				<p>{translate('billing.invoice.subtotal', 'Ara Toplam', 'Subtotal')}: {formatCurrency(invoice.subtotal, undefined, currentLocale)}</p>
				<p>{translate('billing.invoice.taxTotal', 'Toplam KDV', 'Tax total')}: {formatCurrency(invoice.taxTotal, undefined, currentLocale)}</p>
				<p>{translate('billing.invoice.total', 'Genel Toplam', 'Total')}: {formatCurrency(invoice.total, undefined, currentLocale)}</p>
			</CardFooter>
		</Card>

		<div class="flex justify-end gap-2">
			<Button variant="outline" onclick={() => goto('/billing')}>{translate('common.cancel', 'İptal', 'Cancel')}</Button>
			<Button type="submit">{translate('billing.invoice.createInvoice', 'Faturayı Oluştur', 'Create invoice')}</Button>
		</div>
	</form>
</div>
