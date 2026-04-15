import { z } from 'zod';

// Enums
export const orderStatusSchema = z.enum(['pending', 'collected', 'processing', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const resultFlagSchema = z.enum(['normal', 'low', 'high', 'critical']);
export type ResultFlag = z.infer<typeof resultFlagSchema>;

export const labPrioritySchema = z.enum(['routine', 'urgent', 'stat']);
export type LabPriority = z.infer<typeof labPrioritySchema>;

export const sampleTypeSchema = z.enum([
	'blood-serum',
	'blood-plasma',
	'blood-whole',
	'urine',
	'stool',
	'sputum',
	'csf',
	'other'
]);
export type SampleType = z.infer<typeof sampleTypeSchema>;

export const testCategorySchema = z.enum([
	'hematology',
	'chemistry',
	'lipid',
	'thyroid',
	'liver',
	'kidney',
	'diabetes',
	'cardiac',
	'immunology',
	'microbiology',
	'other'
]);
export type TestCategory = z.infer<typeof testCategorySchema>;

// Reference Range Interface
export interface ReferenceRange {
	min?: number;
	max?: number;
	unit: string;
	description?: string;
	// For gender-specific ranges
	male?: { min?: number; max?: number };
	female?: { min?: number; max?: number };
}

// Lab Test Schema
export const labTestSchema = z.object({
	id: z.string(),
	code: z.string().min(2, 'Test kodu en az 2 karakter olmalıdır.'),
	name: z.string().min(3, 'Test adı en az 3 karakter olmalıdır.'),
	category: testCategorySchema,
	turnaroundTime: z.number().int().positive('Tamamlanma süresi pozitif bir sayı olmalıdır.'), // in hours
	price: z.number().positive('Fiyat pozitif bir sayı olmalıdır.'),
	requiresFasting: z.boolean().default(false),
	sampleType: sampleTypeSchema,
	referenceRange: z.custom<ReferenceRange>(),
	description: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type LabTest = z.infer<typeof labTestSchema>;

// Lab Order Schema
export const labOrderSchema = z.object({
	id: z.string(),
	orderId: z.string(), // Human-readable order number (e.g., LAB-2024-001234)
	patientId: z.string(),
	patientName: z.string().optional(), // Derived field
	doctorId: z.string(),
	doctorName: z.string().optional(), // Derived field
	appointmentId: z.string().optional(),
	tests: z.array(z.string()), // Array of test IDs
	priority: labPrioritySchema.default('routine'),
	status: orderStatusSchema.default('pending'),
	orderedAt: z.date(),
	notes: z.string().optional(),
	diagnosisICD10: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type LabOrder = z.infer<typeof labOrderSchema>;

// Lab Sample Schema
export const labSampleSchema = z.object({
	id: z.string(),
	orderId: z.string(), // Reference to LabOrder ID
	collectedBy: z.string(), // User ID of the person who collected the sample
	collectedByName: z.string().optional(), // Derived field
	collectedAt: z.date(),
	sampleType: sampleTypeSchema,
	barcode: z.string(),
	status: orderStatusSchema,
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type LabSample = z.infer<typeof labSampleSchema>;

// Lab Result Schema
export const labResultSchema = z.object({
	id: z.string(),
	orderId: z.string(), // Reference to LabOrder ID
	testId: z.string(), // Reference to LabTest ID
	testName: z.string().optional(), // Derived field
	value: z.string(), // Can be numeric or text (e.g., "positive", "negative")
	numericValue: z.number().optional(), // For numeric results only
	unit: z.string(),
	referenceRange: z.string(), // Display string like "3.5-5.0"
	flag: resultFlagSchema.default('normal'),
	analyzedBy: z.string(), // User ID of lab technician
	analyzedByName: z.string().optional(), // Derived field
	analyzedAt: z.date(),
	reviewedBy: z.string().optional(), // User ID of reviewing doctor
	reviewedByName: z.string().optional(), // Derived field
	reviewedAt: z.date().optional(),
	status: z.enum(['pending', 'completed', 'verified']).default('pending'),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type LabResult = z.infer<typeof labResultSchema>;

// DTOs for API operations
export const createLabOrderDtoSchema = labOrderSchema.omit({
	id: true,
	orderId: true,
	patientName: true,
	doctorName: true,
	createdAt: true,
	updatedAt: true
});
export type CreateLabOrderDto = z.infer<typeof createLabOrderDtoSchema>;

export const updateLabOrderDtoSchema = labOrderSchema
	.omit({
		id: true,
		orderId: true,
		patientName: true,
		doctorName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateLabOrderDto = z.infer<typeof updateLabOrderDtoSchema>;

export const createLabResultDtoSchema = labResultSchema.omit({
	id: true,
	testName: true,
	analyzedByName: true,
	reviewedByName: true,
	createdAt: true,
	updatedAt: true
});
export type CreateLabResultDto = z.infer<typeof createLabResultDtoSchema>;

export const updateLabResultDtoSchema = labResultSchema
	.omit({
		id: true,
		testName: true,
		analyzedByName: true,
		reviewedByName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateLabResultDto = z.infer<typeof updateLabResultDtoSchema>;

// Lab Test Catalog - Common tests grouped by category
export const LAB_TEST_CATALOG: Record<string, LabTest> = {
	// Hematology - Complete Blood Count (CBC)
	'CBC-WBC': {
		id: 'CBC-WBC',
		code: 'CBC-WBC',
		name: 'White Blood Cell Count (WBC)',
		category: 'hematology',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			min: 4.5,
			max: 11.0,
			unit: '10^3/µL',
			description: 'Normal range for adults'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CBC-RBC': {
		id: 'CBC-RBC',
		code: 'CBC-RBC',
		name: 'Red Blood Cell Count (RBC)',
		category: 'hematology',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			unit: '10^6/µL',
			male: { min: 4.7, max: 6.1 },
			female: { min: 4.2, max: 5.4 }
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CBC-HGB': {
		id: 'CBC-HGB',
		code: 'CBC-HGB',
		name: 'Hemoglobin (Hgb)',
		category: 'hematology',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			unit: 'g/dL',
			male: { min: 13.8, max: 17.2 },
			female: { min: 12.1, max: 15.1 }
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CBC-HCT': {
		id: 'CBC-HCT',
		code: 'CBC-HCT',
		name: 'Hematocrit (Hct)',
		category: 'hematology',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			unit: '%',
			male: { min: 40.7, max: 50.3 },
			female: { min: 36.1, max: 44.3 }
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CBC-PLT': {
		id: 'CBC-PLT',
		code: 'CBC-PLT',
		name: 'Platelet Count (PLT)',
		category: 'hematology',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			min: 150,
			max: 400,
			unit: '10^3/µL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Comprehensive Metabolic Panel (CMP)
	'CMP-GLU': {
		id: 'CMP-GLU',
		code: 'CMP-GLU',
		name: 'Glucose (Fasting)',
		category: 'chemistry',
		turnaroundTime: 2,
		price: 15,
		requiresFasting: true,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 70,
			max: 100,
			unit: 'mg/dL',
			description: 'Fasting glucose'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-BUN': {
		id: 'CMP-BUN',
		code: 'CMP-BUN',
		name: 'Blood Urea Nitrogen (BUN)',
		category: 'kidney',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 7,
			max: 20,
			unit: 'mg/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-CREAT': {
		id: 'CMP-CREAT',
		code: 'CMP-CREAT',
		name: 'Creatinine',
		category: 'kidney',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			unit: 'mg/dL',
			male: { min: 0.74, max: 1.35 },
			female: { min: 0.59, max: 1.04 }
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-NA': {
		id: 'CMP-NA',
		code: 'CMP-NA',
		name: 'Sodium (Na)',
		category: 'chemistry',
		turnaroundTime: 2,
		price: 15,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 136,
			max: 145,
			unit: 'mEq/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-K': {
		id: 'CMP-K',
		code: 'CMP-K',
		name: 'Potassium (K)',
		category: 'chemistry',
		turnaroundTime: 2,
		price: 15,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 3.5,
			max: 5.0,
			unit: 'mEq/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-CL': {
		id: 'CMP-CL',
		code: 'CMP-CL',
		name: 'Chloride (Cl)',
		category: 'chemistry',
		turnaroundTime: 2,
		price: 15,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 98,
			max: 107,
			unit: 'mEq/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-CO2': {
		id: 'CMP-CO2',
		code: 'CMP-CO2',
		name: 'Carbon Dioxide (CO2)',
		category: 'chemistry',
		turnaroundTime: 2,
		price: 15,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 23,
			max: 29,
			unit: 'mEq/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CMP-CA': {
		id: 'CMP-CA',
		code: 'CMP-CA',
		name: 'Calcium (Ca)',
		category: 'chemistry',
		turnaroundTime: 2,
		price: 15,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 8.5,
			max: 10.2,
			unit: 'mg/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Lipid Panel
	'LIPID-CHOL': {
		id: 'LIPID-CHOL',
		code: 'LIPID-CHOL',
		name: 'Total Cholesterol',
		category: 'lipid',
		turnaroundTime: 3,
		price: 30,
		requiresFasting: true,
		sampleType: 'blood-serum',
		referenceRange: {
			max: 200,
			unit: 'mg/dL',
			description: 'Desirable: <200'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIPID-HDL': {
		id: 'LIPID-HDL',
		code: 'LIPID-HDL',
		name: 'HDL Cholesterol',
		category: 'lipid',
		turnaroundTime: 3,
		price: 30,
		requiresFasting: true,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 40,
			unit: 'mg/dL',
			description: 'Higher is better'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIPID-LDL': {
		id: 'LIPID-LDL',
		code: 'LIPID-LDL',
		name: 'LDL Cholesterol',
		category: 'lipid',
		turnaroundTime: 3,
		price: 30,
		requiresFasting: true,
		sampleType: 'blood-serum',
		referenceRange: {
			max: 100,
			unit: 'mg/dL',
			description: 'Optimal: <100'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIPID-TRIG': {
		id: 'LIPID-TRIG',
		code: 'LIPID-TRIG',
		name: 'Triglycerides',
		category: 'lipid',
		turnaroundTime: 3,
		price: 30,
		requiresFasting: true,
		sampleType: 'blood-serum',
		referenceRange: {
			max: 150,
			unit: 'mg/dL',
			description: 'Normal: <150'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Thyroid Function Tests
	'THYROID-TSH': {
		id: 'THYROID-TSH',
		code: 'THYROID-TSH',
		name: 'Thyroid Stimulating Hormone (TSH)',
		category: 'thyroid',
		turnaroundTime: 4,
		price: 40,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 0.4,
			max: 4.0,
			unit: 'mIU/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'THYROID-T4': {
		id: 'THYROID-T4',
		code: 'THYROID-T4',
		name: 'Free T4 (Thyroxine)',
		category: 'thyroid',
		turnaroundTime: 4,
		price: 45,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 0.8,
			max: 1.8,
			unit: 'ng/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'THYROID-T3': {
		id: 'THYROID-T3',
		code: 'THYROID-T3',
		name: 'Free T3 (Triiodothyronine)',
		category: 'thyroid',
		turnaroundTime: 4,
		price: 45,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 2.3,
			max: 4.2,
			unit: 'pg/mL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Liver Function Tests
	'LIVER-ALT': {
		id: 'LIVER-ALT',
		code: 'LIVER-ALT',
		name: 'Alanine Aminotransferase (ALT)',
		category: 'liver',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 7,
			max: 56,
			unit: 'U/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIVER-AST': {
		id: 'LIVER-AST',
		code: 'LIVER-AST',
		name: 'Aspartate Aminotransferase (AST)',
		category: 'liver',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 10,
			max: 40,
			unit: 'U/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIVER-ALP': {
		id: 'LIVER-ALP',
		code: 'LIVER-ALP',
		name: 'Alkaline Phosphatase (ALP)',
		category: 'liver',
		turnaroundTime: 2,
		price: 25,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 44,
			max: 147,
			unit: 'U/L'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIVER-BILI-TOTAL': {
		id: 'LIVER-BILI-TOTAL',
		code: 'LIVER-BILI-TOTAL',
		name: 'Total Bilirubin',
		category: 'liver',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 0.1,
			max: 1.2,
			unit: 'mg/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIVER-BILI-DIRECT': {
		id: 'LIVER-BILI-DIRECT',
		code: 'LIVER-BILI-DIRECT',
		name: 'Direct Bilirubin',
		category: 'liver',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 0.0,
			max: 0.3,
			unit: 'mg/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIVER-ALB': {
		id: 'LIVER-ALB',
		code: 'LIVER-ALB',
		name: 'Albumin',
		category: 'liver',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 3.5,
			max: 5.5,
			unit: 'g/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'LIVER-PROTEIN': {
		id: 'LIVER-PROTEIN',
		code: 'LIVER-PROTEIN',
		name: 'Total Protein',
		category: 'liver',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 6.0,
			max: 8.3,
			unit: 'g/dL'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Diabetes/Glucose Tests
	'DIABETES-HBA1C': {
		id: 'DIABETES-HBA1C',
		code: 'DIABETES-HBA1C',
		name: 'Hemoglobin A1C',
		category: 'diabetes',
		turnaroundTime: 3,
		price: 50,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			max: 5.7,
			unit: '%',
			description: 'Normal: <5.7%, Prediabetes: 5.7-6.4%, Diabetes: ≥6.5%'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Cardiac Markers
	'CARDIAC-TROP': {
		id: 'CARDIAC-TROP',
		name: 'Troponin I',
		code: 'CARDIAC-TROP',
		category: 'cardiac',
		turnaroundTime: 1,
		price: 80,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			max: 0.04,
			unit: 'ng/mL',
			description: 'Elevated in myocardial infarction'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'CARDIAC-BNP': {
		id: 'CARDIAC-BNP',
		code: 'CARDIAC-BNP',
		name: 'B-type Natriuretic Peptide (BNP)',
		category: 'cardiac',
		turnaroundTime: 2,
		price: 75,
		requiresFasting: false,
		sampleType: 'blood-plasma',
		referenceRange: {
			max: 100,
			unit: 'pg/mL',
			description: 'Elevated in heart failure'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Kidney Function
	'KIDNEY-GFR': {
		id: 'KIDNEY-GFR',
		code: 'KIDNEY-GFR',
		name: 'Estimated GFR (eGFR)',
		category: 'kidney',
		turnaroundTime: 2,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			min: 90,
			unit: 'mL/min/1.73m²',
			description: 'Normal: ≥90'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Urinalysis
	'URINE-ROUTINE': {
		id: 'URINE-ROUTINE',
		code: 'URINE-ROUTINE',
		name: 'Urinalysis (Routine)',
		category: 'chemistry',
		turnaroundTime: 1,
		price: 15,
		requiresFasting: false,
		sampleType: 'urine',
		referenceRange: {
			unit: 'qualitative',
			description: 'Checks pH, protein, glucose, ketones, blood, etc.'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Immunology
	'IMMUNO-CRP': {
		id: 'IMMUNO-CRP',
		code: 'IMMUNO-CRP',
		name: 'C-Reactive Protein (CRP)',
		category: 'immunology',
		turnaroundTime: 3,
		price: 35,
		requiresFasting: false,
		sampleType: 'blood-serum',
		referenceRange: {
			max: 3.0,
			unit: 'mg/L',
			description: 'Marker of inflammation'
		},
		createdAt: new Date(),
		updatedAt: new Date()
	},
	'IMMUNO-ESR': {
		id: 'IMMUNO-ESR',
		code: 'IMMUNO-ESR',
		name: 'Erythrocyte Sedimentation Rate (ESR)',
		category: 'immunology',
		turnaroundTime: 1,
		price: 20,
		requiresFasting: false,
		sampleType: 'blood-whole',
		referenceRange: {
			unit: 'mm/hr',
			male: { max: 15 },
			female: { max: 20 }
		},
		createdAt: new Date(),
		updatedAt: new Date()
	}
};

// Lab Test Panels (groups of commonly ordered tests together)
export const LAB_TEST_PANELS = {
	'PANEL-CBC': {
		id: 'PANEL-CBC',
		name: 'Complete Blood Count (CBC)',
		tests: ['CBC-WBC', 'CBC-RBC', 'CBC-HGB', 'CBC-HCT', 'CBC-PLT']
	},
	'PANEL-CMP': {
		id: 'PANEL-CMP',
		name: 'Comprehensive Metabolic Panel',
		tests: [
			'CMP-GLU',
			'CMP-BUN',
			'CMP-CREAT',
			'CMP-NA',
			'CMP-K',
			'CMP-CL',
			'CMP-CO2',
			'CMP-CA'
		]
	},
	'PANEL-LIPID': {
		id: 'PANEL-LIPID',
		name: 'Lipid Panel',
		tests: ['LIPID-CHOL', 'LIPID-HDL', 'LIPID-LDL', 'LIPID-TRIG']
	},
	'PANEL-THYROID': {
		id: 'PANEL-THYROID',
		name: 'Thyroid Panel',
		tests: ['THYROID-TSH', 'THYROID-T4', 'THYROID-T3']
	},
	'PANEL-LIVER': {
		id: 'PANEL-LIVER',
		name: 'Liver Function Panel',
		tests: [
			'LIVER-ALT',
			'LIVER-AST',
			'LIVER-ALP',
			'LIVER-BILI-TOTAL',
			'LIVER-BILI-DIRECT',
			'LIVER-ALB',
			'LIVER-PROTEIN'
		]
	},
	'PANEL-KIDNEY': {
		id: 'PANEL-KIDNEY',
		name: 'Kidney Function Panel',
		tests: ['CMP-BUN', 'CMP-CREAT', 'KIDNEY-GFR']
	}
};

// Statistics interface
export interface LabStats {
	totalOrders: number;
	pendingCollection: number;
	processing: number;
	pendingReview: number;
	completed: number;
	todayOrders: number;
	statOrders: number;
	averageTurnaroundTime: number; // in hours
}
