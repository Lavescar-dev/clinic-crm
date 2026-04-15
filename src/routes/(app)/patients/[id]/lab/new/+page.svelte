<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { patients as patientStore } from '$stores/patients';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { users as userStore } from '$stores/users';
	import { lab } from '$stores/lab';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Input } from '$components/ui/input';
	import { Textarea } from '$components/ui/textarea';
	import { Badge } from '$components/ui/badge';
	import PatientActionHeader from '$lib/components/patients/PatientActionHeader.svelte';
	import LabTestSelector from '$lib/components/lab/LabTestSelector.svelte';
	import { LAB_TEST_CATALOG, type CreateLabOrderDto, type LabOrder, type LabPriority } from '$lib/types/lab';
	import type { Appointment, Patient, User } from '$types';
	import { formatDate } from '$utils/date';
	import { ArrowLeft, CheckCircle2, Clock3 } from 'lucide-svelte';

	type HeaderMetric = {
		label: string;
		value: string;
		detail: string;
		tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
	};

	let patient: Patient | null = null;
	let loading = true;
	let isSubmitting = false;
	let diagnosisICD10 = '';
	let notes = '';
	let selectedTests: string[] = [];
	let priority: LabPriority = 'routine';
	let patientOrders: LabOrder[] = [];
	let upcomingAppointments: Appointment[] = [];
	let currentDoctor: User | null = null;
	let patientRouteId = '';
	let headerMetrics: HeaderMetric[] = [];

	const priorityOptions: { value: LabPriority; label: string; detail: string }[] = [
		{ value: 'routine', label: 'Rutin', detail: 'Aynı gün operasyon akışına doğal şekilde eklenir.' },
		{ value: 'urgent', label: 'Öncelikli', detail: 'Hızlı sonuç takibi gereken istemler için.' },
		{ value: 'stat', label: 'Kritik', detail: 'Hemen işlenmesi gereken klinik sinyal.' }
	];

	function displayName(entry: Patient) {
		return entry.fullName ?? `${entry.firstName} ${entry.lastName}`;
	}

	$: selectedTestDetails = selectedTests
		.map((testId) => LAB_TEST_CATALOG[testId])
		.filter(Boolean);

	$: estimatedTurnaround = selectedTestDetails.reduce(
		(maxHours, test) => Math.max(maxHours, test.turnaroundTime),
		0
	);

	$: estimatedCost = selectedTestDetails.reduce((sum, test) => sum + test.price, 0);

	$: patientRouteId = patient?.id ?? '';

	$: if (patient) {
		headerMetrics = [
			{
				label: 'Seçili test',
				value: selectedTests.length > 0 ? `${selectedTests.length} panel` : 'Seçim bekliyor',
				detail:
					selectedTests.length > 0
						? `${estimatedTurnaround || 0} saat hedef dönüş`
						: 'Klinik tabloya göre panel seçilebilir.',
				tone: 'cyan'
			},
			{
				label: 'Açık istem',
				value: `${patientOrders.filter((order) => order.status !== 'completed').length}`,
				detail: `${patientOrders.length} toplam laboratuvar kaydı`,
				tone: 'amber'
			},
			{
				label: 'Planlı ziyaret',
				value: upcomingAppointments[0] ? formatDate(upcomingAppointments[0].date) : 'Takvim boş',
				detail: upcomingAppointments[0]
						? `${upcomingAppointments[0].startTime} · ${upcomingAppointments[0].doctorName || 'Takip viziti'}`
					: 'İstem doğrudan hasta dosyasına işlenir.',
				tone: 'emerald'
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
		patientOrders = await lab.getOrdersByPatient(patientId);
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

	async function handleSubmit() {
		if (!patient) return;

		if (selectedTests.length === 0) {
			toast.error('En az bir laboratuvar testi seçmelisin.');
			return;
		}

		isSubmitting = true;

		const orderData: CreateLabOrderDto = {
			patientId: patient.id,
			doctorId: currentDoctor?.id ?? 'doctor-demo',
			appointmentId: upcomingAppointments[0]?.id,
			tests: selectedTests,
			priority,
			status: 'pending',
			orderedAt: new Date(),
			notes: notes.trim() || undefined,
			diagnosisICD10: diagnosisICD10.trim() || undefined
		};

		const result = await lab.createOrder(orderData);
		isSubmitting = false;

		if (result.success && result.data) {
			toast.success('Laboratuvar istemi hasta dosyasına eklendi.');
			goto(`/lab/orders/${result.data.id}`);
			return;
		}

		toast.error(result.error || 'Laboratuvar istemi oluşturulamadı.');
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
			eyebrow="Laboratuvar aksiyonu"
			title="Yeni laboratuvar istemi"
			description="Bu istem yalnızca bu hastanın klinik bağlamında oluşturulur. Seçilen testler, öncelik ve notlar direkt hasta dosyasına bağlanır."
			metrics={headerMetrics}
		/>

		<div class="patient-action-page-grid">
			<Card class="mf-glass">
				<CardHeader class="space-y-3">
					<p class="mf-kicker text-[0.72rem] font-semibold">İstem kurulum alanı</p>
					<CardTitle class="text-[1.8rem] tracking-[-0.04em]">Test panelini seç ve klinik notu ekle</CardTitle>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="grid gap-4 lg:grid-cols-2">
						<div class="space-y-2">
							<label class="text-sm font-semibold text-[color:var(--mf-ink-strong)]" for="diagnosis">
								Tanı / ICD-10
							</label>
							<Input
								id="diagnosis"
								bind:value={diagnosisICD10}
								placeholder="Örn. E11.9 / I10 / Z00.0"
							/>
						</div>

						<div class="space-y-2">
							<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">Öncelik seviyesi</p>
							<div class="grid gap-2 sm:grid-cols-3">
								{#each priorityOptions as option}
									<button
										type="button"
										class={`priority-choice ${priority === option.value ? 'priority-choice-active' : ''}`}
										onclick={() => (priority = option.value)}
									>
										<span class="priority-choice-label">{option.label}</span>
										<span class="priority-choice-detail">{option.detail}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-semibold text-[color:var(--mf-ink-strong)]" for="notes">
							Klinik not
						</label>
						<Textarea
							id="notes"
							bind:value={notes}
							rows={4}
							placeholder="Test istem nedeni, semptom özeti veya ekip notunu buraya yaz."
						/>
					</div>

					<div class="space-y-3">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">Test seçimi</p>
								<p class="text-sm text-[color:var(--mf-ink-soft)]">
									Hasta bağlamında uygun panel ve alt testleri seç.
								</p>
							</div>
							{#if selectedTests.length > 0}
								<Badge variant="outline">{selectedTests.length} test seçildi</Badge>
							{/if}
						</div>

						<LabTestSelector
							selectedTests={selectedTests}
							onSelectionChange={(tests) => (selectedTests = tests)}
						/>
					</div>

					<div class="flex flex-col gap-3 border-t border-[color:var(--mf-line-soft)] pt-4 sm:flex-row sm:items-center sm:justify-end">
						<Button variant="outline" onclick={() => goto(`/patients/${patientRouteId}`)}>Vazgeç</Button>
						<Button onclick={handleSubmit} disabled={isSubmitting}>
							{#if isSubmitting}
								Oluşturuluyor...
							{:else}
								Laboratuvar istemini kaydet
							{/if}
						</Button>
					</div>
				</CardContent>
			</Card>

			<div class="space-y-4">
				<Card class="mf-panel-dark border-0">
					<CardContent class="space-y-5 px-6 pb-6 pt-9">
						<div class="mt-1 flex items-start justify-between gap-3">
							<div>
								<p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/72">
									Canlı istem özeti
								</p>
								<h2 class="mt-3 text-xl font-semibold text-[color:var(--mf-panel-dark-text)]">
									Bu istem hangi hızda dönecek?
								</h2>
							</div>
							<Clock3 class="h-5 w-5 text-cyan-200" />
						</div>

						<div class="grid gap-3">
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Tahmini dönüş</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									{selectedTests.length > 0 ? `${estimatedTurnaround || 0} saat` : 'Seçim bekleniyor'}
								</p>
							</div>
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Tahmini maliyet</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									₺{estimatedCost.toFixed(2)}
								</p>
							</div>
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Sorumlu hekim</p>
								<p class="mt-2 text-lg font-semibold text-[color:var(--mf-panel-dark-text)]">
									{currentDoctor?.fullName || 'Demo hekimi'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="mf-glass">
					<CardHeader class="space-y-2">
						<p class="mf-kicker text-[0.72rem] font-semibold">Secili testler</p>
						<CardTitle class="text-xl tracking-[-0.04em]">Panele giren kalemler</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if selectedTestDetails.length > 0}
							{#each selectedTestDetails as test}
								<div class="mf-soft-card rounded-[1.1rem] px-4 py-3">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">{test.name}</p>
											<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
												{test.code} · {test.turnaroundTime} saat · ₺{test.price}
											</p>
										</div>
										<CheckCircle2 class="h-4.5 w-4.5 shrink-0 text-emerald-600" />
									</div>
								</div>
							{/each}
						{:else}
							<div class="rounded-[1.2rem] border border-dashed border-[color:var(--mf-line-strong)] px-4 py-5 text-sm text-[color:var(--mf-ink-soft)]">
								Henuz bir test secilmedi. Sol taraftan panel ya da tekli test ekleyebilirsin.
							</div>
						{/if}
					</CardContent>
				</Card>

				<Card class="mf-glass">
					<CardHeader class="space-y-2">
						<p class="mf-kicker text-[0.72rem] font-semibold">Gecmis istemler</p>
						<CardTitle class="text-xl tracking-[-0.04em]">Son laboratuvar hareketleri</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if patientOrders.length > 0}
							{#each patientOrders.slice(0, 3) as order}
								<button
									type="button"
									class="action-side-link"
									onclick={() => goto(`/lab/orders/${order.id}`)}
								>
									<div>
										<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">{order.orderId}</p>
										<p class="mt-1 text-xs text-[color:var(--mf-ink-faint)]">
											{formatDate(order.orderedAt)} · {order.tests.length} test
										</p>
									</div>
									<Badge variant="outline">{order.status}</Badge>
								</button>
							{/each}
						{:else}
							<div class="rounded-[1.2rem] border border-dashed border-[color:var(--mf-line-strong)] px-4 py-5 text-sm text-[color:var(--mf-ink-soft)]">
								Bu hasta icin daha once kayitli laboratuvar istemi yok.
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
{/if}

<style>
	.patient-action-page-grid {
		display: grid;
		gap: 1.5rem;
	}

	.priority-choice {
		display: grid;
		gap: 0.35rem;
		padding: 0.95rem 1rem;
		border: 1px solid var(--mf-line-soft);
		border-radius: 1.15rem;
		background: rgba(255, 255, 255, 0.75);
		text-align: left;
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			box-shadow 180ms ease;
	}

	.priority-choice:hover {
		transform: translateY(-2px);
		border-color: var(--mf-line-strong);
		box-shadow: var(--mf-shadow-soft);
	}

	.priority-choice-active {
		border-color: rgba(16, 145, 164, 0.32);
		background: rgba(231, 249, 253, 0.92);
		box-shadow: var(--mf-shadow-soft);
	}

	.priority-choice-label {
		color: var(--mf-ink-strong);
		font-size: 0.95rem;
		font-weight: 700;
	}

	.priority-choice-detail {
		color: var(--mf-ink-soft);
		font-size: 0.8rem;
		line-height: 1.55;
	}

	.action-side-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		border: 1px solid var(--mf-line-soft);
		border-radius: 1.1rem;
		padding: 0.9rem 1rem;
		background: rgba(255, 255, 255, 0.8);
		text-align: left;
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			box-shadow 180ms ease;
	}

	.action-side-link:hover {
		transform: translateY(-2px);
		border-color: var(--mf-line-strong);
		box-shadow: var(--mf-shadow-soft);
	}

	@media (min-width: 1280px) {
		.patient-action-page-grid {
			grid-template-columns: minmax(0, 1.1fr) 360px;
			align-items: start;
		}
	}
</style>
