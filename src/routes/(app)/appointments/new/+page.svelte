<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$i18n';
	import Button from '$components/ui/button/button.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Select from '$components/ui/select/select.svelte';
	import SelectContent from '$components/ui/select/select-content.svelte';
	import SelectItem from '$components/ui/select/select-item.svelte';
	import SelectTrigger from '$components/ui/select/select-trigger.svelte';
	import SelectValue from '$components/ui/select/select-value.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import { DatePicker } from '$components/shared';
	import FormField from '$components/shared/FormField.svelte';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { patients as patientStore } from '$stores/patients';
	import { users as userStore } from '$stores/users';
	import { appointmentSchema, createAppointmentDtoSchema } from '$types';
	import { nanoid } from 'nanoid';
	import { goto } from '$app/navigation';
	import type { Appointment, AppointmentType } from '$types';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';
	import { get } from 'svelte/store';

	let appointment: Partial<Appointment> = {
		id: nanoid(),
		patientId: '',
		doctorId: '',
		date: (() => {
			const next = new Date();
			while (next.getDay() === 0 || next.getDay() === 6) {
				next.setDate(next.getDate() + 1);
			}
			next.setHours(0, 0, 0, 0);
			return next;
		})(),
		startTime: '',
		endTime: '',
		type: undefined,
		reason: '',
		status: 'scheduled',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	let errors: Record<string, string> = {};

	const doctors = get(userStore).data.filter((user) => user.role === 'doctor');
	const patients = get(patientStore).data;

	const appointmentTypes: { value: AppointmentType; label: string }[] = [
		{ value: 'consultation', label: $t('appointment.type.consultation') },
		{ value: 'follow-up', label: $t('appointment.type.followUp') },
		{ value: 'emergency', label: $t('appointment.type.emergency') },
		{ value: 'routine-checkup', label: $t('appointment.type.routineCheckup') }
	];

	$: preselectedPatientId = $page.url.searchParams.get('patientId');
	$: if (preselectedPatientId && patients.some((patient) => patient.id === preselectedPatientId) && !appointment.patientId) {
		appointment.patientId = preselectedPatientId;
	}

	async function handleSubmit() {
		const createResult = createAppointmentDtoSchema.safeParse(appointment);
		if (!createResult.success) {
			errors = Object.fromEntries(
				Object.entries(createResult.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? ''])
			);
			return;
		}

		const dto = createResult.data;
		const start = new Date(`${format(dto.date, 'yyyy-MM-dd')}T${dto.startTime}:00`);
		const end = new Date(`${format(dto.date, 'yyyy-MM-dd')}T${dto.endTime}:00`);
		const duration = (end.getTime() - start.getTime()) / (1000 * 60);

		if (duration <= 0) {
			errors.endTime = $t('validation.endTimeBeforeStartTime');
			return;
		}

		const selectedPatient = patients.find((patient) => patient.id === dto.patientId);
		const selectedDoctor = doctors.find((doctor) => doctor.id === dto.doctorId);

		if (!selectedPatient || !selectedDoctor) {
			toast.error('Hasta veya doktor kaydı bulunamadı.');
			return;
		}

		const normalizedAppointment: Appointment = {
			...dto,
			id: nanoid(),
			patientName:
				selectedPatient.fullName ||
				`${selectedPatient.firstName ?? ''} ${selectedPatient.lastName ?? ''}`.trim(),
			doctorName:
				selectedDoctor.fullName ||
				`${selectedDoctor.firstName ?? ''} ${selectedDoctor.lastName ?? ''}`.trim(),
			duration,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const result = appointmentSchema.safeParse(normalizedAppointment);
		if (!result.success) {
			errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? ''])
			);
			return;
		}

		await appointmentStore.createAppointment(result.data);
		toast.success(
			$t('appointment.form.addSuccess', {
				patient: normalizedAppointment.patientName,
				doctor: normalizedAppointment.doctorName
			})
		);
		goto('/appointments');
	}

	$: appointment.date, (errors.date = '');
	$: appointment.startTime, (errors.startTime = '');
	$: appointment.endTime, (errors.endTime = '');
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('appointment.form.addAppointmentTitle')}</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{$t('appointment.form.appointmentDetails')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('appointment.form.patient')} error={errors.patientId}>
					<Select bind:value={appointment.patientId}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('appointment.form.selectPatient')} />
						</SelectTrigger>
						<SelectContent>
							{#each patients as patient}
								<SelectItem value={patient.id}>{patient.fullName} ({patient.tcNo})</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={$t('appointment.form.doctor')} error={errors.doctorId}>
					<Select bind:value={appointment.doctorId}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('appointment.form.selectDoctor')} />
						</SelectTrigger>
						<SelectContent>
							{#each doctors as doctor}
								<SelectItem value={doctor.id}>{doctor.fullName}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={$t('appointment.form.date')} error={errors.date}>
					<DatePicker bind:date={appointment.date} placeholder={$t('appointment.form.selectDate')} />
				</FormField>
				<FormField label={$t('appointment.form.startTime')} error={errors.startTime}>
					<Input bind:value={appointment.startTime} type="time" />
				</FormField>
				<FormField label={$t('appointment.form.endTime')} error={errors.endTime}>
					<Input bind:value={appointment.endTime} type="time" />
				</FormField>
				<FormField label={$t('appointment.form.type')} error={errors.type}>
					<Select bind:value={appointment.type}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('appointment.form.selectType')} />
						</SelectTrigger>
						<SelectContent>
							{#each appointmentTypes as type}
								<SelectItem value={type.value}>{type.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<FormField class="md:col-span-2" label={$t('appointment.form.reason')} error={errors.reason}>
					<Textarea bind:value={appointment.reason} placeholder={$t('appointment.form.reasonPlaceholder')} />
				</FormField>
				<FormField class="md:col-span-2" label={$t('appointment.form.notes')} error={errors.notes}>
					<Textarea bind:value={appointment.notes} placeholder={$t('appointment.form.notesPlaceholder')} />
				</FormField>
			</CardContent>
		</Card>

		<div class="flex justify-end gap-2">
			<Button variant="outline" onclick={() => goto('/appointments')}>{$t('common.cancel')}</Button>
			<Button type="submit">{$t('appointment.form.createAppointment')}</Button>
		</div>
	</form>
</div>
