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
	import { prescriptionSchema, medicationSchema } from '$types';
	import { nanoid } from 'nanoid';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Prescription, Medication, Patient } from '$types';
	import { toast } from 'svelte-sonner';
	import { Plus, X } from 'lucide-svelte';

	let prescription: Partial<Prescription> = {
		id: nanoid(),
		medications: [],
		notes: '',
		prescribedDate: new Date(),
		prescribedBy: '' // Current logged-in user
	};
	let patient: Patient | undefined;
	let loading = true;
	let isEditing = false;
	let errors: Record<string, string> = {};

	onMount(async () => {
		const patientId = $page.params.patientId as string;
		const prescriptionId = $page.params.prescriptionId as string; // Optional: for editing existing record

		patient = await patientStore.getPatientById(patientId);
		if (!patient) {
			toast.error($t('patient.profile.patientNotFound'));
			goto('/emr');
			return;
		}

		// Mock logged-in doctor
		const doctor = get(userStore).data.find((u) => u.role === 'doctor');
		if (doctor) {
			prescription.prescribedBy = doctor.fullName;
		}

		if (prescriptionId) {
			const fetchedPrescription = await emrStore.getPrescriptionById(patientId, prescriptionId);
			if (fetchedPrescription) {
				prescription = fetchedPrescription;
				isEditing = true;
			} else {
				toast.error($t('emr.form.prescriptionNotFound'));
				goto(`/emr/${patientId}`);
			}
		} else {
			// Add an initial empty medication for new prescriptions
			addMedication();
		}
		loading = false;
	});

	function addMedication() {
		prescription.medications = [...(prescription.medications || []), { id: nanoid(), name: '', dosage: '', frequency: '', duration: '', startDate: new Date() }];
	}

	function removeMedication(id: string) {
		prescription.medications = prescription.medications?.filter((med) => med.id !== id);
	}

	async function handleSubmit() {
		if (!patient || !prescription.medications || prescription.medications.length === 0) {
			toast.error($t('emr.form.atLeastOneMedication'));
			return;
		}

		// Validate prescription
		const prescriptionResult = prescriptionSchema.safeParse(prescription);
		if (!prescriptionResult.success) {
			errors = prescriptionResult.error.flatten().fieldErrors;
			toast.error($t('common.formErrors'));
			return;
		}

		// Validate each medication
		for (const med of prescription.medications) {
			const medicationResult = medicationSchema.safeParse(med);
			if (!medicationResult.success) {
				errors = { ...errors, ...medicationResult.error.flatten().fieldErrors };
				toast.error($t('common.formErrors'));
				return;
			}
		}

		if (isEditing) {
			await emrStore.updatePrescription(patient.id, prescription.id!, prescription);
			toast.success($t('emr.form.updatePrescriptionSuccess'));
		} else {
			await emrStore.addPrescription(patient.id, prescription as Prescription);
			toast.success($t('emr.form.addPrescriptionSuccess'));
		}
		goto(`/emr/${patient.id}`);
	}

	$: prescription.prescribedDate, (errors.prescribedDate = '');
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if patient}
	<div class="space-y-6 p-4 md:p-6">
		<h1 class="text-3xl font-bold">
			{#if isEditing}
				{$t('emr.form.editPrescriptionTitle', { name: patient.fullName })}
			{:else}
				{$t('emr.form.newPrescriptionTitle', { name: patient.fullName })}
			{/if}
		</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<Card>
				<CardHeader><CardTitle>{$t('emr.form.prescriptionDetails')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4">
					<FormField label={$t('emr.form.prescribedDate')} error={errors.prescribedDate}>
						<DatePicker bind:date={prescription.prescribedDate} placeholder={$t('emr.form.prescribedDatePlaceholder')} />
					</FormField>
					<p><strong>{$t('emr.form.prescribedBy')}:</strong> {prescription.prescribedBy}</p>
					<FormField label={$t('emr.form.notes')} error={errors.notes}>
						<Textarea bind:value={prescription.notes} placeholder={$t('emr.form.notesPlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle>{$t('emr.form.medications')}</CardTitle>
					<Button type="button" variant="outline" size="sm" on:click={addMedication}>
						<Plus class="mr-2 h-4 w-4" />
						{$t('emr.form.addMedication')}
					</Button>
				</CardHeader>
				<CardContent class="space-y-4">
					{#each prescription.medications || [] as med, i (med.id)}
						<div class="border rounded-md p-4 space-y-3 relative">
							<h4 class="font-semibold">{$t('emr.form.medication')} #{i + 1}</h4>
							<Button type="button" variant="ghost" size="icon" class="absolute top-2 right-2" on:click={() => removeMedication(med.id)}>
								<X class="h-4 w-4" />
							</Button>
							<div class="grid gap-4 md:grid-cols-2">
								<FormField label={$t('emr.form.medicationName')} error={errors[`medication.${med.id}.name`]}>
									<Input bind:value={med.name} placeholder={$t('emr.form.medicationNamePlaceholder')} />
								</FormField>
								<FormField label={$t('emr.form.dosage')} error={errors[`medication.${med.id}.dosage`]}>
									<Input bind:value={med.dosage} placeholder={$t('emr.form.dosagePlaceholder')} />
								</FormField>
								<FormField label={$t('emr.form.frequency')} error={errors[`medication.${med.id}.frequency`]}>
									<Input bind:value={med.frequency} placeholder={$t('emr.form.frequencyPlaceholder')} />
								</FormField>
								<FormField label={$t('emr.form.duration')} error={errors[`medication.${med.id}.duration`]}>
									<Input bind:value={med.duration} placeholder={$t('emr.form.durationPlaceholder')} />
								</FormField>
								<FormField label={$t('emr.form.startDate')} error={errors[`medication.${med.id}.startDate`]}>
									<DatePicker bind:date={med.startDate} placeholder={$t('emr.form.startDatePlaceholder')} />
								</FormField>
								<FormField label={$t('emr.form.endDate')} error={errors[`medication.${med.id}.endDate`]}>
									<DatePicker bind:date={med.endDate} placeholder={$t('emr.form.endDatePlaceholder')} />
								</FormField>
								<FormField class="md:col-span-2" label={$t('emr.form.instructions')} error={errors[`medication.${med.id}.instructions`]}>
									<Textarea bind:value={med.instructions} placeholder={$t('emr.form.instructionsPlaceholder')} />
								</FormField>
							</div>
						</div>
					{/each}
				</CardContent>
			</Card>

			<div class="flex justify-end gap-2">
				<Button variant="outline" on:click={() => goto(`/emr/${patient.id}`)}>{$t('common.cancel')}</Button>
				<Button type="submit">
					{#if isEditing}
						{$t('emr.form.updatePrescription')}
					{:else}
						{$t('emr.form.addPrescription')}
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
