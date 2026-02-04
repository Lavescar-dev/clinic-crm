import { z } from 'zod';
import type { AuditFields } from './common';

export const invoiceStatusSchema = z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled']);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const paymentMethodSchema = z.enum(['cash', 'credit-card', 'debit-card', 'bank-transfer', 'insurance']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const taxRateSchema = z.union([z.literal(0), z.literal(1), z.literal(8), z.literal(18)]);
export type TaxRate = z.infer<typeof taxRateSchema>;

export const invoiceItemSchema = z.object({
	id: z.string(),
	description: z.string().min(3, 'Açıklama en az 3 karakter olmalıdır.'),
	quantity: z.number().int().positive('Miktar pozitif bir tam sayı olmalıdır.'),
	unitPrice: z.number().positive('Birim fiyat pozitif bir sayı olmalıdır.'),
	taxRate: taxRateSchema.default(8), // Default to 8% VAT
	taxAmount: z.number(),
	total: z.number(),
	serviceCode: z.string().optional()
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
	id: z.string(),
	invoiceNumber: z.string().min(5, 'Fatura numarası en az 5 karakter olmalıdır.'),
	patientId: z.string(),
	patientName: z.string().optional(), // Derived
	appointmentId: z.string().optional(),
	issueDate: z.date(),
	dueDate: z.date(),
	status: invoiceStatusSchema.default('pending'),
	items: z.array(invoiceItemSchema).min(1, 'En az bir fatura kalemi olmalıdır.'),
	subtotal: z.number(),
	taxTotal: z.number(),
	total: z.number(),
	paidAmount: z.number().default(0),
	remainingAmount: z.number(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type Invoice = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
	id: z.string(),
	invoiceId: z.string(),
	paymentDate: z.date(),
	amount: z.number().positive('Ödeme miktarı pozitif bir sayı olmalıdır.'),
	method: paymentMethodSchema,
	referenceNumber: z.string().optional(),
	notes: z.string().optional(),
	receivedBy: z.string(), // User ID or Name
	createdAt: z.date(),
	updatedAt: z.date()
});
export type Payment = z.infer<typeof paymentSchema>;

export const createInvoiceDtoSchema = invoiceSchema.omit({
	id: true,
	invoiceNumber: true,
	patientName: true,
	subtotal: true,
	taxTotal: true,
	total: true,
	paidAmount: true,
	remainingAmount: true,
	createdAt: true,
	updatedAt: true
});
export type CreateInvoiceDto = z.infer<typeof createInvoiceDtoSchema>;

export const updateInvoiceDtoSchema = invoiceSchema
	.omit({
		id: true,
		invoiceNumber: true,
		patientName: true,
		subtotal: true,
		taxTotal: true,
		total: true,
		paidAmount: true,
		remainingAmount: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceDtoSchema>;

export const createPaymentDtoSchema = paymentSchema.omit({
	id: true,
	receivedBy: true,
	createdAt: true,
	updatedAt: true
});
export type CreatePaymentDto = z.infer<typeof createPaymentDtoSchema>;

export interface PaymentStats {
	totalRevenue: number;
	paidAmount: number;
	pendingAmount: number;
	overdueAmount: number;
	todayRevenue: number;
	monthlyRevenue: number;
	byPaymentMethod: Record<PaymentMethod, number>;
}

export interface RevenueByPeriod {
	period: string;
	revenue: number;
	invoiceCount: number;
}
