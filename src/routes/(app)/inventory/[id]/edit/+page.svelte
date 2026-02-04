<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import { Textarea } from '$components/ui/textarea';
	import { DatePicker } from '$components/shared';
	import FormField from '$components/shared/FormField.svelte';
	import { inventory as inventoryStore } from '$stores/inventory';
	import { inventoryItemSchema } from '$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { InventoryItem, ItemCategory } from '$types';
	import { toast } from 'svelte-sonner';

	let item: InventoryItem | undefined;
	let loading = true;
	let errors: Record<string, string> = {};

	onMount(async () => {
		const itemId = $page.params.id as string;
		const fetchedItem = await inventoryStore.getInventoryItemById(itemId);
		if (fetchedItem) {
			item = fetchedItem;
		} else {
			toast.error($t('inventory.item.itemNotFound'));
			goto('/inventory');
		}
		loading = false;
	});

	const categories: { value: ItemCategory; label: string }[] = [
		{ value: 'medication', label: $t('inventory.category.medication') },
		{ value: 'equipment', label: $t('inventory.category.equipment') },
		{ value: 'consumable', label: $t('inventory.category.consumable') },
		{ value: 'other', label: $t('inventory.category.other') }
	];

	async function handleSubmit() {
		if (!item) return;

		// client-side validation
		const result = inventoryItemSchema.safeParse(item);
		if (!result.success) {
			errors = result.error.flatten().fieldErrors;
			toast.error($t('common.formErrors'));
			return;
		}

		await inventoryStore.updateInventoryItem(item.id, item);
		toast.success($t('inventory.item.updateSuccess', { name: item.name }));
		goto(`/inventory/${item.id}`);
	}

	$: item?.name, (errors.name = '');
	$: item?.category, (errors.category = '');
	$: item?.currentStock, (errors.currentStock = '');
	$: item?.minStockLevel, (errors.minStockLevel = '');
	$: item?.maxStockLevel, (errors.maxStockLevel = '');
	$: item?.unit, (errors.unit = '');
	$: item?.unitPrice, (errors.unitPrice = '');
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if item}
	<div class="space-y-6 p-4 md:p-6">
		<h1 class="text-3xl font-bold">{$t('inventory.item.editItemTitle', { name: item.name })}</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<Card>
				<CardHeader><CardTitle>{$t('inventory.item.itemDetails')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<FormField label={$t('inventory.item.name')} error={errors.name}>
						<Input bind:value={item.name} placeholder={$t('inventory.item.namePlaceholder')} />
					</FormField>
					<FormField label={$t('inventory.item.category')} error={errors.category}>
						<Select bind:value={item.category}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder={$t('inventory.item.selectCategory')} />
							</SelectTrigger>
							<SelectContent>
								{#each categories as category}
									<SelectItem value={category.value}>{category.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</FormField>
					<FormField label={$t('inventory.item.sku')} error={errors.sku}>
						<Input bind:value={item.sku} placeholder={$t('inventory.item.skuPlaceholder')} />
					</FormField>
					<FormField label={$t('inventory.item.barcode')} error={errors.barcode}>
						<Input bind:value={item.barcode} placeholder={$t('inventory.item.barcodePlaceholder')} />
					</FormField>
					<FormField class="md:col-span-2" label={$t('inventory.item.description')} error={errors.description}>
						<Textarea bind:value={item.description} placeholder={$t('inventory.item.descriptionPlaceholder')} />
					</FormField>
					<FormField label={$t('inventory.item.manufacturer')} error={errors.manufacturer}>
						<Input bind:value={item.manufacturer} placeholder={$t('inventory.item.manufacturerPlaceholder')} />
					</FormField>
					<FormField label={$t('inventory.item.location')} error={errors.location}>
						<Input bind:value={item.location} placeholder={$t('inventory.item.locationPlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>{$t('inventory.item.stockInformation')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<FormField label={$t('inventory.item.currentStock')} error={errors.currentStock}>
						<Input bind:value={item.currentStock} type="number" min="0" />
					</FormField>
					<FormField label={$t('inventory.item.minStockLevel')} error={errors.minStockLevel}>
						<Input bind:value={item.minStockLevel} type="number" min="0" />
					</FormField>
					<FormField label={$t('inventory.item.maxStockLevel')} error={errors.maxStockLevel}>
						<Input bind:value={item.maxStockLevel} type="number" min="0" />
					</FormField>
					<FormField label={$t('inventory.item.unit')} error={errors.unit}>
						<Input bind:value={item.unit} placeholder={$t('inventory.item.unitPlaceholder')} />
					</FormField>
					<FormField label={$t('inventory.item.unitPrice')} error={errors.unitPrice}>
						<Input bind:value={item.unitPrice} type="number" step="0.01" min="0" />
					</FormField>
					<FormField label={$t('inventory.item.expiryDate')} error={errors.expiryDate}>
						<DatePicker bind:date={item.expiryDate} placeholder={$t('inventory.item.expiryDatePlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>{$t('inventory.item.notes')}</CardTitle></CardHeader>
				<CardContent>
					<FormField label={$t('inventory.item.notes')} error={errors.notes}>
						<Textarea bind:value={item.notes} placeholder={$t('inventory.item.notesPlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<div class="flex justify-end gap-2">
				<Button variant="outline" on:click={() => goto(`/inventory/${item?.id}`)}>{$t('common.cancel')}</Button>
				<Button type="submit">{$t('inventory.item.updateItem')}</Button>
			</div>
		</form>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('inventory.item.itemNotFound')}</p>
	</div>
{/if}
