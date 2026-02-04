import { z } from 'zod';
import type { AuditFields } from './common';
import { patientSchema } from './patient';
import { userSchema } from './user';

export const appointmentStatusSchema = z.enum([
	'scheduled',
	'confirmed',
	'in-progress',
	'completed',
	'cancelled',
	'no-show'
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const appointmentTypeSchema = z.enum(['consultation', 'follow-up', 'emergency', 'routine-checkup']);
export type AppointmentType = z.infer<typeof appointmentTypeSchema>;

export const appointmentSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	patientName: z.string(), // Derived from patient data for display
	doctorId: z.string(),
	doctorName: z.string(), // Derived from user data for display
	date: z.date(), // Use 'date' instead of 'appointmentDate' for simplicity
	startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçerli bir başlangıç saati giriniz (HH:mm).'),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçerli bir bitiş saati giriniz (HH:mm).'),
	duration: z.number().int().positive('Süre pozitif bir sayı olmalıdır.').optional(), // in minutes
	type: appointmentTypeSchema,
	status: appointmentStatusSchema.default('scheduled'),
	reason: z.string().min(5, 'Randevu nedeni en az 5 karakter olmalıdır.'),
	notes: z.string().optional(),
	symptoms: z.array(z.string()).optional(),
	diagnosis: z.string().optional(),
	prescription: z.string().optional(),
	followUpDate: z.date().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const createAppointmentDtoSchema = appointmentSchema.omit({
	id: true,
	patientName: true,
	doctorName: true,
	createdAt: true,
	updatedAt: true
});
export type CreateAppointmentDto = z.infer<typeof createAppointmentDtoSchema>;

export const updateAppointmentDtoSchema = appointmentSchema
	.omit({
		id: true,
		patientName: true,
		doctorName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentDtoSchema>;

export interface AppointmentSlot {
	doctorId: string;
	date: Date;
	startTime: string;
	endTime: string;
	available: boolean;
}

export interface AppointmentStats {
	total: number;
	scheduled: number;
	completed: number;
	cancelled: number;
	noShow: number;
	todayTotal: number;
	todayCompleted: number;
}
