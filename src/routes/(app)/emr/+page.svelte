<script lang="ts">
	// @ts-nocheck
	import { t, language } from '$i18n';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Input } from '$components/ui/input';
	import { Button } from '$components/ui/button';
	import { Search, History } from 'lucide-svelte';
	import { emr as emrStore } from '$stores/emr';
	import { patients as patientStore } from '$stores/patients';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import type { MedicalRecord } from '$types';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let searchResults: MedicalRecord[] = [];
	let recentRecords: MedicalRecord[] = [];

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	recentRecords = $emrStore.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

	function handleSearch() {
		if (searchTerm.trim() === '') {
			searchResults = [];
			return;
		}
		// Search for patient by name or TC No, then filter EMR records for that patient
		const matchingPatients = $patientStore.data.filter(
			(p) =>
				p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				p.tcNo.includes(searchTerm)
		);

		searchResults = $emrStore.data.filter((record) =>
			matchingPatients.some((patient) => patient.id === record.patientId)
		);
	}

	function viewPatientEMR(patientId: string) {
		goto(`/emr/${patientId}`);
	}
</script>

<div class="mf-page-shell space-y-5 p-4 md:p-6">
	<div class="space-y-2 px-1">
		<p class="mf-kicker text-[0.72rem] font-semibold">Klinik Kayıtlar</p>
		<h1 class="mf-page-title">{translate('emr.title', 'Elektronik Tıbbi Kayıtlar', 'Electronic medical records')}</h1>
		<p class="mf-page-description">
			{translate(
				'emr.description',
				'Hasta geçmişini, yakın ziyaretleri ve klinik kayıtları daha okunur bir akışla inceleyin.',
				'Review patient history, recent visits, and clinical records through a clearer workflow.'
			)}
		</p>
	</div>

	<div class="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_1.12fr]">
		<Card class="h-fit">
			<CardHeader><CardTitle>{translate('emr.searchPatient', 'Hasta Ara', 'Search patient')}</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<Input
						bind:value={searchTerm}
						placeholder={translate('emr.searchPatientPlaceholder', 'Hasta adı veya TC kimlik no ile ara', 'Search by patient name or national ID')}
						class="flex-1"
						on:keydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
					/>
					<Button on:click={handleSearch}><Search class="mr-2 h-4 w-4" />{$t('common.search')}</Button>
				</div>
				{#if searchResults.length > 0}
					<div class="space-y-3 border-t border-[color:var(--mf-line-soft)] pt-4">
						<h3 class="text-base font-semibold">{translate('emr.searchResults', 'Arama Sonuçları', 'Search results')}</h3>
						{#each searchResults as record (record.id)}
							<div class="flex items-center justify-between gap-3 rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-white/75 p-3">
								<div class="min-w-0">
									<p class="font-medium text-[color:var(--mf-ink-strong)]">{record.patientName}</p>
									<p class="text-sm text-muted-foreground">{translate('emr.visitDate', 'Ziyaret Tarihi', 'Visit date')}: {format(new Date(record.visitDate), 'dd MMMM yyyy', { locale: tr })}</p>
									<p class="text-sm text-muted-foreground">{translate('emr.chiefComplaint', 'Ana Şikayet', 'Chief complaint')}: {record.chiefComplaint}</p>
								</div>
								<Button variant="outline" size="sm" on:click={() => viewPatientEMR(record.patientId)}>
									{$t('common.view')}
								</Button>
							</div>
						{/each}
					</div>
				{:else if searchTerm.trim() !== ''}
					<div class="border-t border-[color:var(--mf-line-soft)] pt-4 text-center text-muted-foreground">
						{translate('emr.noResults', 'Aramanızla eşleşen kayıt bulunamadı', 'No matching records found')}
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle>{translate('emr.recentRecords', 'Son Kayıtlar', 'Recent records')}</CardTitle>
				<History class="h-5 w-5 text-muted-foreground" />
			</CardHeader>
			<CardContent class="space-y-3">
				{#if recentRecords.length > 0}
					{#each recentRecords as record (record.id)}
						<div class="flex items-center justify-between gap-3 rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-white/75 p-3">
							<div class="min-w-0">
								<p class="font-medium text-[color:var(--mf-ink-strong)]">{record.patientName}</p>
								<p class="text-sm text-muted-foreground">{translate('emr.visitDate', 'Ziyaret Tarihi', 'Visit date')}: {format(new Date(record.visitDate), 'dd MMMM yyyy', { locale: tr })}</p>
								<p class="text-sm text-muted-foreground">{translate('emr.chiefComplaint', 'Ana Şikayet', 'Chief complaint')}: {record.chiefComplaint}</p>
							</div>
							<Button variant="outline" size="sm" on:click={() => viewPatientEMR(record.patientId)}>
								{$t('common.view')}
							</Button>
						</div>
					{/each}
				{:else}
					<p class="text-center text-muted-foreground">{translate('emr.noRecentRecords', 'Yakın tarihli kayıt bulunmuyor', 'No recent records yet')}</p>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
