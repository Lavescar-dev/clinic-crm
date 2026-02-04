<script lang="ts">
	import { t } from '$i18n';
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

	let searchTerm = '';
	let searchResults: MedicalRecord[] = [];
	let recentRecords: MedicalRecord[] = [];

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

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('emr.title')}</h1>

	<Card>
		<CardHeader><CardTitle>{$t('emr.searchPatient')}</CardTitle></CardHeader>
		<CardContent class="flex flex-col md:flex-row gap-4">
			<Input
				bind:value={searchTerm}
				placeholder={$t('emr.searchPatientPlaceholder')}
				class="flex-1"
				on:keydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
			/>
			<Button on:click={handleSearch}><Search class="mr-2 h-4 w-4" />{$t('common.search')}</Button>
		</CardContent>
		{#if searchResults.length > 0}
			<CardContent class="border-t pt-4 mt-4">
				<h3 class="text-lg font-semibold mb-3">{$t('emr.searchResults')}</h3>
				<div class="grid gap-3">
					{#each searchResults as record (record.id)}
						<div class="flex items-center justify-between p-3 border rounded-md">
							<div>
								<p class="font-medium">{record.patientName}</p>
								<p class="text-sm text-muted-foreground">{$t('emr.visitDate')}: {format(new Date(record.visitDate), 'dd MMMM yyyy', { locale: tr })}</p>
								<p class="text-sm text-muted-foreground">{$t('emr.chiefComplaint')}: {record.chiefComplaint}</p>
							</div>
							<Button variant="outline" size="sm" on:click={() => viewPatientEMR(record.patientId)}>
								{$t('common.view')}
							</Button>
						</div>
					{/each}
				</div>
			</CardContent>
		{:else if searchTerm.trim() !== ''}
			<CardContent class="border-t pt-4 mt-4 text-center text-muted-foreground">
				{$t('emr.noResults')}
			</CardContent>
		{/if}
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle>{$t('emr.recentRecords')}</CardTitle>
			<History class="h-5 w-5 text-muted-foreground" />
		</CardHeader>
		<CardContent class="space-y-4">
			{#if recentRecords.length > 0}
				{#each recentRecords as record (record.id)}
					<div class="flex items-center justify-between p-3 border rounded-md">
						<div>
							<p class="font-medium">{record.patientName}</p>
							<p class="text-sm text-muted-foreground">{$t('emr.visitDate')}: {format(new Date(record.visitDate), 'dd MMMM yyyy', { locale: tr })}</p>
							<p class="text-sm text-muted-foreground">{$t('emr.chiefComplaint')}: {record.chiefComplaint}</p>
						</div>
						<Button variant="outline" size="sm" on:click={() => viewPatientEMR(record.patientId)}>
							{$t('common.view')}
						</Button>
					</div>
				{/each}
			{:else}
				<p class="text-center text-muted-foreground">{$t('emr.noRecentRecords')}</p>
			{/if}
		</CardContent>
	</Card>
</div>