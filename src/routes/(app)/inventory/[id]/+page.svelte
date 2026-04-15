<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { inventory as inventoryStore } from '$stores/inventory';
	import { users as userStore } from '$stores/users';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$components/ui/dialog';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import { toast } from 'svelte-sonner';
	import { formatCurrency } from '$utils/currency';
	import { formatDate } from '$utils/date';
	import type { InventoryItem, ItemStatus, StockMovementType } from '$types';
	import {
		AlertTriangle,
		ArrowLeft,
		Box,
		ClipboardList,
		History,
		PackagePlus,
		ShieldCheck,
		Warehouse
	} from 'lucide-svelte';

	let item: InventoryItem | null = null;
	let loading = true;
	let confirmDelete = false;
	let showRecordMovementDialog = false;
	let movementType: StockMovementType = 'adjustment';
	let movementQuantity = 1;
	let movementReason = '';
	let movementReference = '';

	const movementTypeOptions: { value: StockMovementType; label: string }[] = [
		{ value: 'purchase', label: 'Satın alma girişi' },
		{ value: 'usage', label: 'Klinik kullanım çıkışı' },
		{ value: 'adjustment', label: 'Stok düzeltmesi' },
		{ value: 'return', label: 'İade girişi' },
		{ value: 'disposal', label: 'İmha / kullanım dışı' }
	];

	$: itemId = item?.id ?? '';
	$: itemMovements = itemId
		? $inventoryStore.stockMovements
				.filter((movement) => movement.itemId === itemId)
				.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
		: [];
	$: stockValue = item ? item.currentStock * item.unitPrice : 0;
	$: refillGap = item ? Math.max(0, item.minStockLevel - item.currentStock) : 0;
	$: maxGap = item ? Math.max(0, item.maxStockLevel - item.currentStock) : 0;
	$: lastMovement = itemMovements[0];

	onMount(async () => {
		const routeId = get(page).params.id ?? '';
		if (!routeId) {
			toast.error($t('inventory.item.itemNotFound'));
			goto('/inventory');
			return;
		}

		const fetchedItem = await inventoryStore.getInventoryItemById(routeId);
		loading = false;

		if (!fetchedItem) {
			toast.error($t('inventory.item.itemNotFound'));
			goto('/inventory');
			return;
		}

		item = fetchedItem;
	});

	function getStatusVariant(
		status: ItemStatus
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (status) {
			case 'in-stock':
				return 'success';
			case 'low-stock':
				return 'warning';
			case 'out-of-stock':
				return 'destructive';
			case 'expired':
				return 'outline';
			default:
				return 'secondary';
		}
	}

	function statusLabel(status: ItemStatus) {
		switch (status) {
			case 'in-stock':
				return 'Stok dengede';
			case 'low-stock':
				return 'Minimum eşiğe indi';
			case 'out-of-stock':
				return 'Stok tükendi';
			case 'expired':
				return 'SKT riski oluştu';
			default:
				return 'İzleniyor';
		}
	}

	function statusCopy(currentItem: InventoryItem) {
		if (currentItem.status === 'out-of-stock') {
			return 'Klinik akışı etkilememesi için acil tedarik açılması gerekiyor.';
		}

		if (currentItem.status === 'low-stock') {
			return 'Minimum seviyenin altındaki stok, vardiya içinde yenileme aksiyonu bekliyor.';
		}

		if (currentItem.status === 'expired') {
			return 'Ürün kullanılmadan önce son kullanma ve imha akışı kontrol edilmeli.';
		}

		return 'Bu ürün için stok seviyesi ve operasyon akışı şu an kontrol altında.';
	}

	function movementLabel(type: StockMovementType) {
		return movementTypeOptions.find((option) => option.value === type)?.label || type;
	}

	function movementTone(type: StockMovementType) {
		switch (type) {
			case 'usage':
			case 'disposal':
				return 'mf-tint-amber';
			case 'purchase':
			case 'return':
				return 'mf-tint-emerald';
			default:
				return 'mf-tint-cyan';
		}
	}

	async function handleDelete() {
		if (!item) return;

		const result = await inventoryStore.deleteItem(item.id);
		if (result.success) {
			toast.success('Ürün kaydı stok masasından kaldırıldı.');
			goto('/inventory');
			return;
		}

		toast.error(result.error || 'Ürün silinirken bir sorun oluştu.');
	}

	async function handleRecordMovement() {
		if (!item) return;

		if (!Number.isFinite(movementQuantity) || movementQuantity <= 0) {
			toast.error('Hareket miktarı sıfırdan büyük olmalı.');
			return;
		}

		const currentUser = get(userStore).currentUser;
		const performedBy = currentUser?.fullName || 'Yerel Demo Kullanıcısı';

		const result = await inventoryStore.recordStockMovement(item.id, {
			id: `movement-${Date.now()}`,
			itemId: item.id,
			itemName: item.name,
			type: movementType,
			quantity: movementQuantity,
			previousStock: item.currentStock,
			newStock: item.currentStock,
			reason: movementReason.trim() || undefined,
			referenceNumber: movementReference.trim() || undefined,
			performedBy,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		if (result.success && result.data) {
			item = result.data;
			showRecordMovementDialog = false;
			movementType = 'adjustment';
			movementQuantity = 1;
			movementReason = '';
			movementReference = '';
			toast.success('Stok hareketi kaydedildi.');
			return;
		}

		toast.error(result.error || 'Stok hareketi kaydedilemedi.');
	}

	function handleMovementTypeChange(event: Event) {
		movementType = (event.currentTarget as HTMLSelectElement).value as StockMovementType;
	}

	function handleMovementQuantityChange(event: Event) {
		movementQuantity = Number((event.currentTarget as HTMLInputElement).value);
	}

	function handleMovementReasonChange(event: Event) {
		movementReason = (event.currentTarget as HTMLTextAreaElement).value;
	}

	function handleMovementReferenceChange(event: Event) {
		movementReference = (event.currentTarget as HTMLInputElement).value;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if item}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<PageHero
			eyebrow="Stok Dosyası"
			title={item.name}
			description={`${item.manufacturer || 'Üretici belirtilmedi'} · ${item.location || 'Konum atanmadı'} · ${item.unit}`}
		>
			<Button variant="outline" onclick={() => goto('/inventory')}>
				<ArrowLeft class="h-4 w-4" />
				Stok masasına dön
			</Button>
			<Button onclick={() => (showRecordMovementDialog = true)}>
				<PackagePlus class="h-4 w-4" />
				Hareket kaydet
			</Button>
			<Button variant="outline" onclick={() => goto(`/inventory/${itemId}/edit`)}>
				{$t('common.edit')}
			</Button>
		</PageHero>

		<div class="mf-page-stat-grid">
			<div class="mf-metric-card mf-tint-cyan">
				<p class="mf-kicker text-xs font-semibold">MEVCUT STOK</p>
				<p class="mf-metric-value text-[2rem]">{item.currentStock}</p>
				<p class="mf-metric-copy">{item.unit} bazında eldeki aktif miktar.</p>
			</div>
			<div class="mf-metric-card mf-tint-emerald">
				<p class="mf-kicker text-xs font-semibold">STOK DEĞERİ</p>
				<p class="mf-metric-value text-[2rem]">{formatCurrency(stockValue)}</p>
				<p class="mf-metric-copy">Bu kalemin klinik maliyet karşılığı.</p>
			</div>
			<div class="mf-metric-card mf-tint-amber">
				<p class="mf-kicker text-xs font-semibold">YENİLEME AÇIĞI</p>
				<p class="mf-metric-value text-[2rem]">{refillGap}</p>
				<p class="mf-metric-copy">Minimum seviye için kapanması gereken fark.</p>
			</div>
			<div class="mf-metric-card">
				<p class="mf-kicker text-xs font-semibold">SON HAREKET</p>
				<p class="mf-metric-value text-[2rem]">{lastMovement ? formatDate(lastMovement.createdAt) : 'Henüz yok'}</p>
				<p class="mf-metric-copy">
					{lastMovement ? movementLabel(lastMovement.type) : 'Bu ürün için henüz kayıtlı hareket bulunmuyor.'}
				</p>
			</div>
		</div>

		<div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
			<div class="space-y-6">
				<Card class="mf-section-card">
					<CardHeader class="space-y-3">
						<p class="mf-kicker text-[0.72rem] font-semibold">STOK ÖZETİ</p>
						<CardTitle class="text-2xl tracking-[-0.04em]">Ürün profili ve tedarik bağlamı</CardTitle>
					</CardHeader>
					<CardContent class="grid gap-4 md:grid-cols-2">
						<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
							<p class="mf-kicker text-[0.68rem] font-semibold">KATEGORİ</p>
							<p class="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
								<Box class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
								{$t(`inventory.category.${item.category}`)}
							</p>
						</div>
						<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
							<p class="mf-kicker text-[0.68rem] font-semibold">LOKASYON</p>
							<p class="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
								<Warehouse class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
								{item.location || 'Konum atanmadı'}
							</p>
						</div>
						<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
							<p class="mf-kicker text-[0.68rem] font-semibold">SKU / BARKOD</p>
							<p class="mt-3 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
								{item.sku || 'SKU yok'}
							</p>
							<p class="mt-1 text-sm text-[color:var(--mf-ink-soft)]">{item.barcode || 'Barkod yok'}</p>
						</div>
						<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
							<p class="mf-kicker text-[0.68rem] font-semibold">STOK POLİTİKASI</p>
							<p class="mt-3 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
								Min {item.minStockLevel} · Maks {item.maxStockLevel} {item.unit}
							</p>
							<p class="mt-1 text-sm text-[color:var(--mf-ink-soft)]">
								Üst banda dönmek için {maxGap} {item.unit} alan kaldı.
							</p>
						</div>
						<div class="md:col-span-2 mf-soft-card rounded-[1.2rem] px-4 py-4">
							<p class="mf-kicker text-[0.68rem] font-semibold">ÜRÜN AÇIKLAMASI</p>
							<p class="mt-3 text-sm leading-7 text-[color:var(--mf-ink)]">
								{item.description || 'Bu ürün için açıklama girilmedi.'}
							</p>
						</div>
						<div class="md:col-span-2 mf-soft-card rounded-[1.2rem] px-4 py-4">
							<p class="mf-kicker text-[0.68rem] font-semibold">OPERASYON NOTLARI</p>
							<p class="mt-3 text-sm leading-7 text-[color:var(--mf-ink)]">
								{item.notes || 'Ek operasyon notu bulunmuyor.'}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card class="mf-section-card">
					<CardHeader class="space-y-3">
						<p class="mf-kicker text-[0.72rem] font-semibold">HAREKET AKIŞI</p>
						<CardTitle class="text-2xl tracking-[-0.04em]">Son stok operasyonları</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if itemMovements.length > 0}
							{#each itemMovements as movement (movement.id)}
								<div class={`mf-soft-card rounded-[1.15rem] px-4 py-4 ${movementTone(movement.type)}`}>
									<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
										<div class="space-y-1">
											<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">{movementLabel(movement.type)}</p>
											<p class="text-sm text-[color:var(--mf-ink-soft)]">
												{movement.reason || 'Ek açıklama girilmedi.'}
											</p>
										</div>
										<div class="text-left md:text-right">
											<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
												{movement.quantity} {item.unit}
											</p>
											<p class="text-xs text-[color:var(--mf-ink-soft)]">{formatDate(movement.createdAt)}</p>
										</div>
									</div>
									<div class="mt-4 grid gap-3 text-sm text-[color:var(--mf-ink-soft)] md:grid-cols-3">
										<p>Önceki stok: <span class="font-semibold text-[color:var(--mf-ink)]">{movement.previousStock}</span></p>
										<p>Yeni stok: <span class="font-semibold text-[color:var(--mf-ink)]">{movement.newStock}</span></p>
										<p>İşleyen kişi: <span class="font-semibold text-[color:var(--mf-ink)]">{movement.performedBy}</span></p>
									</div>
									{#if movement.referenceNumber}
										<p class="mt-3 text-xs text-[color:var(--mf-ink-soft)]">
											Referans: {movement.referenceNumber}
										</p>
									{/if}
								</div>
							{/each}
						{:else}
							<div class="mf-soft-card rounded-[1.2rem] px-4 py-5 text-sm text-[color:var(--mf-ink-soft)]">
								Bu ürün için henüz stok hareketi kaydedilmedi. İlk girişi operasyon masasından başlatabilirsin.
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<div class="space-y-4">
				<Card class="mf-panel-dark border-0">
					<CardContent class="space-y-5 px-6 pb-6 pt-8">
						<div class="mt-1 flex items-start justify-between gap-3">
							<div>
								<p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/72">
									Stok sağlığı
								</p>
								<h2 class="mt-3 text-xl font-semibold text-[color:var(--mf-panel-dark-text)]">
									Bu kalem güvenli bölgede mi?
								</h2>
							</div>
							<ShieldCheck class="h-5 w-5 text-cyan-200" />
						</div>

						<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
							<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Aktif durum</p>
							<div class="mt-3 flex items-center gap-2">
								<Badge variant={getStatusVariant(item.status)}>{statusLabel(item.status)}</Badge>
							</div>
							<p class="mt-3 text-sm leading-6 text-cyan-50/80">{statusCopy(item)}</p>
						</div>

						<div class="grid gap-3">
							<div class="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-4">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">SKT</p>
								<p class="mt-2 text-sm font-semibold text-[color:var(--mf-panel-dark-text)]">
									{item.expiryDate ? formatDate(item.expiryDate) : 'SKT bilgisi yok'}
								</p>
							</div>
							<div class="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-4">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Üretici</p>
								<p class="mt-2 text-sm font-semibold text-[color:var(--mf-panel-dark-text)]">
									{item.manufacturer || 'Üretici girilmedi'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="mf-glass">
					<CardHeader class="space-y-2">
						<p class="mf-kicker text-[0.72rem] font-semibold">Hızlı aksiyonlar</p>
						<CardTitle class="text-xl tracking-[-0.04em]">Bu stok kalemi için yapılacaklar</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<Button class="w-full justify-start" onclick={() => (showRecordMovementDialog = true)}>
							<PackagePlus class="h-4 w-4" />
							Stok hareketi oluştur
						</Button>
						<Button variant="outline" class="w-full justify-start" onclick={() => goto(`/inventory/${itemId}/edit`)}>
							<ClipboardList class="h-4 w-4" />
							Ürün bilgisini düzenle
						</Button>
						<Button variant="outline" class="w-full justify-start" onclick={() => goto('/inventory')}>
							<History class="h-4 w-4" />
							Genel stok görünümüne dön
						</Button>
						<Button variant="destructive" class="w-full justify-start" onclick={() => (confirmDelete = true)}>
							<AlertTriangle class="h-4 w-4" />
							Kayıttan kaldır
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>

		<ConfirmDialog
			bind:open={confirmDelete}
			title="Ürün kaydı kaldırılsın mı?"
			message={`${item.name} stok listesinden kaldırılacak. Bu işlem demo ortamında geri alınamaz.`}
			onConfirm={handleDelete}
			onCancel={() => (confirmDelete = false)}
			variant="destructive"
		/>

		<Dialog bind:open={showRecordMovementDialog}>
			<DialogContent class="sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>Stok hareketi oluştur</DialogTitle>
					<DialogDescription>
						Bu giriş doğrudan {item.name} dosyasına işlenir ve stok seviyesini anında günceller.
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-2">
					<div class="space-y-2">
						<label class="text-sm font-medium text-[color:var(--mf-ink)]" for="movement-type">
							Hareket türü
						</label>
						<select
							id="movement-type"
							class="w-full rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-strong)] px-3 py-3 text-sm text-[color:var(--mf-ink)] outline-none"
							value={movementType}
							onchange={handleMovementTypeChange}
						>
							{#each movementTypeOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium text-[color:var(--mf-ink)]" for="movement-quantity">
							Miktar
						</label>
						<input
							id="movement-quantity"
							type="number"
							min="1"
							class="w-full rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-strong)] px-3 py-3 text-sm text-[color:var(--mf-ink)] outline-none"
							value={movementQuantity}
							oninput={handleMovementQuantityChange}
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium text-[color:var(--mf-ink)]" for="movement-reference">
							Referans
						</label>
						<input
							id="movement-reference"
							type="text"
							class="w-full rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-strong)] px-3 py-3 text-sm text-[color:var(--mf-ink)] outline-none"
							value={movementReference}
							oninput={handleMovementReferenceChange}
							placeholder="Satın alma no / vardiya notu"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium text-[color:var(--mf-ink)]" for="movement-reason">
							Açıklama
						</label>
						<textarea
							id="movement-reason"
							rows="4"
							class="w-full rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-strong)] px-3 py-3 text-sm text-[color:var(--mf-ink)] outline-none"
							oninput={handleMovementReasonChange}
							value={movementReason}
							placeholder="Bu hareketin klinik bağlamını yazın"
						></textarea>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onclick={() => (showRecordMovementDialog = false)}>
						{$t('common.cancel')}
					</Button>
					<Button onclick={handleRecordMovement}>Hareketi kaydet</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('inventory.item.itemNotFound')}</p>
	</div>
{/if}
