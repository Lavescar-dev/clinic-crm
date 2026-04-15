<svelte:options runes={false} />

<script lang="ts">
	import { goto } from '$app/navigation';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { language } from '$i18n';
	import DoctorEventCalendar from '$lib/components/appointments/DoctorEventCalendar.svelte';
	import { generateDoctorScheduleBlocks } from '$data/doctorScheduleBlocks';
	import { mockUsers } from '$data/users';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import type { Appointment } from '$types';

	function isSameDay(left: Date, right: Date) {
		return (
			left.getFullYear() === right.getFullYear() &&
			left.getMonth() === right.getMonth() &&
			left.getDate() === right.getDate()
		);
	}

	function appointmentDate(entry: Appointment) {
		return new Date(entry.date);
	}

	function statusLabel(status: Appointment['status']) {
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

	function statusClass(status: Appointment['status']) {
		switch (status) {
			case 'completed':
				return 'bg-emerald-100 text-emerald-700';
			case 'cancelled':
				return 'bg-red-100 text-red-700';
			case 'no-show':
				return 'bg-amber-100 text-amber-700';
			case 'in-progress':
				return 'bg-cyan-100 text-cyan-700';
			case 'confirmed':
				return 'bg-blue-100 text-blue-700';
			default:
				return 'bg-slate-100 text-slate-700';
		}
	}

	function appointmentTypeLabel(type: Appointment['type']) {
		switch (type) {
			case 'follow-up':
				return 'Kontrol';
			case 'emergency':
				return 'Acil';
			case 'routine-checkup':
				return 'Rutin';
			default:
				return 'Muayene';
		}
	}

	function dayMode(count: number) {
		if (count >= 18) return { label: 'YOĞUN', color: 'text-amber-600' };
		if (count >= 8) return { label: 'DENGELİ', color: 'text-blue-600' };
		return { label: 'SAKİN', color: 'text-emerald-600' };
	}

	$: locale = $language === 'tr' ? tr : undefined;
	$: today = new Date();
	$: todayLabel = format(today, 'd MMMM yyyy • EEEE', { locale });
	$: sortedAppointments = [...$appointmentStore.data].sort((left, right) => {
		const dateCompare = appointmentDate(right).getTime() - appointmentDate(left).getTime();
		return dateCompare !== 0 ? dateCompare : right.startTime.localeCompare(left.startTime);
	});
	$: todaysAppointments = sortedAppointments
		.filter((entry) => isSameDay(appointmentDate(entry), today))
		.sort((left, right) => left.startTime.localeCompare(right.startTime));
	$: nextOperationalAppointments = (() => {
		const upcoming = [...$appointmentStore.data]
			.filter((entry) => appointmentDate(entry).getTime() >= new Date().setHours(0, 0, 0, 0))
			.sort((left, right) => {
				const dateCompare = appointmentDate(left).getTime() - appointmentDate(right).getTime();
				return dateCompare !== 0 ? dateCompare : left.startTime.localeCompare(right.startTime);
			});

		const firstDate = upcoming[0] ? appointmentDate(upcoming[0]) : null;
		return firstDate ? upcoming.filter((entry) => isSameDay(appointmentDate(entry), firstDate)) : [];
	})();
	$: summaryAppointments = todaysAppointments.length > 0 ? todaysAppointments : nextOperationalAppointments;
	$: summaryDate = summaryAppointments[0] ? appointmentDate(summaryAppointments[0]) : today;
	$: summaryDateLabel = format(summaryDate, 'd MMMM • EEEE', { locale });
	$: nextDayCount = summaryAppointments.length;
	$: mode = dayMode(nextDayCount);
	$: activeFlowCount = summaryAppointments.filter(
		(entry) => entry.status === 'confirmed' || entry.status === 'in-progress'
	).length;
	$: confirmedCount = summaryAppointments.filter((entry) => entry.status === 'confirmed').length;
	$: completedCount = summaryAppointments.filter((entry) => entry.status === 'completed').length;
	$: noShowCount = summaryAppointments.filter((entry) => entry.status === 'no-show').length;
	$: visibleAppointments = sortedAppointments.slice(0, 20);
	$: doctorDirectory = mockUsers.filter((user) => user.role === 'doctor');
	$: doctorTabs = doctorDirectory
		.map((doctor) => {
			const doctorAppointments = sortedAppointments.filter((entry) => entry.doctorId === doctor.id);
			const upcoming = doctorAppointments.filter(
				(entry) =>
					appointmentDate(entry).getTime() >= new Date().setHours(0, 0, 0, 0) &&
					entry.status !== 'cancelled' &&
					entry.status !== 'no-show'
			);
			return {
				id: doctor.id,
				name: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`.trim(),
				specialty: doctor.specialization || doctor.department || 'Poliklinik',
				total: doctorAppointments.length,
				nextSlot: upcoming[0]
					? `${format(appointmentDate(upcoming[0]), 'dd MMM', { locale })} • ${upcoming[0].startTime}`
					: 'Uygun slot'
			};
		})
		.filter((doctor) => doctor.total > 0)
		.sort((left, right) => right.total - left.total || left.name.localeCompare(right.name, 'tr'));
	let selectedDoctorId = $state('');
	$: if (!selectedDoctorId && doctorTabs.length > 0) {
		selectedDoctorId = doctorTabs[0].id;
	}
	$: selectedDoctor = doctorDirectory.find((doctor) => doctor.id === selectedDoctorId) ?? doctorDirectory[0] ?? null;
	$: selectedDoctorAppointments = sortedAppointments.filter((entry) => entry.doctorId === selectedDoctorId);
	$: calendarFocusDate =
		selectedDoctorAppointments.find(
			(entry) => appointmentDate(entry).getTime() >= new Date().setHours(0, 0, 0, 0)
		)?.date ?? summaryDate;
	$: scheduleBlocks = selectedDoctor
		? generateDoctorScheduleBlocks(selectedDoctor, (() => {
				const base = new Date(calendarFocusDate);
				const shift = (base.getDay() + 6) % 7;
				base.setDate(base.getDate() - shift);
				base.setHours(0, 0, 0, 0);
				return base;
			})())
		: [];
</script>

<div class="min-h-screen bg-[#f8fafc] pb-20 font-sans">
	<div class="mx-auto max-w-7xl px-6 pt-10 sm:px-8 xl:px-10">
		<div class="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<div class="text-xs font-medium tracking-widest text-slate-500">PLANLAMA • RANDEVULAR</div>
				<h1 class="text-4xl font-semibold text-slate-900">Randevu Akışı</h1>
			</div>
			<div class="text-left lg:text-right">
				<div class="text-lg font-medium text-slate-700">{todayLabel}</div>
				<div class="mt-2 flex flex-wrap items-center gap-3 lg:justify-end">
					<div class="flex items-center gap-2 rounded-md bg-emerald-50 px-5 py-2 text-xs font-medium text-emerald-700">
						<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
						STABİL • Bugün {todaysAppointments.length} randevu
					</div>
					<div class="rounded-md bg-slate-100 px-4 py-2 text-xs text-slate-600">Yerel Demo Modu</div>
				</div>
			</div>
		</div>

		<div class="mb-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-3xl border border-slate-200 bg-white p-8 text-center">
				<div class="text-xs font-medium text-slate-500">SIRADAKİ GÜN</div>
				<div class="mt-4 text-6xl font-bold text-blue-600">{nextDayCount}</div>
				<div class="mt-1 text-sm text-slate-500">randevu</div>
				<div class="mt-6 text-xs text-slate-400">{summaryDateLabel}</div>
			</div>
			<div class="rounded-3xl border border-slate-200 bg-white p-8 text-center">
				<div class="text-xs font-medium text-slate-500">GÜN MODU</div>
				<div class={`mt-4 text-6xl font-bold ${mode.color}`}>{mode.label}</div>
				<div class="mt-1 text-sm text-slate-500">Poliklinik</div>
			</div>
			<div class="rounded-3xl border border-slate-200 bg-white p-8 text-center">
				<div class="text-xs font-medium text-slate-500">AKIŞTA</div>
				<div class="mt-4 text-6xl font-bold text-teal-600">{activeFlowCount}</div>
				<div class="mt-1 text-sm text-slate-500">aktif slot</div>
				<div class="mt-4 text-xs text-emerald-600">Onaylı: {confirmedCount} kayıt</div>
			</div>
			<div class="rounded-3xl border border-slate-200 bg-white p-8 text-center">
				<div class="text-xs font-medium text-slate-500">KAPANAN / RİSK</div>
				<div class="mt-6 flex justify-center gap-8">
					<div class="text-center">
						<div class="text-4xl font-bold text-slate-700">{completedCount}</div>
						<div class="text-xs text-slate-500">Kapanan</div>
					</div>
					<div class="text-center">
						<div class="text-4xl font-bold text-red-600">{noShowCount}</div>
						<div class="text-xs text-slate-500">No-Show</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mb-12 rounded-3xl border border-slate-200 bg-white p-8">
			<div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 class="text-2xl font-semibold">DOKTOR TAKVİMİ</h2>
					<p class="text-slate-500">
						{format(summaryDate, 'd MMMM yyyy', { locale })} haftası • Haftalık Görünüm
					</p>
				</div>
				<div class="text-sm font-medium text-slate-400">Burada gerçek takvim bileşeni olacak</div>
			</div>

			{#if doctorTabs.length > 0}
				<div class="mb-5 flex flex-wrap gap-3">
					{#each doctorTabs as doctor}
						<button
							type="button"
							onclick={() => (selectedDoctorId = doctor.id)}
							class={`rounded-2xl border px-4 py-3 text-left transition ${
								selectedDoctorId === doctor.id
									? 'border-cyan-200 bg-cyan-50 text-slate-900 shadow-sm'
									: 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
							}`}
						>
							<div class="text-sm font-semibold">{doctor.name}</div>
							<div class="text-xs text-slate-500">{doctor.specialty}</div>
							<div class="mt-2 text-[11px] text-slate-400">{doctor.total} kayıt • {doctor.nextSlot}</div>
						</button>
					{/each}
				</div>

				<div class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
					<DoctorEventCalendar
						appointments={selectedDoctorAppointments}
						scheduleBlocks={scheduleBlocks}
						focusDate={new Date(calendarFocusDate)}
						locale={$language === 'tr' ? 'tr' : 'en'}
						viewMode="week"
						onEventOpen={(appointmentId) => goto(`/appointments/${appointmentId}`)}
					/>
				</div>
			{:else}
				<div class="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50">
					<div class="mb-6 text-7xl text-slate-300">+</div>
					<h3 class="text-center text-xl font-semibold text-slate-400">Gerçek Takvim Burada Yüklenecek</h3>
					<p class="mt-3 max-w-md text-center text-slate-400">
						Bu alan ileride FullCalendar, react-calendar veya custom takvim bileşeni ile doldurulacaktır.
					</p>
					<div class="mt-8 inline-flex items-center gap-2 rounded-2xl border bg-white px-6 py-3 text-xs text-slate-400">
						<span>Doktor seçimi + Haftalık / Günlük / Aylık görünüm</span>
					</div>
				</div>
			{/if}
		</div>

		<div class="overflow-hidden rounded-3xl border border-slate-200 bg-white">
			<div class="flex flex-col gap-4 border-b bg-slate-50 px-9 py-6 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div class="text-xl font-semibold">Tüm Randevu Kayıtları</div>
					<div class="text-sm text-slate-500">
						{$appointmentStore.data.length} kayıt • Gösterilen 1 - {Math.min(20, visibleAppointments.length)}
					</div>
				</div>
				<div class="rounded-2xl bg-slate-100 px-5 py-2 text-xs text-slate-600">
					{visibleAppointments[0] ? format(appointmentDate(visibleAppointments[0]), 'd MMMM yyyy', { locale }) : 'Kayıt yok'}
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-slate-50 text-xs font-medium text-slate-500">
							<th class="px-9 py-6 text-left">TARİH</th>
							<th class="px-6 py-6 text-left">SAAT</th>
							<th class="px-8 py-6 text-left">HASTA</th>
							<th class="px-8 py-6 text-left">DOKTOR</th>
							<th class="px-8 py-6 text-left">TİP</th>
							<th class="px-9 py-6 text-left">DURUM</th>
						</tr>
					</thead>
					<tbody class="divide-y text-slate-700">
						{#each visibleAppointments as appointment}
							<tr>
								<td class="px-9 py-6">{format(appointmentDate(appointment), 'dd MMM yyyy', { locale })}</td>
								<td class="px-6 py-6">{appointment.startTime} - {appointment.endTime}</td>
								<td class="px-8 py-6 font-medium">{appointment.patientName}</td>
								<td class="px-8 py-6">{appointment.doctorName}</td>
								<td class="px-8 py-6">{appointmentTypeLabel(appointment.type)}</td>
								<td class="px-9 py-6">
									<span class={`rounded-full px-5 py-1 text-xs ${statusClass(appointment.status)}`}>
										{statusLabel(appointment.status)}
									</span>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-9 py-16 text-center text-slate-500">
									Randevu kaydı bulunamadı.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="mt-16 text-center text-xs text-slate-400">
			MedFlow Demo • Yerel Sandbox • Tüm veriler örnek amaçlıdır • Gerçek klinik kayıtları etkilenmez
		</div>
	</div>
</div>

<style>
	tbody tr:nth-child(even) {
		background-color: #f8fafc;
	}

	tbody tr:hover {
		background-color: #f1f5f9;
	}
</style>
