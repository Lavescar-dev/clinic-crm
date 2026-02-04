<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { Button } from '$components/ui/button';
	import { PlusCircle, FileText, Stethoscope, Pill, FlaskConical, HeartPulse } from 'lucide-svelte';
	import { emr as emrStore } from '$stores/emr';
	import { patients as patientStore } from '$stores/patients';
	import { goto } from '$app/navigation';
	import type { Patient, MedicalRecord, Diagnosis, Medication, Prescription, LabResult } from '$types';
	import { formatDate } from '$utils/date';
	import { toast } from 'svelte-sonner';

	let patient: Patient | undefined;
	let medicalRecords: MedicalRecord[] = [];
	let loading = true;

	onMount(async () => {
		const patientId = $page.params.patientId as string;
		patient = await patientStore.getPatientById(patientId);
		if (patient) {
			medicalRecords = await emrStore.getMedicalRecordsByPatientId(patientId);
			medicalRecords = medicalRecords.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
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
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if patient}
	<div class="space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{$t('emr.patientEMR', { name: patient.fullName })}</h1>
			<div class="flex gap-2">
				<Button on:click={() => goto(`/emr/${patient?.id}/examination`)}>
					<Stethoscope class="mr-2 h-4 w-4" />
					{$t('emr.newExamination')}
				</Button>
				<Button on:click={() => goto(`/emr/${patient?.id}/prescription`)}>
					<Pill class="mr-2 h-4 w-4" />
					{$t('emr.newPrescription')}
				</Button>
			</div>
		</div>

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
					{#if medicalRecords.some(r => r.prescriptions.length > 0)}
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
