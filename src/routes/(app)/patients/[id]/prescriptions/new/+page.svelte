<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { patients as patientStore } from '$stores/patients';
	import { prescriptions as prescriptionStore } from '$stores/prescriptions';
	import { users as userStore } from '$stores/users';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Badge } from '$components/ui/badge';
	import PatientActionHeader from '$lib/components/patients/PatientActionHeader.svelte';
	import PrescriptionForm from '$lib/components/emr/PrescriptionForm.svelte';
	import type { Patient, User } from '$types';
	import type { DrugInteraction, PrescriptionTracking } from '$lib/types/prescription';
	import { formatDate } from '$utils/date';
	import { ArrowLeft, AlertTriangle, Pill } from 'lucide-svelte';

	type HeaderMetric = {
		label: string;
		value: string;
		detail: string;
		tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
	};

	let patient: Patient | null = null;
	let loading = true;
	let currentDoctor: User | null = null;
	let activePrescriptions: PrescriptionTracking[] = [];
	let prescriptionHistory: PrescriptionTracking[] = [];
	let patientInteractions: DrugInteraction[] = [];
	let patientRouteId = '';
	let headerMetrics: HeaderMetric[] = [];

	function displayName(entry: Patient) {
		return entry.fullName ?? `${entry.firstName} ${entry.lastName}`;
	}

	function patientAge(entry: Patient) {
		if (!entry.birthDate) return undefined;
		const birthTimestamp = new Date(entry.birthDate).getTime();
		if (!Number.isFinite(birthTimestamp)) return undefined;
		return Math.floor((Date.now() - birthTimestamp) / (365.25 * 24 * 60 * 60 * 1000));
	}

	$: patientRouteId = patient?.id ?? '';

	$: if (patient) {
		headerMetrics = [
			{
				label: 'Aktif reçete',
				value: `${activePrescriptions.length}`,
				detail:
					activePrescriptions.length > 0
						? 'Devam eden ilaç akışı aktif olarak izleniyor.'
						: 'Yeni tedavi kurgusu için boş alan hazır.',
				tone: 'emerald'
			},
			{
				label: 'Etkileşim uyarısı',
				value: `${patientInteractions.length}`,
				detail:
					patientInteractions.length > 0
						? 'Majörlük durumuna göre dikkat gerektiriyor.'
						: 'Aktif çakışan ilaç sinyali görünmüyor.',
				tone: patientInteractions.length > 0 ? 'rose' : 'cyan'
			},
			{
				label: 'Geçmiş reçete',
				value: `${prescriptionHistory.length}`,
				detail: currentDoctor?.fullName || 'Demo doktoru üzerinden işlenir.',
				tone: 'amber'
			}
		];
	} else {
		headerMetrics = [];
	}

	onMount(async () => {
		const patientId = get(page).params.id;
		if (!patientId) {
			toast.error('Hasta kaydı bulunamadı.');
			goto('/patients');
			return;
		}
		const fetchedPatient = await patientStore.getPatientById(patientId);

		if (!fetchedPatient) {
			toast.error('Hasta kaydı bulunamadı.');
			goto('/patients');
			return;
		}

		patient = fetchedPatient;
		activePrescriptions = await prescriptionStore.getActivePrescriptions(patientId);
		prescriptionHistory = await prescriptionStore.getPrescriptionHistory(patientId);
		patientInteractions = await prescriptionStore.getPatientInteractions(patientId);
		currentDoctor =
			get(userStore).data.find((user) => user.role === 'doctor') ??
			get(userStore).data.find((user) => user.role === 'admin') ??
			null;
		loading = false;
	});

	function handleSuccess() {
		if (!patient) return;
		toast.success(`${displayName(patient)} için reçete kaydı oluşturuldu.`);
		goto(`/patients/${patient.id}`);
	}

	function handleCancel() {
		if (!patient) return;
		goto(`/patients/${patient.id}`);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>Yükleniyor...</p>
	</div>
{:else if patient}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<Button variant="ghost" class="w-fit" onclick={() => goto(`/patients/${patientRouteId}`)}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Hasta kartına dön
		</Button>

		<PatientActionHeader
			{patient}
			eyebrow="Reçete aksiyonu"
			title="Hastaya özel reçete akışı"
			description="İlaç seçimi, doz ve uyarı katmanı doğrudan bu hasta dosyasına bağlı ilerler. Aktif reçeteler ve etkileşim sinyalleri sağ panelde görünür."
			metrics={headerMetrics}
		/>

		<div class="patient-rx-grid">
			<div class="space-y-4">
				<PrescriptionForm
					patientId={patientRouteId}
					patientAge={patientAge(patient)}
					doctorId={currentDoctor?.id ?? 'doctor-demo'}
					on:success={handleSuccess}
					on:cancel={handleCancel}
				/>
			</div>

			<div class="space-y-4">
				<Card class="mf-panel-dark border-0">
					<CardContent class="space-y-4 p-6">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/72">
									İlaç güvenliği
								</p>
								<h2 class="mt-3 text-xl font-semibold text-[color:var(--mf-panel-dark-text)]">
									Aktif reçete ve uyarı görünümü
								</h2>
							</div>
							<Pill class="h-5 w-5 text-cyan-200" />
						</div>

						<div class="grid gap-3">
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Sorumlu hekim</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									{currentDoctor?.fullName || 'Demo doktoru'}
								</p>
							</div>
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Etkileşim</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									{patientInteractions.length > 0 ? `${patientInteractions.length} aktif uyarı` : 'Stabil'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{#if patientInteractions.length > 0}
					<Card class="border border-amber-200/70 bg-[color:var(--mf-warning-soft)]">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-amber-700">
								<AlertTriangle class="h-5 w-5" />
								İlaç etkileşimi sinyalleri
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each patientInteractions.slice(0, 3) as interaction}
								<div class="rounded-[1rem] border border-amber-200/80 bg-white/85 px-4 py-3">
									<div class="flex items-center gap-2">
										<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
											{interaction.drug1} + {interaction.drug2}
										</p>
										<Badge variant={interaction.severity === 'major' || interaction.severity === 'contraindicated' ? 'destructive' : 'warning'}>
											{interaction.severity}
										</Badge>
									</div>
									<p class="mt-2 text-sm text-[color:var(--mf-ink-soft)]">{interaction.description}</p>
								</div>
							{/each}
						</CardContent>
					</Card>
				{/if}

				<Card class="mf-glass">
					<CardHeader class="space-y-2">
						<p class="mf-kicker text-[0.72rem] font-semibold">Aktif ilaçlar</p>
						<CardTitle class="text-xl tracking-[-0.04em]">Devam eden reçete akışı</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if activePrescriptions.length > 0}
							{#each activePrescriptions.slice(0, 3) as prescription}
								<button
									type="button"
									class="rx-side-link"
									onclick={() => goto(`/prescriptions/${prescription.id}`)}
								>
									<div class="min-w-0">
										<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
											{prescription.prescriptionNumber}
										</p>
										<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
											{prescription.medications.slice(0, 2).map((medication) => medication.drugName).join(', ')}
										</p>
										<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
											{formatDate(prescription.issuedAt)} · {prescription.status}
										</p>
									</div>
									<Badge variant="success">Aktif</Badge>
								</button>
							{/each}
						{:else}
							<div class="rounded-[1.2rem] border border-dashed border-[color:var(--mf-line-strong)] px-4 py-5 text-sm text-[color:var(--mf-ink-soft)]">
								Bu hasta için aktif reçete akışı bulunmuyor. Sol taraftan yeni tedavi kurgusu açabilirsin.
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
{/if}

<style>
	.patient-rx-grid {
		display: grid;
		gap: 1.5rem;
	}

	.rx-side-link {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		border: 1px solid var(--mf-line-soft);
		border-radius: 1.1rem;
		padding: 0.9rem 1rem;
		background: rgba(255, 255, 255, 0.82);
		text-align: left;
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			box-shadow 180ms ease;
	}

	.rx-side-link:hover {
		transform: translateY(-2px);
		border-color: var(--mf-line-strong);
		box-shadow: var(--mf-shadow-soft);
	}

	@media (min-width: 1280px) {
		.patient-rx-grid {
			grid-template-columns: minmax(0, 1.08fr) 360px;
			align-items: start;
		}
	}
</style>
