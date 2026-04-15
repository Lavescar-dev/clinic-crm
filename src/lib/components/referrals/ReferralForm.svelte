<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import { Building2, User, AlertCircle } from 'lucide-svelte';
	import type { CreateReferralDto, UrgencyLevel, ExternalFacility } from '$types/referral';
	import { COMMON_EXTERNAL_FACILITIES } from '$types/referral';
	import { t } from '$i18n';
	import { users } from '$stores/users';
	import { patients } from '$stores/patients';
	import { formatPhoneNumber } from '$utils/formatting';

	interface Props {
		patientId?: string;
		fromDoctorId: string;
		onSubmit?: (referral: CreateReferralDto) => void;
		onCancel?: () => void;
	}

	let {
		patientId = '',
		fromDoctorId,
		onSubmit,
		onCancel
	}: Props = $props();

	const dispatch = createEventDispatcher();

	// Form state
	let selectedPatientId = $state('');
	let patientLocked = $derived.by(() => Boolean(patientId));
	let referralType = $state<'internal' | 'external'>('internal');
	let selectedDoctorId = $state('');
	let selectedDepartment = $state('');
	let selectedExternalFacilityId = $state('');
	let reason = $state('');
	let urgency = $state<UrgencyLevel>('routine');
	let clinicalSummary = $state('');
	let diagnosisCodes = $state<string[]>([]);
	let relevantTests = $state<string[]>([]);
	let medications = $state<string[]>([]);
	let notes = $state('');

	// Input states for adding codes/tests/meds
	let newDiagnosisCode = $state('');
	let newTest = $state('');
	let newMedication = $state('');

	$effect(() => {
		if (patientId && selectedPatientId !== patientId) {
			selectedPatientId = patientId;
		}
	});

	// Get list of doctors
	let doctors = $derived.by(() =>
		$users.data.filter(u => u.role === 'doctor' && u.id !== fromDoctorId)
	);

	// Get unique departments from doctors
	let departments = $derived.by(() => {
		const depts = new Set<string>();
		doctors.forEach(doc => {
			if (doc.department) depts.add(doc.department);
		});
		return Array.from(depts).sort();
	});

	// Get doctors filtered by department
	let filteredDoctors = $derived.by(() => {
		if (!selectedDepartment) return doctors;
		return doctors.filter(doc => doc.department === selectedDepartment);
	});

	// Get patient list
	let patientList = $derived.by(() => $patients.data);
	let selectedPatient = $derived.by(() => patientList.find((patient) => patient.id === selectedPatientId));

	// External facilities
	let externalFacilities = $derived.by(() => {
		return COMMON_EXTERNAL_FACILITIES.map((f, idx) => ({
			id: `ext-facility-${idx}`,
			...f
		}));
	});

	// Form validation
	let isValid = $derived.by(() => {
		if (!selectedPatientId) return false;
		if (!reason || reason.length < 10) return false;
		if (referralType === 'internal' && !selectedDoctorId) return false;
		if (referralType === 'external' && !selectedExternalFacilityId) return false;
		return true;
	});

	// Add diagnosis code
	function addDiagnosisCode() {
		if (newDiagnosisCode && !diagnosisCodes.includes(newDiagnosisCode)) {
			diagnosisCodes = [...diagnosisCodes, newDiagnosisCode];
			newDiagnosisCode = '';
		}
	}

	// Remove diagnosis code
	function removeDiagnosisCode(code: string) {
		diagnosisCodes = diagnosisCodes.filter(c => c !== code);
	}

	// Add test
	function addTest() {
		if (newTest && !relevantTests.includes(newTest)) {
			relevantTests = [...relevantTests, newTest];
			newTest = '';
		}
	}

	// Remove test
	function removeTest(test: string) {
		relevantTests = relevantTests.filter(t => t !== test);
	}

	// Add medication
	function addMedication() {
		if (newMedication && !medications.includes(newMedication)) {
			medications = [...medications, newMedication];
			newMedication = '';
		}
	}

	// Remove medication
	function removeMedication(med: string) {
		medications = medications.filter(m => m !== med);
	}

	// Handle submit
	function handleSubmit() {
		if (!isValid) return;

		const fromDoctor = $users.data.find(u => u.id === fromDoctorId);

		let referralData: CreateReferralDto;

		if (referralType === 'internal') {
			const toDoctor = doctors.find(d => d.id === selectedDoctorId);
			referralData = {
				patientId: selectedPatientId,
				fromDoctorId,
				fromDepartment: fromDoctor?.department,
				toDoctorId: selectedDoctorId,
				toDepartment: toDoctor?.department,
				reason,
				urgency,
				clinicalSummary: clinicalSummary || undefined,
				diagnosisCodes,
				relevantTests,
				medications,
				notes: notes || undefined,
				status: 'pending',
				expiresAt: urgency === 'stat' ? new Date(Date.now() + 24 * 60 * 60 * 1000) :
				           urgency === 'urgent' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
			};
		} else {
			const facility = externalFacilities.find(f => f.id === selectedExternalFacilityId);
			if (!facility) return;

			referralData = {
				patientId: selectedPatientId,
				fromDoctorId,
				fromDepartment: fromDoctor?.department,
				externalFacility: {
					id: facility.id,
					name: facility.name,
					specialty: facility.specialty,
					address: facility.address,
					contact: facility.contact,
					website: facility.website,
					notes: facility.notes,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				reason,
				urgency,
				clinicalSummary: clinicalSummary || undefined,
				diagnosisCodes,
				relevantTests,
				medications,
				notes: notes || undefined,
				status: 'pending',
				expiresAt: urgency === 'stat' ? new Date(Date.now() + 24 * 60 * 60 * 1000) :
				           urgency === 'urgent' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
			};
		}

		if (onSubmit) {
			onSubmit(referralData);
		}
		dispatch('submit', referralData);
	}

	// Handle cancel
	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
		dispatch('cancel');
	}

	// Handle referral type change
	function handleReferralTypeChange(newType: 'internal' | 'external') {
		referralType = newType;
		selectedDoctorId = '';
		selectedDepartment = '';
		selectedExternalFacilityId = '';
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>{$t('referrals.form.title')}</CardTitle>
	</CardHeader>
	<CardContent>
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
			<!-- Patient Selection -->
				<div class="space-y-2">
					<Label for="patient">{$t('referrals.form.patient')} *</Label>
					{#if patientLocked && selectedPatient}
						<div class="rounded-[1.1rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)] px-4 py-3">
							<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
								{selectedPatient.fullName ?? `${selectedPatient.firstName} ${selectedPatient.lastName}`}
							</p>
							<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
								{selectedPatient.tcNo}
								{#if selectedPatient.contact.phone}
									· {formatPhoneNumber(selectedPatient.contact.phone)}
								{/if}
							</p>
						</div>
					{:else}
						<select id="patient" bind:value={selectedPatientId} class="referral-native-control">
							<option value="">{String($t('referrals.form.selectPatient'))}</option>
							{#each patientList as patient}
								<option value={patient.id}>
									{patient.fullName ?? `${patient.firstName} ${patient.lastName}`} - {patient.tcNo}
								</option>
							{/each}
						</select>
					{/if}
				</div>

			<!-- Referral Type -->
			<div class="space-y-2">
				<Label>{$t('referrals.form.referralType')} *</Label>
				<div class="flex gap-4">
					<button
						type="button"
						onclick={() => handleReferralTypeChange('internal')}
						class="flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors {referralType === 'internal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
					>
						<User class="h-5 w-5" />
						<span class="font-medium">{$t('referrals.form.internal')}</span>
					</button>
					<button
						type="button"
						onclick={() => handleReferralTypeChange('external')}
						class="flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors {referralType === 'external' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
					>
						<Building2 class="h-5 w-5" />
						<span class="font-medium">{$t('referrals.form.external')}</span>
					</button>
				</div>
			</div>

			{#if referralType === 'internal'}
				<!-- Department Selection -->
				<div class="space-y-2">
					<Label for="department">{$t('referrals.form.department')}</Label>
					<select id="department" bind:value={selectedDepartment} class="referral-native-control">
						<option value="">{String($t('common.all'))}</option>
						{#each departments as dept}
							<option value={dept}>{dept}</option>
						{/each}
					</select>
				</div>

				<!-- Doctor Selection -->
				<div class="space-y-2">
					<Label for="doctor">{$t('referrals.form.doctor')} *</Label>
					<select id="doctor" bind:value={selectedDoctorId} class="referral-native-control">
						<option value="">{String($t('referrals.form.selectDoctor'))}</option>
						{#each filteredDoctors as doctor}
							<option value={doctor.id}>
								{doctor.firstName} {doctor.lastName}
								{#if doctor.specialization}
									- {doctor.specialization}
								{/if}
							</option>
						{/each}
					</select>
				</div>
			{:else}
				<!-- External Facility Selection -->
				<div class="space-y-2">
					<Label for="facility">{$t('referrals.form.facility')} *</Label>
					<select id="facility" bind:value={selectedExternalFacilityId} class="referral-native-control">
						<option value="">{String($t('referrals.form.selectFacility'))}</option>
						{#each externalFacilities as facility}
							<option value={facility.id}>
								{facility.name} - {facility.specialty}
							</option>
						{/each}
					</select>
				</div>
			{/if}

			<Separator />

			<!-- Urgency -->
			<div class="space-y-2">
				<Label for="urgency">{$t('referrals.form.urgency')} *</Label>
				<select id="urgency" bind:value={urgency} class="referral-native-control">
					<option value="routine">{String($t('referrals.urgency.routine'))}</option>
					<option value="urgent">{String($t('referrals.urgency.urgent'))}</option>
					<option value="stat">{String($t('referrals.urgency.stat'))}</option>
				</select>
			</div>

			<!-- Reason -->
			<div class="space-y-2">
				<Label for="reason">{$t('referrals.form.reason')} *</Label>
				<Textarea
					id="reason"
					bind:value={reason}
					placeholder={$t('referrals.form.reasonPlaceholder')}
					rows={3}
					required
				/>
				<p class="text-sm text-muted-foreground">
					{reason.length}/500 {$t('referrals.form.minLength')}
				</p>
			</div>

			<!-- Clinical Summary -->
			<div class="space-y-2">
				<Label for="clinicalSummary">{$t('referrals.form.clinicalSummary')}</Label>
				<Textarea
					id="clinicalSummary"
					bind:value={clinicalSummary}
					placeholder={$t('referrals.form.clinicalSummaryPlaceholder')}
					rows={3}
				/>
			</div>

			<!-- Diagnosis Codes -->
			<div class="space-y-2">
				<Label>{$t('referrals.form.diagnosisCodes')}</Label>
				<div class="flex gap-2">
					<input
						bind:value={newDiagnosisCode}
						placeholder={String($t('referrals.form.addDiagnosisCode'))}
						class="referral-native-control flex-1"
						onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && (event.preventDefault(), addDiagnosisCode())}
					/>
					<Button type="button" variant="outline" onclick={addDiagnosisCode}>
						{$t('common.add')}
					</Button>
				</div>
				{#if diagnosisCodes.length > 0}
					<div class="flex flex-wrap gap-2 mt-2">
						{#each diagnosisCodes as code}
							<Badge variant="secondary" class="flex items-center gap-1">
								{code}
								<button
									type="button"
									onclick={() => removeDiagnosisCode(code)}
									class="ml-1 hover:text-destructive"
								>
									×
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Relevant Tests -->
			<div class="space-y-2">
				<Label>{$t('referrals.form.relevantTests')}</Label>
				<div class="flex gap-2">
					<input
						bind:value={newTest}
						placeholder={String($t('referrals.form.addTest'))}
						class="referral-native-control flex-1"
						onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && (event.preventDefault(), addTest())}
					/>
					<Button type="button" variant="outline" onclick={addTest}>
						{$t('common.add')}
					</Button>
				</div>
				{#if relevantTests.length > 0}
					<div class="flex flex-wrap gap-2 mt-2">
						{#each relevantTests as test}
							<Badge variant="secondary" class="flex items-center gap-1">
								{test}
								<button
									type="button"
									onclick={() => removeTest(test)}
									class="ml-1 hover:text-destructive"
								>
									×
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Medications -->
			<div class="space-y-2">
				<Label>{$t('referrals.form.currentMedications')}</Label>
				<div class="flex gap-2">
					<input
						bind:value={newMedication}
						placeholder={String($t('referrals.form.addMedication'))}
						class="referral-native-control flex-1"
						onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && (event.preventDefault(), addMedication())}
					/>
					<Button type="button" variant="outline" onclick={addMedication}>
						{$t('common.add')}
					</Button>
				</div>
				{#if medications.length > 0}
					<div class="flex flex-wrap gap-2 mt-2">
						{#each medications as med}
							<Badge variant="secondary" class="flex items-center gap-1">
								{med}
								<button
									type="button"
									onclick={() => removeMedication(med)}
									class="ml-1 hover:text-destructive"
								>
									×
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Notes -->
			<div class="space-y-2">
				<Label for="notes">{$t('referrals.form.additionalNotes')}</Label>
				<Textarea
					id="notes"
					bind:value={notes}
					placeholder={$t('referrals.form.notesPlaceholder')}
					rows={2}
				/>
			</div>

			{#if urgency !== 'routine'}
				<div class="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
					<AlertCircle class="h-5 w-5 text-yellow-600 mt-0.5" />
					<div class="text-sm">
						<p class="font-medium text-yellow-900">
							{urgency === 'stat' ? $t('referrals.form.statWarning') : $t('referrals.form.urgentWarning')}
						</p>
						<p class="text-yellow-700 mt-1">
							{urgency === 'stat' ? $t('referrals.form.statExpiry') : $t('referrals.form.urgentExpiry')}
						</p>
					</div>
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex justify-end gap-3 pt-4">
				<Button type="button" variant="outline" onclick={handleCancel}>
					{$t('common.cancel')}
				</Button>
				<Button type="submit" disabled={!isValid}>
					{$t('referrals.form.submit')}
				</Button>
			</div>
		</form>
</CardContent>
</Card>

<style>
	.referral-native-control {
		width: 100%;
		border: 1px solid var(--mf-line-soft);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.9);
		color: var(--mf-ink-strong);
		padding: 0.8rem 0.95rem;
		outline: none;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
		transition:
			border-color 160ms ease,
			box-shadow 160ms ease,
			background-color 160ms ease;
	}

	.referral-native-control:focus {
		border-color: rgba(12, 124, 145, 0.44);
		box-shadow:
			0 0 0 4px rgba(73, 201, 218, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.72);
	}
</style>
