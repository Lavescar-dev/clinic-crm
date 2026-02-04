<script lang="ts">
	import { t } from '$i18n';
	import Button from '$components/ui/button/button.svelte';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { Calendar as CalendarComponent } from '$components/ui/calendar'; // shadcn-svelte calendar
	import { appointments as appointmentStore } from '$stores/appointments';
	import { users as userStore } from '$stores/users'; // Assuming a user store for doctors
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import { format, isSameDay } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import type { Appointment, AppointmentStatus, User } from '$types';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Separator from '$components/ui/separator/separator.svelte';

	let selectedDate: Date = new Date();
	let doctorFilter: string | 'all' = 'all';
	let statusFilter: AppointmentStatus | 'all' = 'all';

	const doctors: { value: string; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		...$userStore.data
			.filter((user) => user.role === 'doctor')
			.map((doctor) => ({ value: doctor.id, label: doctor.fullName }))
	];

	const statuses: { value: AppointmentStatus | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'scheduled', label: $t('appointment.status.scheduled') },
		{ value: 'confirmed', label: $t('appointment.status.confirmed') },
		{ value: 'in-progress', label: $t('appointment.status.in-progress') },
		{ value: 'completed', label: $t('appointment.status.completed') },
		{ value: 'cancelled', label: $t('appointment.status.cancelled') }
	];

	$: filteredAppointments = $appointmentStore.data.filter((appointment) => {
		const matchesDate = isSameDay(new Date(appointment.date), selectedDate);
		const matchesDoctor = doctorFilter === 'all' || appointment.doctorId === doctorFilter;
		const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
		return matchesDate && matchesDoctor && matchesStatus;
	});

	function getStatusVariant(status: AppointmentStatus) {
		switch (status) {
			case 'scheduled':
				return 'outline';
			case 'confirmed':
				return 'info';
			case 'in-progress':
				return 'warning';
			case 'completed':
				return 'success';
			case 'cancelled':
				return 'destructive';
			default:
				return 'default';
		}
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('appointment.management.title')}</h1>
		<Button on:click={() => goto('/appointments/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('appointment.management.addAppointment')}
		</Button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<Card class="lg:col-span-1">
			<CardHeader><CardTitle>{$t('appointment.calendar')}</CardTitle></CardHeader>
			<CardContent>
				<CalendarComponent bind:value={selectedDate} class="rounded-md border shadow" />
			</CardContent>
		</Card>

		<Card class="lg:col-span-2">
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle>{$t('appointment.appointmentsForDate', { date: format(selectedDate, 'dd MMMM yyyy', { locale: tr }) })}</CardTitle>
				<div class="flex gap-2">
					<FilterDropdown bind:value={doctorFilter} options={doctors} label={$t('appointment.filterByDoctor')} />
					<FilterDropdown bind:value={statusFilter} options={statuses} label={$t('appointment.filterByStatus')} />
				</div>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if filteredAppointments.length > 0}
					{#each filteredAppointments as appointment (appointment.id)}
						<div class="flex items-center justify-between p-4 border rounded-md">
							<div>
								<p class="font-semibold text-lg">{format(new Date(appointment.date), 'HH:mm')}</p>
								<p>
									<span class="text-muted-foreground">{$t('appointment.patient')}:</span>
									<a href="/patients/{appointment.patientId}" class="text-primary hover:underline">{appointment.patientName}</a>
								</p>
								<p>
									<span class="text-muted-foreground">{$t('appointment.doctor')}:</span>
									{appointment.doctorName}
								</p>
								<p>
									<span class="text-muted-foreground">{$t('appointment.reason')}:</span>
									{appointment.reason}
								</p>
							</div>
							<div class="flex flex-col items-end gap-2">
								<Badge variant={getStatusVariant(appointment.status)}>{$t(`appointment.status.${appointment.status}`)}</Badge>
								<Button variant="outline" size="sm" on:click={() => goto(`/appointments/${appointment.id}`)}>
									{$t('common.details')}
								</Button>
							</div>
						</div>
						<Separator class="last:hidden" />
					{/each}
				{:else}
					<p class="text-center text-muted-foreground">{$t('appointment.noAppointments')}</p>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>