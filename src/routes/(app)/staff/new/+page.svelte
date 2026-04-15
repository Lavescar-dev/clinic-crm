<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import { DatePicker } from '$components/shared';
	import { Switch } from '$components/ui/switch';
	import FormField from '$components/shared/FormField.svelte';
	import { staff as staffStore } from '$stores/staff';
	import { users as userStore } from '$stores/users';
	import { nanoid } from 'nanoid';
	import { goto } from '$app/navigation';
	import type {
		Role,
		Department,
		StaffStatus,
		DoctorSpecialization,
		NurseSpecialization,
		CreateStaffDto
	} from '$types';
	import { toast } from 'svelte-sonner';
	import { rolePermissionMatrix } from '$types/staff';

	let formData = {
		// User fields
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		phone: '',
		// Staff fields
		role: undefined as Role | undefined,
		department: undefined as Department | undefined,
		specialization: undefined as string | undefined,
		licenseNumber: '',
		hireDate: new Date(),
		status: 'Active' as StaffStatus,
		maxPatientsPerDay: 20,
		consultationDuration: 30,
		availability: {
			monday: true,
			tuesday: true,
			wednesday: true,
			thursday: true,
			friday: true,
			saturday: false,
			sunday: false
		}
	};

	let errors: Record<string, string> = {};

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
		formData.role === 'Doctor'
			? doctorSpecializations
			: formData.role === 'Nurse'
				? nurseSpecializations
				: [];
	$: showSpecialization = formData.role === 'Doctor' || formData.role === 'Nurse';
	$: showSchedule = formData.role === 'Doctor' || formData.role === 'Nurse';

	async function handleSubmit() {
		// Validate required fields
		errors = {};
		if (!formData.firstName) errors.firstName = 'First name is required';
		if (!formData.lastName) errors.lastName = 'Last name is required';
		if (!formData.email) errors.email = 'Email is required';
		if (!formData.password || formData.password.length < 6)
			errors.password = 'Password must be at least 6 characters';
		if (!formData.role) errors.role = 'Role is required';
		if (!formData.department) errors.department = 'Department is required';

		if (Object.keys(errors).length > 0) {
			toast.error('Please fix the form errors');
			return;
		}

		// Create user first
		const userId = nanoid();
		const newUser = {
			id: userId,
			email: formData.email,
			password: formData.password,
			firstName: formData.firstName,
			lastName: formData.lastName,
			fullName: `${formData.firstName} ${formData.lastName}`,
			role: formData.role === 'Doctor' ? 'doctor' : formData.role === 'Nurse' ? 'nurse' : 'receptionist' as any,
			status: 'active' as const,
			contact: {
				phone: formData.phone || '',
				email: formData.email
			},
			specialization: formData.specialization,
			licenseNumber: formData.licenseNumber,
			department: formData.department,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await userStore.createUser(newUser);

		// Create staff record
		const permissions = rolePermissionMatrix[formData.role!];
		const staffData: CreateStaffDto = {
			userId: userId,
			role: formData.role!,
			department: formData.department!,
			specialization: formData.specialization || null,
			licenseNumber: formData.licenseNumber || null,
			hireDate: formData.hireDate,
			status: formData.status,
			schedule: {
				shifts: [],
				availability: formData.availability,
				maxPatientsPerDay: showSchedule ? formData.maxPatientsPerDay : undefined,
				consultationDuration: showSchedule ? formData.consultationDuration : undefined
			},
			permissions
		};

		const createdStaff = await staffStore.createStaff(staffData as any);
		if (createdStaff) {
			toast.success('Staff member created successfully');
			goto(`/staff/${createdStaff.id}`);
		} else {
			toast.error('Failed to create staff member');
		}
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Add New Staff Member</h1>
		<Button variant="outline" on:click={() => goto('/staff')}>Cancel</Button>
	</div>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label="First Name *" error={errors.firstName}>
					<Input bind:value={formData.firstName} placeholder="Enter first name" />
				</FormField>

				<FormField label="Last Name *" error={errors.lastName}>
					<Input bind:value={formData.lastName} placeholder="Enter last name" />
				</FormField>

				<FormField label="Email *" error={errors.email}>
					<Input bind:value={formData.email} type="email" placeholder="Enter email address" />
				</FormField>

				<FormField label="Password *" error={errors.password}>
					<Input
						bind:value={formData.password}
						type="password"
						placeholder="Minimum 6 characters"
					/>
				</FormField>

				<FormField label="Phone" error={errors.phone}>
					<Input bind:value={formData.phone} type="tel" placeholder="Enter phone number" />
				</FormField>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label="Role *" error={errors.role}>
					<Select bind:value={formData.role}>
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

				<FormField label="Department *" error={errors.department}>
					<Select bind:value={formData.department}>
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
						<Select bind:value={formData.specialization}>
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
					<Input bind:value={formData.licenseNumber} placeholder="Enter license number" />
				</FormField>

				<FormField label="Hire Date" error={errors.hireDate}>
					<DatePicker bind:date={formData.hireDate} placeholder="Select hire date" />
				</FormField>
			</CardContent>
		</Card>

		{#if showSchedule}
			<Card>
				<CardHeader><CardTitle>Schedule Configuration</CardTitle></CardHeader>
				<CardContent class="grid gap-4">
					<div class="grid gap-4 md:grid-cols-2">
						<FormField label="Max Patients per Day" error={errors.maxPatientsPerDay}>
							<Input
								type="number"
								bind:value={formData.maxPatientsPerDay}
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
								bind:value={formData.consultationDuration}
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
										bind:checked={formData.availability[day]}
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
			<Button type="button" variant="outline" on:click={() => goto('/staff')}>Cancel</Button>
			<Button type="submit">Create Staff Member</Button>
		</div>
	</form>
</div>
