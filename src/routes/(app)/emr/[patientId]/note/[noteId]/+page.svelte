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
	import type { ClinicalNote, UpdateClinicalNoteDto, LockClinicalNoteDto } from '$lib/types/clinicalNote';
	import { formatDate } from '$utils/date';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';

	let patient: Patient | undefined | null = $state(undefined);
	let note: ClinicalNote | undefined = $state(undefined);
	let recentRecords: MedicalRecord[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		const patientId = $page.params.patientId as string;
		const noteId = $page.params.noteId as string;

		patient = await patientStore.getPatientById(patientId) || undefined;

		if (patient) {
			// Load the clinical note
			const noteResult = await clinicalNotesStore.getNote(noteId);
			if (noteResult.success && noteResult.data) {
				note = noteResult.data;

				// Verify the note belongs to this patient
				if (note.patientId !== patientId) {
					toast.error('Note does not belong to this patient');
					goto(`/emr/${patientId}`);
					return;
				}
			} else {
				toast.error('Clinical note not found');
				goto(`/emr/${patientId}`);
				return;
			}

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

	async function handleSave(event: CustomEvent<UpdateClinicalNoteDto>) {
		if (!note) return;

		const updates = event.detail;
		const result = await clinicalNotesStore.updateNote(note.id, updates);

		if (result.success) {
			toast.success($t('emr.clinicalNote.updatedSuccess'));
			// Reload the note to get updated data
			if (result.data) {
				note = result.data;
			}
		} else {
			toast.error(result.error || $t('emr.clinicalNote.updateFailed'));
		}
	}

	async function handleLock() {
		if (!note) return;

		const lockData: LockClinicalNoteDto = {
			signedBy: getCurrentUserId()
		};

		const result = await clinicalNotesStore.lockNote(note.id, lockData);

		if (result.success) {
			toast.success($t('emr.clinicalNote.lockedSuccess'));
			// Reload the note to get updated data
			if (result.data) {
				note = result.data;
			}
		} else {
			toast.error(result.error || $t('emr.clinicalNote.lockFailed'));
		}
	}

	function handleCancel() {
		goto(`/emr/${patient?.id}`);
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
{:else if patient && note}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" onclick={() => goto(`/emr/${patient?.id}`)}>
					<ArrowLeft class="h-4 w-4 mr-2" />
					{$t('common.back')}
				</Button>
				<div>
					<h1 class="text-3xl font-bold">
						{note.locked ? $t('emr.clinicalNote.viewNote') : $t('emr.clinicalNote.editNote')}
					</h1>
					<p class="text-sm text-muted-foreground mt-1">
						{format(new Date(note.date), 'MMMM dd, yyyy')}
						{#if note.locked && note.signedAt}
							• {$t('emr.clinicalNote.signed')}: {format(new Date(note.signedAt), 'MMM dd, yyyy HH:mm')}
						{/if}
					</p>
				</div>
			</div>
			<div>
				<Badge variant={note.locked ? 'outline' : 'default'} class="bg-green-50 dark:bg-green-950">
					{note.locked ? $t('emr.clinicalNote.locked') : $t('emr.clinicalNote.unlocked')}
				</Badge>
			</div>
		</div>

		<!-- Patient Context -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('patient.profile.patientContext')}</CardTitle>
				<CardDescription>Patient information at time of note</CardDescription>
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
						<p class="text-sm font-medium">Note Type</p>
						<p class="text-xs text-muted-foreground">
							{$t(`emr.clinicalNote.noteType.${note.noteType}`)}
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<Activity class="h-5 w-5 text-muted-foreground mt-0.5" />
					<div>
						<p class="text-sm font-medium">Created By</p>
						<p class="text-xs text-muted-foreground">
							{note.doctorName || 'Unknown'}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- SOAP Note Editor -->
		<SOAPNoteEditor
			patientId={patient.id}
			doctorId={note.doctorId}
			appointmentId={note.appointmentId}
			noteType={note.noteType}
			initialData={note.soap}
			isLocked={note.locked}
			on:save={handleSave}
			on:lock={handleLock}
			on:cancel={handleCancel}
			on:autosave={handleSave}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('patient.profile.patientNotFound')}</p>
	</div>
{/if}
