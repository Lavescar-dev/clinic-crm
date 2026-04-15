<script lang="ts">
	import { page } from '$app/stores';
	import { prescriptions } from '$stores/prescriptions';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import CardDescription from '$components/ui/card/card-description.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import { format } from 'date-fns';
	import type { PrescriptionTracking, PrescriptionStatus, DrugInteraction } from '$lib/types/prescription';
	import { ArrowLeft, User, Stethoscope, Calendar, FileText, Pill, AlertTriangle, Printer, Check, X } from 'lucide-svelte';

	let prescription = $state<PrescriptionTracking | undefined>(undefined);
	let interactions = $state<DrugInteraction[]>([]);
	let loading = $state(true);
	let printMode = $state(false);

	onMount(() => {
		const prescriptionId = $page.params.id;
		if (!prescriptionId) {
			loading = false;
			return;
		}
		const foundPrescription = $prescriptions.prescriptions.find(p => p.id === prescriptionId);

		if (foundPrescription) {
			prescription = foundPrescription;
			loadInteractions(prescriptionId);
		}

		loading = false;
	});

	async function loadInteractions(prescriptionId: string) {
		interactions = await prescriptions.getPrescriptionInteractions(prescriptionId);
	}

	function getStatusBadgeVariant(status: PrescriptionStatus): 'success' | 'secondary' | 'outline' | 'destructive' | 'default' {
		switch (status) {
			case 'active':
				return 'success';
			case 'filled':
				return 'secondary';
			case 'expired':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function getSeverityBadgeVariant(severity: string) {
		switch (severity) {
			case 'contraindicated':
			case 'major':
				return 'destructive';
			case 'moderate':
				return 'warning';
			case 'minor':
				return 'outline';
			default:
				return 'default';
		}
	}

	function handlePrint() {
		printMode = true;
		setTimeout(() => {
			window.print();
			printMode = false;
		}, 100);
	}

	function statusCopy(status: PrescriptionStatus) {
		switch (status) {
			case 'active':
				return 'Reçete aktif, kullanım ve hasta takibi devam ediyor.';
			case 'filled':
				return 'Eczane teslimi tamamlanmış, ilaç akışı açılmış.';
			case 'expired':
				return 'Geçerlilik süresi dolmuş, yeni klinik değerlendirme gerekebilir.';
			case 'cancelled':
				return 'Reçete klinik akıştan çıkarılmış durumda.';
			default:
				return 'Reçete durumu sistemde izleniyor.';
		}
	}

	function statusLabel(status: PrescriptionStatus) {
		switch (status) {
			case 'active':
				return 'Aktif';
			case 'filled':
				return 'Teslim edildi';
			case 'expired':
				return 'Süresi doldu';
			case 'cancelled':
				return 'İptal edildi';
			default:
				return 'İzleniyor';
		}
	}
</script>

<svelte:head>
	{#if printMode}
		<style>
			@media print {
				body * {
					visibility: hidden;
				}
				.print-section, .print-section * {
					visibility: visible;
				}
				.print-section {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
				}
				.no-print {
					display: none !important;
				}
			}
		</style>
	{/if}
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>Reçete dosyası yükleniyor...</p>
	</div>
{:else if prescription}
	<div class="mf-page-shell space-y-6 p-4 md:p-6" class:print-section={printMode}>
		{#if !printMode}
			<PageHero
				eyebrow="Reçete Dosyası"
				title={prescription.prescriptionNumber}
				description={`${prescription.patientName || 'Bilinmeyen hasta'} · ${prescription.doctorName || 'Bilinmeyen hekim'} · ${format(new Date(prescription.issuedAt), 'dd.MM.yyyy')}`}
				class="no-print"
			>
				<Button variant="outline" onclick={() => goto('/prescriptions')}>
					<ArrowLeft class="h-4 w-4" />
					Reçetelere dön
				</Button>
				<Button variant="outline" onclick={handlePrint}>
					<Printer class="h-4 w-4" />
					Yazdır
				</Button>
				<Badge variant={getStatusBadgeVariant(prescription.status)}>{prescription.status}</Badge>
			</PageHero>
		{/if}

		<!-- Print Header (only visible when printing) -->
		{#if printMode}
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold">MedFlow Reçete Çıktısı</h1>
				<p class="text-sm text-muted-foreground mt-1">Reçete No: {prescription.prescriptionNumber}</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column: Main Prescription Info -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Patient & Doctor Info -->
				<Card>
					<CardHeader>
						<CardTitle>Reçete özeti</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="flex items-start gap-3">
								<User class="h-5 w-5 text-muted-foreground mt-0.5 no-print" />
								<div>
									<p class="text-sm font-medium">Hasta</p>
									<a href="/patients/{prescription.patientId}" class="text-primary hover:underline no-print">
										{prescription.patientName || 'Bilinmeyen hasta'}
									</a>
									{#if printMode}
										<p class="text-sm">{prescription.patientName || 'Bilinmeyen hasta'}</p>
									{/if}
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Stethoscope class="h-5 w-5 text-muted-foreground mt-0.5 no-print" />
								<div>
									<p class="text-sm font-medium">Yazan hekim</p>
									<p class="text-sm text-muted-foreground">{prescription.doctorName || 'Bilinmeyen hekim'}</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Calendar class="h-5 w-5 text-muted-foreground mt-0.5 no-print" />
								<div>
									<p class="text-sm font-medium">Düzenlenme tarihi</p>
									<p class="text-sm text-muted-foreground">
										{format(new Date(prescription.issuedAt), 'dd.MM.yyyy')}
									</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Calendar class="h-5 w-5 text-muted-foreground mt-0.5 no-print" />
								<div>
									<p class="text-sm font-medium">Geçerlilik bitişi</p>
									<p class="text-sm text-muted-foreground">
										{format(new Date(prescription.validUntil), 'dd.MM.yyyy')}
									</p>
								</div>
							</div>
						</div>

						{#if prescription.diagnosisName || prescription.diagnosisICD10}
							<Separator />
							<div>
								<p class="text-sm font-medium mb-1">Tanı</p>
								<div class="flex items-center gap-2">
									<p class="text-sm text-muted-foreground">{prescription.diagnosisName || 'Belirtilmedi'}</p>
									{#if prescription.diagnosisICD10}
										<Badge variant="outline" class="no-print">{prescription.diagnosisICD10}</Badge>
										{#if printMode}
											<span class="text-xs">({prescription.diagnosisICD10})</span>
										{/if}
									{/if}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Medications -->
				<Card>
					<CardHeader>
						<CardTitle>İlaç akışı</CardTitle>
						<CardDescription>{prescription.medications.length} ilaç kalemi bu reçeteye bağlı</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each prescription.medications as medication, index (index)}
								<div class="border rounded-lg p-4">
									<div class="flex items-start gap-3 mb-3">
										<Pill class="h-5 w-5 text-primary mt-0.5 no-print" />
										<div class="flex-1">
											<h4 class="font-semibold text-lg">{medication.drugName}</h4>
											{#if medication.genericName}
												<p class="text-sm text-muted-foreground">({medication.genericName})</p>
											{/if}
										</div>
										<Badge variant="outline" class="no-print">{medication.form}</Badge>
									</div>

									<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
										<div>
											<p class="text-xs text-muted-foreground">Doz</p>
											<p class="text-sm font-medium">{medication.dosage}</p>
										</div>
										<div>
											<p class="text-xs text-muted-foreground">Sıklık</p>
											<p class="text-sm font-medium">{medication.frequency}</p>
										</div>
										<div>
											<p class="text-xs text-muted-foreground">Süre</p>
											<p class="text-sm font-medium">{medication.duration}</p>
										</div>
										<div>
											<p class="text-xs text-muted-foreground">Miktar</p>
											<p class="text-sm font-medium">{medication.quantity}</p>
										</div>
									</div>

									{#if medication.instructions}
										<div class="mt-3">
											<p class="text-xs text-muted-foreground">Kullanım notu</p>
											<p class="text-sm">{medication.instructions}</p>
										</div>
									{/if}

									{#if medication.warnings && medication.warnings.length > 0}
										<div class="mt-3 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
											<p class="text-xs font-medium text-amber-900 dark:text-amber-100 flex items-center gap-1">
												<AlertTriangle class="h-3 w-3" />
												Uyarılar
											</p>
											<ul class="text-xs text-amber-800 dark:text-amber-200 mt-1 space-y-0.5">
												{#each medication.warnings as warning}
													<li>• {warning}</li>
												{/each}
											</ul>
										</div>
									{/if}

									{#if medication.refillsAllowed > 0}
										<div class="mt-2">
											<p class="text-xs text-muted-foreground">Tekrar yazım hakkı: {medication.refillsAllowed}</p>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Drug Interactions Warning -->
				{#if interactions.length > 0}
					<Card class="border-amber-200 dark:border-amber-800 no-print">
						<CardHeader class="bg-amber-50 dark:bg-amber-950">
							<CardTitle class="flex items-center gap-2 text-amber-900 dark:text-amber-100">
								<AlertTriangle class="h-5 w-5" />
								Etkileşim uyarıları
							</CardTitle>
							<CardDescription class="text-amber-800 dark:text-amber-200">
								{interactions.length} potansiyel ilaç etkileşimi bulundu
							</CardDescription>
						</CardHeader>
						<CardContent class="pt-6">
							<div class="space-y-4">
								{#each interactions as interaction}
									<div class="border-l-4 pl-4" class:border-red-500={interaction.severity === 'major' || interaction.severity === 'contraindicated'} class:border-amber-500={interaction.severity === 'moderate'} class:border-gray-300={interaction.severity === 'minor'}>
										<div class="flex items-center gap-2 mb-2">
											<p class="font-semibold">{interaction.drug1} + {interaction.drug2}</p>
											<Badge variant={getSeverityBadgeVariant(interaction.severity)}>
												{interaction.severity}
											</Badge>
										</div>
										<p class="text-sm text-muted-foreground mb-2">{interaction.description}</p>
										<p class="text-sm font-medium">Öneri: {interaction.recommendation}</p>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Notes -->
				{#if prescription.notes}
					<Card>
						<CardHeader>
							<CardTitle>Klinik notlar</CardTitle>
						</CardHeader>
						<CardContent>
							<p class="text-sm whitespace-pre-wrap">{prescription.notes}</p>
						</CardContent>
					</Card>
				{/if}
			</div>

			<!-- Right Column: Status & Actions -->
			<div class="space-y-6">
				<!-- Status Card -->
				<Card class="mf-panel-dark border-0">
					<CardHeader>
						<CardTitle class="text-[color:var(--mf-panel-dark-text)]">Durum</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<p class="text-sm text-cyan-100/72 mb-2">Aktif durum</p>
							<Badge variant={getStatusBadgeVariant(prescription.status)} class="text-base px-3 py-1">
								{statusLabel(prescription.status)}
							</Badge>
							<p class="mt-3 text-sm leading-6 text-cyan-50/80">{statusCopy(prescription.status)}</p>
						</div>

						{#if prescription.status === 'filled' && prescription.pharmacyFilled}
							<Separator />
							<div>
									<p class="text-sm font-medium mb-2 text-[color:var(--mf-panel-dark-text)]">Eczane bilgisi</p>
									<div class="space-y-2">
										<div>
											<p class="text-xs text-cyan-100/68">Eczane</p>
											<p class="text-sm text-[color:var(--mf-panel-dark-text)]">{prescription.pharmacyFilled.pharmacyName}</p>
										</div>
										<div>
											<p class="text-xs text-cyan-100/68">Teslim tarihi</p>
											<p class="text-sm text-[color:var(--mf-panel-dark-text)]">{format(new Date(prescription.pharmacyFilled.filledAt), 'dd.MM.yyyy')}</p>
										</div>
										{#if prescription.pharmacyFilled.pharmacistName}
											<div>
												<p class="text-xs text-cyan-100/68">Eczacı</p>
												<p class="text-sm text-[color:var(--mf-panel-dark-text)]">{prescription.pharmacyFilled.pharmacistName}</p>
											</div>
										{/if}
									</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Quick Actions (non-print) -->
				<Card class="mf-glass no-print">
					<CardHeader>
						<CardTitle>Hızlı aksiyonlar</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2">
						<Button variant="outline" class="w-full" onclick={handlePrint}>
							<Printer class="mr-2 h-4 w-4" />
							Reçeteyi yazdır
						</Button>
						<Button variant="outline" class="w-full" onclick={() => goto(`/patients/${prescription?.patientId}`)}>
							<User class="mr-2 h-4 w-4" />
							Hastayı aç
						</Button>
						{#if prescription.appointmentId}
							<Button variant="outline" class="w-full" onclick={() => goto(`/appointments/${prescription?.appointmentId}`)}>
								<Calendar class="mr-2 h-4 w-4" />
								Randevuyu aç
							</Button>
						{/if}
					</CardContent>
				</Card>

				<!-- Timeline -->
				<Card class="mf-glass no-print">
					<CardHeader>
						<CardTitle>Zaman çizgisi</CardTitle>
					</CardHeader>
					<CardContent>
							<div class="space-y-4">
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
										<Check class="h-4 w-4 text-primary-foreground" />
									</div>
									<div class="flex-1">
										<p class="text-sm font-medium">Reçete oluşturuldu</p>
										<p class="text-xs text-muted-foreground">
											{format(new Date(prescription.issuedAt), 'dd.MM.yyyy HH:mm')}
										</p>
									</div>
								</div>

							{#if prescription.status === 'filled' && prescription.pharmacyFilled}
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
										<Check class="h-4 w-4 text-primary-foreground" />
									</div>
									<div class="flex-1">
										<p class="text-sm font-medium">Eczane teslimi tamamlandı</p>
										<p class="text-xs text-muted-foreground">
											{format(new Date(prescription.pharmacyFilled.filledAt), 'dd.MM.yyyy HH:mm')}
										</p>
									</div>
								</div>
							{/if}

							{#if prescription.status === 'expired'}
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
										<X class="h-4 w-4 text-muted-foreground" />
									</div>
									<div class="flex-1">
										<p class="text-sm font-medium">Reçetenin süresi doldu</p>
										<p class="text-xs text-muted-foreground">
											{format(new Date(prescription.validUntil), 'dd.MM.yyyy')}
										</p>
									</div>
								</div>
							{/if}

							{#if prescription.status === 'cancelled'}
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
										<X class="h-4 w-4 text-destructive-foreground" />
									</div>
									<div class="flex-1">
										<p class="text-sm font-medium">Reçete iptal edildi</p>
										<p class="text-xs text-muted-foreground">
											{format(new Date(prescription.updatedAt), 'dd.MM.yyyy HH:mm')}
										</p>
									</div>
								</div>
							{/if}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Print Footer -->
		{#if printMode}
			<div class="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
				<p>Bu reçete {format(new Date(prescription.validUntil), 'dd.MM.yyyy')} tarihine kadar geçerlidir.</p>
				<p class="mt-1">Düzenleyen hekim: {prescription.doctorName}</p>
				<p class="mt-1">Reçete numarası: {prescription.prescriptionNumber}</p>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex flex-col items-center justify-center p-8">
		<AlertTriangle class="h-12 w-12 text-muted-foreground mb-4" />
		<h2 class="text-xl font-semibold mb-2">Reçete bulunamadı</h2>
		<p class="text-muted-foreground mb-4">Açmaya çalıştığınız reçete kaydı sistemde bulunmuyor.</p>
		<Button onclick={() => goto('/prescriptions')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Reçetelere dön
		</Button>
	</div>
{/if}
