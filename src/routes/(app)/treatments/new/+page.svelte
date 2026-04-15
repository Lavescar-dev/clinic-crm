<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { nanoid } from 'nanoid';
	import { t, language } from '$i18n';
	import { currentUser } from '$lib/stores';
	import { patients } from '$stores/patients';
	import { users } from '$stores/users';
	import { treatmentPlans } from '$stores/treatmentPlans';
	import { PREDEFINED_PROTOCOLS } from '$lib/types/treatmentPlan';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';

	const protocols = Object.entries(PREDEFINED_PROTOCOLS);
	const doctorOptions = get(users).data.filter((user) => user.role === 'doctor');

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	let patientId = $state($page.url.searchParams.get('patientId') || '');
	let diagnosisICD10 = $state('');
	let protocolKey = $state(protocols[0]?.[0] ?? 'physiotherapy_standard');
	let startDate = $state(new Date().toISOString().slice(0, 10));
	let doctorId = $state(
		($currentUser?.role === 'doctor' ? $currentUser.id : doctorOptions[0]?.id) ?? ''
	);
	let isSubmitting = $state(false);

	async function handleSubmit() {
		const protocol = PREDEFINED_PROTOCOLS[protocolKey];
		if (!patientId || !doctorId || !protocol) {
			toast.error(
				translate(
					'treatments.messages.createFailed',
					'Hasta, doktor ve protokol seçmeniz gerekiyor.',
					'Patient, doctor, and protocol are required.'
				)
			);
			return;
		}

		isSubmitting = true;
		const result = await treatmentPlans.createPlan({
			patientId,
			doctorId,
			diagnosisICD10: diagnosisICD10.trim() || undefined,
			startDate: new Date(startDate),
			status: 'not-started',
			totalSessions: protocol.sessionCount,
			protocol
		});
		isSubmitting = false;

		if (result.success && result.data) {
			toast.success(
				translate('treatments.messages.planCreated', 'Tedavi planı oluşturuldu.', 'Treatment plan created.')
			);
			goto(`/treatments/${result.data.id}`);
			return;
		}

		toast.error(
			result.error ||
				translate(
					'treatments.messages.createFailed',
					'Tedavi planı oluşturulamadı.',
					'Failed to create treatment plan.'
				)
		);
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<div>
			<p class="mf-kicker text-[0.72rem] font-semibold">Tedavi</p>
			<h1 class="text-3xl font-bold">{translate('treatments.newPlan', 'Yeni Tedavi Planı', 'New treatment plan')}</h1>
		</div>
		<Button variant="outline" onclick={() => goto('/treatments')}>
			{translate('common.cancel', 'Vazgeç', 'Cancel')}
		</Button>
	</div>

	<Card class="max-w-4xl">
		<CardHeader>
			<CardTitle>{translate('treatments.planDetails', 'Plan Detayları', 'Plan details')}</CardTitle>
		</CardHeader>
		<CardContent class="grid gap-4 md:grid-cols-2">
			<label class="space-y-2">
				<span class="text-sm font-medium">{translate('treatments.fields.patient', 'Hasta', 'Patient')}</span>
				<select bind:value={patientId} class="referral-native-control">
					<option value="">{translate('patient.form.selectPatient', 'Hasta seçin', 'Select patient')}</option>
					{#each $patients.data as patient}
						<option value={patient.id}>
							{patient.fullName ?? `${patient.firstName} ${patient.lastName}`}
						</option>
					{/each}
				</select>
			</label>

			<label class="space-y-2">
				<span class="text-sm font-medium">{translate('treatments.fields.doctor', 'Doktor', 'Doctor')}</span>
				<select bind:value={doctorId} class="referral-native-control">
					<option value="">{translate('appointments.form.selectDoctor', 'Doktor seçin', 'Select doctor')}</option>
					{#each doctorOptions as doctor}
						<option value={doctor.id}>{doctor.fullName}</option>
					{/each}
				</select>
			</label>

			<label class="space-y-2 md:col-span-2">
				<span class="text-sm font-medium">{translate('treatments.fields.protocol', 'Protokol', 'Protocol')}</span>
				<select bind:value={protocolKey} class="referral-native-control">
					{#each protocols as [key, protocol]}
						<option value={key}>{protocol.name}</option>
					{/each}
				</select>
			</label>

			<label class="space-y-2">
				<span class="text-sm font-medium">{translate('treatments.fields.startDate', 'Başlangıç Tarihi', 'Start date')}</span>
				<input bind:value={startDate} type="date" class="referral-native-control" />
			</label>

			<label class="space-y-2">
				<span class="text-sm font-medium">{translate('treatments.fields.diagnosis', 'Tanı', 'Diagnosis')}</span>
				<input bind:value={diagnosisICD10} type="text" placeholder="ICD-10" class="referral-native-control" />
			</label>

			<div class="rounded-[1.25rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-muted)] p-4 md:col-span-2">
				<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
					{PREDEFINED_PROTOCOLS[protocolKey]?.name}
				</p>
				<p class="mt-2 text-sm text-[color:var(--mf-ink)]">
					{PREDEFINED_PROTOCOLS[protocolKey]?.description}
				</p>
				<p class="mt-3 text-xs text-[color:var(--mf-ink-faint)]">
					{PREDEFINED_PROTOCOLS[protocolKey]?.sessionCount} seans · {PREDEFINED_PROTOCOLS[protocolKey]?.frequency} · {PREDEFINED_PROTOCOLS[protocolKey]?.sessionDuration} dk
				</p>
			</div>
		</CardContent>
	</Card>

	<div class="flex justify-end">
		<Button onclick={handleSubmit} disabled={isSubmitting}>
			{translate('treatments.newPlan', 'Yeni Tedavi Planı', 'New treatment plan')}
		</Button>
	</div>
</div>
