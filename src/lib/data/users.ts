import type { User } from '$types';
import { nanoid } from 'nanoid';

export const mockUsers: User[] = [
	{
		id: nanoid(),
		email: 'admin@klinik.com',
		firstName: 'Ahmet',
		lastName: 'Yılmaz',
		fullName: 'Ahmet Yılmaz',
		role: 'admin',
		status: 'active',
		contact: {
			phone: '05321234567',
			email: 'admin@klinik.com',
			address: {
				street: 'Atatürk Caddesi No: 123',
				city: 'İstanbul',
				district: 'Kadıköy',
				postalCode: '34710',
				country: 'Türkiye'
			}
		},
		department: 'Yönetim',
		permissions: [],
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01')
	},
	{
		id: nanoid(),
		email: 'dr.ayse@klinik.com',
		firstName: 'Ayşe',
		lastName: 'Demir',
		fullName: 'Dr. Ayşe Demir',
		role: 'doctor',
		status: 'active',
		contact: {
			phone: '05339876543',
			email: 'dr.ayse@klinik.com'
		},
		specialization: 'Dahiliye',
		licenseNumber: 'TR-DAH-12345',
		department: 'Dahiliye',
		workingHours: {
			monday: [{ start: '09:00', end: '17:00' }],
			tuesday: [{ start: '09:00', end: '17:00' }],
			wednesday: [{ start: '09:00', end: '17:00' }],
			thursday: [{ start: '09:00', end: '17:00' }],
			friday: [{ start: '09:00', end: '17:00' }]
		},
		permissions: [],
		createdAt: new Date('2023-01-15'),
		updatedAt: new Date('2023-01-15')
	},
	{
		id: nanoid(),
		email: 'dr.mehmet@klinik.com',
		firstName: 'Mehmet',
		lastName: 'Kaya',
		fullName: 'Dr. Mehmet Kaya',
		role: 'doctor',
		status: 'active',
		contact: {
			phone: '05445556677',
			email: 'dr.mehmet@klinik.com'
		},
		specialization: 'Ortopedi',
		licenseNumber: 'TR-ORT-54321',
		department: 'Ortopedi',
		workingHours: {
			monday: [{ start: '10:00', end: '18:00' }],
			tuesday: [{ start: '10:00', end: '18:00' }],
			wednesday: [{ start: '10:00', end: '18:00' }],
			thursday: [{ start: '10:00', end: '18:00' }],
			friday: [{ start: '10:00', end: '14:00' }]
		},
		permissions: [],
		createdAt: new Date('2023-02-01'),
		updatedAt: new Date('2023-02-01')
	},
	{
		id: nanoid(),
		email: 'nurse.fatma@klinik.com',
		firstName: 'Fatma',
		lastName: 'Şahin',
		fullName: 'Fatma Şahin',
		role: 'nurse',
		status: 'active',
		contact: {
			phone: '05556667788',
			email: 'nurse.fatma@klinik.com'
		},
		department: 'Hemşirelik',
		permissions: [],
		createdAt: new Date('2023-02-15'),
		updatedAt: new Date('2023-02-15')
	},
	{
		id: nanoid(),
		email: 'reception@klinik.com',
		firstName: 'Zeynep',
		lastName: 'Çelik',
		fullName: 'Zeynep Çelik',
		role: 'receptionist',
		status: 'active',
		contact: {
			phone: '05667778899',
			email: 'reception@klinik.com'
		},
		department: 'Resepsiyon',
		permissions: [],
		createdAt: new Date('2023-03-01'),
		updatedAt: new Date('2023-03-01')
	}
];

// Password for all demo users: admin123 (for doctors: doctor123)
export const mockPasswords: Record<string, string> = {
	'admin@klinik.com': 'admin123',
	'dr.ayse@klinik.com': 'doctor123',
	'dr.mehmet@klinik.com': 'doctor123',
	'nurse.fatma@klinik.com': 'nurse123',
	'reception@klinik.com': 'reception123'
};
