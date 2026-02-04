<script lang="ts">
	import { t, language } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { inventory as inventoryStore } from '$stores/inventory';
	import { users as userStore } from '$stores/users';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import type { InventoryItem, ItemStatus, StockMovement, StockMovementType } from '$types';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$components/ui/dialog';
	import { Textarea } from '$components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';

	let item: InventoryItem | undefined;
	let loading = true;
	let confirmDelete = false;
	let showRecordMovementDialog = false;

	let movementType: StockMovementType = 'adjustment';
	let movementQuantity: number = 0;
	let movementReason: string = '';
	let movementReference: string = '';

	$: currentLocale = get(language).locale; // Reactive current locale

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
	});</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if item}
	<div class="space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{$t('inventory.item.itemDetailsTitle', { name: item.name })}</h1>
			<div class="flex gap-2">
				<Button variant="outline" on:click={() => goto(`/inventory/${item?.id}/edit`)}>
					{$t('common.edit')}
				</Button>
				<Button variant="destructive" on:click={() => (confirmDelete = true)}>
					{$t('common.delete')}
				</Button>
				<Button on:click={() => (showRecordMovementDialog = true)}>
					{$t('inventory.movement.recordMovement')}
				</Button>
			</div>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>{$t('inventory.item.overview')}</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<p><strong>{$t('inventory.item.name')}:</strong> {item.name}</p>
				<p><strong>{$t('inventory.item.category')}:</strong> {$t(`inventory.category.${item.category}`)}</p>
				<p><strong>{$t('inventory.item.sku')}:</strong> {item.sku || '-'}</p>
				<p><strong>{$t('inventory.item.barcode')}:</strong> {item.barcode || '-'}</p>
				<p><strong>{$t('inventory.item.manufacturer')}:</strong> {item.manufacturer || '-'}</p>
				<p><strong>{$t('inventory.item.location')}:</strong> {item.location || '-'}</p>
				<p><strong>{$t('inventory.item.unitPrice')}:</strong> {formatCurrency(item.unitPrice, undefined, currentLocale)}</p>
				<p><strong>{$t('inventory.item.unit')}:</strong> {item.unit}</p>
				<p><strong>{$t('inventory.item.expiryDate')}:</strong> {item.expiryDate ? formatDate(item.expiryDate) : '-'}</p>
				<p>
					<strong>{$t('inventory.item.status')}:</strong>
					<Badge variant={getStatusVariant(item.status)}>{$t(`inventory.status.${item.status}`)}</Badge>
				</p>
				<p class="md:col-span-2"><strong>{$t('inventory.item.description')}:</strong> {item.description || '-'}</p>
				<p class="md:col-span-2"><strong>{$t('inventory.item.notes')}:</strong> {item.notes || '-'}</p>
			</CardContent>
		</Card>

		<Tabs defaultValue="stockLevels" class="space-y-4">
			<TabsList>
				<TabsTrigger value="stockLevels">{$t('inventory.item.stockLevels')}</TabsTrigger>
				<TabsTrigger value="stockMovements">{$t('inventory.item.stockMovements')}</TabsTrigger>
			</TabsList>

			<TabsContent value="stockLevels">
				<Card>
					<CardHeader><CardTitle>{$t('inventory.item.currentStockInformation')}</CardTitle></CardHeader>
					<CardContent class="grid gap-4 md:grid-cols-2">
						<p><strong>{$t('inventory.item.currentStock')}:</strong> {item.currentStock} {item.unit}</p>
						<p><strong>{$t('inventory.item.minStockLevel')}:</strong> {item.minStockLevel} {item.unit}</p>
						<p><strong>{$t('inventory.item.maxStockLevel')}:</strong> {item.maxStockLevel} {item.unit}</p>
						<p><strong>{$t('inventory.item.stockValue')}:</strong> {formatCurrency(item.currentStock * item.unitPrice, undefined, currentLocale)}</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="stockMovements">
				<Card>
					<CardHeader><CardTitle>{$t('inventory.item.movementHistory')}</CardTitle></CardHeader>
					<CardContent>
						{#if $inventoryStore.stockMovements.filter(sm => sm.itemId === item?.id).length > 0}
							<div class="border rounded-md">
								<table class="w-full text-left">
									<thead>
										<tr class="border-b">
											<th class="p-4">{$t('inventory.movement.date')}</th>
											<th class="p-4">{$t('inventory.movement.type')}</th>
											<th class="p-4">{$t('inventory.movement.quantity')}</th>
											<th class="p-4">{$t('inventory.movement.previousStock')}</th>
											<th class="p-4">{$t('inventory.movement.newStock')}</th>
											<th class="p-4">{$t('inventory.movement.performedBy')}</th>
											<th class="p-4">{$t('inventory.movement.reason')}</th>
										</tr>
									</thead>
									<tbody>
										{#each $inventoryStore.stockMovements.filter(sm => sm.itemId === item?.id) as movement (movement.id)}
											<tr class="border-b last:border-b-0">
												<td class="p-4">{formatDate(movement.createdAt)}</td>
												<td class="p-4">{$t(`inventory.movement.type.${movement.type}`)}</td>
												<td class="p-4">{movement.quantity}</td>
												<td class="p-4">{movement.previousStock}</td>
												<td class="p-4">{movement.newStock}</td>
												<td class="p-4">{movement.performedBy}</td>
												<td class="p-4">{movement.reason || '-'}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<p class="text-center text-muted-foreground">{$t('inventory.movement.noMovements')}</p>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>

		<ConfirmDialog
			bind:open={confirmDelete}
			title={$t('inventory.item.confirmDeleteTitle')}
			description={$t('inventory.item.confirmDeleteDescription', { name: item.name })}
			on:confirm={handleDelete}
			on:cancel={() => (confirmDelete = false)}
		/>

		<Dialog bind:open={showRecordMovementDialog}>
			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{$t('inventory.movement.recordMovement')}</DialogTitle>
					<DialogDescription>
						{$t('inventory.movement.recordMovementDescription', { item: item.name })}
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="movementType" class="text-right">{$t('inventory.movement.type')}</Label>
						<Select bind:value={movementType}>
							<SelectTrigger class="col-span-3">
								<SelectValue placeholder={$t('inventory.movement.selectType')} />
							</SelectTrigger>
							<SelectContent>
								{#each movementTypes as type}
									<SelectItem value={type.value}>{type.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="movementQuantity" class="text-right">{$t('inventory.movement.quantity')}</Label>
						<Input id="movementQuantity" type="number" min="0" bind:value={movementQuantity} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="movementReason" class="text-right">{$t('inventory.movement.reason')}</Label>
						<Textarea id="movementReason" bind:value={movementReason} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="referenceNumber" class="text-right">{$t('inventory.movement.referenceNumber')}</Label>
						<Input id="referenceNumber" bind:value={movementReference} class="col-span-3" />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" on:click={() => (showRecordMovementDialog = false)}>{$t('common.cancel')}</Button>
					<Button type="submit" on:click={handleRecordMovement}>{$t('inventory.movement.record')}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('inventory.item.itemNotFound')}</p>
	</div>
{/if}
