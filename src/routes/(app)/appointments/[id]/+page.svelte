<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Select from '$components/ui/select/select.svelte';
	import SelectContent from '$components/ui/select/select-content.svelte';
	import SelectItem from '$components/ui/select/select-item.svelte';
	import SelectTrigger from '$components/ui/select/select-trigger.svelte';
	import SelectValue from '$components/ui/select/select-value.svelte';

	let appointment: Appointment | undefined;
	let loading = true;
	let confirmCancel = false;
	let confirmDelete = false;
	let selectedStatus: AppointmentStatus = 'scheduled'; // Initialize with a default value

	onMount(async () => {
		const appointmentId = $page.params.id;
		const result = await appointmentStore.getAppointmentById(appointmentId); // Use getAppointmentById alias
		loading = false;
		if (result && result.success && result.data) {
			appointment = result.data;
			selectedStatus = appointment.status;
		} else {
			toast.error($t('appointment.detail.appointmentNotFound'));
			goto('/appointments');
		}
	});

	async function handleStatusChange(newStatus: AppointmentStatus) {
		if (!appointment || newStatus === appointment.status) return; // Only update if status changed

		const result = await appointmentStore.updateAppointment(appointment.id, { status: newStatus });
		if (result.success && result.data) {
			appointment = result.data; // Update appointment with the new data from the API
			selectedStatus = newStatus; // Update selectedStatus to reflect the change
			toast.success($t('appointment.detail.statusUpdateSuccess', { status: $t(`appointment.status.${newStatus}`) }));
		} else {
			toast.error(result.message || $t('appointment.detail.statusUpdateFailed'));
		}
	}

	async function handleCancel() {
		if (appointment) {
			await handleStatusChange('cancelled'); // Use the new handler
			confirmCancel = false;
		}
	}

	async function handleDelete() {
		if (appointment) {
			await appointmentStore.deleteAppointment(appointment.id);
			toast.success($t('appointment.detail.deleteSuccess'));
			goto('/appointments');
		}
	}

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
			case 'no-show':
				return 'destructive';
			default:
				return 'default';
		}
	}

	const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
		{ value: 'scheduled', label: $t('appointment.status.scheduled') },
		{ value: 'confirmed', label: $t('appointment.status.confirmed') },
		{ value: 'in-progress', label: $t('appointment.status.in-progress') },
		{ value: 'completed', label: $t('appointment.status.completed') },
		{ value: 'cancelled', label: $t('appointment.status.cancelled') },
		{ value: 'no-show', label: $t('appointment.status.noShow') }
	];
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if appointment}
	<div class="space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{$t('appointment.detail.title')}</h1>
			<div class="flex gap-2">
				<Button variant="outline" on:click={() => goto(`/appointments/${appointment?.id}/edit`)}>
					{$t('common.edit')}
				</Button>
				<Button variant="destructive" on:click={() => (confirmDelete = true)}>
					{$t('common.delete')}
				</Button>
				{#if appointment.status !== 'cancelled' && appointment.status !== 'completed'}
					<Button variant="secondary" on:click={() => (confirmCancel = true)}>
						{$t('appointment.detail.cancelAppointment')}
					</Button>
				{/if}
			</div>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>{$t('appointment.detail.overview')}</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<p>
					<strong>{$t('appointment.patient')}:</strong>
					<a href="/patients/{appointment.patientId}" class="text-primary hover:underline">{appointment.patientName}</a>
				</p>
				<p>
					<strong>{$t('appointment.doctor')}:</strong>
					{appointment.doctorName}
				</p>
				<p>
					<strong>{$t('appointment.form.date')}:</strong>
					{appointment.date ? formatDate(appointment.date) : '-'}
				</p>
				<p>
					<strong>{$t('appointment.form.time')}:</strong>
					{appointment.startTime} - {appointment.endTime} ({appointment.duration} {$t('common.minutes')})
				</p>
				<p>
					<strong>{$t('appointment.form.type')}:</strong>
					{$t(`appointment.type.${appointment.type}`)}
				</p>
				<div>
					<strong>{$t('appointment.form.status')}:</strong>
					<Select selected={{value: selectedStatus}} on:valueChange={handleStatusChange}>
						<SelectTrigger class="w-[180px] mt-2">
							<SelectValue placeholder={$t('appointment.form.selectStatus')} />
						</SelectTrigger>
						<SelectContent>
							{#each appointmentStatuses as statusOption}
								<SelectItem value={statusOption.value}>{statusOption.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
				<p class="md:col-span-2">
					<strong>{$t('appointment.form.reason')}:</strong>
					{appointment.reason}
				</p>
				<p class="md:col-span-2">
					<strong>{$t('appointment.form.notes')}:</strong>
					{appointment.notes || '-'}
				</p>
			</CardContent>
		</Card>

		<ConfirmDialog
			bind:open={confirmCancel}
			title={$t('appointment.detail.confirmCancelTitle')}
			description={$t('appointment.detail.confirmCancelDescription')}
			on:confirm={handleCancel}
			on:cancel={() => (confirmCancel = false)}
		/>

		<ConfirmDialog
			bind:open={confirmDelete}
			title={$t('appointment.detail.confirmDeleteTitle')}
			description={$t('appointment.detail.confirmDeleteDescription')}
			on:confirm={handleDelete}
			on:cancel={() => (confirmDelete = false)}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('appointment.detail.appointmentNotFound')}</p>
	</div>
{/if}
