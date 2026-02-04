import type { UserRole } from '$types';

export interface Route {
	path: string;
	label: string;
	icon: string;
	roles?: UserRole[];
	children?: Route[];
}

export const routes: Route[] = [
	{
		path: '/dashboard',
		label: 'Dashboard',
		icon: 'LayoutDashboard',
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist']
	},
	{
		path: '/patients',
		label: 'Hasta Yönetimi',
		icon: 'Users',
		roles: ['admin', 'doctor', 'nurse', 'receptionist'],
		children: [
			{ path: '/patients', label: 'Hastalar', icon: 'User' },
			{ path: '/patients/new', label: 'Yeni Hasta', icon: 'UserPlus' }
		]
	},
	{
		path: '/appointments',
		label: 'Randevu Sistemi',
		icon: 'CalendarDays',
		roles: ['admin', 'doctor', 'nurse', 'receptionist']
	},
	{
		path: '/emr',
		label: 'EMR',
		icon: 'FileMedical',
		roles: ['admin', 'doctor', 'nurse']
	},
	{
		path: '/billing',
		label: 'Faturalama',
		icon: 'Receipt',
		roles: ['admin', 'receptionist']
	},
	{
		path: '/inventory',
		label: 'Stok Yönetimi',
		icon: 'Package',
		roles: ['admin', 'pharmacist']
	},
	{
		path: '/reports',
		label: 'Raporlar & Analitik',
		icon: 'BarChart',
		roles: ['admin', 'doctor']
	},
	{
		path: '/users',
		label: 'Kullanıcı Yönetimi',
		icon: 'UserCog',
		roles: ['admin']
	},
	{
		path: '/notifications',
		label: 'Bildirimler',
		icon: 'Bell',
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist']
	},
	{
		path: '/settings',
		label: 'Ayarlar',
		icon: 'Settings',
		roles: ['admin']
	}
];
