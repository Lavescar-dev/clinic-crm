<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Badge } from '$components/ui/badge';
	import ConfirmDialog from '$lib/components/shared/ConfirmDialog.svelte';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import { toast } from 'svelte-sonner';
	import type { Appointment, AppointmentStatus } from '$types/appointment';
	import { formatDate } from '$utils/date';
	import { get } from 'svelte/store';
	import {
		ArrowLeft,
		CalendarDays,
		Clock3,
		FileText,
		ShieldCheck,
		Stethoscope,
		UserRound
	} from 'lucide-svelte';

	let appointment: Appointment | null = null;
	let loading = true;
	let confirmCancel = false;
	let confirmDelete = false;
	let selectedStatus: AppointmentStatus = 'scheduled';
	let appointmentId = '';
	let appointmentPatientId = '';

	onMount(async () => {
		appointmentId = get(page).params.id ?? '';
		if (!appointmentId) {
			toast.error($t('appointment.detail.appointmentNotFound'));
			goto('/appointments');
			return;
		}

		const result = await appointmentStore.getAppointmentById(appointmentId);
		loading = false;

		if (result) {
			appointment = result;
			selectedStatus = result.status;
			appointmentPatientId = result.patientId;
			return;
		}

		toast.error($t('appointment.detail.appointmentNotFound'));
		goto('/appointments');
	});

	const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
		{ value: 'scheduled', label: $t('appointment.status.scheduled') },
		{ value: 'confirmed', label: $t('appointment.status.confirmed') },
		{ value: 'in-progress', label: $t('appointment.status.in-progress') },
		{ value: 'completed', label: $t('appointment.status.completed') },
		{ value: 'cancelled', label: $t('appointment.status.cancelled') },
		{ value: 'no-show', label: $t('appointment.status.noShow') }
	];

	function getStatusVariant(status: AppointmentStatus) {
		switch (status) {
			case 'scheduled':
				return 'outline';
			case 'confirmed':
				return 'default';
			case 'in-progress':
				return 'warning';
			case 'completed':
				return 'success';
			case 'cancelled':
			case 'no-show':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	function statusCopy(status: AppointmentStatus) {
		switch (status) {
			case 'confirmed':
				return 'Hasta ve ekip senkronize, görüşme akışı hazır.';
			case 'in-progress':
				return 'Muayene veya işlem şu anda aktif ilerliyor.';
			case 'completed':
				return 'Ziyaret kapanmış, not ve takip akışı tamamlanmalı.';
			case 'cancelled':
				return 'Takvim slotu iptal edildi, yerine yeni planlama açılabilir.';
			case 'no-show':
				return 'Hasta gelmedi; yeniden temas ve planlama önerilir.';
			default:
				return 'Planlama açık; teyit ve hazırlık aşaması devam ediyor.';
		}
	}

	async function handleStatusChange(newStatus: AppointmentStatus) {
		if (!appointment || newStatus === appointment.status) return;

		const result = await appointmentStore.updateAppointment(appointment.id, { status: newStatus });
		if (result.success && result.data) {
			appointment = result.data;
			selectedStatus = newStatus;
			toast.success($t('appointment.detail.statusUpdateSuccess', { status: $t(`appointment.status.${newStatus}`) }));
			return;
		}

		toast.error(result.error || $t('appointment.detail.statusUpdateFailed'));
	}

	async function handleCancel() {
		if (!appointment) return;
		await handleStatusChange('cancelled');
		confirmCancel = false;
	}

	async function handleDelete() {
		if (!appointment) return;
		await appointmentStore.deleteAppointment(appointment.id);
		toast.success($t('appointment.detail.deleteSuccess'));
		goto('/appointments');
	}

	function handleStatusSelect(event: Event) {
		const nextStatus = (event.currentTarget as HTMLSelectElement).value as AppointmentStatus;
		void handleStatusChange(nextStatus);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if appointment}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<PageHero
			eyebrow="Randevu Dosyası"
			title={appointment.patientName}
			description={`${formatDate(appointment.date)} · ${appointment.startTime} - ${appointment.endTime} · ${appointment.doctorName}`}
		>
			<Button variant="outline" onclick={() => goto('/appointments')}>
				<ArrowLeft class="h-4 w-4" />
				Takvime dön
			</Button>
			<Button onclick={() => goto(`/emr/${appointmentPatientId}/note/new?appointmentId=${appointmentId}`)}>
				<FileText class="h-4 w-4" />
				Klinik not ekle
			</Button>
			<Button variant="outline" onclick={() => goto(`/appointments/${appointmentId}/edit`)}>
				{$t('common.edit')}
			</Button>
		</PageHero>

		<div class="mf-page-stat-grid">
			<div class="mf-metric-card mf-tint-cyan">
				<p class="mf-kicker text-xs font-semibold">TARİH</p>
				<p class="mf-metric-value text-[2rem]">{formatDate(appointment.date)}</p>
				<p class="mf-metric-copy">Planlanan klinik temas günü ve operasyon slotu.</p>
			</div>
			<div class="mf-metric-card mf-tint-emerald">
				<p class="mf-kicker text-xs font-semibold">SAAT</p>
				<p class="mf-metric-value text-[2rem]">{appointment.startTime}</p>
				<p class="mf-metric-copy">{appointment.duration} dakikalık rezervasyon süresi.</p>
			</div>
			<div class="mf-metric-card mf-tint-amber">
				<p class="mf-kicker text-xs font-semibold">TÜR</p>
				<p class="mf-metric-value text-[2rem]">{$t(`appointment.type.${appointment.type}`)}</p>
				<p class="mf-metric-copy">İşlem tipi ve kaynak planı bu akışa göre şekilleniyor.</p>
			</div>
			<div class="mf-metric-card">
				<p class="mf-kicker text-xs font-semibold">DURUM</p>
				<p class="mf-metric-value text-[2rem]">{$t(`appointment.status.${appointment.status}`)}</p>
				<p class="mf-metric-copy">{statusCopy(appointment.status)}</p>
			</div>
		</div>

		<div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
			<Card class="mf-section-card">
				<CardHeader class="space-y-3">
					<p class="mf-kicker text-[0.72rem] font-semibold">RANDEVU ÖZETİ</p>
					<CardTitle class="text-2xl tracking-[-0.04em]">Ziyaret bağlamı ve operasyon detayı</CardTitle>
				</CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
						<p class="mf-kicker text-[0.68rem] font-semibold">HASTA</p>
						<a href="/patients/{appointment.patientId}" class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--mf-accent-strong)] hover:underline">
							<UserRound class="h-4 w-4" />
							{appointment.patientName}
						</a>
					</div>
					<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
						<p class="mf-kicker text-[0.68rem] font-semibold">HEKİM</p>
						<p class="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
							<Stethoscope class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
							{appointment.doctorName}
						</p>
					</div>
					<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
						<p class="mf-kicker text-[0.68rem] font-semibold">TAKVİM SLOTU</p>
						<p class="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
							<CalendarDays class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
							{formatDate(appointment.date)}
						</p>
						<p class="mt-1 text-sm text-[color:var(--mf-ink-soft)]">
							{appointment.startTime} - {appointment.endTime}
						</p>
					</div>
					<div class="mf-soft-card rounded-[1.2rem] px-4 py-4">
						<p class="mf-kicker text-[0.68rem] font-semibold">AKIŞ TİPİ</p>
						<p class="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
							<Clock3 class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
							{$t(`appointment.type.${appointment.type}`)}
						</p>
						<p class="mt-1 text-sm text-[color:var(--mf-ink-soft)]">
							{$t('common.minutes')}: {appointment.duration}
						</p>
					</div>
					<div class="md:col-span-2 mf-soft-card rounded-[1.2rem] px-4 py-4">
						<p class="mf-kicker text-[0.68rem] font-semibold">ZİYARET NEDENİ</p>
						<p class="mt-3 text-sm leading-7 text-[color:var(--mf-ink)]">{appointment.reason}</p>
					</div>
					<div class="md:col-span-2 mf-soft-card rounded-[1.2rem] px-4 py-4">
						<p class="mf-kicker text-[0.68rem] font-semibold">KLİNİK NOT</p>
						<p class="mt-3 text-sm leading-7 text-[color:var(--mf-ink)]">{appointment.notes || '-'}</p>
					</div>
				</CardContent>
			</Card>

			<div class="space-y-4">
				<Card class="mf-panel-dark border-0">
					<CardContent class="space-y-5 px-6 pb-6 pt-8">
						<div class="mt-1 flex items-start justify-between gap-3">
							<div>
								<p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/72">
									Operasyon durumu
								</p>
								<h2 class="mt-3 text-xl font-semibold text-[color:var(--mf-panel-dark-text)]">
									Bu ziyaret hangi aşamada?
								</h2>
							</div>
							<ShieldCheck class="h-5 w-5 text-cyan-200" />
						</div>

						<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
							<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Aktif durum</p>
							<div class="mt-3 flex items-center gap-2">
								<Badge variant={getStatusVariant(appointment.status)}>
									{$t(`appointment.status.${appointment.status}`)}
								</Badge>
							</div>
							<p class="mt-3 text-sm leading-6 text-cyan-50/80">{statusCopy(appointment.status)}</p>
						</div>

						<div class="space-y-2">
							<p class="text-xs uppercase tracking-[0.18em] text-cyan-100/68">Durumu güncelle</p>
							<select
								bind:value={selectedStatus}
								onchange={handleStatusSelect}
								class="w-full rounded-[1rem] border border-white/12 bg-white/6 px-3 py-3 text-sm text-[color:var(--mf-panel-dark-text)] outline-none"
							>
								{#each appointmentStatuses as statusOption}
									<option value={statusOption.value}>{statusOption.label}</option>
								{/each}
							</select>
						</div>
					</CardContent>
				</Card>

				<Card class="mf-glass">
					<CardHeader class="space-y-2">
						<p class="mf-kicker text-[0.72rem] font-semibold">Hızlı aksiyonlar</p>
						<CardTitle class="text-xl tracking-[-0.04em]">Bu randevudan çıkılacak yollar</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<Button variant="outline" class="w-full justify-start" onclick={() => goto(`/patients/${appointmentPatientId}`)}>
							<UserRound class="h-4 w-4" />
							Hasta dosyasını aç
						</Button>
						<Button variant="outline" class="w-full justify-start" onclick={() => goto(`/appointments/${appointmentId}/edit`)}>
							<CalendarDays class="h-4 w-4" />
							Randevuyu düzenle
						</Button>
						{#if appointment.status !== 'cancelled' && appointment.status !== 'completed'}
							<Button variant="outline" class="w-full justify-start" onclick={() => (confirmCancel = true)}>
								<Clock3 class="h-4 w-4" />
								{$t('appointment.detail.cancelAppointment')}
							</Button>
						{/if}
						<Button variant="destructive" class="w-full justify-start" onclick={() => (confirmDelete = true)}>
							{$t('common.delete')}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>

		<ConfirmDialog
			bind:open={confirmCancel}
			title={$t('appointment.detail.confirmCancelTitle')}
			message={$t('appointment.detail.confirmCancelDescription')}
			onConfirm={handleCancel}
			onCancel={() => (confirmCancel = false)}
		/>

		<ConfirmDialog
			bind:open={confirmDelete}
			title={$t('appointment.detail.confirmDeleteTitle')}
			message={$t('appointment.detail.confirmDeleteDescription')}
			onConfirm={handleDelete}
			onCancel={() => (confirmDelete = false)}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('appointment.detail.appointmentNotFound')}</p>
	</div>
{/if}
