import { z } from 'zod';
import type { AuditFields } from './common';
import { addressSchema, contactSchema, emergencyContactSchema } from './common';

export const genderSchema = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof genderSchema>;

export const bloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export type BloodType = z.infer<typeof bloodTypeSchema>;

export const patientStatusSchema = z.enum(['active', 'inactive', 'deceased']);
export type PatientStatus = z.infer<typeof patientStatusSchema>;

export const insuranceTypeSchema = z.enum(['sgk', 'private', 'none']);
export type InsuranceType = z.infer<typeof insuranceTypeSchema>;



export const insuranceSchema = z.object({
	type: insuranceTypeSchema,
	company: z.string().min(2, 'Şirket adı en az 2 karakter olmalıdır.').optional().or(z.literal('')),
	provider: z.string().optional(), // Added provider field
	policyNumber: z.string().min(5, 'Poliçe numarası en az 5 karakter olmalıdır.').optional().or(z.literal(''))
});

export const medicalHistorySchema = z.object({
	allergies: z.array(z.string()).default([]),
	pastIllnesses: z.array(z.string()).default([]),
	surgeries: z.array(z.string()).default([]),
	medications: z.array(z.string()).default([])
});

export const patientSchema = z.object({
	id: z.string(),
	tcNo: z.string().regex(/^\d{11}$/, 'Geçerli bir T.C. Kimlik Numarası giriniz.'),
	firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır.'),
	lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır.'),
	fullName: z.string().optional(), // Will be derived
	birthDate: z.date(),
	gender: genderSchema,
	bloodType: bloodTypeSchema.optional(),
	status: patientStatusSchema.default('active'),
	contact: contactSchema,
	emergencyContact: emergencyContactSchema,
	insurance: insuranceSchema,
	medicalHistory: medicalHistorySchema.optional(),
	avatar: z.string().url().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Patient = z.infer<typeof patientSchema>;

// DTOs for API operations
export const createPatientDtoSchema = patientSchema.omit({
	id: true,
	fullName: true,
	createdAt: true,
	updatedAt: true
});
export type CreatePatientDto = z.infer<typeof createPatientDtoSchema>;

export const updatePatientDtoSchema = patientSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdatePatientDto = z.infer<typeof updatePatientDtoSchema>;


export interface PatientStats {
	totalPatients: number;
	activePatients: number;
	newThisMonth: number;
	byGender: Record<Gender, number>;
	byInsurance: Record<InsuranceType, number>;
	averageAge: number;
}
