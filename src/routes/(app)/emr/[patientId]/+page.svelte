<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { PlusCircle, FileText, Stethoscope, Pill, FlaskConical, HeartPulse, AlertTriangle, Lock, Edit, ArrowRightLeft } from 'lucide-svelte';
	import { emr as emrStore } from '$stores/emr';
	import { patients as patientStore } from '$stores/patients';
	import { prescriptions as prescriptionsStore } from '$stores/prescriptions';
	import { clinicalNotes as clinicalNotesStore } from '$stores/clinicalNotes';
	import { goto } from '$app/navigation';
	import type { Patient, MedicalRecord, Diagnosis, Medication, Prescription, LabResult } from '$types';
	import type { PrescriptionTracking, DrugInteraction } from '$lib/types/prescription';
	import type { ClinicalNote } from '$lib/types/clinicalNote';
	import { formatDate } from '$utils/date';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';
	import PrescriptionForm from '$lib/components/emr/PrescriptionForm.svelte';

	let patient: Patient | undefined = $state(undefined);
	let medicalRecords: MedicalRecord[] = $state([]);
	let loading = $state(true);
	let prescriptionHistory: PrescriptionTracking[] = $state([]);
	let activePrescriptions: PrescriptionTracking[] = $state([]);
	let patientInteractions: DrugInteraction[] = $state([]);
	let showPrescriptionForm = $state(false);
	let clinicalNotes: ClinicalNote[] = $state([]);
	let expandedNoteId: string | null = $state(null);

	onMount(async () => {
		const patientId = $page.params.patientId as string;
		patient = await patientStore.getPatientById(patientId);
		if (patient) {
			medicalRecords = await emrStore.getMedicalRecordsByPatientId(patientId);
			medicalRecords = medicalRecords.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

			// Load prescription tracking data
			prescriptionHistory = await prescriptionsStore.getPrescriptionHistory(patientId);
			activePrescriptions = await prescriptionsStore.getActivePrescriptions(patientId);
			patientInteractions = await prescriptionsStore.getPatientInteractions(patientId);

			// Load clinical notes
			await clinicalNotesStore.loadPatientNotes(patientId);
			const notesResult = await clinicalNotesStore.data;
			clinicalNotes = notesResult.notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		} else {
			toast.error($t('patient.profile.patientNotFound'));
			goto('/emr');
		}
		loading = false;
	});

	function getDiagnosisStatusVariant(status: Diagnosis['status']) {
		switch (status) {
			case 'active':
				return 'info';
			case 'resolved':
				return 'success';
			case 'chronic':
				return 'warning';
			default:
				return 'default';
		}
	}

	function getLabResultStatusVariant(status: LabResult['status']) {
		switch (status) {
			case 'normal':
				return 'success';
			case 'abnormal':
				return 'warning';
			case 'critical':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function getPrescriptionStatusVariant(status: string) {
		switch (status) {
			case 'active':
				return 'success';
			case 'filled':
				return 'info';
			case 'expired':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'default';
		}
	}

	async function handlePrescriptionCreated(event: CustomEvent) {
		showPrescriptionForm = false;
		toast.success('Prescription created successfully');
		// Reload prescription data
		if (patient) {
			prescriptionHistory = await prescriptionsStore.getPrescriptionHistory(patient.id);
			activePrescriptions = await prescriptionsStore.getActivePrescriptions(patient.id);
			patientInteractions = await prescriptionsStore.getPatientInteractions(patient.id);
		}
	}

	function handlePrescriptionCancel() {
		showPrescriptionForm = false;
	}

	function getCurrentUserId(): string {
		// TODO: Get from auth context
		return 'current-doctor-id';
	}

	function getNoteTypeVariant(noteType: ClinicalNote['noteType']) {
		switch (noteType) {
			case 'consultation':
				return 'default';
			case 'followup':
				return 'info';
			case 'emergency':
				return 'destructive';
			case 'procedure':
				return 'warning';
			case 'discharge':
				return 'success';
			default:
				return 'outline';
		}
	}

	function toggleNoteExpansion(noteId: string) {
		expandedNoteId = expandedNoteId === noteId ? null : noteId;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if patient}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{$t('emr.patientEMR', { name: patient.fullName })}</h1>
			<div class="flex gap-2">
				<Button on:click={() => goto(`/emr/${patient?.id}/examination`)}>
					<Stethoscope class="mr-2 h-4 w-4" />
					{$t('emr.newExamination')}
				</Button>
				<Button on:click={() => showPrescriptionForm = true}>
					<Pill class="mr-2 h-4 w-4" />
					Write Prescription
				</Button>
				<Button variant="outline" on:click={() => goto(`/referrals/new?patientId=${patient?.id}`)}>
					<ArrowRightLeft class="mr-2 h-4 w-4" />
					{$t('referrals.newReferral')}
				</Button>
			</div>
		</div>

		<!-- Active Prescriptions & Interaction Warnings -->
		{#if activePrescriptions.length > 0}
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle class="flex items-center gap-2">
							<Pill class="h-5 w-5" />
							Current Medications ({activePrescriptions.length})
						</CardTitle>
						{#if patientInteractions.length > 0}
							<Badge variant="destructive">
								<AlertTriangle class="h-3 w-3 mr-1" />
								{patientInteractions.length} Interaction(s)
							</Badge>
						{/if}
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each activePrescriptions as prescription}
							<div class="border rounded-lg p-3">
								<div class="flex items-start justify-between mb-2">
									<div>
										<p class="font-medium">{prescription.prescriptionNumber}</p>
										<p class="text-sm text-muted-foreground">
											Issued: {format(new Date(prescription.issuedAt), 'MMM dd, yyyy')}
											• Valid until: {format(new Date(prescription.validUntil), 'MMM dd, yyyy')}
										</p>
									</div>
									<Button variant="outline" size="sm" on:click={() => goto(`/prescriptions/${prescription.id}`)}>
										View
									</Button>
								</div>
								<div class="text-sm">
									<p class="font-medium mb-1">Medications:</p>
									<ul class="space-y-1">
										{#each prescription.medications as med}
											<li class="text-muted-foreground">
												• {med.drugName} {med.dosage} - {med.frequency}
											</li>
										{/each}
									</ul>
								</div>
							</div>
						{/each}
					</div>

					{#if patientInteractions.length > 0}
						<div class="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
							<p class="font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-2">
								<AlertTriangle class="h-4 w-4" />
								Drug Interaction Warnings
							</p>
							<div class="space-y-2">
								{#each patientInteractions as interaction}
									<div class="text-sm text-amber-800 dark:text-amber-200">
										<p class="font-medium">
											{interaction.drug1} + {interaction.drug2}
											<Badge variant={interaction.severity === 'major' || interaction.severity === 'contraindicated' ? 'destructive' : 'warning'} class="ml-2">
												{interaction.severity}
											</Badge>
										</p>
										<p class="text-xs">{interaction.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}

		<!-- Prescription Form Modal/Section -->
		{#if showPrescriptionForm && patient}
			<div class="space-y-4">
				<PrescriptionForm
					patientId={patient.id}
					patientAge={patient.birthDate ? Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined}
					doctorId={getCurrentUserId()}
					on:success={handlePrescriptionCreated}
					on:cancel={handlePrescriptionCancel}
				/>
			</div>
		{/if}

		<Card>
			<CardHeader><CardTitle>{$t('emr.overview')}</CardTitle></CardHeader>
			<CardContent>
				<p><strong>{$t('patient.form.tcNo')}:</strong> {patient.tcNo}</p>
				<p><strong>{$t('patient.form.birthDate')}:</strong> {patient.birthDate ? formatDate(patient.birthDate) : '-'}</p>
				<p><strong>{$t('patient.form.gender')}:</strong> {$t(`patient.gender.${patient.gender}`)}</p>
			</CardContent>
		</Card>

		<Tabs defaultValue="records" class="space-y-4">
			<TabsList>
				<TabsTrigger value="records">{$t('emr.medicalRecords')}</TabsTrigger>
				<TabsTrigger value="clinicalNotes">{$t('emr.clinicalNotes')}</TabsTrigger>
				<TabsTrigger value="diagnoses">{$t('emr.diagnoses')}</TabsTrigger>
				<TabsTrigger value="prescriptions">{$t('emr.prescriptions')}</TabsTrigger>
				<TabsTrigger value="labResults">{$t('emr.labResults')}</TabsTrigger>
				<TabsTrigger value="vitalSignsHistory">{$t('emr.vitalSignsHistory')}</TabsTrigger>
			</TabsList>

			<TabsContent value="records">
				<div class="space-y-4">
					{#if medicalRecords.length > 0}
						{#each medicalRecords as record (record.id)}
							<Card>
								<CardHeader class="flex flex-row items-center justify-between">
									<CardTitle>{$t('emr.visitDate')}: {formatDate(record.visitDate)}</CardTitle>
									<Button variant="outline" size="sm" on:click={() => goto(`/emr/${patient?.id}/examination/${record.id}`)}>
										{$t('common.view')}
									</Button>
								</CardHeader>
								<CardContent class="space-y-2">
									<p><strong>{$t('emr.chiefComplaint')}:</strong> {record.chiefComplaint}</p>
									<p><strong>{$t('emr.doctor')}:</strong> {record.doctorName}</p>
									<p><strong>{$t('emr.assessment')}:</strong> {record.assessment}</p>
									<p><strong>{$t('emr.plan')}:</strong> {record.plan}</p>
								</CardContent>
							</Card>
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('emr.noMedicalRecords')}</p>
					{/if}
				</div>
			</TabsContent>

			<TabsContent value="clinicalNotes">
				<div class="space-y-4">
					<div class="flex justify-between items-center mb-4">
						<p class="text-sm text-muted-foreground">
							{clinicalNotes.length} {clinicalNotes.length === 1 ? 'note' : 'notes'}
						</p>
						<Button on:click={() => goto(`/emr/${patient?.id}/note/new`)}>
							<FileText class="mr-2 h-4 w-4" />
							{$t('emr.clinicalNote.newNote')}
						</Button>
					</div>

					{#if clinicalNotes.length > 0}
						{#each clinicalNotes as note (note.id)}
							<Card>
								<CardHeader>
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<div class="flex items-center gap-2 mb-1">
												<CardTitle class="text-lg">{format(new Date(note.date), 'MMM dd, yyyy')}</CardTitle>
												<Badge variant={getNoteTypeVariant(note.noteType)}>
													{$t(`emr.clinicalNote.noteType.${note.noteType}`)}
												</Badge>
												{#if note.locked}
													<Badge variant="outline" class="bg-green-50 dark:bg-green-950">
														<Lock class="h-3 w-3 mr-1" />
														{$t('emr.clinicalNote.locked')}
													</Badge>
												{:else}
													<Badge variant="outline" class="bg-amber-50 dark:bg-amber-950">
														{$t('emr.clinicalNote.unlocked')}
													</Badge>
												{/if}
											</div>
											<p class="text-sm text-muted-foreground">
												{#if note.doctorName}
													By: {note.doctorName}
												{/if}
												{#if note.locked && note.signedAt}
													• Signed: {format(new Date(note.signedAt), 'MMM dd, yyyy HH:mm')}
												{/if}
											</p>
										</div>
										<div class="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												on:click={() => toggleNoteExpansion(note.id)}
											>
												{expandedNoteId === note.id ? 'Collapse' : $t('emr.clinicalNote.preview')}
											</Button>
											<Button
												variant="outline"
												size="sm"
												on:click={() => goto(`/emr/${patient?.id}/note/${note.id}`)}
											>
												{note.locked ? $t('emr.clinicalNote.viewNote') : $t('emr.clinicalNote.editNote')}
											</Button>
										</div>
									</div>
								</CardHeader>

								{#if expandedNoteId === note.id}
									<CardContent class="space-y-4 border-t pt-4">
										<!-- SOAP Preview -->
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div class="space-y-2">
												<p class="font-semibold text-sm">S - {$t('emr.clinicalNote.soap.subjective')}</p>
												<p class="text-sm text-muted-foreground whitespace-pre-wrap">
													{note.soap.subjective.length > 150
														? note.soap.subjective.substring(0, 150) + '...'
														: note.soap.subjective}
												</p>
											</div>
											<div class="space-y-2">
												<p class="font-semibold text-sm">O - {$t('emr.clinicalNote.soap.objective')}</p>
												<p class="text-sm text-muted-foreground whitespace-pre-wrap">
													{note.soap.objective.length > 150
														? note.soap.objective.substring(0, 150) + '...'
														: note.soap.objective}
												</p>
											</div>
											<div class="space-y-2">
												<p class="font-semibold text-sm">A - {$t('emr.clinicalNote.soap.assessment')}</p>
												<p class="text-sm text-muted-foreground whitespace-pre-wrap">
													{note.soap.assessment.length > 150
														? note.soap.assessment.substring(0, 150) + '...'
														: note.soap.assessment}
												</p>
											</div>
											<div class="space-y-2">
												<p class="font-semibold text-sm">P - {$t('emr.clinicalNote.soap.plan')}</p>
												<p class="text-sm text-muted-foreground whitespace-pre-wrap">
													{note.soap.plan.length > 150
														? note.soap.plan.substring(0, 150) + '...'
														: note.soap.plan}
												</p>
											</div>
										</div>

										<!-- Diagnosis and Procedure Codes -->
										{#if note.diagnosisCodes && note.diagnosisCodes.length > 0}
											<div>
												<p class="font-semibold text-sm mb-2">ICD-10 Codes:</p>
												<div class="flex flex-wrap gap-2">
													{#each note.diagnosisCodes as code}
														<Badge variant="secondary">{code}</Badge>
													{/each}
												</div>
											</div>
										{/if}

										{#if note.procedureCodes && note.procedureCodes.length > 0}
											<div>
												<p class="font-semibold text-sm mb-2">Procedure Codes:</p>
												<div class="flex flex-wrap gap-2">
													{#each note.procedureCodes as code}
														<Badge variant="secondary">{code}</Badge>
													{/each}
												</div>
											</div>
										{/if}
									</CardContent>
								{/if}
							</Card>
						{/each}
					{:else}
						<p class="text-center text-muted-foreground py-8">{$t('emr.clinicalNote.noClinicalNotes')}</p>
					{/if}
				</div>
			</TabsContent>

			<TabsContent value="diagnoses">
				<div class="space-y-4">
					{#if medicalRecords.some(r => r.diagnoses.length > 0)}
						{#each medicalRecords as record (record.id)}
							{#each record.diagnoses as diagnosis (diagnosis.id)}
								<Card>
									<CardContent class="space-y-2 pt-6">
										<p><strong>{$t('emr.diagnosis')}:</strong> {diagnosis.name} ({diagnosis.code})</p>
										<p><strong>{$t('emr.diagnosedOn')}:</strong> {formatDate(diagnosis.diagnosedDate)}</p>
										<p><strong>{$t('emr.status')}:</strong> <Badge variant={getDiagnosisStatusVariant(diagnosis.status)}>{$t(`emr.diagnosisStatus.${diagnosis.status}`)}</Badge></p>
										{#if diagnosis.description}<p><strong>{$t('emr.description')}:</strong> {diagnosis.description}</p>{/if}
									</CardContent>
								</Card>
							{/each}
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('emr.noDiagnoses')}</p>
					{/if}
				</div>
			</TabsContent>

			<TabsContent value="prescriptions">
				<div class="space-y-4">
					{#if prescriptionHistory.length > 0}
						{#each prescriptionHistory as prescription (prescription.id)}
							<Card>
								<CardHeader>
									<div class="flex items-center justify-between">
										<CardTitle>{prescription.prescriptionNumber}</CardTitle>
										<Badge variant={getPrescriptionStatusVariant(prescription.status)}>{prescription.status}</Badge>
									</div>
									<p class="text-sm text-muted-foreground mt-1">
										Issued: {format(new Date(prescription.issuedAt), 'MMM dd, yyyy')}
										{#if prescription.doctorName}• By: {prescription.doctorName}{/if}
									</p>
								</CardHeader>
								<CardContent class="space-y-3">
									<div>
										<p class="font-medium mb-2">Medications:</p>
										<div class="space-y-2">
											{#each prescription.medications as medication}
												<div class="flex items-start gap-2 text-sm">
													<Pill class="h-4 w-4 text-muted-foreground mt-0.5" />
													<div class="flex-1">
														<p class="font-medium">{medication.drugName} {medication.dosage}</p>
														<p class="text-muted-foreground text-xs">
															{medication.frequency} • {medication.duration} • Qty: {medication.quantity}
														</p>
														{#if medication.instructions}
															<p class="text-xs mt-1">{medication.instructions}</p>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>

									{#if prescription.diagnosisName}
										<div>
											<p class="text-sm"><strong>Diagnosis:</strong> {prescription.diagnosisName}</p>
											{#if prescription.diagnosisICD10}
												<p class="text-xs text-muted-foreground">ICD-10: {prescription.diagnosisICD10}</p>
											{/if}
										</div>
									{/if}

									{#if prescription.notes}
										<div>
											<p class="text-sm"><strong>Notes:</strong> {prescription.notes}</p>
										</div>
									{/if}

									{#if prescription.status === 'filled' && prescription.pharmacyFilled}
										<div class="p-2 bg-muted rounded text-sm">
											<p><strong>Filled at:</strong> {prescription.pharmacyFilled.pharmacyName}</p>
											<p class="text-xs text-muted-foreground">
												{format(new Date(prescription.pharmacyFilled.filledAt), 'MMM dd, yyyy')}
											</p>
										</div>
									{/if}

									<div class="flex gap-2">
										<Button variant="outline" size="sm" on:click={() => goto(`/prescriptions/${prescription.id}`)}>
											View Details
										</Button>
									</div>
								</CardContent>
							</Card>
						{/each}
					{:else if medicalRecords.some(r => r.prescriptions.length > 0)}
						<!-- Fallback to old EMR prescriptions if no tracking data -->
						{#each medicalRecords as record (record.id)}
							{#each record.prescriptions as prescription (prescription.id)}
								<Card>
									<CardHeader><CardTitle>{$t('emr.prescriptionOn')}: {formatDate(prescription.prescribedDate)} - {$t('emr.prescribedBy')}: {prescription.prescribedBy}</CardTitle></CardHeader>
									<CardContent class="space-y-2">
										{#each prescription.medications as medication (medication.id)}
											<p>{medication.name} - {medication.dosage}, {medication.frequency}, {medication.duration}</p>
										{/each}
										{#if prescription.notes}<p><strong>{$t('emr.notes')}:</strong> {prescription.notes}</p>{/if}
									</CardContent>
								</Card>
							{/each}
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('emr.noPrescriptions')}</p>
					{/if}
				</div>
			</TabsContent>

			<TabsContent value="labResults">
				<div class="space-y-4">
					{#if medicalRecords.some(r => r.labResults && r.labResults.length > 0)}
						{#each medicalRecords as record (record.id)}
							{#each record.labResults as labResult (labResult.id)}
								<Card>
									<CardContent class="space-y-2 pt-6">
										<p><strong>{$t('emr.testName')}:</strong> {labResult.testName} ({labResult.testType})</p>
										<p><strong>{$t('emr.result')}:</strong> {labResult.result} {labResult.unit || ''}</p>
										<p><strong>{$t('emr.status')}:</strong> <Badge variant={getLabResultStatusVariant(labResult.status)}>{$t(`emr.labResultStatus.${labResult.status}`)}</Badge></p>
										<p><strong>{$t('emr.testDate')}:</strong> {formatDate(labResult.testDate)}</p>
										{#if labResult.notes}<p><strong>{$t('emr.notes')}:</strong> {labResult.notes}</p>{/if}
									</CardContent>
								</Card>
							{/each}
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('emr.noLabResults')}</p>
					{/if}
				</div>
			</TabsContent>

			<TabsContent value="vitalSignsHistory">
				<div class="space-y-4">
					{#if medicalRecords.some(r => r.vitalSigns)}
						{#each medicalRecords as record (record.id)}
							{#if record.vitalSigns}
								<Card>
									<CardHeader><CardTitle>{$t('emr.vitalSignsOn')}: {formatDate(record.visitDate)}</CardTitle></CardHeader>
									<CardContent class="grid grid-cols-2 gap-2">
										{#if record.vitalSigns.temperature}<p><strong>{$t('emr.temperature')}:</strong> {record.vitalSigns.temperature}°C</p>{/if}
										{#if record.vitalSigns.bloodPressureSystolic && record.vitalSigns.bloodPressureDiastolic}<p><strong>{$t('emr.bloodPressure')}:</strong> {record.vitalSigns.bloodPressureSystolic}/{record.vitalSigns.bloodPressureDiastolic} mmHg</p>{/if}
										{#if record.vitalSigns.heartRate}<p><strong>{$t('emr.heartRate')}:</strong> {record.vitalSigns.heartRate} bpm</p>{/if}
										{#if record.vitalSigns.respiratoryRate}<p><strong>{$t('emr.respiratoryRate')}:</strong> {record.vitalSigns.respiratoryRate} /min</p>{/if}
										{#if record.vitalSigns.oxygenSaturation}<p><strong>{$t('emr.oxygenSaturation')}:</strong> {record.vitalSigns.oxygenSaturation}%</p>{/if}
										{#if record.vitalSigns.weight}<p><strong>{$t('emr.weight')}:</strong> {record.vitalSigns.weight} kg</p>{/if}
										{#if record.vitalSigns.height}<p><strong>{$t('emr.height')}:</strong> {record.vitalSigns.height} cm</p>{/if}
										{#if record.vitalSigns.bmi}<p><strong>{$t('emr.bmi')}:</strong> {record.vitalSigns.bmi}</p>{/if}
									</CardContent>
								</Card>
							{/if}
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('emr.noVitalSigns')}</p>
					{/if}
				</div>
			</TabsContent>
		</Tabs>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('patient.profile.patientNotFound')}</p>
	</div>
{/if}
