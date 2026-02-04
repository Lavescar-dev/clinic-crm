<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { patients as patientStore } from '$stores/patients';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { Avatar, AvatarFallback } from '$components/ui/avatar';
	import { Badge } from '$components/ui/badge';
	import { formatDate, calculateAge } from '$utils/date';
	import { formatPhoneNumber } from '$utils/formatting';
	import type { Patient } from '$types';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import { toast } from 'svelte-sonner'; // Assuming svelte-sonner is installed

	let patient: Patient | undefined;
	let loading = true;
	let confirmDelete = false;

	onMount(async () => {
		const patientId = $page.params.id;
		patient = await patientStore.getPatientById(patientId);
		loading = false;
		if (!patient) {
			toast.error($t('patient.profile.patientNotFound'));
			goto('/patients');
		}
	});

	async function handleDelete() {
		if (patient) {
			await patientStore.deletePatient(patient.id);
			toast.success($t('patient.profile.deleteSuccess', { name: patient.fullName }));
			goto('/patients');
		}
	}

	function getStatusVariant(status: Patient['status']) {
		switch (status) {
			case 'active':
				return 'success';
			case 'inactive':
				return 'secondary';
			case 'deceased':
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
			<h1 class="text-3xl font-bold">{$t('patient.profile.title', { name: patient.fullName })}</h1>
			<div class="flex gap-2">
				<Button variant="outline" on:click={() => goto(`/patients/${patient?.id}/edit`)}>
					{$t('common.edit')}
				</Button>
				<Button variant="destructive" on:click={() => (confirmDelete = true)}>
					{$t('common.delete')}
				</Button>
			</div>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>{$t('patient.profile.overview')}</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="flex flex-col items-center gap-4 md:col-span-1">
					<Avatar class="h-24 w-24">
						{#if patient.avatar}
							<AvatarImage src={patient.avatar} alt={patient.fullName} />
						{:else}
							<AvatarFallback>{patient.firstName[0]}{patient.lastName[0]}</AvatarFallback>
						{/if}
					</Avatar>
					<div class="text-center">
						<h2 class="text-xl font-semibold">{patient.fullName}</h2>
						<Badge variant={getStatusVariant(patient.status)}>{$t(`patient.status.${patient.status}`)}</Badge>
					</div>
				</div>

				<div class="grid gap-2 md:col-span-2">
					<p><strong>{$t('patient.form.tcNo')}:</strong> {patient.tcNo}</p>
					<p>
						<strong>{$t('patient.form.birthDate')}:</strong> {patient.birthDate ? formatDate(patient.birthDate) : '-'}
					</p>
					<p><strong>{$t('patient.profile.age')}:</strong> {patient.birthDate ? calculateAge(patient.birthDate) : '-'} {$t('common.years')}</p>
					<p><strong>{$t('patient.form.gender')}:</strong> {$t(`patient.gender.${patient.gender}`)}</p>
					<p><strong>{$t('patient.form.bloodType')}:</strong> {patient.bloodType || '-'}</p>
					<p>
						<strong>{$t('patient.form.email')}:</strong> {patient.contact.email || '-'}
					</p>
					<p>
						<strong>{$t('patient.form.phone')}:</strong> {patient.contact.phone ? formatPhoneNumber(patient.contact.phone) : '-'}
					</p>
					<p>
						<strong>{$t('patient.form.address')}:</strong>
						{#if patient.contact.address}
							{patient.contact.address.street}, {patient.contact.address.city}
							{#if patient.contact.address.state}, {patient.contact.address.state}{/if}
							{patient.contact.address.zipCode}, {patient.contact.address.country}
						{:else}
							-
						{/if}
					</p>
				</div>
			</CardContent>
		</Card>

		<Tabs defaultValue="medicalHistory" class="space-y-4">
			<TabsList>
				<TabsTrigger value="medicalHistory">{$t('patient.profile.medicalHistory')}</TabsTrigger>
				<TabsTrigger value="appointments">{$t('patient.profile.appointments')}</TabsTrigger>
				<TabsTrigger value="billing">{$t('patient.profile.billing')}</TabsTrigger>
				<TabsTrigger value="documents">{$t('patient.profile.documents')}</TabsTrigger>
				<TabsTrigger value="family">{$t('patient.profile.familyMembers')}</TabsTrigger>
			</TabsList>

			<TabsContent value="medicalHistory">
				<Card>
					<CardHeader><CardTitle>{$t('patient.profile.medicalHistory')}</CardTitle></CardHeader>
					<CardContent class="grid gap-4">
						<p><strong>{$t('patient.form.allergies')}:</strong> {patient.medicalHistory?.allergies?.join(', ') || '-'}</p>
						<p><strong>{$t('patient.form.pastIllnesses')}:</strong> {patient.medicalHistory?.pastIllnesses?.join(', ') || '-'}</p>
						<p><strong>{$t('patient.form.surgeries')}:</strong> {patient.medicalHistory?.surgeries?.join(', ') || '-'}</p>
						<p><strong>{$t('patient.form.medications')}:</strong> {patient.medicalHistory?.medications?.join(', ') || '-'}</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="appointments">
				<Card>
					<CardHeader><CardTitle>{$t('patient.profile.appointments')}</CardTitle></CardHeader>
					<CardContent>
						<!-- Appointment History Component goes here -->
						<p>{$t('patient.profile.noAppointments')}</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="billing">
				<Card>
					<CardHeader><CardTitle>{$t('patient.profile.billing')}</CardTitle></CardHeader>
					<CardContent>
						<!-- Billing History Component goes here -->
						<p>{$t('patient.profile.noBillingHistory')}</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="documents">
				<Card>
					<CardHeader><CardTitle>{$t('patient.profile.documents')}</CardTitle></CardHeader>
					<CardContent>
						<!-- Document Management Component goes here -->
						<p>{$t('patient.profile.noDocuments')}</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="family">
				<Card>
					<CardHeader><CardTitle>{$t('patient.profile.familyMembers')}</CardTitle></CardHeader>
					<CardContent>
						<!-- Family Members Component goes here -->
						<p>{$t('patient.profile.noFamilyMembers')}</p>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>

		<ConfirmDialog
			bind:open={confirmDelete}
			title={$t('patient.profile.confirmDeleteTitle')}
			description={$t('patient.profile.confirmDeleteDescription', { name: patient.fullName })}
			on:confirm={handleDelete}
			on:cancel={() => (confirmDelete = false)}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('patient.profile.patientNotFound')}</p>
	</div>
{/if}