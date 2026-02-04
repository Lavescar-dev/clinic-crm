import type { Notification } from '$types';
import { nanoid } from 'nanoid';
import { mockUsers } from './users';
import { mockPatients } from './patients';
import { mockAppointments } from './appointments';
import { mockInventoryItems } from './inventory';

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

// Generate date within last N days
function getRecentDate(daysAgo: number): Date {
	const date = new Date();
	date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
	date.setHours(Math.floor(Math.random() * 24));
	date.setMinutes(Math.floor(Math.random() * 60));
	return date;
}

// Create various types of notifications
export const mockNotifications: Notification[] = [];

// Get upcoming appointments for reminders
const upcomingAppointments = mockAppointments.filter(
	(a) =>
		(a.status === 'scheduled' || a.status === 'confirmed') &&
		a.date >= new Date()
);

// 1. Appointment reminders (for doctors)
const doctors = mockUsers.filter((u) => u.role === 'doctor');
doctors.forEach((doctor) => {
	const doctorAppointments = upcomingAppointments.filter((a) => a.doctorId === doctor.id);
	if (doctorAppointments.length > 0) {
		const appointment = doctorAppointments[0];
		const patient = mockPatients.find((p) => p.id === appointment.patientId)!;

		mockNotifications.push({
			id: nanoid(),
			userId: doctor.id,
			type: 'appointment-reminder',
			priority: 'medium',
			status: Math.random() > 0.3 ? 'unread' : 'read',
			title: 'Yaklaşan Randevu',
			message: `${patient.fullName} için randevunuz ${appointment.date.toLocaleDateString('tr-TR')} tarihinde saat ${appointment.startTime}'de`,
			data: {
				appointmentId: appointment.id,
				patientId: patient.id,
				appointmentDate: appointment.date,
				startTime: appointment.startTime
			},
			actionUrl: `/appointments/${appointment.id}`,
			readAt: Math.random() > 0.3 ? undefined : getRecentDate(1),
			createdAt: getRecentDate(2),
			updatedAt: getRecentDate(2)
		});
	}
});

// 2. Appointment confirmations (for receptionists)
const receptionists = mockUsers.filter(
	(u) => u.role === 'receptionist' || u.role === 'admin'
);
const receptionist = getRandomItem(receptionists);

for (let i = 0; i < 3; i++) {
	const appointment = getRandomItem(upcomingAppointments);
	const patient = mockPatients.find((p) => p.id === appointment.patientId)!;

	mockNotifications.push({
		id: nanoid(),
		userId: receptionist.id,
		type: 'appointment-confirmed',
		priority: 'low',
		status: Math.random() > 0.5 ? 'unread' : 'read',
		title: 'Randevu Onaylandı',
		message: `${patient.fullName} randevusunu onayladı`,
		data: {
			appointmentId: appointment.id,
			patientId: patient.id
		},
		actionUrl: `/appointments/${appointment.id}`,
		readAt: Math.random() > 0.5 ? undefined : getRecentDate(3),
		createdAt: getRecentDate(3),
		updatedAt: getRecentDate(3)
	});
}

// 3. Cancelled appointment (for doctors and receptionist)
const cancelledAppointment = mockAppointments.find((a) => a.status === 'cancelled');
if (cancelledAppointment) {
	const doctor = mockUsers.find((u) => u.id === cancelledAppointment.doctorId)!;
	const patient = mockPatients.find((p) => p.id === cancelledAppointment.patientId)!;

	mockNotifications.push({
		id: nanoid(),
		userId: doctor.id,
		type: 'appointment-cancelled',
		priority: 'medium',
		status: 'read',
		title: 'Randevu İptal Edildi',
		message: `${patient.fullName} randevusunu iptal etti`,
		data: {
			appointmentId: cancelledAppointment.id,
			patientId: patient.id,
			reason: 'Hasta tarafından iptal edildi'
		},
		actionUrl: `/appointments`,
		readAt: getRecentDate(5),
		createdAt: getRecentDate(5),
		updatedAt: getRecentDate(5)
	});
}

// 4. Payment received notifications (for admin)
const admin = mockUsers.find((u) => u.role === 'admin')!;

for (let i = 0; i < 2; i++) {
	const patient = getRandomItem(mockPatients);
	const amount = Math.floor(Math.random() * 1000) + 200;

	mockNotifications.push({
		id: nanoid(),
		userId: admin.id,
		type: 'payment-received',
		priority: 'low',
		status: Math.random() > 0.4 ? 'read' : 'unread',
		title: 'Ödeme Alındı',
		message: `${patient.fullName} - ${amount.toFixed(2)} TL ödeme yapıldı`,
		data: {
			patientId: patient.id,
			amount: amount,
			paymentMethod: 'credit-card'
		},
		actionUrl: `/billing`,
		readAt: Math.random() > 0.4 ? getRecentDate(4) : undefined,
		createdAt: getRecentDate(4),
		updatedAt: getRecentDate(4)
	});
}

// 5. Payment reminder (for receptionist)
for (let i = 0; i < 2; i++) {
	const patient = getRandomItem(mockPatients);
	const amount = Math.floor(Math.random() * 500) + 100;

	mockNotifications.push({
		id: nanoid(),
		userId: receptionist.id,
		type: 'payment-reminder',
		priority: 'high',
		status: 'unread',
		title: 'Ödeme Hatırlatması',
		message: `${patient.fullName} - ${amount.toFixed(2)} TL ödeme beklemede`,
		data: {
			patientId: patient.id,
			amount: amount,
			dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
		},
		actionUrl: `/billing`,
		createdAt: getRecentDate(2),
		updatedAt: getRecentDate(2)
	});
}

// 6. Lab result ready (for doctors)
doctors.forEach((doctor) => {
	const doctorAppointments = mockAppointments.filter(
		(a) => a.doctorId === doctor.id && a.status === 'completed'
	);

	if (doctorAppointments.length > 0 && Math.random() > 0.5) {
		const appointment = getRandomItem(doctorAppointments);
		const patient = mockPatients.find((p) => p.id === appointment.patientId)!;

		mockNotifications.push({
			id: nanoid(),
			userId: doctor.id,
			type: 'lab-result-ready',
			priority: 'high',
			status: Math.random() > 0.4 ? 'read' : 'unread',
			title: 'Laboratuvar Sonucu Hazır',
			message: `${patient.fullName} için laboratuvar test sonuçları geldi`,
			data: {
				patientId: patient.id,
				appointmentId: appointment.id,
				testTypes: ['Tam Kan Sayımı', 'Biyokimya Paneli']
			},
			actionUrl: `/emr?patient=${patient.id}`,
			readAt: Math.random() > 0.4 ? getRecentDate(3) : undefined,
			createdAt: getRecentDate(3),
			updatedAt: getRecentDate(3)
		});
	}
});

// 7. Stock alerts (for admin and nurses)
const lowStockItems = mockInventoryItems.filter(
	(item) => item.status === 'low-stock' || item.status === 'out-of-stock'
);

const stockAlertUsers = mockUsers.filter(
	(u) => u.role === 'admin' || u.role === 'nurse'
);

stockAlertUsers.forEach((user) => {
	for (let i = 0; i < Math.min(2, lowStockItems.length); i++) {
		const item = lowStockItems[i];

		mockNotifications.push({
			id: nanoid(),
			userId: user.id,
			type: 'stock-alert',
			priority: item.status === 'out-of-stock' ? 'urgent' : 'high',
			status: 'unread',
			title: item.status === 'out-of-stock' ? 'Stok Tükendi' : 'Düşük Stok Uyarısı',
			message: `${item.name} - ${item.status === 'out-of-stock' ? 'Stok tükendi' : `Kalan: ${item.currentStock} ${item.unit}`}`,
			data: {
				itemId: item.id,
				itemName: item.name,
				currentStock: item.currentStock,
				minStockLevel: item.minStockLevel
			},
			actionUrl: `/inventory/${item.id}`,
			createdAt: getRecentDate(1),
			updatedAt: getRecentDate(1)
		});
	}
});

// 8. Expiring items (for admin)
const expiringItems = mockInventoryItems.filter(
	(item) =>
		item.expiryDate &&
		item.expiryDate > new Date() &&
		item.expiryDate < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Next 60 days
);

if (expiringItems.length > 0) {
	const item = getRandomItem(expiringItems);

	mockNotifications.push({
		id: nanoid(),
		userId: admin.id,
		type: 'stock-alert',
		priority: 'medium',
		status: 'unread',
		title: 'SKT Yaklaşıyor',
		message: `${item.name} - Son kullanma tarihi: ${item.expiryDate!.toLocaleDateString('tr-TR')}`,
		data: {
			itemId: item.id,
			itemName: item.name,
			expiryDate: item.expiryDate
		},
		actionUrl: `/inventory/${item.id}`,
		createdAt: getRecentDate(2),
		updatedAt: getRecentDate(2)
	});
}

// 9. System notifications (for all users)
mockUsers.forEach((user) => {
	if (Math.random() > 0.7) {
		mockNotifications.push({
			id: nanoid(),
			userId: user.id,
			type: 'system',
			priority: 'low',
			status: Math.random() > 0.5 ? 'read' : 'unread',
			title: 'Sistem Güncellemesi',
			message: 'Klinik CRM sistemi başarıyla güncellendi. Yeni özellikler eklendi.',
			data: {
				version: '2.1.0',
				features: ['Yeni rapor şablonları', 'Gelişmiş arama', 'Performans iyileştirmeleri']
			},
			readAt: Math.random() > 0.5 ? getRecentDate(7) : undefined,
			createdAt: getRecentDate(7),
			updatedAt: getRecentDate(7)
		});
	}
});

// 10. Prescription ready (for patients - but we send to receptionists to inform)
for (let i = 0; i < 2; i++) {
	const patient = getRandomItem(mockPatients);

	mockNotifications.push({
		id: nanoid(),
		userId: receptionist.id,
		type: 'prescription-ready',
		priority: 'medium',
		status: Math.random() > 0.6 ? 'read' : 'unread',
		title: 'Reçete Hazır',
		message: `${patient.fullName} için reçete hazırlandı`,
		data: {
			patientId: patient.id
		},
		actionUrl: `/patients/${patient.id}`,
		readAt: Math.random() > 0.6 ? getRecentDate(4) : undefined,
		createdAt: getRecentDate(4),
		updatedAt: getRecentDate(4)
	});
}

// Sort notifications by creation date (newest first)
mockNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

export default mockNotifications;
