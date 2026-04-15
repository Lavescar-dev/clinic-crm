import { z } from 'zod';

// Note Type Enum
export const noteTypeSchema = z.enum([
	'consultation',
	'followup',
	'emergency',
	'procedure',
	'discharge'
]);
export type NoteType = z.infer<typeof noteTypeSchema>;

// SOAP Structure Schema
export const soapSchema = z.object({
	subjective: z
		.string()
		.min(10, 'Subjective section must be at least 10 characters')
		.describe('Patient-reported symptoms, history, concerns'),
	objective: z
		.string()
		.min(10, 'Objective section must be at least 10 characters')
		.describe('Physical examination findings, vital signs, lab results'),
	assessment: z
		.string()
		.min(10, 'Assessment section must be at least 10 characters')
		.describe('Clinical diagnosis, differential diagnosis, analysis'),
	plan: z
		.string()
		.min(10, 'Plan section must be at least 10 characters')
		.describe('Treatment plan, follow-up, patient instructions')
});
export type SOAP = z.infer<typeof soapSchema>;

// Clinical Note Schema
export const clinicalNoteSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	patientName: z.string().optional(), // Derived for display
	appointmentId: z.string().optional(),
	doctorId: z.string(),
	doctorName: z.string().optional(), // Derived for display
	noteType: noteTypeSchema,
	date: z.date(),
	soap: soapSchema,
	locked: z.boolean().default(false),
	signedBy: z.string().optional(), // DoctorId who signed
	signedByName: z.string().optional(), // Derived for display
	signedAt: z.date().optional(),
	// Additional metadata
	diagnosisCodes: z.array(z.string()).default([]), // ICD-10 codes
	procedureCodes: z.array(z.string()).default([]), // CPT or local procedure codes
	createdAt: z.date(),
	updatedAt: z.date()
});
export type ClinicalNote = z.infer<typeof clinicalNoteSchema>;

// DTOs for API operations
export const createClinicalNoteDtoSchema = clinicalNoteSchema.omit({
	id: true,
	patientName: true,
	doctorName: true,
	signedByName: true,
	locked: true,
	signedBy: true,
	signedAt: true,
	createdAt: true,
	updatedAt: true
});
export type CreateClinicalNoteDto = z.infer<typeof createClinicalNoteDtoSchema>;

export const updateClinicalNoteDtoSchema = clinicalNoteSchema
	.omit({
		id: true,
		patientName: true,
		doctorName: true,
		signedByName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateClinicalNoteDto = z.infer<typeof updateClinicalNoteDtoSchema>;

// Lock/Sign Note DTO - only when all SOAP sections are complete
export const lockClinicalNoteDtoSchema = z.object({
	signedBy: z.string()
});
export type LockClinicalNoteDto = z.infer<typeof lockClinicalNoteDtoSchema>;

// Validation helper
export function validateSOAPComplete(soap: SOAP): boolean {
	try {
		soapSchema.parse(soap);
		return true;
	} catch {
		return false;
	}
}

// Statistics interface
export interface ClinicalNoteStats {
	total: number;
	byType: Record<NoteType, number>;
	locked: number;
	unlocked: number;
	thisMonth: number;
	thisWeek: number;
}
