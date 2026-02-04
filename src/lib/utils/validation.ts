import { z } from 'zod';

// Turkish ID Number (TC Kimlik No) validation
export function validateTcNo(tcNo: string): boolean {
	if (!/^\d{11}$/.test(tcNo)) return false;
	if (tcNo[0] === '0') return false;

	const digits = tcNo.split('').map(Number);
	const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
	const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
	const check1 = (sum1 - sum2) % 10;

	if (check1 !== digits[9]) return false;

	const sum3 = digits.slice(0, 10).reduce((acc, val) => acc + val, 0);
	const check2 = sum3 % 10;

	return check2 === digits[10];
}

// Zod schemas for validation
export const tcNoSchema = z
	.string()
	.length(11, 'TC Kimlik No 11 haneli olmalıdır')
	.refine(validateTcNo, 'Geçersiz TC Kimlik No');

export const emailSchema = z.string().email('Geçersiz e-posta adresi');

export const phoneSchema = z
	.string()
	.regex(/^(\+90|0)?5\d{9}$/, 'Geçersiz telefon numarası')
	.transform((val) => val.replace(/\D/g, ''));

export const passwordSchema = z
	.string()
	.min(6, 'Şifre en az 6 karakter olmalıdır')
	.max(50, 'Şifre en fazla 50 karakter olabilir');

export const nameSchema = z
	.string()
	.min(2, 'En az 2 karakter olmalıdır')
	.max(100, 'En fazla 100 karakter olabilir')
	.regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Sadece harf içermelidir');

export const addressSchema = z.object({
	street: z.string().min(5, 'Adres en az 5 karakter olmalıdır'),
	city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
	district: z.string().min(2, 'İlçe en az 2 karakter olmalıdır'),
	postalCode: z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalıdır'),
	country: z.string().default('Türkiye')
});

export const contactSchema = z.object({
	phone: phoneSchema,
	email: emailSchema.optional(),
	address: addressSchema.optional()
});

export const emergencyContactSchema = z.object({
	name: nameSchema,
	relationship: z.string().min(2, 'İlişki belirtilmelidir'),
	phone: phoneSchema
});

// Patient validation schemas
export const createPatientSchema = z.object({
	tcNo: tcNoSchema,
	firstName: nameSchema,
	lastName: nameSchema,
	dateOfBirth: z.date().max(new Date(), 'Doğum tarihi gelecekte olamaz'),
	gender: z.enum(['male', 'female', 'other']),
	bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
	contact: contactSchema,
	emergencyContact: emergencyContactSchema,
	insurance: z.object({
		type: z.enum(['sgk', 'private', 'none']),
		provider: z.string().optional(),
		policyNumber: z.string().optional(),
		validUntil: z.date().optional()
	}),
	allergies: z.array(z.string()).optional(),
	chronicDiseases: z.array(z.string()).optional(),
	medications: z.array(z.string()).optional(),
	notes: z.string().optional()
});

// Appointment validation schemas
export const createAppointmentSchema = z.object({
	patientId: z.string().min(1, 'Hasta seçilmelidir'),
	doctorId: z.string().min(1, 'Doktor seçilmelidir'),
	appointmentDate: z.date().min(new Date(), 'Randevu tarihi geçmişte olamaz'),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçersiz saat formatı'),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçersiz saat formatı'),
	type: z.enum(['consultation', 'follow-up', 'emergency', 'routine-checkup']),
	reason: z.string().min(5, 'Sebep en az 5 karakter olmalıdır'),
	notes: z.string().optional()
});

// Invoice validation schemas
export const invoiceItemSchema = z.object({
	description: z.string().min(3, 'Açıklama en az 3 karakter olmalıdır'),
	quantity: z.number().min(1, 'Miktar en az 1 olmalıdır'),
	unitPrice: z.number().min(0, 'Birim fiyat negatif olamaz'),
	taxRate: z.enum([0, 1, 8, 18]),
	serviceCode: z.string().optional()
});

export const createInvoiceSchema = z.object({
	patientId: z.string().min(1, 'Hasta seçilmelidir'),
	appointmentId: z.string().optional(),
	issueDate: z.date(),
	dueDate: z.date(),
	items: z.array(invoiceItemSchema).min(1, 'En az bir kalem eklenmelidir'),
	notes: z.string().optional()
});

// User validation schemas
export const createUserSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	firstName: nameSchema,
	lastName: nameSchema,
	role: z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist']),
	contact: contactSchema,
	specialization: z.string().optional(),
	licenseNumber: z.string().optional(),
	department: z.string().optional()
});

// Login validation
export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Şifre girilmelidir')
});
