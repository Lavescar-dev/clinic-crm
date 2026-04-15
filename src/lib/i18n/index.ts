import { writable, derived, get } from 'svelte/store';
import type { Language } from '$types';
import tr from './locales/tr.json';
import en from './locales/en.json';

const translations = {
	tr,
	en
};

type TranslationDictionary = Record<string, any>;

const exactAliasKeys: Record<string, string> = {
	'notifications.markAllAsRead': 'notifications.markAllRead',
	'reports.financial.title': 'reports.financial',
	'reports.patientStats.title': 'reports.patientStatistics',
	'reports.appointmentAnalysis.title': 'reports.appointmentAnalysis',
	'billing.invoice.invoiceNumber': 'billing.fields.invoiceNumber',
	'billing.invoice.patient': 'billing.fields.patient',
	'billing.invoice.issueDate': 'billing.fields.issueDate',
	'billing.invoice.dueDate': 'billing.fields.dueDate',
	'billing.invoice.status': 'billing.fields.status',
	'billing.invoice.items': 'billing.fields.items',
	'billing.invoice.description': 'billing.fields.description',
	'billing.invoice.quantity': 'billing.fields.quantity',
	'billing.invoice.unitPrice': 'billing.fields.unitPrice',
	'billing.invoice.taxRate': 'billing.fields.taxRate',
	'billing.invoice.taxAmount': 'billing.fields.taxAmount',
	'billing.invoice.subtotal': 'billing.fields.subtotal',
	'billing.invoice.total': 'billing.fields.total',
	'billing.invoice.paidAmount': 'billing.fields.paidAmount',
	'billing.invoice.remainingAmount': 'billing.fields.remainingAmount',
	'billing.payment.date': 'billing.fields.paymentDate',
	'billing.payment.method': 'billing.fields.paymentMethod',
	'billing.payment.referenceNumber': 'billing.fields.referenceNumber',
	'billing.payment.method.cash': 'billing.paymentMethod.cash',
	'billing.payment.method.credit-card': 'billing.paymentMethod.credit-card',
	'billing.payment.method.debit-card': 'billing.paymentMethod.debit-card',
	'billing.payment.method.bank-transfer': 'billing.paymentMethod.bank-transfer',
	'billing.payment.method.insurance': 'billing.paymentMethod.insurance',
	'inventory.item.name': 'inventory.fields.name',
	'inventory.item.category': 'inventory.fields.category',
	'inventory.item.currentStock': 'inventory.fields.currentStock',
	'inventory.item.unitPrice': 'inventory.fields.unitPrice',
	'inventory.item.expiryDate': 'inventory.fields.expiryDate',
	'inventory.item.status': 'inventory.fields.status',
	'patient.lastVisit': 'patients.fields.lastVisit',
	'patient.status.active': 'patients.status.active',
	'patient.status.inactive': 'patients.status.inactive',
	'patient.status.deceased': 'patients.status.deceased',
	'appointment.patient': 'appointments.fields.patient',
	'appointment.doctor': 'appointments.fields.doctor',
	'appointment.status.scheduled': 'appointments.status.scheduled',
	'appointment.status.confirmed': 'appointments.status.confirmed',
	'appointment.status.in-progress': 'appointments.status.in-progress',
	'appointment.status.completed': 'appointments.status.completed',
	'appointment.status.cancelled': 'appointments.status.cancelled',
	'appointment.status.noShow': 'appointments.status.no-show',
	'appointment.type.consultation': 'appointments.type.consultation',
	'appointment.type.emergency': 'appointments.type.emergency',
	'appointment.type.followUp': 'appointments.type.follow-up',
	'appointment.type.routineCheckup': 'appointments.type.routine-checkup',
	'user.role.admin': 'users.role.admin',
	'user.role.doctor': 'users.role.doctor',
	'user.role.nurse': 'users.role.nurse',
	'user.role.receptionist': 'users.role.receptionist',
	'user.role.pharmacist': 'users.role.pharmacist'
};

const translationFallbacks: Record<Language, Record<string, string>> = {
	tr: {
		'patient.management.title': 'Hasta Yönetimi',
		'patient.management.description': 'Hasta kayıtlarını, iletişim bilgilerini ve durum takibini tek listede yönetin.',
		'patient.management.addPatient': 'Yeni Hasta',
		'patient.profile.title': '{name} hasta profili',
		'patient.profile.medicalHistory': 'Tıbbi geçmiş',
		'patient.profile.appointments': 'Randevular',
		'patient.profile.billing': 'Faturalama',
		'patient.profile.documents': 'Dokümanlar',
		'patient.profile.familyMembers': 'Aile üyeleri',
		'patient.profile.patientNotFound': 'Hasta kaydı bulunamadı',
		'patient.profile.noAppointments': 'Bu hasta için randevu kaydı görünmüyor.',
		'patient.profile.noBillingHistory': 'Bu hasta için fatura geçmişi görünmüyor.',
		'patient.profile.noDocuments': 'Bu hasta için bağlı doküman görünmüyor.',
		'patient.profile.noFamilyMembers': 'Yakın aile kaydı görünmüyor.',
		'patient.form.addPatientTitle': 'Yeni Hasta Ekle',
		'patient.form.editPatientTitle': '{name} kaydını düzenle',
		'patient.form.tcNo': 'TC kimlik no',
		'patient.form.firstName': 'Ad',
		'patient.form.lastName': 'Soyad',
		'patient.form.fullName': 'Ad Soyad',
		'patient.form.birthDate': 'Doğum tarihi',
		'patient.form.age': 'Yaş',
		'patient.form.gender': 'Cinsiyet',
		'patient.form.phone': 'Telefon',
		'patient.form.status': 'Durum',
		'patient.form.emergencyName': 'Acil durumda aranacak kişi',
		'patient.form.emergencyRelation': 'Yakınlık',
		'patient.form.emergencyPhone': 'Acil durumda aranacak telefon',
		'appointments.description': 'Günlük takvimi, doktor uygunluğunu ve durum değişikliklerini tek akışta yönetin.',
		'billing.description': 'Fatura, tahsilat ve vade takibini mobilde de rahat okunacak bir yapıda yönetin.',
		'billing.invoice.filterByStatus': 'Duruma göre filtrele',
		'inventory.description': 'Kritik ürünleri, filtreleri ve stok risklerini dar ekranda da rahat takip edin.',
		'inventory.item.addNewItem': 'Yeni Ürün',
		'inventory.item.filterByCategory': 'Kategoriye göre filtrele',
		'inventory.item.filterByStatus': 'Duruma göre filtrele',
		'inventory.status.inStock': 'Stokta',
		'inventory.status.lowStock': 'Düşük stok',
		'inventory.status.outOfStock': 'Tükendi',
		'inventory.status.expired': 'Son kullanma tarihi geçti',
		'user.management.title': 'Kullanıcı Yönetimi',
		'user.management.addUser': 'Yeni Kullanıcı',
		'user.management.filterByRole': 'Role göre filtrele',
		'user.form.fullName': 'Ad Soyad',
		'user.form.email': 'E-posta',
		'user.form.role': 'Rol',
		'user.form.status': 'Durum',
		'user.form.firstName': 'Ad',
		'user.form.lastName': 'Soyad',
		'user.form.addUserTitle': 'Yeni Kullanıcı Ekle',
		'user.form.editUserTitle': '{name} kullanıcısını düzenle',
		'user.form.updateUser': 'Kullanıcıyı Güncelle',
		'user.form.selectRole': 'Rol seçin',
		'user.form.selectStatus': 'Durum seçin',
		'user.profile.title': '{name} kullanıcı profili',
		'reports.viewReport': 'Raporu Görüntüle',
		'reports.financial.description': 'Tahsilat, vade ve gelir hareketlerini finans bakışıyla inceleyin.',
		'reports.patientStats.description': 'Hasta tabanını, demografiyi ve bakım yoğunluğunu daha net okuyun.',
		'reports.appointmentAnalysis.description': 'Randevu hacmini, doluluk oranını ve iptal eğilimlerini izleyin.',
		'notifications.markAsRead': 'Okundu işaretle',
		'notifications.all': 'Tümü',
		'notifications.unread': 'Okunmamış',
		'notifications.allNotifications': 'Tüm Bildirimler',
		'notifications.unreadNotifications': 'Okunmamış Bildirimler',
		'notifications.noUnreadNotifications': 'Okunmamış bildirim yok',
		'notifications.ago': 'önce',
		'emr.searchPatient': 'Hasta Ara',
		'emr.searchPatientPlaceholder': 'Hasta adı veya TC kimlik no ile ara',
		'emr.searchResults': 'Arama Sonuçları',
		'emr.visitDate': 'Ziyaret Tarihi',
		'emr.noResults': 'Aramanızla eşleşen kayıt bulunamadı',
		'emr.recentRecords': 'Son Kayıtlar',
		'emr.noRecentRecords': 'Yakın tarihli kayıt bulunmuyor'
	},
	en: {
		'patient.management.title': 'Patient Management',
		'patient.management.description': 'Manage patient records, contact details, and status tracking in one list.',
		'patient.management.addPatient': 'Add Patient',
		'patient.profile.title': '{name} patient profile',
		'patient.profile.medicalHistory': 'Medical history',
		'patient.profile.appointments': 'Appointments',
		'patient.profile.billing': 'Billing',
		'patient.profile.documents': 'Documents',
		'patient.profile.familyMembers': 'Family members',
		'patient.profile.patientNotFound': 'Patient record not found',
		'patient.profile.noAppointments': 'No appointments found for this patient.',
		'patient.profile.noBillingHistory': 'No billing history found for this patient.',
		'patient.profile.noDocuments': 'No linked documents found for this patient.',
		'patient.profile.noFamilyMembers': 'No family records found for this patient.',
		'patient.form.addPatientTitle': 'Add Patient',
		'patient.form.editPatientTitle': 'Edit {name}',
		'patient.form.tcNo': 'National ID',
		'patient.form.firstName': 'First Name',
		'patient.form.lastName': 'Last Name',
		'patient.form.fullName': 'Full Name',
		'patient.form.birthDate': 'Birth date',
		'patient.form.age': 'Age',
		'patient.form.gender': 'Gender',
		'patient.form.phone': 'Phone',
		'patient.form.status': 'Status',
		'patient.form.emergencyName': 'Emergency contact',
		'patient.form.emergencyRelation': 'Relationship',
		'patient.form.emergencyPhone': 'Emergency phone',
		'appointments.description': 'Manage daily scheduling, doctor availability, and status changes in one flow.',
		'billing.description': 'Manage invoices, collections, and due dates in a mobile-friendly workflow.',
		'billing.invoice.filterByStatus': 'Filter by status',
		'inventory.description': 'Track critical items, filters, and stock risk comfortably on smaller screens.',
		'inventory.item.addNewItem': 'Add Item',
		'inventory.item.filterByCategory': 'Filter by category',
		'inventory.item.filterByStatus': 'Filter by status',
		'inventory.status.inStock': 'In stock',
		'inventory.status.lowStock': 'Low stock',
		'inventory.status.outOfStock': 'Out of stock',
		'inventory.status.expired': 'Expired',
		'user.management.title': 'User Management',
		'user.management.addUser': 'Add User',
		'user.management.filterByRole': 'Filter by role',
		'user.form.fullName': 'Full Name',
		'user.form.email': 'Email',
		'user.form.role': 'Role',
		'user.form.status': 'Status',
		'user.form.firstName': 'First Name',
		'user.form.lastName': 'Last Name',
		'user.form.addUserTitle': 'Add User',
		'user.form.editUserTitle': 'Edit {name}',
		'user.form.updateUser': 'Update User',
		'user.form.selectRole': 'Select role',
		'user.form.selectStatus': 'Select status',
		'user.profile.title': '{name} user profile',
		'reports.viewReport': 'View Report',
		'reports.financial.description': 'Review collections, dues, and revenue flow with finance context.',
		'reports.patientStats.description': 'Read the patient base, demographics, and care density more clearly.',
		'reports.appointmentAnalysis.description': 'Track appointment volume, occupancy, and cancellation trends.',
		'notifications.markAsRead': 'Mark as read',
		'notifications.all': 'All',
		'notifications.unread': 'Unread',
		'notifications.allNotifications': 'All Notifications',
		'notifications.unreadNotifications': 'Unread Notifications',
		'notifications.noUnreadNotifications': 'No unread notifications',
		'notifications.ago': 'ago',
		'emr.searchPatient': 'Search Patient',
		'emr.searchPatientPlaceholder': 'Search by patient name or national ID',
		'emr.searchResults': 'Search Results',
		'emr.visitDate': 'Visit Date',
		'emr.noResults': 'No matching records found',
		'emr.recentRecords': 'Recent Records',
		'emr.noRecentRecords': 'No recent records yet'
	}
};

function getNestedTranslation(source: TranslationDictionary, key: string): string | null {
	const keys = key.split('.');
	let value: any = source;

	for (const part of keys) {
		if (value && typeof value === 'object' && part in value) {
			value = value[part];
		} else {
			return null;
		}
	}

	return typeof value === 'string' ? value : null;
}

function resolveAliasKey(key: string): string | null {
	if (exactAliasKeys[key]) return exactAliasKeys[key];

	const patientFormMatch = key.match(/^patient\.form\.(.+)$/);
	if (patientFormMatch) {
		const fieldMap: Record<string, string> = {
			tcNo: 'patients.fields.tcNo',
			firstName: 'patients.fields.firstName',
			lastName: 'patients.fields.lastName',
			fullName: 'patients.fields.fullName',
			birthDate: 'patients.fields.dateOfBirth',
			age: 'patients.fields.age',
			gender: 'patients.fields.gender',
			phone: 'patients.fields.phone',
			status: 'patients.fields.status',
			emergencyName: 'patients.fields.emergencyContactName',
			emergencyRelation: 'patients.fields.emergencyContactRelation',
			emergencyPhone: 'patients.fields.emergencyContactPhone'
		};

		return fieldMap[patientFormMatch[1]] ?? null;
	}

	const appointmentFormMatch = key.match(/^appointment\.form\.(.+)$/);
	if (appointmentFormMatch) {
		const fieldMap: Record<string, string> = {
			patient: 'appointments.fields.patient',
			doctor: 'appointments.fields.doctor',
			date: 'appointments.fields.date',
			time: 'appointments.fields.time',
			startTime: 'appointments.fields.startTime',
			endTime: 'appointments.fields.endTime',
			type: 'appointments.fields.type',
			status: 'appointments.fields.status',
			reason: 'appointments.fields.reason',
			notes: 'appointments.fields.notes'
		};

		return fieldMap[appointmentFormMatch[1]] ?? null;
	}

	const userFormMatch = key.match(/^user\.form\.(.+)$/);
	if (userFormMatch) {
		const fieldMap: Record<string, string> = {
			fullName: 'users.fields.name',
			email: 'users.fields.email',
			role: 'users.fields.role',
			status: 'users.fields.status'
		};

		return fieldMap[userFormMatch[1]] ?? null;
	}

	return null;
}

function interpolate(value: string, params?: Record<string, string | number>): string {
	if (!params) return value;

	return Object.entries(params).reduce(
		(acc, [param, replacement]) => acc.replaceAll(`{${param}}`, String(replacement)),
		value
	);
}

function createI18n() {
	const { subscribe, set } = writable<Language>('tr');

	// Load from localStorage on client
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('language') as Language;
		if (stored && (stored === 'tr' || stored === 'en')) {
			set(stored);
		}
	}

	return {
		subscribe,
		set: (lang: Language) => {
			set(lang);
			if (typeof window !== 'undefined') {
				localStorage.setItem('language', lang);
			}
		},
		toggle: () => {
			const current = get(language);
			const next = current === 'tr' ? 'en' : 'tr';
			set(next);
			if (typeof window !== 'undefined') {
				localStorage.setItem('language', next);
			}
		}
	};
}

export const language = createI18n();

export const t = derived(language, ($language) => {
	const trans = translations[$language];

	return (key: string, params?: Record<string, string | number>): string => {
		const directValue = getNestedTranslation(trans, key);
		if (directValue) return interpolate(directValue, params);

		const aliasKey = resolveAliasKey(key);
		if (aliasKey) {
			const aliasedValue = getNestedTranslation(trans, aliasKey);
			if (aliasedValue) return interpolate(aliasedValue, params);
		}

		const fallbackValue = translationFallbacks[$language]?.[key];
		if (fallbackValue) return interpolate(fallbackValue, params);

		return key;
	};
});
