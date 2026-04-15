<script lang="ts">
	import { goto } from '$app/navigation';
	import { t, language } from '$i18n';
	import { Badge } from '$components/ui/badge';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { notifications as notificationStore } from '$stores/notifications';
	import { formatDateDistance } from '$utils/date';
	import type { Notification, NotificationPriority, NotificationType } from '$types';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import {
		ArrowRight,
		BellRing,
		CalendarDays,
		CircleAlert,
		CreditCard,
		FlaskConical,
		Mail,
		MailOpen,
		PackageSearch,
		ShieldCheck
	} from 'lucide-svelte';
	import { get } from 'svelte/store';

	let activeTab: 'all' | 'unread' = 'all';

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	function priorityWeight(priority: NotificationPriority) {
		switch (priority) {
			case 'urgent':
				return 4;
			case 'high':
				return 3;
			case 'medium':
				return 2;
			default:
				return 1;
		}
	}

	function priorityLabel(priority: NotificationPriority) {
		const labels: Record<NotificationPriority, { tr: string; en: string }> = {
			urgent: { tr: 'Kritik', en: 'Urgent' },
			high: { tr: 'Yüksek', en: 'High' },
			medium: { tr: 'Orta', en: 'Medium' },
			low: { tr: 'Düşük', en: 'Low' }
		};

		return get(language) === 'tr' ? labels[priority].tr : labels[priority].en;
	}

	function typeLabel(type: NotificationType) {
		const labels: Record<NotificationType, { tr: string; en: string }> = {
			'appointment-reminder': { tr: 'Randevu', en: 'Appointment' },
			'appointment-confirmed': { tr: 'Randevu', en: 'Appointment' },
			'appointment-cancelled': { tr: 'Randevu', en: 'Appointment' },
			'payment-reminder': { tr: 'Finans', en: 'Billing' },
			'payment-received': { tr: 'Finans', en: 'Billing' },
			'lab-result-ready': { tr: 'Laboratuvar', en: 'Lab' },
			'prescription-ready': { tr: 'Reçete', en: 'Prescription' },
			'stock-alert': { tr: 'Stok', en: 'Inventory' },
			'referral-received': { tr: 'Sevk', en: 'Referral' },
			'referral-accepted': { tr: 'Sevk', en: 'Referral' },
			'referral-rejected': { tr: 'Sevk', en: 'Referral' },
			'referral-expired': { tr: 'Sevk', en: 'Referral' },
			system: { tr: 'Sistem', en: 'System' },
			other: { tr: 'Genel', en: 'General' }
		};

		return get(language) === 'tr' ? labels[type].tr : labels[type].en;
	}

	function typeIcon(type: NotificationType) {
		if (type.startsWith('appointment')) return CalendarDays;
		if (type.startsWith('payment')) return CreditCard;
		if (type.startsWith('lab') || type.startsWith('prescription')) return FlaskConical;
		if (type.startsWith('stock')) return PackageSearch;
		if (type.startsWith('referral')) return ArrowRight;
		return ShieldCheck;
	}

	function priorityClass(priority: NotificationPriority) {
		switch (priority) {
			case 'urgent':
				return 'border-rose-200 bg-rose-50 text-rose-700';
			case 'high':
				return 'border-amber-200 bg-amber-50 text-amber-700';
			case 'medium':
				return 'border-cyan-200 bg-cyan-50 text-cyan-700';
			default:
				return 'border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] text-[color:var(--mf-ink-soft)]';
		}
	}

	function surfaceClass(type: NotificationType) {
		if (type.startsWith('appointment')) return 'mf-tint-cyan';
		if (type.startsWith('payment')) return 'mf-tint-amber';
		if (type.startsWith('lab') || type.startsWith('prescription')) return 'mf-tint-emerald';
		if (type.startsWith('stock')) return 'bg-[linear-gradient(180deg,rgba(255,245,245,0.95),rgba(255,250,250,0.9))]';
		return 'bg-[color:var(--mf-surface-strong)]';
	}

	$: filteredNotifications = [...$notificationStore.data]
		.filter((notification) => {
			if (activeTab === 'unread') {
				return !notification.read;
			}

			return notification.status !== 'archived';
		})
		.sort((left, right) => {
			const priorityDelta = priorityWeight(right.priority) - priorityWeight(left.priority);
			if (priorityDelta !== 0) return priorityDelta;
			return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
		});

	$: unreadNotifications = $notificationStore.data.filter((notification) => !notification.read);
	$: urgentNotifications = unreadNotifications.filter(
		(notification) => notification.priority === 'urgent' || notification.priority === 'high'
	);
	$: labNotifications = unreadNotifications.filter(
		(notification) =>
			notification.type === 'lab-result-ready' || notification.type === 'prescription-ready'
	);
	$: financeNotifications = unreadNotifications.filter((notification) =>
		notification.type.startsWith('payment')
	);

	$: operationalBuckets = [
		{
			title: get(language) === 'tr' ? 'Kritik triage' : 'Critical triage',
			description:
				get(language) === 'tr'
					? 'İlk kapanması gereken yüksek öncelikli başlıklar.'
					: 'The highest-priority items to close first.',
			items: filteredNotifications.slice(0, 4)
		},
		{
			title: get(language) === 'tr' ? 'Finans sinyalleri' : 'Finance signals',
			description:
				get(language) === 'tr'
					? 'Tahsilat ve ödeme kaynaklı aksiyon gerektiren başlıklar.'
					: 'Collection and payment items that need action.',
			items: filteredNotifications
				.filter((notification) => notification.type.startsWith('payment'))
				.slice(0, 3)
		},
		{
			title: get(language) === 'tr' ? 'Klinik çıktı akışı' : 'Clinical output flow',
			description:
				get(language) === 'tr'
					? 'Laboratuvar, reçete ve sevk kararlarına bağlı bildirimler.'
					: 'Notifications tied to labs, prescriptions, and referrals.',
			items: filteredNotifications
				.filter(
					(notification) =>
						notification.type.startsWith('lab') ||
						notification.type.startsWith('prescription') ||
						notification.type.startsWith('referral')
				)
				.slice(0, 3)
		}
	];

	async function markAsRead(notificationId: string) {
		await notificationStore.markAsRead(notificationId);
	}

	async function markAllAsRead() {
		await notificationStore.markAllAsRead();
	}

	function openAction(notification: Notification) {
		if (!notification.read) {
			void markAsRead(notification.id);
		}

		if (notification.actionUrl) {
			goto(notification.actionUrl);
		}
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<PageHero
		eyebrow="Operasyon Kutusu"
		title={translate('notifications.title', 'İş Akışı Bildirimleri', 'Operations inbox')}
		description={translate(
			'notifications.description',
			'Randevu, tahsilat, laboratuvar ve stok sinyallerini tek operasyon akışında triage edin.',
			'Triage appointment, billing, lab, and stock signals from one operational stream.'
		)}
	>
			<Button variant="outline" onclick={() => goto('/appointments')}>
				<CalendarDays class="h-4 w-4" />
				{get(language) === 'tr' ? 'Takvime git' : 'Open schedule'}
			</Button>
			<Button variant="outline" onclick={markAllAsRead}>
				<MailOpen class="h-4 w-4" />
				{translate('notifications.markAllAsRead', 'Tümünü okundu işaretle', 'Mark all as read')}
			</Button>
	</PageHero>

	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		<div class="mf-tint-cyan rounded-[1.5rem] border p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'AÇIK İŞ' : 'OPEN WORK'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">{filteredNotifications.length}</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Arşivlenmemiş tüm operasyon bildirimleri.'
					: 'All non-archived operational notifications.'}
			</p>
		</div>
		<div class="mf-tint-amber rounded-[1.5rem] border p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'KRİTİK' : 'PRIORITY'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">{urgentNotifications.length}</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Yüksek veya kritik öncelikte bekleyen başlıklar.'
					: 'High-priority or urgent items waiting for review.'}
			</p>
		</div>
		<div class="mf-tint-emerald rounded-[1.5rem] border p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'KLİNİK ÇIKTI' : 'CLINICAL OUTPUT'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">{labNotifications.length}</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Laboratuvar ve reçete akışından gelen okunmamış sinyaller.'
					: 'Unread lab and prescription notifications.'}
			</p>
		</div>
		<div class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-[linear-gradient(180deg,rgba(245,248,255,0.94),rgba(255,255,255,0.88))] p-5 shadow-[var(--mf-shadow-soft)]">
			<p class="mf-kicker text-xs font-semibold">{get(language) === 'tr' ? 'TAHSİLAT' : 'COLLECTIONS'}</p>
			<p class="mf-heading mt-3 text-3xl font-semibold">{financeNotifications.length}</p>
			<p class="mf-copy mt-2 text-sm leading-6">
				{get(language) === 'tr'
					? 'Ödeme ve tahsilat tarafında kapanmayı bekleyen sinyaller.'
					: 'Billing and payment items still awaiting closure.'}
			</p>
		</div>
	</div>

	<Tabs value={activeTab} onValueChange={(value) => (activeTab = (value as 'all' | 'unread') || 'all')} class="space-y-4">
		<TabsList>
			<TabsTrigger value="all">{translate('notifications.all', 'Tümü', 'All')}</TabsTrigger>
			<TabsTrigger value="unread">
				{translate('notifications.unread', 'Okunmamış', 'Unread')} ({unreadNotifications.length})
			</TabsTrigger>
		</TabsList>

		<TabsContent value="all">
			<div class="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
				<Card class="mf-glass">
					<CardHeader class="space-y-3">
						<p class="mf-kicker text-[0.72rem] font-semibold">
							{get(language) === 'tr' ? 'AKIŞ' : 'STREAM'}
						</p>
						<CardTitle class="text-2xl tracking-[-0.04em]">
							{translate('notifications.allNotifications', 'Tüm Bildirimler', 'All notifications')}
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if filteredNotifications.length > 0}
							{#each filteredNotifications as notification (notification.id)}
								{@const NotificationIcon = typeIcon(notification.type)}
								<div class={`rounded-[1.4rem] border p-4 shadow-[var(--mf-shadow-soft)] ${surfaceClass(notification.type)}`}>
									<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
										<div class="min-w-0 flex-1">
											<div class="flex flex-wrap items-center gap-2">
												<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--mf-surface-contrast)] text-[color:var(--mf-ink-strong)]">
													<NotificationIcon class="h-4.5 w-4.5" />
												</div>
												<Badge variant="outline">{typeLabel(notification.type)}</Badge>
												<span class={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${priorityClass(notification.priority)}`}>
													{priorityLabel(notification.priority)}
												</span>
												{#if !notification.read}
													<span class="rounded-full bg-cyan-600 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white">
														{get(language) === 'tr' ? 'Yeni' : 'New'}
													</span>
												{/if}
											</div>

											<p class="mt-4 text-base font-semibold text-[color:var(--mf-ink-strong)]">
												{notification.title}
											</p>
											<p class="mf-copy mt-2 text-sm leading-6">{notification.message}</p>
											<p class="mt-3 text-xs text-[color:var(--mf-ink-faint)]">
												{formatDateDistance(notification.createdAt, new Date())}
												{get(language) === 'tr' ? ' önce' : ' ago'}
											</p>
										</div>

										<div class="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
											{#if notification.actionUrl}
												<Button variant="outline" onclick={() => openAction(notification)}>
													{get(language) === 'tr' ? 'Kaydı aç' : 'Open record'}
													<ArrowRight class="h-4 w-4" />
												</Button>
											{/if}
											{#if !notification.read}
												<Button variant="ghost" onclick={() => markAsRead(notification.id)}>
													<MailOpen class="h-4 w-4" />
													{translate('notifications.markAsRead', 'Okundu işaretle', 'Mark as read')}
												</Button>
											{:else}
												<div class="flex items-center gap-2 rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-[color:var(--mf-surface-strong)] px-3 py-2 text-sm text-[color:var(--mf-ink-soft)]">
													<Mail class="h-4 w-4" />
													<span>{get(language) === 'tr' ? 'İncelendi' : 'Reviewed'}</span>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						{:else}
							<div class="mf-soft-card rounded-[1.4rem] border-dashed p-5 text-center text-sm text-[color:var(--mf-ink-soft)]">
								{translate('notifications.noNotifications', 'Bildirim yok', 'No notifications')}
							</div>
						{/if}
					</CardContent>
				</Card>

				<div class="space-y-6">
					<Card class="mf-glass">
						<CardHeader class="space-y-3">
							<p class="mf-kicker text-[0.72rem] font-semibold">
								{get(language) === 'tr' ? 'TRIAGE' : 'TRIAGE'}
							</p>
							<CardTitle class="text-2xl tracking-[-0.04em]">
								{get(language) === 'tr' ? 'Operasyon sütunları' : 'Operations lanes'}
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each operationalBuckets as bucket}
								<div class="mf-soft-card rounded-[1.35rem] p-4">
									<div class="flex items-start justify-between gap-3">
										<div>
											<p class="text-sm font-semibold text-[color:var(--mf-ink-strong)]">{bucket.title}</p>
											<p class="mf-copy mt-1 text-sm leading-6">{bucket.description}</p>
										</div>
										<Badge variant="secondary">{bucket.items.length}</Badge>
									</div>

									<div class="mt-4 space-y-2">
										{#if bucket.items.length > 0}
											{#each bucket.items as item}
												<button
													type="button"
													class="flex w-full items-center justify-between gap-3 rounded-[1rem] border border-[color:var(--mf-line-soft)] bg-white/75 px-3 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/60"
													onclick={() => openAction(item)}
												>
													<div class="min-w-0">
														<p class="truncate text-sm font-medium text-[color:var(--mf-ink-strong)]">{item.title}</p>
														<p class="mt-1 truncate text-xs text-[color:var(--mf-ink-soft)]">{item.message}</p>
													</div>
													<ArrowRight class="h-4 w-4 shrink-0 text-[color:var(--mf-ink-faint)]" />
												</button>
											{/each}
										{:else}
											<p class="text-sm text-[color:var(--mf-ink-soft)]">
												{get(language) === 'tr' ? 'Bekleyen iş yok.' : 'No queued items.'}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</CardContent>
					</Card>

					<Card class="mf-panel-dark mt-2 overflow-hidden border-0">
						<div class="border-b border-white/10 px-6 pb-5 pt-10">
							<div class="flex items-start justify-between gap-4">
								<div class="space-y-3">
									<p class="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-cyan-100/68">
										{get(language) === 'tr' ? 'İŞ YÜKÜ' : 'WORKLOAD'}
									</p>
									<h3 class="max-w-[18rem] text-[1.35rem] font-semibold leading-[1.2] text-[color:var(--mf-panel-dark-text)]">
										{get(language) === 'tr'
											? 'Vardiyada kapanması gereken bildirim akışı'
											: 'Notification flow that should close this shift'}
									</h3>
									<p class="max-w-[20rem] text-sm leading-6 text-[color:var(--mf-panel-dark-muted)]">
										{get(language) === 'tr'
											? 'Kritik, finans ve klinik sinyalleri aşağıdaki sırayla ele alın.'
											: 'Work through critical, finance, and clinical signals in order below.'}
									</p>
								</div>
								<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
									<BellRing class="h-5 w-5 text-cyan-200" />
								</div>
							</div>
						</div>

						<div class="space-y-3 px-4 pb-4 pt-4 text-sm text-[color:var(--mf-panel-dark-muted)]">
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								{get(language) === 'tr'
									? `${urgentNotifications.length} kritik başlık ilk sırada gözden geçirilmeli.`
									: `${urgentNotifications.length} critical items should be reviewed first.`}
							</div>
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								{get(language) === 'tr'
									? `${financeNotifications.length} finans sinyali tahsilat ekibiyle hizalanmalı.`
									: `${financeNotifications.length} finance items should be aligned with collections.`}
							</div>
							<div class="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
								{get(language) === 'tr'
									? `${labNotifications.length} klinik çıktı sinyali hekim ya da laboratuvar takibi bekliyor.`
									: `${labNotifications.length} clinical outputs are waiting on provider or lab follow-up.`}
							</div>
						</div>
					</Card>
				</div>
			</div>
		</TabsContent>

		<TabsContent value="unread">
			<Card class="mf-glass">
				<CardHeader class="space-y-3">
					<p class="mf-kicker text-[0.72rem] font-semibold">
						{get(language) === 'tr' ? 'ÖNCELİK' : 'FOCUS'}
					</p>
					<CardTitle class="text-2xl tracking-[-0.04em]">
						{translate(
							'notifications.unreadNotifications',
							'Okunmamış Bildirimler',
							'Unread notifications'
						)}
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if filteredNotifications.length > 0}
						{#each filteredNotifications as notification (notification.id)}
							<div class="mf-soft-card rounded-[1.35rem] p-4">
								<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div class="min-w-0">
										<div class="flex flex-wrap items-center gap-2">
											<Badge variant="outline">{typeLabel(notification.type)}</Badge>
											<span class={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${priorityClass(notification.priority)}`}>
												{priorityLabel(notification.priority)}
											</span>
										</div>
										<p class="mt-3 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
											{notification.title}
										</p>
										<p class="mf-copy mt-1 text-sm leading-6">{notification.message}</p>
									</div>

									<div class="flex shrink-0 gap-2">
										<Button variant="ghost" onclick={() => markAsRead(notification.id)}>
											<MailOpen class="h-4 w-4" />
											{get(language) === 'tr' ? 'Okundu' : 'Mark read'}
										</Button>
										{#if notification.actionUrl}
											<Button variant="outline" onclick={() => openAction(notification)}>
												{get(language) === 'tr' ? 'Aç' : 'Open'}
											</Button>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					{:else}
						<div class="mf-soft-card rounded-[1.4rem] border-dashed p-5 text-center text-sm text-[color:var(--mf-ink-soft)]">
							{translate(
								'notifications.noUnreadNotifications',
								'Okunmamış bildirim yok',
								'No unread notifications'
							)}
						</div>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div>
