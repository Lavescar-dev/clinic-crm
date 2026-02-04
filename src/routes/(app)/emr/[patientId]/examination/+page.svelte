<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Textarea } from '$components/ui/textarea';
	import { DatePicker } from '$components/shared';
	import FormField from '$components/shared/FormField.svelte';
	import { emr as emrStore } from '$stores/emr';
	import { patients as patientStore } from '$stores/patients';
	import { users as userStore } from '$stores/users';
	import { medicalRecordSchema, vitalSignsSchema } from '$types';
	import { nanoid } from 'nanoid';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { MedicalRecord, VitalSigns, Patient } from '$types';
	import { toast } from 'svelte-sonner';

	let medicalRecord: Partial<MedicalRecord> = {
		id: nanoid(),
		patientId: '',
		doctorId: '', // Current logged-in user
		visitDate: new Date(),
		chiefComplaint: '',
		presentIllness: '',
		physicalExamination: '',
		vitalSigns: {},
		diagnoses: [],
		prescriptions: [],
		labResults: [],
		procedures: [],
		assessment: '',
		plan: '',
		followUpInstructions: '',
		notes: '',
		createdAt: new Date(),
		updatedAt: new Date()
	};
	let patient: Patient | undefined;
	let loading = true;
	let isEditing = false;
	let errors: Record<string, string> = {};

	onMount(async () => {
		const patientId = $page.params.patientId as string;
		const emrId = $page.params.emrId as string; // Optional: for editing existing record

		patient = await patientStore.getPatientById(patientId);
		if (!patient) {
			toast.error($t('patient.profile.patientNotFound'));
			goto('/emr');
			return;
		}
		medicalRecord.patientId = patientId;
		medicalRecord.patientName = patient.fullName;

		// Mock logged-in doctor
		const doctor = get(userStore).data.find((u) => u.role === 'doctor');
		if (doctor) {
			medicalRecord.doctorId = doctor.id;
			medicalRecord.doctorName = doctor.fullName;
		}

		if (emrId) {
			const fetchedRecord = await emrStore.getMedicalRecordById(emrId);
			if (fetchedRecord && fetchedRecord.patientId === patientId) {
				medicalRecord = fetchedRecord;
				isEditing = true;
			} else {
				toast.error($t('emr.form.recordNotFound'));
				goto(`/emr/${patientId}`);
			}
		}
		loading = false;
	});

	async function handleSubmit() {
		if (!patient) return;

		// Validate medical record
		const medicalRecordResult = medicalRecordSchema.safeParse(medicalRecord);
		if (!medicalRecordResult.success) {
			errors = medicalRecordResult.error.flatten().fieldErrors;
			toast.error($t('common.formErrors'));
			return;
		}

		// Validate vital signs separately if present
		if (medicalRecord.vitalSigns) {
			const vitalSignsResult = vitalSignsSchema.safeParse(medicalRecord.vitalSigns);
			if (!vitalSignsResult.success) {
				// Map vital signs errors
				errors = { ...errors, ...vitalSignsResult.error.flatten().fieldErrors };
				toast.error($t('common.formErrors'));
				return;
			}
		}

		if (isEditing) {
			await emrStore.updateMedicalRecord(medicalRecord.id!, medicalRecord);
			toast.success($t('emr.form.updateSuccess'));
		} else {
			await emrStore.addMedicalRecord(medicalRecord as MedicalRecord);
			toast.success($t('emr.form.addSuccess'));
		}
		goto(`/emr/${patient.id}`);
	}

	$: medicalRecord.visitDate, (errors.visitDate = '');
	$: medicalRecord.chiefComplaint, (errors.chiefComplaint = '');
	$: medicalRecord.assessment, (errors.assessment = '');
	$: medicalRecord.plan, (errors.plan = '');
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if patient}
	<div class="space-y-6 p-4 md:p-6">
		<h1 class="text-3xl font-bold">
			{#if isEditing}
				{$t('emr.form.editExaminationTitle', { name: patient.fullName })}
			{:else}
				{$t('emr.form.newExaminationTitle', { name: patient.fullName })}
			{/if}
		</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<Card>
				<CardHeader><CardTitle>{$t('emr.form.visitDetails')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<FormField label={$t('emr.form.visitDate')} error={errors.visitDate}>
						<DatePicker bind:date={medicalRecord.visitDate} placeholder={$t('emr.form.visitDatePlaceholder')} />
					</FormField>
					<FormField label={$t('emr.form.chiefComplaint')} error={errors.chiefComplaint}>
						<Input bind:value={medicalRecord.chiefComplaint} placeholder={$t('emr.form.chiefComplaintPlaceholder')} />
					</FormField>
					<FormField class="md:col-span-2" label={$t('emr.form.presentIllness')} error={errors.presentIllness}>
						<Textarea bind:value={medicalRecord.presentIllness} placeholder={$t('emr.form.presentIllnessPlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>{$t('emr.form.physicalExamination')}</CardTitle></CardHeader>
				<CardContent>
					<FormField label={$t('emr.form.examinationNotes')} error={errors.physicalExamination}>
						<Textarea bind:value={medicalRecord.physicalExamination} placeholder={$t('emr.form.examinationNotesPlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>{$t('emr.form.vitalSigns')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-3">
					<FormField label={$t('emr.form.temperature')} error={errors['vitalSigns.temperature']}>
						<Input bind:value={medicalRecord.vitalSigns.temperature} type="number" step="0.1" placeholder="36.5" />
					</FormField>
					<FormField label={$t('emr.form.systolicBP')} error={errors['vitalSigns.bloodPressureSystolic']}>
						<Input bind:value={medicalRecord.vitalSigns.bloodPressureSystolic} type="number" placeholder="120" />
					</FormField>
					<FormField label={$t('emr.form.diastolicBP')} error={errors['vitalSigns.bloodPressureDiastolic']}>
						<Input bind:value={medicalRecord.vitalSigns.bloodPressureDiastolic} type="number" placeholder="80" />
					</FormField>
					<FormField label={$t('emr.form.heartRate')} error={errors['vitalSigns.heartRate']}>
						<Input bind:value={medicalRecord.vitalSigns.heartRate} type="number" placeholder="72" />
					</FormField>
					<FormField label={$t('emr.form.respiratoryRate')} error={errors['vitalSigns.respiratoryRate']}>
						<Input bind:value={medicalRecord.vitalSigns.respiratoryRate} type="number" placeholder="16" />
					</FormField>
					<FormField label={$t('emr.form.oxygenSaturation')} error={errors['vitalSigns.oxygenSaturation']}>
						<Input bind:value={medicalRecord.vitalSigns.oxygenSaturation} type="number" placeholder="98" />
					</FormField>
					<FormField label={$t('emr.form.weight')} error={errors['vitalSigns.weight']}>
						<Input bind:value={medicalRecord.vitalSigns.weight} type="number" step="0.1" placeholder="70.5" />
					</FormField>
					<FormField label={$t('emr.form.height')} error={errors['vitalSigns.height']}>
						<Input bind:value={medicalRecord.vitalSigns.height} type="number" placeholder="175" />
					</FormField>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>{$t('emr.form.assessmentAndPlan')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4">
					<FormField label={$t('emr.form.assessment')} error={errors.assessment}>
						<Textarea bind:value={medicalRecord.assessment} placeholder={$t('emr.form.assessmentPlaceholder')} />
					</FormField>
					<FormField label={$t('emr.form.plan')} error={errors.plan}>
						<Textarea bind:value={medicalRecord.plan} placeholder={$t('emr.form.planPlaceholder')} />
					</FormField>
					<FormField label={$t('emr.form.followUpInstructions')} error={errors.followUpInstructions}>
						<Textarea bind:value={medicalRecord.followUpInstructions} placeholder={$t('emr.form.followUpInstructionsPlaceholder')} />
					</FormField>
					<FormField label={$t('emr.form.notes')} error={errors.notes}>
						<Textarea bind:value={medicalRecord.notes} placeholder={$t('emr.form.notesPlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<div class="flex justify-end gap-2">
				<Button variant="outline" on:click={() => goto(`/emr/${patient.id}`)}>{$t('common.cancel')}</Button>
				<Button type="submit">
					{#if isEditing}
						{$t('emr.form.updateExamination')}
					{:else}
						{$t('emr.form.addExamination')}
					{/if}
				</Button>
			</div>
		</form>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('patient.profile.patientNotFound')}</p>
	</div>
{/if}
