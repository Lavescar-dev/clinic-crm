import { z } from 'zod';
import type { AuditFields } from './common';

export const vitalSignsSchema = z.object({
	temperature: z.number().optional(), // Celsius
	bloodPressureSystolic: z.number().optional(),
	bloodPressureDiastolic: z.number().optional(),
	heartRate: z.number().optional(), // bpm
	respiratoryRate: z.number().optional(), // per minute
	oxygenSaturation: z.number().optional(), // percentage
	weight: z.number().optional(), // kg
	height: z.number().optional(), // cm
	bmi: z.number().optional()
});
export type VitalSigns = z.infer<typeof vitalSignsSchema>;

export const diagnosisSeveritySchema = z.enum(['mild', 'moderate', 'severe']);
export const diagnosisStatusSchema = z.enum(['active', 'resolved', 'chronic']);

export const diagnosisSchema = z.object({
	id: z.string(),
	code: z.string().min(1, 'ICD-10 kodu gereklidir.'), // ICD-10 code
	name: z.string().min(3, 'Tanı adı en az 3 karakter olmalıdır.'),
	description: z.string().optional(),
	severity: diagnosisSeveritySchema.optional(),
	status: diagnosisStatusSchema.default('active'),
	diagnosedDate: z.date(),
	resolvedDate: z.date().optional()
});
export type Diagnosis = z.infer<typeof diagnosisSchema>;

export const medicationSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'İlaç adı gereklidir.'),
	dosage: z.string().min(1, 'Dozaj gereklidir.'),
	frequency: z.string().min(1, 'Sıklık gereklidir.'),
	duration: z.string().min(1, 'Süre gereklidir.'),
	instructions: z.string().optional(),
	startDate: z.date(),
	endDate: z.date().optional()
});
export type Medication = z.infer<typeof medicationSchema>;

export const prescriptionSchema = z.object({
	id: z.string(),
	medications: z.array(medicationSchema),
	notes: z.string().optional(),
	prescribedDate: z.date(),
	prescribedBy: z.string() // User ID or Name
});
export type Prescription = z.infer<typeof prescriptionSchema>;

export const labResultStatusSchema = z.enum(['normal', 'abnormal', 'critical']);

export const labResultSchema = z.object({
	id: z.string(),
	testName: z.string().min(1, 'Test adı gereklidir.'),
	testType: z.string().min(1, 'Test tipi gereklidir.'),
	result: z.string().min(1, 'Sonuç gereklidir.'),
	unit: z.string().optional(),
	referenceRange: z.string().optional(),
	status: labResultStatusSchema.default('normal'),
	testDate: z.date(),
	notes: z.string().optional()
});
export type LabResult = z.infer<typeof labResultSchema>;

export const medicalRecordSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	patientName: z.string().optional(), // Derived
	appointmentId: z.string().optional(),
	doctorId: z.string(),
	doctorName: z.string().optional(), // Derived
	visitDate: z.date(),
	chiefComplaint: z.string().min(5, 'Şikayet en az 5 karakter olmalıdır.'),
	presentIllness: z.string().optional(),
	physicalExamination: z.string().optional(),
	vitalSigns: vitalSignsSchema.optional(),
	diagnoses: z.array(diagnosisSchema).default([]),
	prescriptions: z.array(prescriptionSchema).default([]),
	labResults: z.array(labResultSchema).default([]),
	procedures: z.array(z.string()).default([]),
	assessment: z.string().min(5, 'Değerlendirme en az 5 karakter olmalıdır.'),
	plan: z.string().min(5, 'Plan en az 5 karakter olmalıdır.'),
	followUpInstructions: z.string().optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type MedicalRecord = z.infer<typeof medicalRecordSchema>;

export const createMedicalRecordDtoSchema = medicalRecordSchema.omit({
	id: true,
	patientName: true,
	doctorName: true,
	createdAt: true,
	updatedAt: true
});
export type CreateMedicalRecordDto = z.infer<typeof createMedicalRecordDtoSchema>;

export const updateMedicalRecordDtoSchema = medicalRecordSchema
	.omit({
		id: true,
		patientName: true,
		doctorName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateMedicalRecordDto = z.infer<typeof updateMedicalRecordDtoSchema>;
