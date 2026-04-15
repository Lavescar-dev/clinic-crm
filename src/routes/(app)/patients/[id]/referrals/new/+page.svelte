<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { patients as patientStore } from '$stores/patients';
	import { referrals } from '$stores/referrals';
	import { users as userStore } from '$stores/users';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Badge } from '$components/ui/badge';
	import PatientActionHeader from '$lib/components/patients/PatientActionHeader.svelte';
	import ReferralForm from '$lib/components/referrals/ReferralForm.svelte';
	import type { Appointment, Patient, User } from '$types';
	import type { CreateReferralDto, Referral } from '$types/referral';
	import { formatDate } from '$utils/date';
	import { ArrowLeft, ArrowRightLeft } from 'lucide-svelte';

	type HeaderMetric = {
		label: string;
		value: string;
		detail: string;
		tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
	};

	let patient: Patient | null = null;
	let loading = true;
	let currentDoctor: User | null = null;
	let patientReferrals: Referral[] = [];
	let upcomingAppointments: Appointment[] = [];
	let isSubmitting = false;
	let patientRouteId = '';
	let headerMetrics: HeaderMetric[] = [];

	function displayName(entry: Patient) {
		return entry.fullName ?? `${entry.firstName} ${entry.lastName}`;
	}

	$: openReferrals = patientReferrals.filter(
		(referral) => !['completed', 'rejected', 'expired'].includes(referral.status)
	);

	$: patientRouteId = patient?.id ?? '';

	$: if (patient) {
		headerMetrics = [
			{
				label: 'Açık sevk',
				value: `${openReferrals.length}`,
				detail:
					openReferrals.length > 0
						? 'Dış koordinasyon bekleyen kayıtlar var.'
						: 'Yeni yönlendirme için temiz bir kanal var.',
				tone: openReferrals.length > 0 ? 'amber' : 'emerald'
			},
			{
				label: 'Toplam sevk',
				value: `${patientReferrals.length}`,
				detail: currentDoctor?.fullName || 'Demo doktoru üzerinden oluşturulur.',
				tone: 'cyan'
			},
			{
				label: 'Takip viziti',
				value: upcomingAppointments[0] ? formatDate(upcomingAppointments[0].date) : 'Plan yok',
				detail: upcomingAppointments[0]
					? `${upcomingAppointments[0].startTime} sonrası koordinasyon`
					: 'Sevk doğrudan hasta dosyasına işlenir.',
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
		patientReferrals = await referrals.getReferralsByPatient(patientId);
		upcomingAppointments = appointmentStore.data
			.filter(
				(appointment) =>
					appointment.patientId === patientId &&
					new Date(appointment.date).getTime() >= Date.now() &&
					appointment.status !== 'cancelled' &&
					appointment.status !== 'completed'
			)
			.sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

		currentDoctor =
			get(userStore).data.find((user) => user.role === 'doctor') ??
			get(userStore).data.find((user) => user.role === 'admin') ??
			null;
		loading = false;
	});

	async function handleSubmit(referralData: CreateReferralDto) {
		if (!patient) return;

		isSubmitting = true;
		const result = await referrals.createReferral(referralData);
		isSubmitting = false;

		if (result.success && result.data) {
			toast.success(`${displayName(patient)} için sevk kaydı oluşturuldu.`);
			goto(`/referrals/${result.data.id}`);
			return;
		}

		toast.error(result.error || 'Sevk oluşturulamadı.');
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
			eyebrow="Sevk aksiyonu"
			title="Bu hastaya özel sevk planla"
			description="Sevk formu hasta seçimi istemez; tüm bilgi doğrudan bu dosya bağlamında oluşur. Hekim, klinik özet ve hedef kurum bilgisi bu kayda bağlanır."
			metrics={headerMetrics}
		/>

		<div class="patient-referral-grid">
			<div class="space-y-4">
				<ReferralForm
					patientId={patientRouteId}
					fromDoctorId={currentDoctor?.id ?? 'user-1'}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
				/>
			</div>

			<div class="space-y-4">
				<Card class="mf-panel-dark border-0">
					<CardContent class="space-y-4 p-6">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/72">
									Koordinasyon notu
								</p>
								<h2 class="mt-3 text-xl font-semibold text-[color:var(--mf-panel-dark-text)]">
									Sevk akışında kim sorumlu?
								</h2>
							</div>
							<ArrowRightLeft class="h-5 w-5 text-cyan-200" />
						</div>

						<div class="grid gap-3">
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Gönderen hekim</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									{currentDoctor?.fullName || 'Demo hekimi'}
								</p>
							</div>
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Acil akış</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									{openReferrals.length > 0 ? `${openReferrals.length} takipte` : 'Temiz kanal'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="mf-glass">
					<CardHeader class="space-y-2">
						<p class="mf-kicker text-[0.72rem] font-semibold">Son sevkler</p>
						<CardTitle class="text-xl tracking-[-0.04em]">Bu hasta için açılan son kayıtlar</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if patientReferrals.length > 0}
							{#each patientReferrals.slice(0, 3) as referral}
								<button
									type="button"
									class="referral-side-link"
									onclick={() => goto(`/referrals/${referral.id}`)}
								>
									<div class="min-w-0">
										<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">
											{referral.reason}
										</p>
										<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
											{formatDate(referral.createdAt)} · {referral.urgency}
										</p>
									</div>
									<Badge variant={referral.status === 'completed' ? 'success' : referral.status === 'rejected' ? 'destructive' : 'outline'}>
										{referral.status}
									</Badge>
								</button>
							{/each}
						{:else}
							<div class="rounded-[1.2rem] border border-dashed border-[color:var(--mf-line-strong)] px-4 py-5 text-sm text-[color:var(--mf-ink-soft)]">
								Bu hasta için önceki sevk kaydı bulunmuyor.
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>

		{#if isSubmitting}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
				<div class="rounded-[1.25rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] px-5 py-4 shadow-[var(--mf-shadow-soft)]">
					Sevk kaydı oluşturuluyor...
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.patient-referral-grid {
		display: grid;
		gap: 1.5rem;
	}

	.referral-side-link {
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

	.referral-side-link:hover {
		transform: translateY(-2px);
		border-color: var(--mf-line-strong);
		box-shadow: var(--mf-shadow-soft);
	}

	@media (min-width: 1280px) {
		.patient-referral-grid {
			grid-template-columns: minmax(0, 1.08fr) 360px;
			align-items: start;
		}
	}
</style>
