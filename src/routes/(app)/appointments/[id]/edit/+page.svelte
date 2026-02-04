<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
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
	import { appointmentSchema } from '$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Appointment, AppointmentType, AppointmentStatus } from '$types';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';

	import { get } from 'svelte/store';

	let appointment: Appointment | undefined;
	let loading = true;
	let errors: Record<string, string> = {};

	onMount(async () => {
		const appointmentId = $page.params.id;
		const fetchedAppointment = await appointmentStore.getAppointmentById(appointmentId);
		if (fetchedAppointment && fetchedAppointment.success && fetchedAppointment.data) {
			appointment = fetchedAppointment.data;
		} else {
			toast.error($t('appointment.detail.appointmentNotFound'));
			goto('/appointments');
		}
		loading = false;
	});

	const doctors = get(userStore).data.filter((user) => user.role === 'doctor');
	const patients = get(patientStore).data;

	const appointmentTypes: { value: AppointmentType; label: string }[] = [
		{ value: 'consultation', label: $t('appointment.type.consultation') },
		{ value: 'follow-up', label: $t('appointment.type.followUp') },
		{ value: 'emergency', label: $t('appointment.type.emergency') },
		{ value: 'routine-checkup', label: 'Rutin Kontrol' }
	];

	const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
		{ value: 'scheduled', label: $t('appointment.status.scheduled') },
		{ value: 'confirmed', label: $t('appointment.status.confirmed') },
		{ value: 'in-progress', label: $t('appointment.status.in-progress') },
		{ value: 'completed', label: $t('appointment.status.completed') },
		{ value: 'cancelled', label: $t('appointment.status.cancelled') },
		{ value: 'no-show', label: $t('appointment.status.noShow') }
	];

	async function handleSubmit() {
		if (!appointment) return;

		// client-side validation
		const result = appointmentSchema.safeParse(appointment);
		if (!result.success) {
			errors = result.error.flatten().fieldErrors;
			return;
		}

		// Calculate duration if not set
		if (appointment.startTime && appointment.endTime && appointment.date) {
			const start = new Date(`${format(appointment.date, 'yyyy-MM-dd')}T${appointment.startTime}:00`);
			const end = new Date(`${format(appointment.date, 'yyyy-MM-dd')}T${appointment.endTime}:00`);
			const duration = (end.getTime() - start.getTime()) / (1000 * 60); // duration in minutes
			if (duration <= 0) {
				errors.endTime = $t('validation.endTimeBeforeStartTime');
				return;
			}
			appointment.duration = duration;
		}

		// Populate patientName and doctorName for display
		const selectedPatient = patients.find(p => p.id === appointment.patientId);
		const selectedDoctor = doctors.find(d => d.id === appointment.doctorId);
		appointment.patientName = selectedPatient?.fullName;
		appointment.doctorName = selectedDoctor?.fullName;

		await appointmentStore.updateAppointment(appointment.id, appointment);
		toast.success($t('appointment.form.updateSuccess', { patient: appointment.patientName, doctor: appointment.doctorName }));
		goto(`/appointments/${appointment.id}`);
	}

	$: appointment?.date, (errors.date = '');
	$: appointment?.startTime, (errors.startTime = '');
	$: appointment?.endTime, (errors.endTime = '');
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if appointment}
	<div class="space-y-6 p-4 md:p-6">
		<h1 class="text-3xl font-bold">{$t('appointment.form.editAppointmentTitle')}</h1>

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
					<FormField label={$t('appointment.form.status')} error={errors.status}>
						<Select bind:value={appointment.status}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder={$t('appointment.form.selectStatus')} />
							</SelectTrigger>
							<SelectContent>
								{#each appointmentStatuses as status}
									<SelectItem value={status.value}>{status.label}</SelectItem>
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
				<Button variant="outline" on:click={() => goto(`/appointments/${appointment?.id}`)}>{$t('common.cancel')}</Button>
				<Button type="submit">{$t('appointment.form.updateAppointment')}</Button>
			</div>
		</form>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('appointment.detail.appointmentNotFound')}</p>
	</div>
{/if}
