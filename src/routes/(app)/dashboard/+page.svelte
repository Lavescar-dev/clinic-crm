<script lang="ts">
	import { goto } from '$app/navigation';
	import { Badge } from '$components/ui/badge';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import InteractiveLineChart from '$components/charts/echarts/InteractiveLineChart.svelte';
	import PieChart from '$components/charts/echarts/PieChart.svelte';
	import QuickActions from '$components/dashboard/QuickActions.svelte';
	import RecentActivities from '$components/dashboard/RecentActivities.svelte';
	import { language } from '$i18n';
	import { appointments, appointmentStats } from '$stores/appointments';
	import { billing, billingStats } from '$stores/billing';
	import { inventory, inventoryStats } from '$stores/inventory';
	import { recentNotifications } from '$stores/notifications';
	import { patientStats } from '$stores/patients';
	import { activeStaff, staffOnLeave } from '$stores/staff';
	import { todayShifts } from '$stores/shifts';
	import { currentUser, staffRole } from '$stores';
	import { theme } from '$stores';
	import { formatCurrency } from '$utils/currency';
	import {
		ArrowRight,
		BellRing,
		CalendarDays,
		CircleAlert,
		ClipboardCheck,
		Clock3,
		HeartPulse,
		PackageSearch,
		Stethoscope,
		TrendingUp
	} from 'lucide-svelte';

	type AnalyticsTabKey =
		| 'appointments'
		| 'quickActions'
		| 'revenue'
		| 'activity'
		| 'payor'
		| 'stock';

	type AnalyticsTab = {
		key: AnalyticsTabKey;
		kicker: string;
		label: string;
		description: string;
		href: string;
		icon: typeof CalendarDays;
	};

	type DashboardCopy = {
		heroBadge: string;
		heroTitle: string;
		heroDescription: string;
		heroMetrics: {
			readiness: string;
			readinessHint: string;
			revenue: string;
			revenueHint: string;
			alerts: string;
			alertsHint: string;
		};
		control: {
			kicker: string;
			title: string;
		};
		stats: {
			appointments: string;
			appointmentsDescription: string;
			revenue: string;
			revenueDescription: string;
			patients: string;
			patientsDescription: string;
			stock: string;
			stockDescription: string;
		};
		focus: {
			kicker: string;
			title: string;
			description: string;
			statusTitle: string;
			coverageTitle: string;
			coverageDescription: string;
			openSchedule: string;
		};
		schedule: {
			kicker: string;
			title: string;
			description: string;
			empty: string;
			openAppointments: string;
		};
		analytics: {
			appointmentsKicker: string;
			appointmentsTitle: string;
			appointmentsDescription: string;
			revenueKicker: string;
			revenueTitle: string;
			revenueDescription: string;
			quickActionsKicker: string;
			quickActionsTitle: string;
			quickActionsDescription: string;
			activityKicker: string;
			activityTitle: string;
			activityDescription: string;
			payorKicker: string;
			payorTitle: string;
			payorDescription: string;
			stockKicker: string;
			stockTitle: string;
			stockDescription: string;
		};
		watchlist: {
			pendingRevenue: string;
			pendingRevenueNote: string;
			overdueRevenue: string;
			overdueRevenueNote: string;
			stockAlerts: string;
			stockAlertsNote: string;
			teamAvailability: string;
			teamAvailabilityNote: string;
		};
		appointmentStatus: Record<string, string>;
		actionMeta: {
			intake: string;
			booking: string;
			finance: string;
			oversight: string;
		};
		coverage: {
			sgk: string;
			private: string;
			none: string;
		};
		stockStates: {
			low: string;
			out: string;
			expired: string;
			inStock: string;
		};
	};

	const copy: Record<'tr' | 'en', DashboardCopy> = {
		tr: {
			heroBadge: 'GÜNLÜK OPERASYON ÖZETİ',
			heroTitle: 'Bugünün klinik akışına tek bakışta hakim olun.',
			heroDescription:
				'Randevu yoğunluğu, tahsilat, stok riski ve ekip kapasitesini aynı kontrol panelinde birleştiren daha rafine bir operasyon görünümü.',
			heroMetrics: {
				readiness: 'Servis hazırlık skoru',
				readinessHint: 'Onaylı ve ilerleyen akışın bugünkü randevu oranına etkisi.',
				revenue: 'Bugün tahsil edilen',
				revenueHint: 'Kasa ve ödeme akışını günlük bazda izleyin.',
				alerts: 'Acil izleme alanı',
				alertsHint: 'Stok, ödeme ve ekip kaynaklı dikkat gerektiren başlıklar.'
			},
			control: {
				kicker: 'RİSK İZLEME',
				title: 'Finansal ve operasyonel riskleri kapanmadan görün.'
			},
			stats: {
				appointments: 'Bugünkü randevular',
				appointmentsDescription: 'Planlanan, onaylı ve aktif tüm akışı tek bakışta izleyin.',
				revenue: 'Aylık tahsilat',
				revenueDescription: 'Bugüne kadar kapanan ödemeler ile finans nabzını takip edin.',
				patients: 'Aktif hasta havuzu',
				patientsDescription: 'Devam eden bakım ilişkisindeki hasta tabanının anlık görünümü.',
				stock: 'Stok uyarıları',
				stockDescription: 'Düşük stok, tükenmiş veya son kullanım riski taşıyan kalemler.'
			},
			focus: {
				kicker: 'BAKIM AKIŞI',
				title: 'Günlük operasyon ritmi',
				description: 'Takvim hızını, ekip kapsamasını ve kritik darboğazları yönetici bakışıyla özetler.',
				statusTitle: 'Randevu durumu',
				coverageTitle: 'Ekip kapsaması',
				coverageDescription: 'Aktif personel, bugünkü vardiya ve izinli ekip dağılımı.',
				openSchedule: 'Takvimi aç'
			},
			schedule: {
				kicker: 'BUGÜN PANOSU',
				title: 'Sıradaki hasta akışı',
				description: 'Önemli saat aralıklarını ve durum etiketlerini hızlı şekilde gözden geçirin.',
				empty: 'Bugün için planlı randevu görünmüyor.',
				openAppointments: 'Randevulara git'
			},
			analytics: {
				appointmentsKicker: 'EĞİLİM',
				appointmentsTitle: 'Randevu talep eğilimi',
				appointmentsDescription: 'Son altı ayda hasta talebi ve takvim yükünün nasıl değiştiğini izleyin.',
				revenueKicker: 'FİNANS',
				revenueTitle: 'Gelir momentumu',
				revenueDescription: 'Aylık tahsilat ritmindeki ivmeyi, gecikmeden önce görün.',
				quickActionsKicker: 'OPERASYON MASASI',
				quickActionsTitle: 'Hızlı operasyon kısayolları',
				quickActionsDescription: 'Hasta alımı, finans ve yönetim aksiyonlarını tek blokta toplayın.',
				activityKicker: 'AKIŞ',
				activityTitle: 'Son operasyon sinyalleri',
				activityDescription: 'Ekibin son dokunduğu aksiyonları öncelik hissiyle görün.',
				payorKicker: 'HASTA KARMASI',
				payorTitle: 'Sigorta dağılımı',
				payorDescription: 'Kurumsal gelir yapısını SGK, özel ve nakit hasta dağılımıyla takip edin.',
				stockKicker: 'İZLEME LİSTESİ',
				stockTitle: 'Stok riski ve yenileme listesi',
				stockDescription: 'Eczane ve sarf malzeme tarafında yakından izlenmesi gereken ürünler.'
			},
			watchlist: {
				pendingRevenue: 'Bekleyen alacak',
				pendingRevenueNote: 'Tahsilat bekleyen aktif faturalar.',
				overdueRevenue: 'Gecikmiş ödeme',
				overdueRevenueNote: 'Bugün aksiyon alınması gereken gecikmeler.',
				stockAlerts: 'Stok alarmı',
				stockAlertsNote: 'Klinik süreci etkileyebilecek malzeme riski.',
				teamAvailability: 'Ekip erişilebilirliği',
				teamAvailabilityNote: 'İzinli personel ve bugünkü vardiya dengesi.'
			},
			appointmentStatus: {
				scheduled: 'Planlandı',
				confirmed: 'Onaylandı',
				'in-progress': 'İşlemde',
				completed: 'Tamamlandı',
				cancelled: 'İptal',
				'no-show': 'Gelmedi'
			},
			actionMeta: {
				intake: 'Hasta alımı',
				booking: 'Takvim yönetimi',
				finance: 'Gelir takibi',
				oversight: 'Performans izleme'
			},
			coverage: {
				sgk: 'SGK',
				private: 'Özel sigorta',
				none: 'Özel ödeme'
			},
			stockStates: {
				low: 'Düşük stok',
				out: 'Tükendi',
				expired: 'SKT riski',
				inStock: 'Güvenli stok'
			}
		},
		en: {
			heroBadge: 'DAILY OPERATIONS SUMMARY',
			heroTitle: "Stay on top of today's clinical flow at a glance.",
			heroDescription:
				'A calmer operational view that combines appointment load, collections, stock risk, and team capacity in one executive dashboard.',
			heroMetrics: {
				readiness: 'Service readiness score',
				readinessHint: "How confirmed and active visits support today's schedule stability.",
				revenue: 'Collected today',
				revenueHint: 'Track payment flow and front-desk collections in real time.',
				alerts: 'Priority watch area',
				alertsHint: 'Stock, payment, and staffing topics that need attention.'
			},
			control: {
				kicker: 'SAFETY MONITOR',
				title: 'Surface financial and operational risks before they become blockers.'
			},
			stats: {
				appointments: "Today's appointments",
				appointmentsDescription: 'Monitor scheduled, confirmed, and in-progress flow in one view.',
				revenue: 'Monthly collections',
				revenueDescription: 'Keep a clear pulse on revenue already closed this month.',
				patients: 'Active patient base',
				patientsDescription: 'A live view of patients currently inside the care relationship.',
				stock: 'Stock alerts',
				stockDescription: 'Items with low stock, stockout, or expiration risk.',
			},
			focus: {
				kicker: 'CARE FLOW',
				title: 'Daily operating rhythm',
				description: 'Summarizes schedule pace, staffing coverage, and emerging bottlenecks.',
				statusTitle: 'Appointment state',
				coverageTitle: 'Team coverage',
				coverageDescription: "Active staff, today's shifts, and leave balance.",
				openSchedule: 'Open schedule'
			},
			schedule: {
				kicker: 'TODAY BOARD',
				title: 'Upcoming patient flow',
				description: 'Review the next key time blocks and their status labels quickly.',
				empty: 'No planned appointments for today.',
				openAppointments: 'Go to appointments'
			},
			analytics: {
				appointmentsKicker: 'TREND',
				appointmentsTitle: 'Appointment demand trend',
				appointmentsDescription: 'Understand how patient demand has shifted over the last six months.',
				revenueKicker: 'FINANCE',
				revenueTitle: 'Revenue momentum',
				revenueDescription: 'Watch collection pace before delays become visible elsewhere.',
				quickActionsKicker: 'WORKBENCH',
				quickActionsTitle: 'Operational shortcuts',
				quickActionsDescription: 'Keep intake, finance, and leadership actions within easy reach.',
				activityKicker: 'ACTIVITY FEED',
				activityTitle: 'Recent operational signals',
				activityDescription: 'See what the team touched most recently with better priority context.',
				payorKicker: 'PATIENT MIX',
				payorTitle: 'Coverage distribution',
				payorDescription: 'Track revenue structure through public, private, and self-pay mix.',
				stockKicker: 'WATCHLIST',
				stockTitle: 'Stock risk and reorder list',
				stockDescription: 'Items that need closer oversight across pharmacy and consumables.'
			},
			watchlist: {
				pendingRevenue: 'Pending receivables',
				pendingRevenueNote: 'Invoices still waiting for collection.',
				overdueRevenue: 'Overdue balance',
				overdueRevenueNote: 'Items that need action today.',
				stockAlerts: 'Stock alert',
				stockAlertsNote: 'Materials that can disrupt clinical flow.',
				teamAvailability: 'Team availability',
				teamAvailabilityNote: "Leave count versus today's staffed shifts."
			},
			appointmentStatus: {
				scheduled: 'Scheduled',
				confirmed: 'Confirmed',
				'in-progress': 'In progress',
				completed: 'Completed',
				cancelled: 'Cancelled',
				'no-show': 'No show'
			},
			actionMeta: {
				intake: 'Patient intake',
				booking: 'Schedule control',
				finance: 'Revenue tracking',
				oversight: 'Performance review'
			},
			coverage: {
				sgk: 'Public coverage',
				private: 'Private insurance',
				none: 'Self-pay'
			},
			stockStates: {
				low: 'Low stock',
				out: 'Out of stock',
				expired: 'Expiry risk',
				inStock: 'Healthy stock'
			}
		}
	};

	let activeAnalyticsTab: AnalyticsTabKey = 'appointments';

	function isToday(date: Date | string) {
		const source = new Date(date);
		const today = new Date();
		return (
			source.getFullYear() === today.getFullYear() &&
			source.getMonth() === today.getMonth() &&
			source.getDate() === today.getDate()
		);
	}

	function monthSeries<T>(
		entries: T[],
		getDate: (entry: T) => Date | string,
		getValue: (entry: T) => number,
		locale: string
	) {
		const now = new Date();
		const buckets = Array.from({ length: 6 }, (_, index) => {
			const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
			return {
				year: date.getFullYear(),
				month: date.getMonth(),
				label: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
				value: 0
			};
		});

		for (const entry of entries) {
			const entryDate = new Date(getDate(entry));
			const bucket = buckets.find(
				(item) => item.year === entryDate.getFullYear() && item.month === entryDate.getMonth()
			);

			if (bucket) {
				bucket.value += getValue(entry);
			}
		}

		return {
			xAxisData: buckets.map((bucket) => bucket.label),
			values: buckets.map((bucket) => Math.round(bucket.value))
		};
	}

	function appointmentStatusWidth(value: number, total: number) {
		if (!total) return 0;
		return Math.max(6, Math.round((value / total) * 100));
	}

	function activityType(type: string): 'appointment' | 'patient' | 'billing' | 'emr' | 'inventory' {
		if (type.startsWith('appointment')) return 'appointment';
		if (type.startsWith('payment')) return 'billing';
		if (type.startsWith('stock')) return 'inventory';
		if (type.startsWith('referral')) return 'patient';
		if (type.startsWith('lab') || type.startsWith('prescription')) return 'emr';
		return 'patient';
	}

	function statusPillClass(status: string) {
		switch (status) {
			case 'confirmed':
				return 'bg-cyan-100 text-cyan-700';
			case 'in-progress':
				return 'bg-emerald-100 text-emerald-700';
			case 'completed':
				return 'bg-[rgba(15,110,122,0.14)] text-cyan-800';
			case 'cancelled':
			case 'no-show':
				return 'bg-rose-100 text-rose-700';
			default:
				return 'bg-amber-100 text-amber-700';
		}
	}

	function roleLabel(role: string | null | undefined, locale: 'tr' | 'en') {
		const labels: Record<string, { tr: string; en: string }> = {
			Admin: { tr: 'Yönetici', en: 'Admin' },
			Doctor: { tr: 'Doktor', en: 'Doctor' },
			Nurse: { tr: 'Hemşire', en: 'Nurse' },
			Receptionist: { tr: 'Resepsiyon', en: 'Reception' },
			LabTechnician: { tr: 'Laboratuvar', en: 'Lab' },
			Pharmacist: { tr: 'Eczane', en: 'Pharmacy' }
		};

		const selected = role ? labels[role] ?? { tr: role, en: role } : { tr: 'Operasyon', en: 'Operations' };
		return locale === 'tr' ? selected.tr : selected.en;
	}

	function priorityTone(priority: string) {
		switch (priority) {
			case 'urgent':
				return 'border-rose-200 bg-rose-50 text-rose-700';
			case 'high':
				return 'border-amber-200 bg-amber-50 text-amber-700';
			default:
				return 'border-cyan-200 bg-cyan-50 text-cyan-700';
		}
	}

	function priorityLabel(priority: string, locale: 'tr' | 'en') {
		const labels: Record<string, { tr: string; en: string }> = {
			urgent: { tr: 'Kritik', en: 'Urgent' },
			high: { tr: 'Yüksek', en: 'High' },
			medium: { tr: 'Orta', en: 'Medium' }
		};

		const selected = labels[priority] ?? { tr: priority, en: priority };
		return locale === 'tr' ? selected.tr : selected.en;
	}

	function inventoryStatusLabel(status: string, locale: 'tr' | 'en') {
		switch (status) {
			case 'low-stock':
				return locale === 'tr' ? 'Düşük stok' : 'Low stock';
			case 'out-of-stock':
				return locale === 'tr' ? 'Tükendi' : 'Out of stock';
			case 'expired':
				return locale === 'tr' ? 'SKT riski' : 'Expiry risk';
			default:
				return locale === 'tr' ? 'Stokta' : 'In stock';
		}
	}

	function initialsFromName(name: string) {
		return name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}

	function roleWorkspace(role: string | null | undefined, locale: 'tr' | 'en') {
		switch (role) {
			case 'Doctor':
				return {
					kicker: locale === 'tr' ? 'HEKİM MASASI' : 'PROVIDER DESK',
					title:
						locale === 'tr'
							? 'Muayene, reçete ve sevk kararlarını tek akışta kapatın.'
							: 'Close consults, prescriptions, and referrals from one flow.',
					description:
						locale === 'tr'
							? 'Doktor odağında kritik hastaları, tetkik sonuçlarını ve takip gerektiren randevuları öne çıkarır.'
							: 'Highlights priority patients, test results, and follow-up visits for clinicians.',
					quickActions: [
						{
							label: locale === 'tr' ? 'Muayene notu aç' : 'Open encounter note',
							description:
								locale === 'tr'
									? 'Aktif muayeneyi EMR, reçete ve laboratuvar istekleriyle birlikte yönetin.'
									: 'Manage an active visit with EMR, prescriptions, and lab requests.',
							meta: locale === 'tr' ? 'Klinik kayıt' : 'Clinical record',
							icon: 'ClipboardPlus',
							href: '/emr',
							tone: 'primary'
						},
						{
							label: locale === 'tr' ? 'Tedavi planlarını gözden geçir' : 'Review treatment plans',
							description:
								locale === 'tr'
									? 'Aktif planları, ilerleme ve seans yüküyle birlikte kontrol edin.'
									: 'Review active plans together with progress and session load.',
							meta: locale === 'tr' ? 'Bakım koordinasyonu' : 'Care coordination',
							icon: 'Stethoscope',
							href: '/treatments',
							tone: 'success'
						},
						{
							label: locale === 'tr' ? 'Sevk kutusunu aç' : 'Open referral inbox',
							description:
								locale === 'tr'
									? 'Gelen ve bekleyen sevk kararlarını hızla kapatın.'
									: 'Process incoming and pending referrals quickly.',
							meta: locale === 'tr' ? 'Uzman yönlendirmesi' : 'Referral coordination',
							icon: 'ArrowRightLeft',
							href: '/referrals',
							tone: 'warning'
						}
					]
				};
			case 'Receptionist':
				return {
					kicker: locale === 'tr' ? 'ÖN MASA' : 'FRONT DESK',
					title:
						locale === 'tr'
							? 'Check-in, tahsilat ve takvimi tek ön büro akışında yönetin.'
							: 'Manage check-in, collections, and scheduling in one front-desk flow.',
					description:
						locale === 'tr'
							? 'Resepsiyon ekibi için randevu yoğunluğu, bekleyen ödemeler ve no-show riskini öne çıkarır.'
							: 'Surfaces schedule load, pending payments, and no-show risk for reception.',
					quickActions: [
						{
							label: locale === 'tr' ? 'Yeni hasta kaydı' : 'Register patient',
							description:
								locale === 'tr'
									? 'Ön kayıt, iletişim ve sigorta bilgisini hızlıca tamamlayın.'
									: 'Complete intake, contact, and coverage quickly.',
							meta: locale === 'tr' ? 'Hasta alımı' : 'Patient intake',
							icon: 'UserPlus',
							href: '/patients/new',
							tone: 'primary'
						},
						{
							label: locale === 'tr' ? 'Randevu boardunu aç' : 'Open appointment board',
							description:
								locale === 'tr'
									? 'Gün içi check-in ve sıra akışını operasyon boardundan yönetin.'
									: 'Run same-day check-in and queue flow from the operations board.',
							meta: locale === 'tr' ? 'Takvim yönetimi' : 'Schedule control',
							icon: 'CalendarRange',
							href: '/appointments',
							tone: 'success'
						},
						{
							label: locale === 'tr' ? 'Tahsilat masasına git' : 'Open collections desk',
							description:
								locale === 'tr'
									? 'Bekleyen ve geciken faturaları hasta bazında kapatın.'
									: 'Close pending and overdue invoices patient by patient.',
							meta: locale === 'tr' ? 'Finans akışı' : 'Revenue cycle',
							icon: 'Receipt',
							href: '/billing',
							tone: 'warning'
						}
					]
				};
			case 'Nurse':
				return {
					kicker: locale === 'tr' ? 'BAKIM KOORDİNASYONU' : 'CARE COORDINATION',
					title:
						locale === 'tr'
							? 'Günün bakım ritmini, hazırlıkları ve takipleri yönetin.'
							: 'Run the day’s care rhythm, prep, and follow-up tasks.',
					description:
						locale === 'tr'
							? 'Hemşire akışında yaklaşan randevular, aktif planlar ve hasta hazırlıklarını öne çıkarır.'
							: 'Surfaces upcoming visits, active plans, and patient prep for nursing teams.',
					quickActions: [
						{
							label: locale === 'tr' ? 'Hasta 360 ekranı' : 'Open patient 360',
							description:
								locale === 'tr'
									? 'Hasta detayında randevu, laboratuvar ve reçeteleri birlikte görüntüleyin.'
									: 'See appointments, labs, and prescriptions together from patient detail.',
							meta: locale === 'tr' ? 'Bakım görünümü' : 'Care view',
							icon: 'HeartPulse',
							href: '/patients',
							tone: 'primary'
						},
						{
							label: locale === 'tr' ? 'Tedavi planları' : 'Treatment plans',
							description:
								locale === 'tr'
									? 'Seans ve bakım planlarının güncel ilerleme yüzdesini takip edin.'
									: 'Track progress against active treatment plans.',
							meta: locale === 'tr' ? 'Takip yönetimi' : 'Follow-up',
							icon: 'ListChecks',
							href: '/treatments',
							tone: 'success'
						},
						{
							label: locale === 'tr' ? 'Bildirim kutusu' : 'Open inbox',
							description:
								locale === 'tr'
									? 'Laboratuvar ve stok kaynaklı aksiyonları tek kutuda görün.'
									: 'Keep lab and stock actions in one inbox.',
							meta: locale === 'tr' ? 'Operasyon kutusu' : 'Operations inbox',
							icon: 'BellRing',
							href: '/notifications',
							tone: 'warning'
						}
					]
				};
			default:
				return {
					kicker: locale === 'tr' ? 'OPERASYON MASASI' : 'OPERATIONS DESK',
					title:
						locale === 'tr'
							? 'Klinik ritmini, riski ve gelir akışını tek merkezden yönetin.'
							: 'Manage clinical rhythm, risk, and revenue from one center.',
					description:
						locale === 'tr'
							? 'Yönetici bakışında ekip kapasitesi, tahsilat ve kritik uyarıları aynı zeminde toplar.'
							: 'Brings team capacity, collections, and critical alerts together for leadership.',
					quickActions: [
						{
							label: locale === 'tr' ? 'Yeni hasta kaydı' : 'Register patient',
							description:
								locale === 'tr'
									? 'Ön kayıt, iletişim ve sigorta bilgisini tek akışta tamamlayın.'
									: 'Complete intake, contact details, and coverage in one flow.',
							meta: locale === 'tr' ? 'Hasta alımı' : 'Patient intake',
							icon: 'UserPlus',
							href: '/patients/new',
							tone: 'primary'
						},
						{
							label: locale === 'tr' ? 'Randevu boardunu aç' : 'Open appointment board',
							description:
								locale === 'tr'
									? 'Günün kapasite ve check-in akışını sahadan izleyin.'
									: 'Track same-day capacity and check-in flow from operations.',
							meta: locale === 'tr' ? 'Takvim yönetimi' : 'Schedule control',
							icon: 'CalendarPlus',
							href: '/appointments',
							tone: 'success'
						},
						{
							label: locale === 'tr' ? 'Tahsilat masasına git' : 'Open collections desk',
							description:
								locale === 'tr'
									? 'Bekleyen ve geciken ödemeleri operasyon masasında kapatın.'
									: 'Close pending and overdue balances from the collections desk.',
							meta: locale === 'tr' ? 'Gelir takibi' : 'Revenue tracking',
							icon: 'Receipt',
							href: '/billing',
							tone: 'warning'
						},
						{
							label: locale === 'tr' ? 'Rapor merkezine git' : 'Open reports',
							description:
								locale === 'tr'
									? 'Kapasite, performans ve gelir eğilimlerini yönetici bakışıyla yorumlayın.'
									: 'Review capacity, performance, and revenue trends with leadership context.',
							meta: locale === 'tr' ? 'Performans izleme' : 'Performance review',
							icon: 'BarChart3',
							href: '/reports',
							tone: 'neutral'
						}
					]
				};
		}
	}

	$: currentLanguage = $language;
	$: currentLocale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
	$: text = copy[currentLanguage];
	$: todayLabel = new Intl.DateTimeFormat(currentLocale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(new Date());

	$: chartTheme = $theme.effectiveTheme;
	$: totalPatients = $patientStats.total;
	$: activePatients = $patientStats.active;
	$: todaysAppointments = $appointmentStats.today;
	$: confirmedAppointments = $appointmentStats.confirmed;
	$: inProgressAppointments = $appointmentStats.inProgress;
	$: completedAppointments = $appointmentStats.completed;
	$: noShowAppointments = $appointmentStats.noShow;
	$: todaysRevenue = $billingStats.todaysRevenue;
	$: monthlyRevenue = $billingStats.monthlyRevenue;
	$: pendingAmount = $billingStats.pendingAmount;
	$: overdueAmount = $billingStats.overdueAmount;
	$: stockAlerts = $inventoryStats.alertCount;
	$: lowStockCount = $inventoryStats.byStatus.lowStock;
	$: outOfStockCount = $inventoryStats.byStatus.outOfStock;
	$: expiredCount = $inventoryStats.byStatus.expired;
	$: totalInventoryValue = $inventoryStats.totalValue;
	$: activeTeam = $activeStaff.length;
	$: onDutyToday = $todayShifts.length;
	$: onLeaveCount = $staffOnLeave.length;

	$: readinessScore = Math.min(
		98,
		Math.round(
			((confirmedAppointments + inProgressAppointments + completedAppointments) /
				Math.max(todaysAppointments, 1)) *
				100
		)
	);
	$: loadBalance = Math.min(96, Math.round((todaysAppointments / Math.max(onDutyToday * 4, 1)) * 100));

	$: appointmentSeries = monthSeries($appointments.data, (entry) => entry.date, () => 1, currentLocale);
	$: revenueSeries = monthSeries($billing.payments, (entry) => entry.paymentDate, (entry) => entry.amount, currentLocale);

	$: appointmentData = {
		datasets: [
			{
				name: text.analytics.appointmentsTitle,
				data: appointmentSeries.values,
				smooth: true,
				areaStyle: true,
				color: '#0891b2'
			}
		],
		xAxisData: appointmentSeries.xAxisData
	};

	$: revenueData = {
		datasets: [
			{
				name: text.analytics.revenueTitle,
				data: revenueSeries.values,
				smooth: true,
				areaStyle: true,
				color: '#0f766e'
			}
		],
		xAxisData: revenueSeries.xAxisData
	};

	$: appointmentBreakdown = [
		{
			key: 'scheduled',
			label: text.appointmentStatus.scheduled,
			value: $appointmentStats.scheduled,
			barClass: 'bg-amber-400'
		},
		{
			key: 'confirmed',
			label: text.appointmentStatus.confirmed,
			value: confirmedAppointments,
			barClass: 'bg-cyan-500'
		},
		{
			key: 'in-progress',
			label: text.appointmentStatus['in-progress'],
			value: inProgressAppointments,
			barClass: 'bg-emerald-500'
		},
		{
			key: 'completed',
			label: text.appointmentStatus.completed,
			value: completedAppointments,
			barClass: 'bg-teal-700'
		},
		{
			key: 'no-show',
			label: text.appointmentStatus['no-show'],
			value: noShowAppointments,
			barClass: 'bg-rose-500'
		}
	];

	$: todaysSchedule = [...$appointments.data]
		.filter((appointment) => isToday(appointment.date))
		.sort((left, right) => left.startTime.localeCompare(right.startTime))
		.slice(0, 6);

	$: recentActivityItems = $recentNotifications.slice(0, 5).map((notification) => ({
		id: notification.id,
		type: activityType(notification.type),
		description: notification.message,
		timestamp: new Date(notification.createdAt)
	}));

	$: coverageData = [
		{ name: text.coverage.sgk, value: $patientStats.withSGK },
		{ name: text.coverage.private, value: $patientStats.withPrivateInsurance },
		{ name: text.coverage.none, value: $patientStats.withoutInsurance }
	];

	$: stockWatchItems = [...$inventory.data]
		.filter((item) =>
			item.status === 'low-stock' || item.status === 'out-of-stock' || item.status === 'expired'
		)
		.slice(0, 5);

	$: overdueInvoices = $billing.data.filter((invoice) => invoice.status === 'overdue');
	$: pendingInvoices = $billing.data.filter((invoice) => invoice.status === 'pending');
	$: activeScheduleCount = confirmedAppointments + inProgressAppointments;
	$: upcomingQueue = todaysSchedule
		.filter((appointment) => appointment.status !== 'completed' && appointment.status !== 'cancelled')
		.slice(0, 2);

	$: activeRole = $staffRole ?? 'Admin';
	$: workspace = roleWorkspace(activeRole, currentLanguage);
	$: quickActions = workspace.quickActions as any;
	$: currentUserName =
		$currentUser?.fullName ?? (currentLanguage === 'tr' ? 'Demo Kullanıcısı' : 'Demo User');
	$: currentUserEmail = $currentUser?.email ?? 'demo@medflow.local';
	$: currentUserInitials = initialsFromName(currentUserName);
	$: metricCards = [
		{
			kicker: currentLanguage === 'tr' ? 'RANDEVU AKIŞI' : 'VISIT FLOW',
			title: currentLanguage === 'tr' ? 'Bugün aktif akış' : 'Today in motion',
			value: todaysAppointments.toLocaleString(currentLocale),
			href: '/appointments',
			icon: CalendarDays,
			iconClass: 'bg-cyan-100 text-cyan-700',
			primaryLabel: currentLanguage === 'tr' ? 'Onaylı + işlemde' : 'Confirmed + active',
			primaryValue: activeScheduleCount.toLocaleString(currentLocale),
			secondaryLabel: currentLanguage === 'tr' ? 'Planlı / gelmedi' : 'Scheduled / no-show',
			secondaryValue: `${$appointmentStats.scheduled.toLocaleString(currentLocale)} / ${noShowAppointments.toLocaleString(currentLocale)}`
		},
		{
			kicker: currentLanguage === 'tr' ? 'TAHSİLAT' : 'COLLECTIONS',
			title: currentLanguage === 'tr' ? 'Aylık kapanan gelir' : 'Closed this month',
			value: formatCurrency(monthlyRevenue, undefined, currentLocale),
			href: '/billing',
			icon: TrendingUp,
			iconClass: 'bg-emerald-100 text-emerald-700',
			primaryLabel: currentLanguage === 'tr' ? 'Gecikmiş / bekleyen' : 'Overdue / pending',
			primaryValue: `${formatCurrency(overdueAmount, undefined, currentLocale)} / ${formatCurrency(pendingAmount, undefined, currentLocale)}`,
			secondaryLabel: currentLanguage === 'tr' ? 'Bugün tahsil edilen' : 'Collected today',
			secondaryValue: formatCurrency(todaysRevenue, undefined, currentLocale)
		},
		{
			kicker: currentLanguage === 'tr' ? 'BAKIM HAVUZU' : 'CARE BASE',
			title: currentLanguage === 'tr' ? 'Aktif hasta ilişkisi' : 'Active care base',
			value: activePatients.toLocaleString(currentLocale),
			href: '/patients',
			icon: HeartPulse,
			iconClass: 'bg-violet-100 text-violet-700',
			primaryLabel: currentLanguage === 'tr' ? 'Toplam kayıt' : 'Total records',
			primaryValue: totalPatients.toLocaleString(currentLocale),
			secondaryLabel: currentLanguage === 'tr' ? 'SGK / özel' : 'Public / private',
			secondaryValue: `${$patientStats.withSGK.toLocaleString(currentLocale)} / ${$patientStats.withPrivateInsurance.toLocaleString(currentLocale)}`
		},
		{
			kicker: currentLanguage === 'tr' ? 'TEDARİK' : 'SUPPLY',
			title: currentLanguage === 'tr' ? 'Kritik stok alanı' : 'Critical stock area',
			value: stockAlerts.toLocaleString(currentLocale),
			href: '/inventory',
			icon: PackageSearch,
			iconClass: 'bg-amber-100 text-amber-700',
			primaryLabel: currentLanguage === 'tr' ? 'Tükendi / SKT' : 'Out / expiry',
			primaryValue: `${outOfStockCount.toLocaleString(currentLocale)} / ${expiredCount.toLocaleString(currentLocale)}`,
			secondaryLabel: currentLanguage === 'tr' ? 'Stok değeri' : 'Inventory value',
			secondaryValue: formatCurrency(totalInventoryValue, undefined, currentLocale)
		}
	];
	$: riskItems = [
		{
			title: currentLanguage === 'tr' ? 'Tahsilat kapanışı gerekiyor' : 'Collections need closure',
			value: formatCurrency(overdueAmount, undefined, currentLocale),
			detail:
				currentLanguage === 'tr'
					? `${overdueInvoices.length.toLocaleString(currentLocale)} gecikmiş fatura bugün takip bekliyor.`
					: `${overdueInvoices.length.toLocaleString(currentLocale)} overdue invoices need follow-up today.`,
			owner: currentLanguage === 'tr' ? 'Ön büro' : 'Front desk',
			action: currentLanguage === 'tr' ? 'Tahsilat masasını aç' : 'Open collections desk',
			href: '/billing',
			priority: overdueAmount > 0 ? 'urgent' : 'medium',
			toneClass: 'bg-rose-500'
		},
		{
			title: currentLanguage === 'tr' ? 'Stok kritik listesi' : 'Supply critical list',
			value: stockAlerts.toLocaleString(currentLocale),
			detail:
				currentLanguage === 'tr'
					? `${outOfStockCount.toLocaleString(currentLocale)} ürün tükendi, ${expiredCount.toLocaleString(currentLocale)} ürün SKT riski taşıyor.`
					: `${outOfStockCount.toLocaleString(currentLocale)} items are out, ${expiredCount.toLocaleString(currentLocale)} are at expiry risk.`,
			owner: currentLanguage === 'tr' ? 'Depo ve klinik' : 'Supply and clinic',
			action: currentLanguage === 'tr' ? 'Stok masasını aç' : 'Open inventory desk',
			href: '/inventory',
			priority: outOfStockCount > 0 || expiredCount > 0 ? 'urgent' : 'high',
			toneClass: 'bg-amber-500'
		},
		{
			title: currentLanguage === 'tr' ? 'Vardiya kapasitesi baskıda' : 'Shift capacity is tightening',
			value: `${loadBalance}%`,
			detail:
				currentLanguage === 'tr'
					? `${onDutyToday.toLocaleString(currentLocale)} görevli, ${onLeaveCount.toLocaleString(currentLocale)} izinli personel var.`
					: `${onDutyToday.toLocaleString(currentLocale)} on duty with ${onLeaveCount.toLocaleString(currentLocale)} team members on leave.`,
			owner: currentLanguage === 'tr' ? 'Koordinasyon' : 'Coordination',
			action: currentLanguage === 'tr' ? 'Vardiya görünümünü aç' : 'Open staff schedule',
			href: '/staff/schedule',
			priority: loadBalance >= 80 || onLeaveCount > 0 ? 'high' : 'medium',
			toneClass: 'bg-cyan-500'
		}
	];
	$: priorityCount = riskItems.filter((item) => item.priority === 'urgent' || item.priority === 'high').length;
	$: urgentWatchCount = stockAlerts + overdueInvoices.length + onLeaveCount;
	$: riskSummaryCards = [
		{
			label: currentLanguage === 'tr' ? 'Gecikmiş' : 'Overdue',
			value: overdueInvoices.length.toLocaleString(currentLocale),
			help: formatCurrency(overdueAmount, undefined, currentLocale),
			className: 'bg-rose-50 text-rose-700 border-rose-100'
		},
		{
			label: currentLanguage === 'tr' ? 'Bekleyen' : 'Pending',
			value: pendingInvoices.length.toLocaleString(currentLocale),
			help: formatCurrency(pendingAmount, undefined, currentLocale),
			className: 'bg-amber-50 text-amber-700 border-amber-100'
		},
		{
			label: currentLanguage === 'tr' ? 'Ekip yükü' : 'Team load',
			value: `${loadBalance}%`,
			help:
				currentLanguage === 'tr'
					? `${onDutyToday.toLocaleString(currentLocale)} görevli`
					: `${onDutyToday.toLocaleString(currentLocale)} on duty`,
			className: 'bg-cyan-50 text-cyan-700 border-cyan-100'
		}
	];
	$: scenarioCards = [
		{
			kicker: currentLanguage === 'tr' ? 'YOĞUN SABAH' : 'BUSY MORNING',
			title:
				currentLanguage === 'tr'
					? `${todaysAppointments.toLocaleString(currentLocale)} randevuluk poliklinik açılışı`
					: `${todaysAppointments.toLocaleString(currentLocale)}-visit clinic opening`,
			description:
				currentLanguage === 'tr'
					? 'Ön masa, onaylı akışı ve check-in kuyruğunu randevu boardundan yönetiyor.'
					: 'Front desk is running confirmed flow and check-in queue from the board.',
			href: '/appointments',
			tone: 'mf-tint-cyan'
		},
		{
			kicker: currentLanguage === 'tr' ? 'KRİTİK TAKİP' : 'FOLLOW-UP',
			title:
				currentLanguage === 'tr'
					? `${$recentNotifications.length.toLocaleString(currentLocale)} açık operasyon sinyali`
					: `${$recentNotifications.length.toLocaleString(currentLocale)} open operational signals`,
			description:
				currentLanguage === 'tr'
					? 'Laboratuvar, sevk ve stok uyarıları triage kutusunda toplanıyor.'
					: 'Lab, referral, and stock signals are gathered inside the triage inbox.',
			href: '/notifications',
			tone: 'mf-tint-emerald'
		},
		{
			kicker: currentLanguage === 'tr' ? 'TAHSİLAT KAPANIŞI' : 'CLOSING LOOP',
			title:
				currentLanguage === 'tr'
					? `${formatCurrency(overdueAmount, undefined, currentLocale)} gecikmiş bakiye`
					: `${formatCurrency(overdueAmount, undefined, currentLocale)} overdue balance`,
			description:
				currentLanguage === 'tr'
					? 'Geciken faturalar gelir masasında kapanış turuna hazırlanıyor.'
					: 'Overdue invoices are queued for a collections close-out pass.',
			href: '/billing',
			tone: 'mf-tint-amber'
		}
	];
	$: operationsQueue = [
		...upcomingQueue.map((appointment) => ({
			kicker: currentLanguage === 'tr' ? 'RANDEVU' : 'VISIT',
			title: `${appointment.startTime} · ${appointment.patientName}`,
			detail: `${appointment.doctorName} · ${appointment.reason}`,
			meta: currentLanguage === 'tr' ? 'Takvim akışı' : 'Schedule flow',
			badge: text.appointmentStatus[appointment.status],
			href: '/appointments',
			priority: appointment.status === 'in-progress' ? 'urgent' : appointment.status === 'confirmed' ? 'high' : 'medium'
		})),
		...(overdueInvoices.length > 0
			? [
					{
						kicker: currentLanguage === 'tr' ? 'TAHSİLAT' : 'COLLECTIONS',
						title:
							currentLanguage === 'tr'
								? `${overdueInvoices.length.toLocaleString(currentLocale)} fatura kapanış bekliyor`
								: `${overdueInvoices.length.toLocaleString(currentLocale)} invoices await closure`,
						detail:
							currentLanguage === 'tr'
								? `${formatCurrency(overdueAmount, undefined, currentLocale)} gecikmiş bakiye ön masada takipte.`
								: `${formatCurrency(overdueAmount, undefined, currentLocale)} overdue balance needs front-desk follow-up.`,
						meta: currentLanguage === 'tr' ? 'Gelir döngüsü' : 'Revenue cycle',
						badge: currentLanguage === 'tr' ? 'Bugün' : 'Today',
						href: '/billing',
						priority: 'high'
					}
				]
			: []),
		...(stockWatchItems.length > 0
			? [
					{
						kicker: currentLanguage === 'tr' ? 'STOK' : 'SUPPLY',
						title: stockWatchItems[0].name,
						detail:
							currentLanguage === 'tr'
								? `${stockWatchItems[0].currentStock.toLocaleString(currentLocale)} ${stockWatchItems[0].unit} kaldı. ${inventoryStatusLabel(stockWatchItems[0].status, currentLanguage)}.`
								: `${stockWatchItems[0].currentStock.toLocaleString(currentLocale)} ${stockWatchItems[0].unit} left. ${inventoryStatusLabel(stockWatchItems[0].status, currentLanguage)}.`,
						meta: currentLanguage === 'tr' ? 'Tedarik masası' : 'Supply desk',
						badge: inventoryStatusLabel(stockWatchItems[0].status, currentLanguage),
						href: '/inventory',
						priority: stockWatchItems[0].status === 'out-of-stock' || stockWatchItems[0].status === 'expired' ? 'urgent' : 'high'
					}
				]
			: []),
		...(inboxPreview.length > 0
			? [
					{
						kicker: currentLanguage === 'tr' ? 'BİLDİRİM' : 'ALERT',
						title: inboxPreview[0].title,
						detail: inboxPreview[0].message,
						meta: currentLanguage === 'tr' ? 'Operasyon kutusu' : 'Operations inbox',
						badge: priorityLabel(inboxPreview[0].priority, currentLanguage),
						href: inboxPreview[0].actionUrl ?? '/notifications',
						priority: inboxPreview[0].priority
					}
				]
			: [])
	].slice(0, 4);
	$: workspacePulseItems = [
		{
			label: currentLanguage === 'tr' ? 'Bugün akış' : 'Today flow',
			value: todaysAppointments.toLocaleString(currentLocale),
			note:
				currentLanguage === 'tr'
					? `${activeScheduleCount.toLocaleString(currentLocale)} aktif slot hazır`
					: `${activeScheduleCount.toLocaleString(currentLocale)} active slots ready`,
			href: '/appointments',
			tone:
				'bg-[linear-gradient(180deg,rgba(236,249,253,0.96),rgba(247,252,255,0.92))] border-cyan-100 text-cyan-900'
		},
		{
			label: currentLanguage === 'tr' ? 'Tahsilat baskısı' : 'Collections pressure',
			value: formatCurrency(overdueAmount, undefined, currentLocale),
			note:
				currentLanguage === 'tr'
					? `${overdueInvoices.length.toLocaleString(currentLocale)} gecikmiş fatura`
					: `${overdueInvoices.length.toLocaleString(currentLocale)} overdue invoices`,
			href: '/billing',
			tone:
				'bg-[linear-gradient(180deg,rgba(255,245,246,0.96),rgba(255,251,252,0.92))] border-rose-100 text-rose-900'
		},
		{
			label: currentLanguage === 'tr' ? 'Stok riski' : 'Supply risk',
			value: stockAlerts.toLocaleString(currentLocale),
			note:
				currentLanguage === 'tr'
					? `${outOfStockCount.toLocaleString(currentLocale)} tükenen ürün`
					: `${outOfStockCount.toLocaleString(currentLocale)} stockouts`,
			href: '/inventory',
			tone:
				'bg-[linear-gradient(180deg,rgba(255,249,238,0.96),rgba(255,252,247,0.92))] border-amber-100 text-amber-900'
		}
	];
	$: analyticsHub = {
		kicker: currentLanguage === 'tr' ? 'ANALİTİK MERKEZİ' : 'ANALYTICS HUB',
		title:
			currentLanguage === 'tr'
				? 'Eğilim, finans ve akış görünümünü tek sekmeli yüzeyde toplayın.'
				: 'Bring trends, finance, and operational flow into one tabbed surface.',
		description:
			currentLanguage === 'tr'
				? 'Ayrı ayrı kutular arasında dolaşmak yerine aynı çalışma alanında randevu, gelir, akış, hasta karması ve stok görünümünü sekmeyle değiştirin.'
				: 'Switch between appointments, revenue, activity, patient mix, and stock views from one shared analysis workspace.'
	};
	$: analyticsTabs = [
		{
			key: 'appointments',
			kicker: text.analytics.appointmentsKicker,
			label: text.analytics.appointmentsTitle,
			description: text.analytics.appointmentsDescription,
			href: '/appointments',
			icon: CalendarDays
		},
		{
			key: 'quickActions',
			kicker: text.analytics.quickActionsKicker,
			label: text.analytics.quickActionsTitle,
			description: text.analytics.quickActionsDescription,
			href: '/appointments',
			icon: Stethoscope
		},
		{
			key: 'revenue',
			kicker: text.analytics.revenueKicker,
			label: text.analytics.revenueTitle,
			description: text.analytics.revenueDescription,
			href: '/billing',
			icon: TrendingUp
		},
		{
			key: 'activity',
			kicker: text.analytics.activityKicker,
			label: text.analytics.activityTitle,
			description: text.analytics.activityDescription,
			href: '/notifications',
			icon: BellRing
		},
		{
			key: 'payor',
			kicker: text.analytics.payorKicker,
			label: text.analytics.payorTitle,
			description: text.analytics.payorDescription,
			href: '/patients',
			icon: HeartPulse
		},
		{
			key: 'stock',
			kicker: text.analytics.stockKicker,
			label: text.analytics.stockTitle,
			description: text.analytics.stockDescription,
			href: '/inventory',
			icon: PackageSearch
		}
	] as AnalyticsTab[];
	$: activeAnalyticsMeta =
		analyticsTabs.find((tab) => tab.key === activeAnalyticsTab) ?? analyticsTabs[0];
	$: analyticsSummaryCards = [
		{
			label: currentLanguage === 'tr' ? 'Canlı randevu' : 'Live visits',
			value: todaysAppointments.toLocaleString(currentLocale),
			note:
				currentLanguage === 'tr'
					? `${activeScheduleCount.toLocaleString(currentLocale)} aktif akış`
					: `${activeScheduleCount.toLocaleString(currentLocale)} active flow`,
			href: '/appointments',
			tone:
				'bg-[linear-gradient(180deg,rgba(236,249,253,0.96),rgba(247,252,255,0.92))] border-cyan-100 text-cyan-900'
		},
		{
			label: currentLanguage === 'tr' ? 'Gelir ritmi' : 'Revenue rhythm',
			value: formatCurrency(monthlyRevenue, undefined, currentLocale),
			note:
				currentLanguage === 'tr'
					? `${formatCurrency(todaysRevenue, undefined, currentLocale)} bugün`
					: `${formatCurrency(todaysRevenue, undefined, currentLocale)} today`,
			href: '/billing',
			tone:
				'bg-[linear-gradient(180deg,rgba(236,253,244,0.96),rgba(247,255,251,0.92))] border-emerald-100 text-emerald-900'
		},
		{
			label: currentLanguage === 'tr' ? 'Risk alanı' : 'Risk area',
			value: stockAlerts.toLocaleString(currentLocale),
			note:
				currentLanguage === 'tr'
					? `${priorityCount.toLocaleString(currentLocale)} öncelikli konu`
					: `${priorityCount.toLocaleString(currentLocale)} priority items`,
			href: '/notifications',
			tone:
				'bg-[linear-gradient(180deg,rgba(255,249,238,0.96),rgba(255,252,247,0.92))] border-amber-100 text-amber-900'
		}
	];
	$: focusCoverageCards = [
		{
			label: currentLanguage === 'tr' ? 'Aktif ekip' : 'Active team',
			value: activeTeam.toLocaleString(currentLocale),
			tone: 'bg-cyan-50 text-cyan-800 border-cyan-100'
		},
		{
			label: currentLanguage === 'tr' ? 'Görevde' : 'On duty',
			value: onDutyToday.toLocaleString(currentLocale),
			tone: 'bg-emerald-50 text-emerald-800 border-emerald-100'
		},
		{
			label: currentLanguage === 'tr' ? 'Yük' : 'Load',
			value: `${loadBalance}%`,
			tone: 'bg-amber-50 text-amber-800 border-amber-100'
		}
	];
	$: inboxPreview = [...$recentNotifications]
		.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
		.slice(0, 4);
</script>

<div class="mf-page-shell space-y-8 pt-6 pb-12 md:pt-8 lg:pt-10">
	<section class="rounded-[1.9rem] border border-[color:var(--mf-line-soft)] bg-white px-6 py-8 shadow-[0_12px_40px_-34px_rgba(15,23,42,0.22)] lg:px-8">
		<div class="flex flex-col gap-6 border-b border-[color:var(--mf-line-soft)] pb-7 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<p class="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--mf-ink-faint)]">
					MedFlow Clinic CRM • Demo
				</p>
				<h1
					class="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--mf-ink-strong)]"
					style="font-family: var(--lavescar-font-display);"
				>
					{currentLanguage === 'tr' ? 'Günlük Operasyon Özeti' : 'Daily Operations Summary'}
				</h1>
			</div>

			<div class="text-left lg:text-right">
				<p class="text-lg font-medium text-[color:var(--mf-ink)]">{todayLabel}</p>
				<div class="mt-2 flex flex-wrap items-center gap-3 lg:justify-end">
					<div class="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
						<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
						{currentLanguage === 'tr' ? 'Stabil' : 'Stable'}
					</div>
					<p class="text-sm text-[color:var(--mf-ink-soft)]">
						{currentLanguage === 'tr' ? 'Bugün' : 'Today'}
						<span class="mx-1 font-semibold text-[color:var(--mf-ink-strong)]">{todaysAppointments}</span>
						{currentLanguage === 'tr' ? 'randevu' : 'appointments'}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-8 grid gap-4 xl:grid-cols-4">
			<button
				type="button"
				class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 text-left shadow-[0_10px_30px_-28px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5"
				onclick={() => goto('/appointments')}
			>
				<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
					{currentLanguage === 'tr' ? 'Randevu' : 'Appointments'}
				</p>
				<p class="mt-4 text-[2.8rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
					{todaysAppointments}
				</p>
			</button>

			<div class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.2)]">
				<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
					{currentLanguage === 'tr' ? 'Açık başlık' : 'Open priorities'}
				</p>
				<p class="mt-4 text-[2.8rem] font-semibold leading-none text-blue-700">{priorityCount}</p>
			</div>

			<div class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.2)]">
				<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
					{currentLanguage === 'tr' ? 'Acil izleme' : 'Urgent watch'}
				</p>
				<p class="mt-4 text-[2.8rem] font-semibold leading-none text-rose-700">{urgentWatchCount}</p>
			</div>

			<button
				type="button"
				class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 text-left shadow-[0_10px_30px_-28px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5"
				onclick={() => goto('/patients')}
			>
				<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
					{currentLanguage === 'tr' ? 'Aktif hasta' : 'Active patients'}
				</p>
				<p class="mt-4 text-[2.8rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
					{activePatients}
				</p>
			</button>
		</div>

		<div class="mt-10 grid gap-4 xl:grid-cols-12">
			<div class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-white p-7 shadow-[0_10px_34px_-30px_rgba(15,23,42,0.2)] xl:col-span-5">
				<div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0">
						<h2 class="text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--mf-ink-strong)]">
							{currentLanguage === 'tr' ? 'Servis hazırlık skoru' : 'Service readiness score'}
						</h2>
						<p class="mt-8 text-[3.6rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
							{readinessScore}%
						</p>
						<p class="mt-8 max-w-xs text-sm leading-6 text-[color:var(--mf-ink-soft)]">
							{currentLanguage === 'tr'
								? 'Onaylı ve ilerleyen akışın bugünkü randevu oranına etkisi.'
								: "How confirmed and active visits support today's schedule stability."}
						</p>
					</div>

					<div class="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
						<svg class="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
							<circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" stroke-width="14"></circle>
							<circle
								cx="60"
								cy="60"
								r="48"
								fill="none"
								stroke="#1e40af"
								stroke-width="14"
								stroke-linecap="round"
								stroke-dasharray="301.59"
								stroke-dashoffset={301.59 - (301.59 * readinessScore) / 100}
								class="transition-all duration-500"
							></circle>
						</svg>
						<div class="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-slate-400">
							{readinessScore}%
						</div>
					</div>
				</div>
			</div>

			<button
				type="button"
				class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-white p-7 text-left shadow-[0_10px_34px_-30px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 xl:col-span-4"
				onclick={() => goto('/billing')}
			>
				<h2 class="text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--mf-ink-strong)]">
					{currentLanguage === 'tr' ? 'Bugün tahsil edilen' : 'Collected today'}
				</h2>
				<p class="mt-9 text-[3.3rem] font-semibold leading-none text-emerald-700">
					{formatCurrency(todaysRevenue, undefined, currentLocale)}
				</p>
				<p class="mt-14 text-xs text-[color:var(--mf-ink-soft)]">
					{currentLanguage === 'tr'
						? 'Kasa ve ödeme akışını günlük bazda izleyin.'
						: 'Track payment flow and front-desk collections in real time.'}
				</p>
			</button>

			<button
				type="button"
				class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-white p-7 text-left shadow-[0_10px_34px_-30px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 xl:col-span-3"
				onclick={() => goto('/notifications')}
			>
				<h2 class="text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--mf-ink-strong)]">
					{currentLanguage === 'tr' ? 'Acil izleme alanı' : 'Priority watch area'}
				</h2>
				<p class="mt-9 text-[3.3rem] font-semibold leading-none text-rose-700">{urgentWatchCount}</p>
				<p class="mt-14 text-xs text-[color:var(--mf-ink-soft)]">
					{currentLanguage === 'tr'
						? 'Stok, ödeme ve ekip kaynaklı dikkat gerektiren başlıklar.'
						: 'Stock, payment, and staffing topics that need attention.'}
				</p>
			</button>
		</div>

		<div class="mt-10">
			<h2 class="text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--mf-ink-strong)]">
				{currentLanguage === 'tr' ? 'Operasyon öncelikleri' : 'Operations priorities'}
			</h2>
			<div class="mt-5 grid gap-4 md:grid-cols-3">
				<button
					type="button"
					class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 text-left shadow-[0_10px_28px_-28px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
					onclick={() => goto('/billing')}
				>
					<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-rose-600">
						{currentLanguage === 'tr' ? 'Gecikmiş' : 'Overdue'}
					</p>
					<p class="mt-5 text-[2.9rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
						{overdueInvoices.length}
					</p>
					<p class="mt-8 text-xs text-[color:var(--mf-ink-soft)]">
						{formatCurrency(overdueAmount, undefined, currentLocale)}
					</p>
				</button>

				<button
					type="button"
					class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 text-left shadow-[0_10px_28px_-28px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
					onclick={() => goto('/billing')}
				>
					<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-600">
						{currentLanguage === 'tr' ? 'Bekleyen' : 'Pending'}
					</p>
					<p class="mt-5 text-[2.9rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
						{pendingInvoices.length}
					</p>
					<p class="mt-8 text-xs text-[color:var(--mf-ink-soft)]">
						{formatCurrency(pendingAmount, undefined, currentLocale)}
					</p>
				</button>

				<button
					type="button"
					class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white p-6 text-left shadow-[0_10px_28px_-28px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
					onclick={() => goto('/staff/schedule')}
				>
					<p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-blue-600">
						{currentLanguage === 'tr' ? 'Ekip yükü' : 'Team load'}
					</p>
					<p class="mt-5 text-[2.9rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
						{loadBalance}%
					</p>
					<p class="mt-8 text-xs text-[color:var(--mf-ink-soft)]">
						{onDutyToday} {currentLanguage === 'tr' ? 'görevli' : 'on duty'}
					</p>
				</button>
			</div>
		</div>

		<div class="mt-10 grid gap-4 xl:grid-cols-12">
			<div class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-white p-7 shadow-[0_10px_34px_-30px_rgba(15,23,42,0.2)] xl:col-span-5">
				<h2 class="text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--mf-ink-strong)]">
					{currentLanguage === 'tr' ? 'Hızlı masa • aktif kullanıcı' : 'Quick desk • active user'}
				</h2>

				<div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
					<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-white">
						{currentUserInitials}
					</div>
					<div class="min-w-0">
						<p class="text-2xl font-semibold text-[color:var(--mf-ink-strong)]">{currentUserName}</p>
						<p class="mt-1 text-sm text-[color:var(--mf-ink-soft)]">
							{currentUserEmail} • {roleLabel(activeRole, currentLanguage)}
						</p>

						<div class="mt-8 grid gap-6 sm:grid-cols-3">
							<div>
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
									{currentLanguage === 'tr' ? 'Bugün öncelik' : 'Priority today'}
								</p>
								<p class="mt-2 text-sm font-semibold text-blue-700">
									{priorityCount} {currentLanguage === 'tr' ? 'açık başlık' : 'open items'}
								</p>
							</div>
							<div>
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
									{currentLanguage === 'tr' ? 'Bugün ajanda' : 'Today agenda'}
								</p>
								<p class="mt-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{todaysAppointments} {currentLanguage === 'tr' ? 'aktif kayıt' : 'active visits'}
								</p>
							</div>
							<div>
								<p class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
									{currentLanguage === 'tr' ? 'Hazırlık' : 'Readiness'}
								</p>
								<p class="mt-2 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
									{readinessScore}%
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-[1.5rem] border border-[color:var(--mf-line-soft)] bg-white p-7 shadow-[0_10px_34px_-30px_rgba(15,23,42,0.2)] xl:col-span-7">
				<h2 class="text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--mf-ink-strong)]">
					{currentLanguage === 'tr' ? 'Bakım akışı • randevu durumu' : 'Care flow • visit status'}
				</h2>

				<div class="mt-7 grid gap-3 md:grid-cols-5">
					{#each appointmentBreakdown as item}
						<div class="rounded-xl bg-slate-50 px-4 py-5 text-center">
							<p class={`text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${
								item.key === 'in-progress'
									? 'text-blue-600'
									: item.key === 'completed'
										? 'text-emerald-600'
										: item.key === 'no-show'
											? 'text-rose-600'
											: 'text-slate-500'
							}`}>
								{item.label}
							</p>
							<p class="mt-3 text-[2.2rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
								{item.value}
							</p>
						</div>
					{/each}
				</div>

				<div class="mt-8 flex flex-col gap-4 border-t border-[color:var(--mf-line-soft)] pt-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">
							{currentLanguage === 'tr' ? 'Ekip kapsaması' : 'Team coverage'}
						</p>
						<p class="mt-3 text-[2.5rem] font-semibold leading-none text-[color:var(--mf-ink-strong)]">
							{activeTeam}
						</p>
						<p class="mt-2 text-xs text-[color:var(--mf-ink-soft)]">
							{currentLanguage === 'tr'
								? `${activeTeam} aktif personel • ${onDutyToday} görevde`
								: `${activeTeam} active staff • ${onDutyToday} on duty`}
						</p>
					</div>

					<p class="max-w-[280px] text-xs leading-6 text-[color:var(--mf-ink-soft)] md:text-right">
						{currentLanguage === 'tr'
							? `${onLeaveCount} personel izinde • ${stockAlerts} tedarik uyarısı var`
							: `${onLeaveCount} on leave • ${stockAlerts} supply alerts`}
					</p>
				</div>
			</div>
		</div>

		<p class="mt-12 text-center text-xs text-[color:var(--mf-ink-faint)]">
			{currentLanguage === 'tr'
				? 'MedFlow Demo • Yerel Sandbox Modu • Tüm veriler örnek amaçlıdır • Gerçek klinik kayıtları etkilenmez'
				: 'MedFlow Demo • Local sandbox mode • All data is sample data • Real clinical records are not affected'}
		</p>
	</section>
</div>
