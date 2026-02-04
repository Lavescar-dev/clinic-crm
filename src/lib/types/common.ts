import { z } from 'zod';

export type Language = 'tr' | 'en';

export type Theme = 'light' | 'dark' | 'system';

export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface SearchParams {
	query?: string;
	filters?: Record<string, any>;
	sort?: {
		field: string;
		order: 'asc' | 'desc';
	};
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface DateRange {
	start: Date;
	end: Date;
}

// Zod schemas for common types
export const addressSchema = z.object({
	street: z.string().min(3, 'Sokak/Cadde en az 3 karakter olmalıdır.'),
	city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır.'),
	state: z.string().min(2, 'İlçe/Semt en az 2 karakter olmalıdır.'),
	district: z.string().min(2, 'Mahalle/Köy en az 2 karakter olmalıdır.').optional(),
	zipCode: z.string().regex(/^\d{5}$/, 'Geçerli bir posta kodu giriniz.'),
	country: z.string().default('Türkiye')
});
export type Address = z.infer<typeof addressSchema>;

export const contactSchema = z.object({
	phone: z.string().min(10, 'Telefon numarası en az 10 hane olmalıdır.'),
	email: z.string().email('Geçerli bir e-posta adresi giriniz.').optional().or(z.literal('')),
	address: addressSchema.optional()
});
export type Contact = z.infer<typeof contactSchema>;

export const emergencyContactSchema = z.object({
	name: z.string().min(3, 'Acil durum kişi adı en az 3 karakter olmalıdır.'),
	relationship: z.string().min(3, 'Yakınlık derecesi en az 3 karakter olmalıdır.'),
	phone: z.string().min(10, 'Telefon numarası en az 10 hane olmalıdır.')
});
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;

export interface AuditFields {
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string;
	updatedBy?: string;
}
