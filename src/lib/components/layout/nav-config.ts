import type { PermissionFlags, Role } from '$types/staff';
import type { PermissionKey } from '$lib/utils/rbac';
import {
	ArrowRightLeft,
	BarChart3,
	Bell,
	Calendar,
	ClipboardList,
	CreditCard,
	FileText,
	LayoutDashboard,
	Package,
	Settings,
	UserCheck,
	UserCog,
	Users
} from 'lucide-svelte';

export interface NavItemDefinition {
	id: string;
	label: string;
	href: string;
	icon: any;
	requiredPermissions?: PermissionKey[];
}

export interface NavSectionDefinition {
	id: string;
	title: string;
	subtitle: string;
	items: NavItemDefinition[];
}

export interface NavInsight {
	badge?: string;
	hint: string;
	tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface NavInsightSeed {
	patientStats: {
		active: number;
		inactive: number;
	};
	appointmentStats: {
		today: number;
		confirmed: number;
		inProgress: number;
	};
	billingStats: {
		overdueInvoices: number;
		pendingInvoices: number;
	};
	inventoryStats: {
		alertCount: number;
		byStatus?: {
			outOfStock: number;
			lowStock: number;
		};
	};
	unreadCount: number;
	activeTreatmentCount: number;
	pendingReferralCount: number;
	staffOnLeaveCount: number;
}

export const navSections: NavSectionDefinition[] = [
	{
		id: 'control',
		title: 'Kontrol',
		subtitle: 'Merkezi operasyon görünümü',
		items: [{ id: 'dashboard', label: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard }]
	},
	{
		id: 'clinical',
		title: 'Klinik',
		subtitle: 'Hasta ve bakım akışları',
		items: [
			{ id: 'patients', label: 'nav.patients', href: '/patients', icon: Users, requiredPermissions: ['canViewPatients'] },
			{ id: 'appointments', label: 'nav.appointments', href: '/appointments', icon: Calendar, requiredPermissions: ['canViewAppointments'] },
			{ id: 'emr', label: 'nav.emr', href: '/emr', icon: FileText, requiredPermissions: ['canViewEMR'] },
			{ id: 'treatments', label: 'treatments.title', href: '/treatments', icon: ClipboardList, requiredPermissions: ['canViewEMR'] },
			{ id: 'referrals', label: 'nav.referrals', href: '/referrals', icon: ArrowRightLeft, requiredPermissions: ['canViewEMR'] }
		]
	},
	{
		id: 'ops',
		title: 'Operasyon',
		subtitle: 'Finans, tedarik ve risk katmanı',
		items: [
			{ id: 'billing', label: 'nav.billing', href: '/billing', icon: CreditCard, requiredPermissions: ['canViewBilling'] },
			{ id: 'inventory', label: 'nav.inventory', href: '/inventory', icon: Package, requiredPermissions: ['canViewInventory'] },
			{ id: 'notifications', label: 'nav.notifications', href: '/notifications', icon: Bell },
			{ id: 'reports', label: 'nav.reports', href: '/reports', icon: BarChart3, requiredPermissions: ['canViewReports'] }
		]
	},
	{
		id: 'admin',
		title: 'Yönetim',
		subtitle: 'Ekip ve sistem denetimi',
		items: [
			{ id: 'staff', label: 'nav.staff', href: '/staff', icon: UserCheck, requiredPermissions: ['canViewStaff'] },
			{ id: 'users', label: 'nav.users', href: '/users', icon: UserCog, requiredPermissions: ['canManageSettings'] },
			{ id: 'settings', label: 'nav.settings', href: '/settings', icon: Settings, requiredPermissions: ['canManageSettings'] }
		]
	}
];

export function filterNavSections(permissions: PermissionFlags | null | undefined) {
	if (!permissions) {
		return navSections;
	}

	return navSections
		.map((section) => ({
			...section,
			items: section.items.filter((item) => {
				if (!item.requiredPermissions?.length) {
					return true;
				}

				return item.requiredPermissions.some((permission) => permissions[permission] === true);
			})
		}))
		.filter((section) => section.items.length > 0);
}

export function createNavInsights(seed: NavInsightSeed): Record<string, NavInsight> {
	return {
		dashboard: {
			hint:
				seed.appointmentStats.confirmed > 0
					? `${seed.appointmentStats.confirmed} teyitli slot bugüne hazır`
					: 'Günün kritik akışlarını tek bakışta toparla',
			tone: 'info'
		},
		patients: {
			hint:
				seed.patientStats.inactive > 0
					? `${seed.patientStats.active} aktif, ${seed.patientStats.inactive} pasif kayıt`
					: `${seed.patientStats.active} aktif hasta akışta`,
			tone: 'success'
		},
		appointments: {
			badge: String(seed.appointmentStats.today),
			hint:
				seed.appointmentStats.inProgress > 0
					? `${seed.appointmentStats.inProgress} ziyaret şu an sürüyor`
					: 'Takvim ve klinik kapasiteyi dengele',
			tone: 'info'
		},
		emr: {
			hint: 'Notlar, tanılar ve klinik kayıtlar',
			tone: 'neutral'
		},
		treatments: {
			hint:
				seed.activeTreatmentCount > 0
					? `${seed.activeTreatmentCount} plan aktif izleniyor`
					: 'Tedavi planlarını seans ritmiyle yönet',
			tone: 'success'
		},
		referrals: {
			badge: seed.pendingReferralCount > 0 ? String(seed.pendingReferralCount) : undefined,
			hint:
				seed.pendingReferralCount > 0
					? 'Kapanmayı bekleyen sevk akışları var'
					: 'Kurum içi ve dışı sevk akışları temiz',
			tone: seed.pendingReferralCount > 0 ? 'warning' : 'neutral'
		},
		billing: {
			badge: seed.billingStats.overdueInvoices > 0 ? String(seed.billingStats.overdueInvoices) : undefined,
			hint:
				seed.billingStats.overdueInvoices > 0
					? `${seed.billingStats.overdueInvoices} gecikmiş fatura tahsilat bekliyor`
					: `${seed.billingStats.pendingInvoices} açık fatura operasyonda`,
			tone: seed.billingStats.overdueInvoices > 0 ? 'danger' : 'warning'
		},
		inventory: {
			badge: seed.inventoryStats.alertCount > 0 ? String(seed.inventoryStats.alertCount) : undefined,
			hint:
				seed.inventoryStats.alertCount > 0
					? `${seed.inventoryStats.byStatus?.outOfStock ?? 0} tükenen, ${seed.inventoryStats.byStatus?.lowStock ?? 0} düşük stok`
					: 'Stok seviyesi ve tedarik akışı dengede',
			tone: seed.inventoryStats.alertCount > 0 ? 'warning' : 'success'
		},
		notifications: {
			badge: seed.unreadCount > 0 ? String(seed.unreadCount) : undefined,
			hint:
				seed.unreadCount > 0
					? 'Okunmayı bekleyen operasyon sinyalleri var'
					: 'Akış şu an temiz görünüyor',
			tone: seed.unreadCount > 0 ? 'danger' : 'neutral'
		},
		reports: {
			hint: 'Operasyon ve finans görünümünü birleştir',
			tone: 'neutral'
		},
		staff: {
			hint:
				seed.staffOnLeaveCount > 0
					? `${seed.staffOnLeaveCount} ekip üyesi izin veya pasif`
					: 'Vardiya ve ekip yapısı dengeli',
			tone: seed.staffOnLeaveCount > 0 ? 'warning' : 'success'
		},
		users: {
			hint: 'Yetki yüzeyi ve erişim rol dağılımını yönet',
			tone: 'neutral'
		},
		settings: {
			hint: 'Tema, yapılandırma ve sistem davranışları burada',
			tone: 'neutral'
		}
	};
}

export function roleLabel(role: Role | null | undefined) {
	const labels: Record<string, string> = {
		Admin: 'Yönetici',
		Doctor: 'Doktor',
		Nurse: 'Hemşire',
		Receptionist: 'Resepsiyon',
		LabTechnician: 'Laboratuvar',
		Pharmacist: 'Eczane'
	};

	return role ? (labels[role] ?? role) : 'Demo Operatörü';
}
