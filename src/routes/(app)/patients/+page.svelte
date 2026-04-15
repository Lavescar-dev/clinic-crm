<script lang="ts">
	import { goto } from '$app/navigation';
	import { appointments } from '$stores/appointments';
	import { patients as patientStore } from '$stores/patients';
	import { language } from '$i18n';
	import { CalendarPlus, Eye, Pencil, Plus } from 'lucide-svelte';
	import { formatDate } from '$utils/date';
	import type { Patient } from '$types';

	type PatientWatchRow = {
		id: string;
		name: string;
		tc: string;
		appointmentDateLabel: string;
		appointmentTimeLabel: string;
		doctorLabel: string;
		insuranceLabel: string;
		insuranceType: 'sgk' | 'private' | 'none';
		statusLabel: string;
		statusTone: string;
		sortValue: number;
	};

	function toTimestamp(date: Date | string, time = '00:00') {
		const value = new Date(date);
		if (Number.isNaN(value.getTime())) return Number.POSITIVE_INFINITY;

		const [hours, minutes] = time.split(':').map(Number);
		value.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
		return value.getTime();
	}

	function formatTc(tcNo: string) {
		const clean = tcNo.replace(/\D/g, '').slice(0, 11);
		if (clean.length !== 11) return tcNo;
		return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
	}

	function insuranceLabel(type: 'sgk' | 'private' | 'none') {
		if (type === 'sgk') return 'SGK';
		if (type === 'private') return 'Özel';
		return 'Nakit';
	}

	function insuranceBadgeClass(type: 'sgk' | 'private' | 'none') {
		if (type === 'sgk') return 'bg-blue-100 text-blue-700';
		if (type === 'private') return 'bg-purple-100 text-purple-700';
		return 'bg-rose-100 text-rose-700';
	}

	function patientStatusLabel(status: Patient['status']) {
		if (status === 'inactive') return 'Pasif';
		if (status === 'deceased') return 'Kapalı';
		return 'Aktif';
	}

	function patientStatusTone(status: Patient['status']) {
		if (status === 'inactive') return 'bg-amber-100 text-amber-700';
		if (status === 'deceased') return 'bg-rose-100 text-rose-700';
		return 'bg-emerald-100 text-emerald-700';
	}

	$: currentLocale = $language === 'tr' ? 'tr' : 'en';
	$: todayLabel = new Intl.DateTimeFormat('tr-TR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		weekday: 'long'
	}).format(new Date());

	$: activePatients = $patientStore.data.filter((patient) => patient.status === 'active').length;
	$: inactivePatients = $patientStore.data.filter((patient) => patient.status === 'inactive').length;
	$: upcomingTouchpoints = $appointments.data.filter((appointment) => {
		const timestamp = toTimestamp(appointment.date, appointment.startTime);
		return timestamp > Date.now() && timestamp <= Date.now() + 1000 * 60 * 60 * 24 * 14;
	}).length;
	$: newlyRegistered = $patientStore.data.filter((patient) => {
		if (!patient.createdAt) return false;
		return new Date(patient.createdAt).getTime() >= Date.now() - 1000 * 60 * 60 * 24 * 30;
	}).length;

	$: patientRows = [...$patientStore.data]
		.map((patient) => {
			const patientAppointments = [...$appointments.data]
				.filter((appointment) => appointment.patientId === patient.id)
				.sort(
					(left, right) =>
						toTimestamp(left.date, left.startTime) - toTimestamp(right.date, right.startTime)
				);

			const nextAppointment =
				patientAppointments.find((appointment) => toTimestamp(appointment.date, appointment.startTime) >= Date.now()) ??
				patientAppointments[0];

			return {
				id: patient.id,
				name: patient.fullName ?? `${patient.firstName} ${patient.lastName}`,
				tc: formatTc(patient.tcNo),
				appointmentDateLabel: nextAppointment
					? formatDate(nextAppointment.date, 'dd.MM.yyyy', currentLocale)
					: '-',
				appointmentTimeLabel: nextAppointment?.startTime ?? '-',
				doctorLabel: nextAppointment?.doctorName ?? '-',
				insuranceLabel: insuranceLabel(patient.insurance.type),
				insuranceType: patient.insurance.type,
				statusLabel: patientStatusLabel(patient.status),
				statusTone: patientStatusTone(patient.status),
				sortValue: nextAppointment
					? toTimestamp(nextAppointment.date, nextAppointment.startTime)
					: Number.POSITIVE_INFINITY
			} satisfies PatientWatchRow;
		})
		.sort((left, right) => left.sortValue - right.sortValue || left.name.localeCompare(right.name, 'tr'));
</script>

<div class="mx-auto min-h-screen max-w-7xl bg-[#f8fafc] px-6 pb-16 pt-10 sm:px-8 xl:px-10">
	<div class="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<div class="text-xs font-medium tracking-[0.125em] text-slate-500">MEDFLOW CLINIC CRM • DEMO</div>
			<h1 class="mt-1 text-3xl font-semibold text-slate-900">Operasyon Masası</h1>
			<p class="mt-1 text-slate-600">Günlük Operasyon • Yaklaşan Temas Takibi</p>
		</div>

		<div class="text-left lg:text-right">
			<div class="text-lg font-medium text-slate-700">{todayLabel}</div>
			<div class="mt-2 flex flex-wrap items-center gap-3 lg:justify-end">
				<div class="flex items-center gap-2 rounded-md bg-emerald-50 px-5 py-2 text-xs font-medium text-emerald-700">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					STABİL • Bugün {upcomingTouchpoints} temas
				</div>
				<div class="rounded-md bg-slate-100 px-4 py-2 text-xs text-slate-600">Yerel Demo Modu</div>
			</div>
		</div>
	</div>

	<div class="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<div class="text-xs font-medium tracking-wider text-slate-500">AKTİF HASTA</div>
			<div class="mt-3 text-6xl font-bold text-teal-700">{activePatients}</div>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<div class="text-xs font-medium tracking-wider text-slate-500">PASİF DOSYA</div>
			<div class="mt-3 text-6xl font-bold text-amber-600">{inactivePatients}</div>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<div class="text-xs font-medium tracking-wider text-slate-500">YAKIN TEMAS</div>
			<div class="mt-3 text-6xl font-bold text-blue-700">{upcomingTouchpoints}</div>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<div class="text-xs font-medium tracking-wider text-slate-500">YENİ KAYIT</div>
			<div class="mt-3 text-6xl font-bold text-slate-700">{newlyRegistered}</div>
		</div>
	</div>

	<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div class="flex flex-col gap-5 border-b bg-slate-50 px-6 py-6 sm:px-9 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<div class="text-xl font-semibold text-slate-900">FOLLOW-UP WATCHLIST</div>
				<div class="mt-1 text-sm text-slate-500">Yaklaşan hasta temasları • Randevuya en yakın kayıtlar</div>
			</div>

			<button
				type="button"
				onclick={() => goto('/patients/new')}
				class="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-3.5 font-medium text-white shadow transition-all hover:bg-blue-700"
			>
				<Plus class="h-4 w-4" />
				<span>Yeni Ekle</span>
			</button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-slate-50 text-xs font-medium text-slate-500">
						<th class="px-9 py-6 text-left">HASTA ADI</th>
						<th class="px-6 py-6 text-left">TC KİMLİK NO</th>
						<th class="px-6 py-6 text-left">RANDEVU TARİHİ</th>
						<th class="px-6 py-6 text-left">SAAT</th>
						<th class="px-6 py-6 text-left">DOKTOR</th>
						<th class="px-6 py-6 text-left">ÖDEME TİPİ</th>
						<th class="px-9 py-6 text-left">DURUM</th>
						<th class="w-32 px-9 py-6 text-left">İŞLEMLER</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-slate-700">
					{#each patientRows as patient}
						<tr class="transition-colors hover:bg-slate-50">
							<td class="px-9 py-6 font-medium">{patient.name}</td>
							<td class="px-6 py-6">{patient.tc}</td>
							<td class="px-6 py-6">{patient.appointmentDateLabel}</td>
							<td class="px-6 py-6 font-medium">{patient.appointmentTimeLabel}</td>
							<td class="px-6 py-6 text-slate-600">{patient.doctorLabel}</td>
							<td class="px-6 py-6">
								<span class={`rounded-full px-4 py-1 text-xs font-medium ${insuranceBadgeClass(patient.insuranceType)}`}>
									{patient.insuranceLabel}
								</span>
							</td>
							<td class="px-9 py-6">
								<span class={`rounded-full px-5 py-1 text-xs font-medium ${patient.statusTone}`}>
									{patient.statusLabel}
								</span>
							</td>
							<td class="px-9 py-6">
								<div class="flex gap-4">
									<button
										type="button"
										onclick={() => goto(`/patients/${patient.id}`)}
										class="text-blue-600 transition hover:text-blue-700"
										title="Görüntüle"
									>
										<Eye class="h-4 w-4" />
									</button>
									<button
										type="button"
										onclick={() => goto(`/appointments/new?patientId=${patient.id}`)}
										class="text-emerald-600 transition hover:text-emerald-700"
										title="Randevu Ekle"
									>
										<CalendarPlus class="h-4 w-4" />
									</button>
									<button
										type="button"
										onclick={() => goto(`/patients/${patient.id}/edit`)}
										class="text-amber-600 transition hover:text-amber-700"
										title="Düzenle"
									>
										<Pencil class="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="8" class="px-9 py-16 text-center text-sm text-slate-500">
								Hasta kaydı bulunamadı.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<div class="mt-16 text-center text-xs text-slate-400">
		MedFlow Operasyon Masası • Yerel Sandbox • Tüm veriler örnek amaçlıdır
	</div>
</div>

<style>
	tbody tr:nth-child(even) {
		background-color: #f8fafc;
	}
</style>
