<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { staff as staffStore } from '$stores/staff';
	import { users as userStore } from '$stores/users';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { Avatar, AvatarFallback } from '$components/ui/avatar';
	import { Badge } from '$components/ui/badge';
	import { formatDate } from '$utils/date';
	import { formatPhoneNumber } from '$utils/formatting';
	import type { Staff, User } from '$types';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { Calendar, Clock, Users, Award, Briefcase, Mail, Phone, MapPin } from 'lucide-svelte';
	import { format } from 'date-fns';

	let staff: Staff | undefined;
	let user: User | undefined;
	let loading = true;
	let confirmDelete = false;

	onMount(async () => {
		const staffId = $page.params.id;
		staff = await staffStore.getStaff(staffId);
		if (staff) {
			user = await userStore.getUserById(staff.userId);
		}
		loading = false;
		if (!staff) {
			toast.error('Staff member not found');
			goto('/staff');
		}
	});

	async function handleDelete() {
		if (staff) {
			await staffStore.deleteStaff(staff.id);
			toast.success(`Staff member deleted successfully`);
			goto('/staff');
		}
	}

	function getStatusVariant(status: Staff['status']): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'Active':
				return 'default';
			case 'OnLeave':
				return 'secondary';
			case 'Inactive':
				return 'destructive';
		}
	}

	function getRoleBadgeColor(role: Staff['role']): string {
		const colors = {
			Doctor: 'bg-blue-100 text-blue-800',
			Nurse: 'bg-green-100 text-green-800',
			Receptionist: 'bg-purple-100 text-purple-800',
			LabTechnician: 'bg-yellow-100 text-yellow-800',
			Pharmacist: 'bg-pink-100 text-pink-800',
			Admin: 'bg-gray-100 text-gray-800'
		};
		return colors[role] || 'bg-gray-100 text-gray-800';
	}

	// Mock performance metrics - in real app would come from analytics
	$: performanceMetrics = staff
		? {
				patientsThisMonth: Math.floor(Math.random() * 100) + 50,
				avgConsultationTime: staff.schedule?.consultationDuration || 30,
				patientSatisfaction: (Math.random() * 0.3 + 4.5).toFixed(1)
		  }
		: null;
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if staff && user}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
			<div class="flex gap-2">
				<Button variant="outline" on:click={() => goto(`/staff/${staff?.id}/edit`)}>
					{$t('common.edit')}
				</Button>
				<Button variant="outline" on:click={() => goto('/staff/schedule')}>
					<Calendar class="mr-2 h-4 w-4" />
					Schedule
				</Button>
				<Button variant="destructive" on:click={() => (confirmDelete = true)}>
					{$t('common.delete')}
				</Button>
			</div>
		</div>

		<!-- Overview Card -->
		<Card>
			<CardHeader>
				<CardTitle>Staff Overview</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="flex flex-col items-center gap-4 md:col-span-1">
					<Avatar class="h-24 w-24">
						{#if user.avatar}
							<img src={user.avatar} alt={user.fullName} class="object-cover" />
						{:else}
							<AvatarFallback class="text-2xl"
								>{user.firstName[0]}{user.lastName[0]}</AvatarFallback
							>
						{/if}
					</Avatar>
					<div class="text-center">
						<h2 class="text-xl font-semibold">{user.fullName || `${user.firstName} ${user.lastName}`}</h2>
						<div class="flex gap-2 mt-2 justify-center flex-wrap">
							<Badge class={getRoleBadgeColor(staff.role)}>{staff.role}</Badge>
							<Badge variant={getStatusVariant(staff.status)}>{staff.status}</Badge>
						</div>
					</div>
				</div>

				<div class="grid gap-3 md:col-span-2">
					<div class="flex items-center gap-2">
						<Briefcase class="h-4 w-4 text-muted-foreground" />
						<strong>Department:</strong>
						<span>{staff.department}</span>
					</div>
					{#if staff.specialization}
						<div class="flex items-center gap-2">
							<Award class="h-4 w-4 text-muted-foreground" />
							<strong>Specialization:</strong>
							<span>{staff.specialization}</span>
						</div>
					{/if}
					{#if staff.licenseNumber}
						<div class="flex items-center gap-2">
							<Award class="h-4 w-4 text-muted-foreground" />
							<strong>License Number:</strong>
							<span>{staff.licenseNumber}</span>
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<Calendar class="h-4 w-4 text-muted-foreground" />
						<strong>Hire Date:</strong>
						<span>{staff.hireDate ? format(new Date(staff.hireDate), 'MMM dd, yyyy') : '-'}</span>
					</div>
					{#if user.contact?.email}
						<div class="flex items-center gap-2">
							<Mail class="h-4 w-4 text-muted-foreground" />
							<strong>Email:</strong>
							<span>{user.contact.email}</span>
						</div>
					{/if}
					{#if user.contact?.phone}
						<div class="flex items-center gap-2">
							<Phone class="h-4 w-4 text-muted-foreground" />
							<strong>Phone:</strong>
							<span>{formatPhoneNumber(user.contact.phone)}</span>
						</div>
					{/if}
					{#if user.contact?.address}
						<div class="flex items-center gap-2">
							<MapPin class="h-4 w-4 text-muted-foreground" />
							<strong>Address:</strong>
							<span
								>{user.contact.address.street}, {user.contact.address.city}, {user.contact.address.country}</span
							>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Performance Metrics (for Doctors/Nurses) -->
		{#if staff.role === 'Doctor' || staff.role === 'Nurse'}
			<div class="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Patients This Month</CardTitle>
						<Users class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{performanceMetrics?.patientsThisMonth}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Avg Consultation Time</CardTitle>
						<Clock class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{performanceMetrics?.avgConsultationTime} min</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Patient Satisfaction</CardTitle>
						<Award class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{performanceMetrics?.patientSatisfaction} / 5.0</div>
					</CardContent>
				</Card>
			</div>
		{/if}

		<!-- Tabs for detailed information -->
		<Tabs defaultValue="schedule" class="space-y-4">
			<TabsList>
				<TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
				<TabsTrigger value="permissions">Permissions</TabsTrigger>
				<TabsTrigger value="history">Shift History</TabsTrigger>
				<TabsTrigger value="leave">Leave Records</TabsTrigger>
			</TabsList>

			<TabsContent value="schedule">
				<Card>
					<CardHeader><CardTitle>Schedule & Availability</CardTitle></CardHeader>
					<CardContent class="space-y-4">
						{#if staff.schedule}
							<div>
								<h3 class="font-semibold mb-2">Weekly Availability</h3>
								<div class="grid grid-cols-7 gap-2">
									{#each ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as day}
										<div
											class="p-2 text-center rounded {staff.schedule.availability[day]
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-500'}"
										>
											<div class="text-xs font-medium capitalize">{day.slice(0, 3)}</div>
											<div class="text-xs">{staff.schedule.availability[day] ? '✓' : '✗'}</div>
										</div>
									{/each}
								</div>
							</div>

							{#if staff.schedule.maxPatientsPerDay}
								<div>
									<strong>Max Patients per Day:</strong>
									{staff.schedule.maxPatientsPerDay}
								</div>
							{/if}

							{#if staff.schedule.consultationDuration}
								<div>
									<strong>Consultation Duration:</strong>
									{staff.schedule.consultationDuration} minutes
								</div>
							{/if}

							{#if staff.schedule.shifts && staff.schedule.shifts.length > 0}
								<div>
									<h3 class="font-semibold mb-2">Assigned Shifts</h3>
									<p class="text-sm text-muted-foreground">
										{staff.schedule.shifts.length} shift(s) assigned
									</p>
								</div>
							{/if}
						{:else}
							<p class="text-muted-foreground">No schedule information available</p>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="permissions">
				<Card>
					<CardHeader><CardTitle>Role Permissions</CardTitle></CardHeader>
					<CardContent>
						{#if staff.permissions}
							<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
								{#each Object.entries(staff.permissions) as [permission, granted]}
									{#if granted}
										<div class="flex items-center gap-2 text-sm">
											<span class="text-green-600">✓</span>
											<span class="capitalize"
												>{permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}</span
											>
										</div>
									{/if}
								{/each}
							</div>
						{:else}
							<p class="text-muted-foreground">No permissions assigned</p>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="history">
				<Card>
					<CardHeader><CardTitle>Shift History</CardTitle></CardHeader>
					<CardContent>
						<p class="text-muted-foreground">Shift history will be displayed here</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="leave">
				<Card>
					<CardHeader><CardTitle>Leave & Absence Records</CardTitle></CardHeader>
					<CardContent>
						<p class="text-muted-foreground">Leave records will be displayed here</p>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>

		<ConfirmDialog
			bind:open={confirmDelete}
			title="Delete Staff Member"
			description="Are you sure you want to delete this staff member? This action cannot be undone."
			on:confirm={handleDelete}
			on:cancel={() => (confirmDelete = false)}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>Staff member not found</p>
	</div>
{/if}
