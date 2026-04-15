<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { ArrowLeft, User, Calendar, Activity } from 'lucide-svelte';
	import { patients as patientStore } from '$stores/patients';
	import { clinicalNotes as clinicalNotesStore } from '$stores/clinicalNotes';
	import { emr as emrStore } from '$stores/emr';
	import SOAPNoteEditor from '$lib/components/emr/SOAPNoteEditor.svelte';
	import type { Patient, MedicalRecord } from '$types';
	import type { CreateClinicalNoteDto } from '$lib/types/clinicalNote';
	import { formatDate } from '$utils/date';
	import { toast } from 'svelte-sonner';

	let patient: Patient | undefined | null = $state(undefined);
	let recentRecords: MedicalRecord[] = $state([]);
	let loading = $state(true);

	// Get appointmentId from query params if available
	let appointmentId: string | undefined = $state(undefined);

	onMount(async () => {
		const patientId = $page.params.patientId as string;
		appointmentId = $page.url.searchParams.get('appointmentId') || undefined;

		patient = await patientStore.getPatientById(patientId) || undefined;
		if (patient) {
			// Load recent medical records for context
			const records = await emrStore.getMedicalRecordsByPatientId(patientId);
			recentRecords = records
				.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
				.slice(0, 3);
		} else {
			toast.error($t('patient.profile.patientNotFound'));
			goto('/emr');
		}
		loading = false;
	});

	async function handleSave(event: CustomEvent<CreateClinicalNoteDto>) {
		const noteData = event.detail;
		const result = await clinicalNotesStore.createNote(noteData);

		if (result.success) {
			toast.success($t('emr.clinicalNote.createdSuccess'));
			goto(`/emr/${patient?.id}`);
		} else {
			toast.error(result.error || $t('emr.clinicalNote.createFailed'));
		}
	}

	async function handleLock() {
		toast.error('Please save the note first before locking');
	}

	function handleCancel() {
		const confirmed = confirm('Are you sure you want to cancel? Any unsaved changes will be lost.');
		if (confirmed) {
			goto(`/emr/${patient?.id}`);
		}
	}

	function getCurrentUserId(): string {
		// TODO: Get from auth context
		return 'current-doctor-id';
	}

	function getPatientAge(birthDate: Date | undefined): number {
		if (!birthDate) return 0;
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if patient}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" onclick={() => goto(`/emr/${patient?.id}`)}>
					<ArrowLeft class="h-4 w-4 mr-2" />
					{$t('common.back')}
				</Button>
				<h1 class="text-3xl font-bold">{$t('emr.clinicalNote.newNote')}</h1>
			</div>
		</div>

		<!-- Patient Context -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('patient.profile.patientContext')}</CardTitle>
				<CardDescription>Recent patient information for reference</CardDescription>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="flex items-start gap-3">
					<User class="h-5 w-5 text-muted-foreground mt-0.5" />
					<div>
						<p class="text-sm font-medium">{patient.fullName}</p>
						<p class="text-xs text-muted-foreground">
							{patient.birthDate ? `${getPatientAge(patient.birthDate)} years • ` : ''}
							{$t(`patient.gender.${patient.gender}`)}
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
					<div>
						<p class="text-sm font-medium">Last Visit</p>
						<p class="text-xs text-muted-foreground">
							{#if recentRecords.length > 0}
								{formatDate(recentRecords[0].visitDate)}
							{:else}
								No previous visits
							{/if}
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Activity class="h-5 w-5 text-muted-foreground mt-0.5" />
					<div>
						<p class="text-sm font-medium">Active Diagnoses</p>
						<div class="flex flex-wrap gap-1 mt-1">
							{#if recentRecords.length > 0}
								{#each recentRecords.flatMap(r => r.diagnoses.filter(d => d.status === 'active' || d.status === 'chronic')).slice(0, 3) as diagnosis}
									<Badge variant="outline" class="text-xs">{diagnosis.code}</Badge>
								{/each}
							{:else}
								<p class="text-xs text-muted-foreground">None</p>
							{/if}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- SOAP Note Editor -->
		<SOAPNoteEditor
			patientId={patient.id}
			doctorId={getCurrentUserId()}
			{appointmentId}
			noteType="consultation"
			on:save={handleSave}
			on:lock={handleLock}
			on:cancel={handleCancel}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('patient.profile.patientNotFound')}</p>
	</div>
{/if}
