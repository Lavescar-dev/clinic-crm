export * from './common';
export * from './user';
export * from './patient';
export * from './appointment';

// EMR types - excluding LabResult and labResultSchema which conflict with lab module
export type {
	VitalSigns,
	Diagnosis,
	Medication,
	Prescription,
	MedicalRecord,
	CreateMedicalRecordDto,
	UpdateMedicalRecordDto
} from './emr';
export {
	vitalSignsSchema,
	diagnosisSeveritySchema,
	diagnosisStatusSchema,
	diagnosisSchema,
	medicationSchema,
	prescriptionSchema,
	medicalRecordSchema,
	createMedicalRecordDtoSchema,
	updateMedicalRecordDtoSchema
} from './emr';

export * from './billing';
export * from './inventory';
export * from './notification';
export * from './staff';
export * from './shift';
export * from './lab';
export * from './prescription';
export * from './treatmentPlan';
export * from './clinicalNote';
export * from './referral';
