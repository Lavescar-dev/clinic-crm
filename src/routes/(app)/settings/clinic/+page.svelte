<script lang="ts">
	import { t } from '$i18n';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$components/ui/card';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Button } from '$components/ui/button';
	import FormField from '$components/shared/FormField.svelte';
	import { Textarea } from '$components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { appConfigStore } from '$stores/settings'; // Assuming a settings store
	import { get } from 'svelte/store';

	let clinicInfo = {
		name: get(appConfigStore).clinicName || '',
		address: get(appConfigStore).clinicAddress || '',
		taxNumber: get(appConfigStore).clinicTaxNumber || '',
		logoUrl: get(appConfigStore).clinicLogoUrl || ''
	};

	let errors: Record<string, string> = {};

	async function handleSubmit() {
		// Basic validation
		if (!clinicInfo.name.trim()) {
			errors.name = $t('settings.clinic.validation.nameRequired');
			return;
		}
		if (!clinicInfo.address.trim()) {
			errors.address = $t('settings.clinic.validation.addressRequired');
			return;
		}
		if (!clinicInfo.taxNumber.trim()) {
			errors.taxNumber = $t('settings.clinic.validation.taxNumberRequired');
			return;
		}

		appConfigStore.update((config) => ({
			...config,
			clinicName: clinicInfo.name,
			clinicAddress: clinicInfo.address,
			clinicTaxNumber: clinicInfo.taxNumber,
			clinicLogoUrl: clinicInfo.logoUrl
		}));

		toast.success($t('settings.clinic.updateSuccess'));
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

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('settings.clinic.title')}</h1>
	<p class="text-muted-foreground">{$t('settings.clinic.description')}</p>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{$t('settings.clinic.generalInfo')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('settings.clinic.name')} error={errors.name}>
					<Input bind:value={clinicInfo.name} placeholder={$t('settings.clinic.namePlaceholder')} />
				</FormField>
				<FormField class="md:col-span-2" label={$t('settings.clinic.address')} error={errors.address}>
					<Textarea bind:value={clinicInfo.address} placeholder={$t('settings.clinic.addressPlaceholder')} />
				</FormField>
				<FormField label={$t('settings.clinic.taxNumber')} error={errors.taxNumber}>
					<Input bind:value={clinicInfo.taxNumber} placeholder={$t('settings.clinic.taxNumberPlaceholder')} />
				</FormField>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('settings.clinic.logo')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4">
				<div class="flex items-center gap-4">
					<div class="h-24 w-24 rounded-full border flex items-center justify-center overflow-hidden">
						{#if clinicInfo.logoUrl}
							<img src={clinicInfo.logoUrl} alt="Clinic Logo" class="object-cover h-full w-full" />
						{:else}
							<span class="text-muted-foreground">{$t('settings.clinic.noLogo')}</span>
						{/if}
					</div>
					<Input type="file" accept="image/*" on:change={handleLogoUpload} class="w-auto" />
				</div>
			</CardContent>
		</Card>

		<div class="flex justify-end">
			<Button type="submit">{$t('common.saveChanges')}</Button>
		</div>
	</form>
</div>
