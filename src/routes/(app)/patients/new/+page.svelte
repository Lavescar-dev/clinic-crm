<script lang="ts">
	import { t } from '$i18n';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import { Textarea } from '$components/ui/textarea';
	import { DatePicker } from '$components/shared';
	import { Switch } from '$components/ui/switch';
	import FormField from '$components/shared/FormField.svelte';
	import { patients as patientStore } from '$stores/patients';
	import { patientSchema } from '$types'; // Assuming you'll add Zod schema to types
	import { nanoid } from 'nanoid';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import { goto } from '$app/navigation';
	import { validateTcNo } from '$utils/validation';
	import type { BloodType, Gender, PatientStatus, InsuranceType } from '$types';

	let patient: Partial<patientSchema> = {
		id: nanoid(),
		firstName: '',
		lastName: '',
		fullName: '',
		tcNo: '',
		birthDate: undefined,
		gender: undefined,
		bloodType: undefined,
		contact: {
			email: '',
			phone: '',
			address: {
				street: '',
				city: '',
				state: '',
				zipCode: '',
				country: 'Türkiye'
			}
		},
		emergencyContact: {
			name: '',
			phone: '',
			relationship: ''
		},
		insurance: {
			type: undefined,
			company: '',
			policyNumber: ''
		},
		medicalHistory: {
			allergies: [],
			pastIllnesses: [],
			surgeries: [],
			medications: []
		},
		status: 'active',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	let errors: Record<string, string> = {};

	const genders: { value: Gender; label: string }[] = [
		{ value: 'male', label: $t('patient.gender.male') },
		{ value: 'female', label: $t('patient.gender.female') },
		{ value: 'other', label: $t('patient.gender.other') }
	];

	const bloodTypes: { value: BloodType; label: string }[] = [
		{ value: 'A+', label: 'A+' },
		{ value: 'A-', label: 'A-' },
		{ value: 'B+', label: 'B+' },
		{ value: 'B-', label: 'B-' },
		{ value: 'AB+', label: 'AB+' },
		{ value: 'AB-', label: 'AB-' },
		{ value: 'O+', label: 'O+' },
		{ value: 'O-', label: 'O-' }
	];

	const insuranceTypes: { value: InsuranceType; label: string }[] = [
		{ value: 'sgk', label: $t('patient.insurance.sgk') },
		{ value: 'private', label: $t('patient.insurance.private') },
		{ value: 'none', label: $t('patient.insurance.none') }
	];

	async function handleSubmit() {
		// client-side validation
		const result = patientSchema.safeParse(patient);
		if (!result.success) {
			errors = result.error.flatten().fieldErrors;
			return;
		}

		// TC Kimlik No specific validation
		if (patient.tcNo && !validateTcNo(patient.tcNo)) {
			errors.tcNo = $t('validation.invalidTcNo');
			return;
		}

		patient.fullName = `${patient.firstName} ${patient.lastName}`;
		// Ensure dates are correct format
		if (patient.birthDate) {
			patient.birthDate = new Date(patient.birthDate);
		}
		
		await patientStore.addPatient(patient as patientSchema);
		goto('/patients');
	}

	$: patient.birthDate, (errors.birthDate = '');
	$: patient.tcNo, (errors.tcNo = '');
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('patient.form.addPatientTitle')}</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{$t('patient.form.personalInfo')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('patient.form.firstName')} error={errors.firstName}>
					<Input bind:value={patient.firstName} placeholder={$t('patient.form.firstNamePlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.lastName')} error={errors.lastName}>
					<Input bind:value={patient.lastName} placeholder={$t('patient.form.lastNamePlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.tcNo')} error={errors.tcNo}>
					<Input bind:value={patient.tcNo} placeholder="T.C. Kimlik Numarası" />
				</FormField>
				<FormField label={$t('patient.form.birthDate')} error={errors.birthDate}>
					<DatePicker bind:date={patient.birthDate} placeholder={$t('patient.form.birthDatePlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.gender')} error={errors.gender}>
					<Select bind:value={patient.gender}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('patient.form.selectGender')} />
						</SelectTrigger>
						<SelectContent>
							{#each genders as gender}
								<SelectItem value={gender.value}>{gender.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={$t('patient.form.bloodType')} error={errors.bloodType}>
					<Select bind:value={patient.bloodType}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('patient.form.selectBloodType')} />
						</SelectTrigger>
						<SelectContent>
							{#each bloodTypes as type}
								<SelectItem value={type.value}>{type.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<div class="flex items-center space-x-2">
					<Switch id="patient-status" checked={patient.status === 'active'} onCheckedChange={(checked) => patient.status = checked ? 'active' : 'inactive'} />
					<Label for="patient-status">{$t('patient.form.activePatient')}</Label>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('patient.form.contactInfo')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('patient.form.email')} error={errors['contact.email']}>
					<Input bind:value={patient.contact.email} type="email" placeholder={$t('patient.form.emailPlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.phone')} error={errors['contact.phone']}>
					<Input bind:value={patient.contact.phone} type="tel" placeholder={$t('patient.form.phonePlaceholder')} />
				</FormField>
				<div class="md:col-span-2 grid gap-4">
					<Label>{$t('patient.form.address')}</Label>
					<div class="grid gap-4 md:grid-cols-2">
						<FormField label={$t('patient.form.street')} error={errors['contact.address.street']}>
							<Input bind:value={patient.contact.address.street} placeholder={$t('patient.form.streetPlaceholder')} />
						</FormField>
						<FormField label={$t('patient.form.city')} error={errors['contact.address.city']}>
							<Input bind:value={patient.contact.address.city} placeholder={$t('patient.form.cityPlaceholder')} />
						</FormField>
						<FormField label={$t('patient.form.state')} error={errors['contact.address.state']}>
							<Input bind:value={patient.contact.address.state} placeholder={$t('patient.form.statePlaceholder')} />
						</FormField>
						<FormField label={$t('patient.form.zipCode')} error={errors['contact.address.zipCode']}>
							<Input bind:value={patient.contact.address.zipCode} placeholder={$t('patient.form.zipCodePlaceholder')} />
						</FormField>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('patient.form.emergencyContact')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('patient.form.emergencyName')} error={errors['emergencyContact.name']}>
					<Input bind:value={patient.emergencyContact.name} placeholder={$t('patient.form.emergencyNamePlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.emergencyPhone')} error={errors['emergencyContact.phone']}>
					<Input bind:value={patient.emergencyContact.phone} type="tel" placeholder={$t('patient.form.emergencyPhonePlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.emergencyRelationship')} error={errors['emergencyContact.relationship']}>
					<Input bind:value={patient.emergencyContact.relationship} placeholder={$t('patient.form.emergencyRelationshipPlaceholder')} />
				</FormField>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('patient.form.insuranceInfo')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('patient.form.insuranceType')} error={errors['insurance.type']}>
					<Select bind:value={patient.insurance.type}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('patient.form.selectInsuranceType')} />
						</SelectTrigger>
						<SelectContent>
							{#each insuranceTypes as type}
								<SelectItem value={type.value}>{type.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				{#if patient.insurance.type !== 'none'}
					<FormField label={$t('patient.form.insuranceCompany')} error={errors['insurance.company']}>
						<Input bind:value={patient.insurance.company} placeholder={$t('patient.form.insuranceCompanyPlaceholder')} />
					</FormField>
					<FormField label={$t('patient.form.policyNumber')} error={errors['insurance.policyNumber']}>
						<Input bind:value={patient.insurance.policyNumber} placeholder={$t('patient.form.policyNumberPlaceholder')} />
					</FormField>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('patient.form.medicalHistory')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4">
				<FormField label={$t('patient.form.allergies')} error={errors['medicalHistory.allergies']}>
					<Textarea bind:value={patient.medicalHistory.allergies} placeholder={$t('patient.form.allergiesPlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.pastIllnesses')} error={errors['medicalHistory.pastIllnesses']}>
					<Textarea bind:value={patient.medicalHistory.pastIllnesses} placeholder={$t('patient.form.pastIllnessesPlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.surgeries')} error={errors['medicalHistory.surgeries']}>
					<Textarea bind:value={patient.medicalHistory.surgeries} placeholder={$t('patient.form.surgeriesPlaceholder')} />
				</FormField>
				<FormField label={$t('patient.form.medications')} error={errors['medicalHistory.medications']}>
					<Textarea bind:value={patient.medicalHistory.medications} placeholder={$t('patient.form.medicationsPlaceholder')} />
				</FormField>
			</CardContent>
		</Card>

		<div class="flex justify-end gap-2">
			<Button variant="outline" on:click={() => goto('/patients')}>{$t('common.cancel')}</Button>
			<Button type="submit">{$t('patient.form.addPatient')}</Button>
		</div>
	</form>
</div>