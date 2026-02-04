<script lang="ts">
	import { get } from 'svelte/store';
	import { format } from 'date-fns';
	import type { InvoiceItem, TaxRate, Patient } from '$types';
	import { toast } from 'svelte-sonner';
	import { Plus, X } from 'lucide-svelte';
	import { formatCurrency } from '$utils/currency';
	import { t, language } from '$i18n';

	let invoice: Partial<invoiceSchema> = {
		id: nanoid(),
		invoiceNumber: '', // Will be generated
		patientId: '',
		issueDate: new Date(),
		dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
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

	let errors: Record<string, string> = {};
	let patient: Patient | undefined;

	$: currentLocale = get(language).locale; // Get current locale reactively</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('billing.invoice.createInvoiceTitle')}</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{$t('billing.invoice.invoiceDetails')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('billing.invoice.patient')} error={errors.patientId}>
					<Select bind:value={invoice.patientId}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('billing.invoice.selectPatient')} />
						</SelectTrigger>
						<SelectContent>
							{#each patients as p}
								<SelectItem value={p.id}>{p.fullName} ({p.tcNo})</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={$t('billing.invoice.issueDate')} error={errors.issueDate}>
					<DatePicker bind:date={invoice.issueDate} placeholder={$t('billing.invoice.issueDatePlaceholder')} />
				</FormField>
				<FormField label={$t('billing.invoice.dueDate')} error={errors.dueDate}>
					<DatePicker bind:date={invoice.dueDate} placeholder={$t('billing.invoice.dueDatePlaceholder')} />
				</FormField>
				<FormField label={$t('billing.invoice.notes')} error={errors.notes} class="md:col-span-2">
					<Textarea bind:value={invoice.notes} placeholder={$t('billing.invoice.notesPlaceholder')} />
				</FormField>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle>{$t('billing.invoice.items')}</CardTitle>
				<Button type="button" variant="outline" size="sm" on:click={addItem}>
					<Plus class="mr-2 h-4 w-4" />
					{$t('billing.invoice.addItem')}
				</Button>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each invoice.items || [] as item, i (item.id)}
					<div class="border rounded-md p-4 space-y-3 relative">
						<h4 class="font-semibold">{$t('billing.invoice.item')} #{i + 1}</h4>
						<Button type="button" variant="ghost" size="icon" class="absolute top-2 right-2" on:click={() => removeItem(item.id)}>
							<X class="h-4 w-4" />
						</Button>
						<div class="grid gap-4 md:grid-cols-4">
							<FormField class="md:col-span-2" label={$t('billing.invoice.description')} error={errors[`item.${item.id}.description`]}>
								<Input bind:value={item.description} placeholder={$t('billing.invoice.descriptionPlaceholder')} />
							</FormField>
							<FormField label={$t('billing.invoice.quantity')} error={errors[`item.${item.id}.quantity`]}>
								<Input bind:value={item.quantity} type="number" min="1" on:input={() => calculateItemTotals(item)} />
							</FormField>
							<FormField label={$t('billing.invoice.unitPrice')} error={errors[`item.${item.id}.unitPrice`]}>
								<Input bind:value={item.unitPrice} type="number" step="0.01" min="0" on:input={() => calculateItemTotals(item)} />
							</FormField>
							<FormField label={$t('billing.invoice.taxRate')} error={errors[`item.${item.id}.taxRate`]}>
								<Select bind:value={item.taxRate} on:valueChange={() => calculateItemTotals(item)}>
									<SelectTrigger class="w-full">
										<SelectValue placeholder={$t('billing.invoice.selectTaxRate')} />
									</SelectTrigger>
									<SelectContent>
										{#each taxRates as rate}
											<SelectItem value={rate.value}>{rate.label}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</FormField>
							<p><strong>{$t('billing.invoice.taxAmount')}:</strong> {formatCurrency(item.taxAmount, undefined, currentLocale)}</p>
							<p><strong>{$t('billing.invoice.itemTotal')}:</strong> {formatCurrency(item.total, undefined, currentLocale)}</p>
						</div>
					</div>
				{/each}
			</CardContent>
			<CardFooter class="flex flex-col items-end gap-2 text-lg font-semibold">
				<p>{$t('billing.invoice.subtotal')}: {formatCurrency(invoice.subtotal, undefined, currentLocale)}</p>
				<p>{$t('billing.invoice.taxTotal')}: {formatCurrency(invoice.taxTotal, undefined, currentLocale)}</p>
				<p>{$t('billing.invoice.total')}: {formatCurrency(invoice.total, undefined, currentLocale)}</p>
			</CardFooter>
		</Card>

		<div class="flex justify-end gap-2">
			<Button variant="outline" on:click={() => goto('/billing')}>{$t('common.cancel')}</Button>
			<Button type="submit">{$t('billing.invoice.createInvoice')}</Button>
		</div>
	</form>
</div>
