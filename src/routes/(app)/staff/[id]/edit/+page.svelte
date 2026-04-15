<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import { Textarea } from '$components/ui/textarea';
	import { DatePicker } from '$components/shared';
	import { Switch } from '$components/ui/switch';
	import FormField from '$components/shared/FormField.svelte';
	import { staff as staffStore } from '$stores/staff';
	import { users as userStore } from '$stores/users';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type {
		Staff,
		User,
		Role,
		Department,
		StaffStatus,
		DoctorSpecialization,
		NurseSpecialization,
		LabTechnicianSpecialization,
		PharmacistSpecialization
	} from '$types';
	import { toast } from 'svelte-sonner';

	let staff: Staff | undefined;
	let user: User | undefined;
	let loading = true;
	let errors: Record<string, string> = {};

	onMount(async () => {
		const staffId = $page.params.id;
		const fetchedStaff = await staffStore.getStaff(staffId);
		if (fetchedStaff) {
			staff = fetchedStaff;
			user = await userStore.getUserById(fetchedStaff.userId);
		} else {
			toast.error('Staff member not found');
			goto('/staff');
		}
		loading = false;
	});

	const roles: { value: Role; label: string }[] = [
		{ value: 'Doctor', label: 'Doctor' },
		{ value: 'Nurse', label: 'Nurse' },
		{ value: 'Receptionist', label: 'Receptionist' },
		{ value: 'LabTechnician', label: 'Lab Technician' },
		{ value: 'Pharmacist', label: 'Pharmacist' },
		{ value: 'Admin', label: 'Admin' }
	];

	const departments: { value: Department; label: string }[] = [
		{ value: 'Emergency', label: 'Emergency' },
		{ value: 'Cardiology', label: 'Cardiology' },
		{ value: 'Pediatrics', label: 'Pediatrics' },
		{ value: 'Surgery', label: 'Surgery' },
		{ value: 'Radiology', label: 'Radiology' },
		{ value: 'Laboratory', label: 'Laboratory' },
		{ value: 'Pharmacy', label: 'Pharmacy' },
		{ value: 'Administration', label: 'Administration' }
	];

	const statuses: { value: StaffStatus; label: string }[] = [
		{ value: 'Active', label: 'Active' },
		{ value: 'OnLeave', label: 'On Leave' },
		{ value: 'Inactive', label: 'Inactive' }
	];

	const doctorSpecializations: { value: DoctorSpecialization; label: string }[] = [
		{ value: 'Cardiologist', label: 'Cardiologist' },
		{ value: 'Pediatrician', label: 'Pediatrician' },
		{ value: 'Surgeon', label: 'Surgeon' },
		{ value: 'Radiologist', label: 'Radiologist' },
		{ value: 'Emergency Medicine', label: 'Emergency Medicine' },
		{ value: 'General Practitioner', label: 'General Practitioner' },
		{ value: 'Orthopedist', label: 'Orthopedist' },
		{ value: 'Neurologist', label: 'Neurologist' },
		{ value: 'Dermatologist', label: 'Dermatologist' },
		{ value: 'Psychiatrist', label: 'Psychiatrist' }
	];

	const nurseSpecializations: { value: NurseSpecialization; label: string }[] = [
		{ value: 'Emergency Nurse', label: 'Emergency Nurse' },
		{ value: 'Pediatric Nurse', label: 'Pediatric Nurse' },
		{ value: 'Surgical Nurse', label: 'Surgical Nurse' },
		{ value: 'ICU Nurse', label: 'ICU Nurse' },
		{ value: 'General Nurse', label: 'General Nurse' },
		{ value: 'Anesthesia Nurse', label: 'Anesthesia Nurse' }
	];

	$: specializationOptions =
		staff?.role === 'Doctor'
			? doctorSpecializations
			: staff?.role === 'Nurse'
				? nurseSpecializations
				: [];
	$: showSpecialization = staff?.role === 'Doctor' || staff?.role === 'Nurse';

	async function handleSubmit() {
		if (!staff) return;

		// Update staff
		await staffStore.updateStaff(staff.id, staff);
		toast.success('Staff member updated successfully');
		goto(`/staff/${staff.id}`);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if staff && user}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">
				Edit Staff: {user.fullName || `${user.firstName} ${user.lastName}`}
			</h1>
			<Button variant="outline" on:click={() => goto(`/staff/${staff.id}`)}>Cancel</Button>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<Card>
				<CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<FormField label="Role" error={errors.role}>
						<Select bind:value={staff.role}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder="Select Role" />
							</SelectTrigger>
							<SelectContent>
								{#each roles as role}
									<SelectItem value={role.value}>{role.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</FormField>

					<FormField label="Department" error={errors.department}>
						<Select bind:value={staff.department}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder="Select Department" />
							</SelectTrigger>
							<SelectContent>
								{#each departments as dept}
									<SelectItem value={dept.value}>{dept.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</FormField>

					{#if showSpecialization}
						<FormField label="Specialization" error={errors.specialization}>
							<Select bind:value={staff.specialization}>
								<SelectTrigger class="w-full">
									<SelectValue placeholder="Select Specialization" />
								</SelectTrigger>
								<SelectContent>
									{#each specializationOptions as spec}
										<SelectItem value={spec.value}>{spec.label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</FormField>
					{/if}

					<FormField label="License Number" error={errors.licenseNumber}>
						<Input bind:value={staff.licenseNumber} placeholder="Enter license number" />
					</FormField>

					<FormField label="Hire Date" error={errors.hireDate}>
						<DatePicker bind:date={staff.hireDate} placeholder="Select hire date" />
					</FormField>

					<FormField label="Status" error={errors.status}>
						<Select bind:value={staff.status}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder="Select Status" />
							</SelectTrigger>
							<SelectContent>
								{#each statuses as status}
									<SelectItem value={status.value}>{status.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</FormField>
				</CardContent>
			</Card>

			{#if staff.role === 'Doctor' || staff.role === 'Nurse'}
				<Card>
					<CardHeader><CardTitle>Schedule Configuration</CardTitle></CardHeader>
					<CardContent class="grid gap-4">
						<div class="grid gap-4 md:grid-cols-2">
							<FormField label="Max Patients per Day" error={errors.maxPatientsPerDay}>
								<Input
									type="number"
									bind:value={staff.schedule.maxPatientsPerDay}
									placeholder="e.g., 20"
									min="1"
								/>
							</FormField>

							<FormField
								label="Consultation Duration (minutes)"
								error={errors.consultationDuration}
							>
								<Input
									type="number"
									bind:value={staff.schedule.consultationDuration}
									placeholder="e.g., 30"
									min="5"
									step="5"
								/>
							</FormField>
						</div>

						<div>
							<Label>Weekly Availability</Label>
							<div class="grid grid-cols-7 gap-2 mt-2">
								{#each ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as day}
									<div class="flex flex-col items-center gap-1">
										<Label for={day} class="text-xs capitalize">{day.slice(0, 3)}</Label>
										<Switch
											id={day}
											bind:checked={staff.schedule.availability[day]}
											class="data-[state=checked]:bg-primary"
										/>
									</div>
								{/each}
							</div>
						</div>
					</CardContent>
				</Card>
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" on:click={() => goto(`/staff/${staff.id}`)}
					>Cancel</Button
				>
				<Button type="submit">Save Changes</Button>
			</div>
		</form>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>Staff member not found</p>
	</div>
{/if}
