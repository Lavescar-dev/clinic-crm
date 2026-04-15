<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { billing as billingStore } from '$stores/billing';
	import { lab } from '$stores/lab';
	import { patients as patientStore } from '$stores/patients';
	import { prescriptions as prescriptionStore } from '$stores/prescriptions';
	import { referrals } from '$stores/referrals';
	import { treatmentPlans } from '$stores/treatmentPlans';
	import { calculateAge, formatDate } from '$utils/date';
	import { formatPhoneNumber } from '$utils/formatting';
	import { formatCurrency } from '$utils/currency';
	import {
		ArrowLeft,
		CalendarPlus,
		Pencil,
		Phone
	} from 'lucide-svelte';
	import type { Patient } from '$types';

	type DetailEvent = {
		id: string;
		date: Date;
		typeLabel: string;
		description: string;
		statusLabel: string;
		statusClass: string;
	};

	function patientName(entry: Patient) {
		return entry.fullName ?? `${entry.firstName} ${entry.lastName}`;
	}

	function initials(entry: Patient) {
		return `${entry.firstName?.[0] ?? ''}${entry.lastName?.[0] ?? ''}`.toUpperCase();
	}

	function cityLabel(entry: Patient) {
		return entry.contact.address?.city || entry.contact.address?.state || 'Konum eklenmedi';
	}

	function addressLabel(entry: Patient) {
		const address = entry.contact.address;
		if (!address) return 'Adres bilgisi eklenmedi.';

		return [address.street, address.district, address.city, address.state, address.zipCode]
			.filter(Boolean)
			.join(', ');
	}

	function insuranceLabel(entry: Patient) {
		if (entry.insurance.type === 'sgk') return 'SGK';
		if (entry.insurance.type === 'private') {
			return entry.insurance.company || entry.insurance.provider || 'Özel Sigorta';
		}
		return 'Nakit / Direkt Ödeme';
	}

	function statusLabel(status: Patient['status']) {
		if (status === 'inactive') return 'Pasif';
		if (status === 'deceased') return 'Kapalı';
		return 'Aktif';
	}

	function statusClass(status: Patient['status']) {
		if (status === 'inactive') return 'bg-amber-100 text-amber-700';
		if (status === 'deceased') return 'bg-rose-100 text-rose-700';
		return 'bg-emerald-100 text-emerald-700';
	}

	function genderLabel(gender: Patient['gender']) {
		if (gender === 'male') return 'Erkek';
		if (gender === 'female') return 'Kadın';
		return 'Diğer';
	}

	function appointmentStatusLabel(status: string) {
		switch (status) {
			case 'scheduled':
				return 'Planlandı';
			case 'confirmed':
				return 'Onaylandı';
			case 'in-progress':
				return 'İşlemde';
			case 'completed':
				return 'Tamamlandı';
			case 'cancelled':
				return 'İptal';
			case 'no-show':
				return 'Gelmedi';
			default:
				return status;
		}
	}

	function invoiceStatusLabel(status: string) {
		switch (status) {
			case 'paid':
				return 'Ödendi';
			case 'pending':
				return 'Bekliyor';
			case 'overdue':
				return 'Gecikmiş';
			case 'cancelled':
				return 'İptal';
			default:
				return 'Taslak';
		}
	}

	function referralStatusLabel(status: string) {
		switch (status) {
			case 'pending':
				return 'Bekliyor';
			case 'accepted':
				return 'Kabul';
			case 'completed':
				return 'Tamamlandı';
			case 'rejected':
				return 'Reddedildi';
			case 'expired':
				return 'Süresi doldu';
			default:
				return status;
		}
	}

	function genericStatusClass(kind: 'good' | 'info' | 'warn' | 'danger') {
		if (kind === 'good') return 'bg-emerald-100 text-emerald-700';
		if (kind === 'warn') return 'bg-amber-100 text-amber-700';
		if (kind === 'danger') return 'bg-rose-100 text-rose-700';
		return 'bg-blue-100 text-blue-700';
	}

	function joinList(items: string[] | undefined, fallback: string) {
		return items && items.length > 0 ? items.join(', ') : fallback;
	}

	$: patientId = $page.params.id;
	$: patient = $patientStore.data.find((entry) => entry.id === patientId) ?? null;
	$: patientAppointments = [...$appointmentStore.data]
		.filter((entry) => entry.patientId === patientId)
		.sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
	$: patientInvoices = [...$billingStore.data]
		.filter((entry) => entry.patientId === patientId)
		.sort((left, right) => new Date(right.issueDate).getTime() - new Date(left.issueDate).getTime());
	$: patientLabOrders = [...$lab.orders]
		.filter((entry) => entry.patientId === patientId)
		.sort((left, right) => new Date(right.orderedAt).getTime() - new Date(left.orderedAt).getTime());
	$: patientPrescriptions = [...$prescriptionStore.prescriptions]
		.filter((entry) => entry.patientId === patientId)
		.sort((left, right) => new Date(right.issuedAt).getTime() - new Date(left.issuedAt).getTime());
	$: patientReferrals = [...$referrals.referrals]
		.filter((entry) => entry.patientId === patientId)
		.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
	$: patientTreatmentPlans = [...$treatmentPlans.plans]
		.filter((entry) => entry.patientId === patientId)
		.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

	$: upcomingAppointments = patientAppointments.filter(
		(entry) =>
			new Date(entry.date).getTime() >= Date.now() &&
			entry.status !== 'cancelled' &&
			entry.status !== 'no-show'
	);
	$: nextAppointment = upcomingAppointments[0] ?? null;
	$: completedAppointments = patientAppointments.filter((entry) => entry.status === 'completed');
	$: activeTreatmentPlans = patientTreatmentPlans.filter(
		(entry) => entry.status === 'not-started' || entry.status === 'in-progress' || entry.status === 'on-hold'
	);
	$: openCoordinationCount =
		patientLabOrders.filter((entry) => entry.status !== 'completed' && entry.status !== 'cancelled').length +
		patientReferrals.filter((entry) => entry.status === 'pending' || entry.status === 'accepted').length;
	$: outstandingBalance = patientInvoices.reduce((sum, entry) => sum + entry.remainingAmount, 0);
	$: latestTouchDate =
		patientAppointments[0]?.date ??
		patientInvoices[0]?.issueDate ??
		patientPrescriptions[0]?.issuedAt ??
		patientReferrals[0]?.createdAt ??
		null;

	$: timelineEvents = [
		...patientAppointments.map((entry) => ({
			id: `appointment-${entry.id}`,
			date: new Date(entry.date),
			typeLabel: 'Randevu',
			description: entry.reason,
			statusLabel: appointmentStatusLabel(entry.status),
			statusClass:
				entry.status === 'completed'
					? genericStatusClass('good')
					: entry.status === 'cancelled' || entry.status === 'no-show'
						? genericStatusClass('danger')
						: genericStatusClass('info')
		})),
		...patientPrescriptions.map((entry) => ({
			id: `prescription-${entry.id}`,
			date: new Date(entry.issuedAt),
			typeLabel: 'Reçete',
			description: entry.medications.map((medication) => medication.drugName).join(', '),
			statusLabel:
				entry.status === 'filled'
					? 'Tamamlandı'
					: entry.status === 'active'
						? 'Onaylandı'
						: entry.status === 'expired'
							? 'Süresi doldu'
							: 'İptal',
			statusClass:
				entry.status === 'filled'
					? genericStatusClass('good')
					: entry.status === 'active'
						? genericStatusClass('info')
						: genericStatusClass('warn')
		})),
		...patientLabOrders.map((entry) => ({
			id: `lab-${entry.id}`,
			date: new Date(entry.orderedAt),
			typeLabel: 'Laboratuvar',
			description: entry.orderId,
			statusLabel: entry.status === 'completed' ? 'Tamamlandı' : 'Takipte',
			statusClass: entry.status === 'completed' ? genericStatusClass('good') : genericStatusClass('warn')
		})),
		...patientInvoices.map((entry) => ({
			id: `invoice-${entry.id}`,
			date: new Date(entry.issueDate),
			typeLabel: 'Fatura',
			description: `${entry.invoiceNumber} • ${formatCurrency(entry.total)}`,
			statusLabel: invoiceStatusLabel(entry.status),
			statusClass:
				entry.status === 'paid'
					? genericStatusClass('good')
					: entry.status === 'overdue'
						? genericStatusClass('danger')
						: genericStatusClass('warn')
		})),
		...patientReferrals.map((entry) => ({
			id: `referral-${entry.id}`,
			date: new Date(entry.createdAt),
			typeLabel: 'Sevk',
			description: entry.reason,
			statusLabel: referralStatusLabel(entry.status),
			statusClass:
				entry.status === 'completed'
					? genericStatusClass('good')
					: entry.status === 'rejected' || entry.status === 'expired'
						? genericStatusClass('danger')
						: genericStatusClass('warn')
		}))
	]
		.filter((entry) => !Number.isNaN(entry.date.getTime()))
		.sort((left, right) => right.date.getTime() - left.date.getTime())
		.slice(0, 10) satisfies DetailEvent[];
</script>

{#if patient}
	<div class="min-h-screen bg-[#f8fafc] pb-20 font-sans">
		<div class="mx-auto max-w-7xl px-6 pt-10 sm:px-8 xl:px-10">
			<div class="mb-8 flex flex-wrap items-center gap-3">
				<button
					type="button"
					onclick={() => goto('/patients')}
					class="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
				>
					<ArrowLeft class="h-4 w-4" />
					Hasta listesi
				</button>
			</div>

			<div class="mb-12 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
				<div class="flex items-start gap-4">
					<div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 to-slate-700 text-2xl font-bold text-white shadow-inner">
						{initials(patient)}
					</div>
					<div>
						<h1 class="text-4xl font-semibold text-slate-900">{patientName(patient)}</h1>
						<p class="mt-1 text-lg text-slate-500">
							Hasta 360 • {statusLabel(patient.status)} • {insuranceLabel(patient)} • {cityLabel(patient)}
						</p>
					</div>
				</div>

				<div class="flex flex-wrap gap-4">
					<button
						type="button"
						onclick={() => goto(`/appointments/new?patientId=${patient.id}`)}
						class="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-3.5 font-medium text-white transition hover:bg-blue-700"
					>
						<CalendarPlus class="h-4 w-4" />
						Yeni Randevu
					</button>
					<button
						type="button"
						onclick={() => goto(`/patients/${patient.id}/edit`)}
						class="inline-flex items-center gap-3 rounded-2xl bg-slate-700 px-8 py-3.5 font-medium text-white transition hover:bg-slate-800"
					>
						<Pencil class="h-4 w-4" />
						Düzenle
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-8 xl:grid-cols-12">
				<div class="space-y-6 xl:col-span-4">
					<section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
						<div class="flex items-start justify-between">
							<div>
								<div class="text-xs font-medium tracking-wider text-slate-500">HASTA NO</div>
								<div class="mt-1 text-2xl font-semibold text-slate-900">{patient.tcNo}</div>
							</div>
							<span class={`rounded-2xl px-6 py-2 text-xs font-medium ${statusClass(patient.status)}`}>
								{statusLabel(patient.status)}
							</span>
						</div>

						<div class="mt-8 grid grid-cols-2 gap-y-7 text-sm">
							<div>
								<span class="text-slate-500">Yaş</span><br />
								<span class="text-xl font-semibold">{calculateAge(patient.birthDate)}</span>
							</div>
							<div>
								<span class="text-slate-500">Cinsiyet</span><br />
								<span class="font-semibold">{genderLabel(patient.gender)}</span>
							</div>
							<div>
								<span class="text-slate-500">Son Temas</span><br />
								<span class="font-semibold text-emerald-600">
									{latestTouchDate ? formatDate(latestTouchDate, 'dd.MM.yyyy') : 'Henüz yok'}
								</span>
							</div>
							<div>
								<span class="text-slate-500">Kayıt Tarihi</span><br />
								<span class="font-semibold">{formatDate(patient.createdAt, 'dd.MM.yyyy')}</span>
							</div>
						</div>
					</section>

					<section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
						<h2 class="mb-5 flex items-center gap-2 font-semibold">
							<Phone class="h-4 w-4" />
							İletişim ve Konum
						</h2>
						<div class="space-y-5 text-sm">
							<div class="flex items-center justify-between gap-4">
								<span class="text-slate-500">Telefon</span>
								<span class="font-medium">
									{patient.contact.phone ? formatPhoneNumber(patient.contact.phone) : 'Eklenmedi'}
								</span>
							</div>
							<div class="flex items-center justify-between gap-4">
								<span class="text-slate-500">E-posta</span>
								<span class={patient.contact.email ? 'font-medium text-slate-700' : 'text-slate-400'}>
									{patient.contact.email || 'Eklenmedi'}
								</span>
							</div>
							<div>
								<span class="mb-1 block text-slate-500">Adres</span>
								<span class="text-slate-700">{addressLabel(patient)}</span>
							</div>
						</div>
					</section>

					<section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
						<h2 class="mb-5 font-semibold">Destek Ağı</h2>
						<div class="flex items-center gap-4">
							<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 font-bold text-violet-700">
								{patient.emergencyContact.name
									? patient.emergencyContact.name
											.split(' ')
											.slice(0, 2)
											.map((part) => part[0])
											.join('')
											.toUpperCase()
									: 'NA'}
							</div>
							<div class="min-w-0 flex-1">
								<div class="font-medium">{patient.emergencyContact.name || 'Destek kişisi eklenmedi'}</div>
								<div class="text-xs text-slate-500">
									{patient.emergencyContact.relationship || 'Yakın / acil temas'}
								</div>
								<div class="mt-1 text-sm text-emerald-600">
									{patient.emergencyContact.phone
										? formatPhoneNumber(patient.emergencyContact.phone)
										: 'Telefon bilgisi yok'}
								</div>
							</div>
						</div>
					</section>
				</div>

				<div class="space-y-8 xl:col-span-8">
					<section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
						<div class="mb-6 flex items-center justify-between gap-4">
							<h2 class="text-lg font-semibold">Operasyon Masası</h2>
							<span class="rounded-2xl bg-slate-100 px-5 py-2 text-xs">Günün Klinik Çerçevesi</span>
						</div>

						<div class="grid gap-6 text-center md:grid-cols-2 xl:grid-cols-4">
							<div>
								<div class="text-xs text-slate-500">Planlı Ziyaret</div>
								<div class="mt-2 text-4xl font-bold text-blue-600">{upcomingAppointments.length}</div>
								<div class="mt-1 text-xs text-slate-400">
									{nextAppointment
										? `${formatDate(nextAppointment.date, 'dd/MM/yyyy')} • ${nextAppointment.startTime}`
										: 'Plan yok'}
								</div>
							</div>
							<div>
								<div class="text-xs text-slate-500">Bakım İvmesi</div>
								<div class="mt-2 text-4xl font-bold text-slate-700">{activeTreatmentPlans.length}</div>
								<div class="mt-1 text-xs text-slate-400">Aktif tedavi planı</div>
							</div>
							<div>
								<div class="text-xs text-slate-500">Açık Koordinasyon</div>
								<div class="mt-2 text-4xl font-bold text-slate-700">{openCoordinationCount}</div>
								<div class="mt-1 text-xs text-slate-400">
									{patientLabOrders.filter((entry) => entry.status !== 'completed' && entry.status !== 'cancelled').length}
									 tetkik •
									{patientReferrals.filter((entry) => entry.status === 'pending' || entry.status === 'accepted').length}
									 sevk
								</div>
							</div>
							<div>
								<div class="text-xs text-slate-500">Açık Bakiye</div>
								<div class="mt-2 text-4xl font-bold text-red-600">{formatCurrency(outstandingBalance)}</div>
								<div class="mt-1 text-xs text-slate-400">{patientInvoices.length} fatura kaydı</div>
							</div>
						</div>
					</section>

					<section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
						<h2 class="mb-5 font-semibold">
							Bakım Zaman Çizelgesi • {timelineEvents.length} Olay
						</h2>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b bg-slate-50 text-xs font-medium text-slate-500">
										<th class="px-8 py-5 text-left">TARİH</th>
										<th class="px-8 py-5 text-left">TİP</th>
										<th class="px-8 py-5 text-left">AÇIKLAMA</th>
										<th class="px-8 py-5 text-left">DURUM</th>
									</tr>
								</thead>
								<tbody class="divide-y text-slate-700">
									{#each timelineEvents as event}
										<tr class="transition-colors hover:bg-slate-50">
											<td class="px-8 py-5">{formatDate(event.date, 'dd.MM.yyyy')}</td>
											<td class="px-8 py-5">{event.typeLabel}</td>
											<td class="px-8 py-5">{event.description}</td>
											<td class="px-8 py-5">
												<span class={`rounded-full px-5 py-1 text-xs ${event.statusClass}`}>
													{event.statusLabel}
												</span>
											</td>
										</tr>
									{:else}
										<tr>
											<td colspan="4" class="px-8 py-10 text-center text-slate-500">
												Hasta için bakım olayı görünmüyor.
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>

					<section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
						<h2 class="mb-6 font-semibold">Klinik Profil</h2>
						<div class="grid gap-8 text-sm md:grid-cols-2">
							<div>
								<div class="mb-3 text-xs font-medium text-slate-500">ALERJİLER</div>
								<div class="text-slate-600">
									{joinList(patient.medicalHistory?.allergies, 'Aktif alerji kaydı görünmüyor.')}
								</div>
							</div>
							<div>
								<div class="mb-3 text-xs font-medium text-slate-500">GEÇMİŞ HASTALIKLAR</div>
								<div class="text-slate-600">
									{joinList(patient.medicalHistory?.pastIllnesses, 'Öne çıkan kronik geçmiş kaydı görünmüyor.')}
								</div>
							</div>
							<div>
								<div class="mb-3 text-xs font-medium text-slate-500">CERRAHİ ÖYKÜ</div>
								<div class="text-slate-600">
									{joinList(patient.medicalHistory?.surgeries, 'Cerrahi girişim kaydı eklenmedi.')}
								</div>
							</div>
							<div>
								<div class="mb-3 text-xs font-medium text-slate-500">SÜREGELEN İLAÇLAR</div>
								<div class="text-slate-600">
									{joinList(patient.medicalHistory?.medications, 'Sabit ilaç kullanımı bilgisi bulunmuyor.')}
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>

			<div class="mt-20 text-center text-xs text-slate-400">
				MedFlow Demo • Yerel Sandbox • Tüm veriler örnek amaçlıdır
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6">
		<div class="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
			<h1 class="text-2xl font-semibold text-slate-900">Hasta bulunamadı</h1>
			<p class="mt-3 text-slate-500">Bu kayıt silinmiş olabilir ya da bağlantı geçersiz.</p>
			<button
				type="button"
				onclick={() => goto('/patients')}
				class="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
			>
				<ArrowLeft class="h-4 w-4" />
				Hasta listesine dön
			</button>
		</div>
	</div>
{/if}

<style>
	tbody tr:nth-child(even) {
		background-color: #f8fafc;
	}

	tbody tr:hover {
		background-color: #f1f5f9;
	}
</style>
