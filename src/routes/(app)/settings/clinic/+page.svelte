<script lang="ts">
	import { t, language } from '$i18n';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Input } from '$components/ui/input';
	import { Button } from '$components/ui/button';
	import FormField from '$components/shared/FormField.svelte';
	import { Textarea } from '$components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { appConfigStore } from '$stores/settings';
	import { get } from 'svelte/store';

	let clinicInfo = {
		name: get(appConfigStore).clinicName || '',
		address: get(appConfigStore).clinicAddress || '',
		taxNumber: get(appConfigStore).clinicTaxNumber || '',
		logoUrl: get(appConfigStore).clinicLogoUrl || ''
	};

	let errors: Record<string, string> = {};

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	async function handleSubmit() {
		errors = {};
		if (!clinicInfo.name.trim()) {
			errors.name = translate('settings.clinic.validation.nameRequired', 'Klinik adı gerekli.', 'Clinic name is required.');
			return;
		}
		if (!clinicInfo.address.trim()) {
			errors.address = translate('settings.clinic.validation.addressRequired', 'Klinik adresi gerekli.', 'Clinic address is required.');
			return;
		}
		if (!clinicInfo.taxNumber.trim()) {
			errors.taxNumber = translate('settings.clinic.validation.taxNumberRequired', 'Vergi numarası gerekli.', 'Tax number is required.');
			return;
		}

		appConfigStore.update((config) => ({
			...config,
			clinicName: clinicInfo.name,
			clinicAddress: clinicInfo.address,
			clinicTaxNumber: clinicInfo.taxNumber,
			clinicLogoUrl: clinicInfo.logoUrl
		}));

		toast.success(translate('settings.clinic.updateSuccess', 'Klinik ayarları kaydedildi.', 'Clinic settings saved.'));
	}

	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				clinicInfo.logoUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="mf-page-header space-y-2">
		<p class="mf-kicker text-[0.72rem] font-semibold">Klinik Kimliği</p>
		<h1 class="mf-page-title">{translate('settings.clinic.title', 'Klinik Ayarları', 'Clinic settings')}</h1>
		<p class="mf-page-description">
			{translate(
				'settings.clinic.description',
				'Kurum kimliği, resmi bilgiler ve görünür marka alanlarını tek panelde güncelleyin.',
				'Update organization identity, formal details, and visible brand assets in one panel.'
			)}
		</p>
	</div>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{translate('settings.clinic.generalInfo', 'Genel Bilgiler', 'General information')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={translate('settings.clinic.name', 'Klinik Adı', 'Clinic name')} error={errors.name}>
					<Input bind:value={clinicInfo.name} placeholder={translate('settings.clinic.namePlaceholder', 'Klinik adını girin', 'Enter clinic name')} />
				</FormField>
				<FormField class="md:col-span-2" label={translate('settings.clinic.address', 'Adres', 'Address')} error={errors.address}>
					<Textarea bind:value={clinicInfo.address} placeholder={translate('settings.clinic.addressPlaceholder', 'Adres bilgisini girin', 'Enter clinic address')} />
				</FormField>
				<FormField label={translate('settings.clinic.taxNumber', 'Vergi Numarası', 'Tax number')} error={errors.taxNumber}>
					<Input bind:value={clinicInfo.taxNumber} placeholder={translate('settings.clinic.taxNumberPlaceholder', 'Vergi numarasını girin', 'Enter tax number')} />
				</FormField>
				<div class="rounded-[1.2rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)] p-4">
					<p class="text-xs uppercase tracking-[0.18em] text-[color:var(--mf-ink-faint)]">
						Operasyon Notu
					</p>
					<p class="mt-2 text-sm text-[color:var(--mf-ink)]">
						Bu bilgiler fatura başlıklarında, login ekranında ve yönetim yüzeylerinde görünür.
					</p>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{translate('settings.clinic.logo', 'Logo ve Marka', 'Logo and branding')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4">
				<div class="flex items-center gap-4">
					<div class="h-24 w-24 rounded-full border flex items-center justify-center overflow-hidden">
						{#if clinicInfo.logoUrl}
							<img src={clinicInfo.logoUrl} alt="Clinic Logo" class="object-cover h-full w-full" />
						{:else}
							<span class="text-muted-foreground">{translate('settings.clinic.noLogo', 'Henüz logo yüklenmedi', 'No logo uploaded yet')}</span>
						{/if}
					</div>
					<Input type="file" accept="image/*" on:change={handleLogoUpload} class="w-auto" />
				</div>
				<div class="grid gap-3 md:grid-cols-3">
					<div class="mf-soft-card rounded-[1.1rem] p-4">
						<p class="text-xs uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">Tema</p>
						<p class="mt-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">{get(appConfigStore).theme}</p>
					</div>
					<div class="mf-soft-card rounded-[1.1rem] p-4">
						<p class="text-xs uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">Dil</p>
						<p class="mt-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">{get(appConfigStore).language}</p>
					</div>
					<div class="mf-soft-card rounded-[1.1rem] p-4">
						<p class="text-xs uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">Hatırlatmalar</p>
						<p class="mt-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
							{get(appConfigStore).appointmentReminders ? 'Aktif' : 'Kapalı'}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="flex justify-end">
			<Button type="submit">{translate('common.saveChanges', 'Değişiklikleri Kaydet', 'Save changes')}</Button>
		</div>
	</form>
</div>
