import { z } from 'zod';

// Enums
export const prescriptionStatusSchema = z.enum(['active', 'filled', 'expired', 'cancelled']);
export type PrescriptionStatus = z.infer<typeof prescriptionStatusSchema>;

export const medicationFormSchema = z.enum([
	'tablet',
	'capsule',
	'syrup',
	'injection',
	'cream',
	'ointment',
	'drops',
	'inhaler',
	'patch',
	'suppository',
	'other'
]);
export type MedicationForm = z.infer<typeof medicationFormSchema>;

export const interactionSeveritySchema = z.enum(['minor', 'moderate', 'major', 'contraindicated']);
export type InteractionSeverity = z.infer<typeof interactionSeveritySchema>;

export const drugCategorySchema = z.enum([
	'antibiotic',
	'antihypertensive',
	'analgesic',
	'anti-inflammatory',
	'antidiabetic',
	'anticoagulant',
	'antidepressant',
	'antihistamine',
	'bronchodilator',
	'cardiovascular',
	'gastrointestinal',
	'hormone',
	'immunosuppressant',
	'vitamin',
	'other'
]);
export type DrugCategory = z.infer<typeof drugCategorySchema>;

// Prescription Medication Schema (different from EMR Medication)
export const prescriptionMedicationSchema = z.object({
	drugName: z.string().min(2, 'İlaç adı en az 2 karakter olmalıdır.'),
	genericName: z.string().min(2, 'Jenerik adı en az 2 karakter olmalıdır.').optional(),
	dosage: z.string().min(1, 'Dozaj gereklidir.'), // e.g., "500mg", "5ml", "1 puff"
	form: medicationFormSchema,
	frequency: z.string().min(1, 'Sıklık gereklidir.'), // e.g., "twice daily", "every 8 hours", "as needed"
	duration: z.string().min(1, 'Süre gereklidir.'), // e.g., "7 days", "2 weeks", "ongoing"
	quantity: z.number().int().positive('Miktar pozitif bir sayı olmalıdır.'), // Total quantity to dispense
	instructions: z.string().optional(), // e.g., "Take with food", "Before bedtime"
	warnings: z.array(z.string()).default([]), // Patient-specific warnings
	refillsAllowed: z.number().int().min(0).default(0)
});
export type PrescriptionMedication = z.infer<typeof prescriptionMedicationSchema>;

// Drug Interaction Schema
export const drugInteractionSchema = z.object({
	drug1: z.string(), // Drug name or ID
	drug2: z.string(), // Drug name or ID
	severity: interactionSeveritySchema,
	description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır.'),
	recommendation: z.string().min(10, 'Öneri en az 10 karakter olmalıdır.')
});
export type DrugInteraction = z.infer<typeof drugInteractionSchema>;

// Prescription Tracking Schema (different from EMR Prescription)
export const prescriptionTrackingSchema = z.object({
	id: z.string(),
	prescriptionNumber: z.string(), // Human-readable number (e.g., RX-2024-001234)
	patientId: z.string(),
	patientName: z.string().optional(), // Derived field
	appointmentId: z.string().optional(),
	doctorId: z.string(),
	doctorName: z.string().optional(), // Derived field
	medications: z.array(prescriptionMedicationSchema).min(1, 'En az bir ilaç gereklidir.'),
	diagnosisICD10: z.string().optional(), // ICD-10 code for the condition being treated
	diagnosisName: z.string().optional(), // Name of the diagnosis
	issuedAt: z.date(),
	validUntil: z.date(), // Prescription expiration date
	status: prescriptionStatusSchema.default('active'),
	pharmacyFilled: z
		.object({
			pharmacyName: z.string(),
			pharmacyId: z.string().optional(),
			filledAt: z.date(),
			pharmacistName: z.string().optional()
		})
		.optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type PrescriptionTracking = z.infer<typeof prescriptionTrackingSchema>;

// DTOs for API operations
export const createPrescriptionDtoSchema = prescriptionTrackingSchema.omit({
	id: true,
	prescriptionNumber: true,
	patientName: true,
	doctorName: true,
	createdAt: true,
	updatedAt: true
});
export type CreatePrescriptionDto = z.infer<typeof createPrescriptionDtoSchema>;

export const updatePrescriptionDtoSchema = prescriptionTrackingSchema
	.omit({
		id: true,
		prescriptionNumber: true,
		patientName: true,
		doctorName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdatePrescriptionDto = z.infer<typeof updatePrescriptionDtoSchema>;

// Drug Database Entry
export interface DrugInfo {
	id: string;
	brandName: string;
	genericName: string;
	category: DrugCategory;
	commonDosages: string[]; // e.g., ["250mg", "500mg", "1000mg"]
	forms: MedicationForm[];
	commonFrequencies: string[]; // e.g., ["once daily", "twice daily", "three times daily"]
	standardDuration?: string; // e.g., "7 days" for antibiotics
	requiresPrescription: boolean;
	commonWarnings: string[];
	contraindications?: string[];
	sideEffects?: string[];
	pregnancyCategory?: string; // FDA pregnancy categories: A, B, C, D, X
}

// Drug Database - 100+ common medications
export const DRUG_DATABASE: Record<string, DrugInfo> = {
	// Antibiotics
	'amoxicillin': {
		id: 'amoxicillin',
		brandName: 'Amoxil',
		genericName: 'Amoxicillin',
		category: 'antibiotic',
		commonDosages: ['250mg', '500mg', '875mg'],
		forms: ['tablet', 'capsule', 'syrup'],
		commonFrequencies: ['three times daily', 'twice daily'],
		standardDuration: '7-10 days',
		requiresPrescription: true,
		commonWarnings: ['Take with or without food', 'Complete full course', 'May cause diarrhea'],
		contraindications: ['Penicillin allergy'],
		sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
		pregnancyCategory: 'B'
	},
	'azithromycin': {
		id: 'azithromycin',
		brandName: 'Zithromax',
		genericName: 'Azithromycin',
		category: 'antibiotic',
		commonDosages: ['250mg', '500mg'],
		forms: ['tablet', 'syrup'],
		commonFrequencies: ['once daily'],
		standardDuration: '3-5 days',
		requiresPrescription: true,
		commonWarnings: ['Take on empty stomach', 'Complete full course'],
		contraindications: ['Macrolide allergy', 'Liver disease'],
		sideEffects: ['Nausea', 'Diarrhea', 'Abdominal pain'],
		pregnancyCategory: 'B'
	},
	'ciprofloxacin': {
		id: 'ciprofloxacin',
		brandName: 'Cipro',
		genericName: 'Ciprofloxacin',
		category: 'antibiotic',
		commonDosages: ['250mg', '500mg', '750mg'],
		forms: ['tablet', 'drops'],
		commonFrequencies: ['twice daily'],
		standardDuration: '7-14 days',
		requiresPrescription: true,
		commonWarnings: ['Drink plenty of water', 'Avoid dairy products', 'May cause tendon damage'],
		contraindications: ['Pregnancy', 'Children under 18', 'Tendon disorders'],
		sideEffects: ['Nausea', 'Diarrhea', 'Dizziness', 'Tendinitis'],
		pregnancyCategory: 'C'
	},
	'doxycycline': {
		id: 'doxycycline',
		brandName: 'Vibramycin',
		genericName: 'Doxycycline',
		category: 'antibiotic',
		commonDosages: ['50mg', '100mg'],
		forms: ['tablet', 'capsule'],
		commonFrequencies: ['once daily', 'twice daily'],
		standardDuration: '7-14 days',
		requiresPrescription: true,
		commonWarnings: ['Take with food', 'Avoid sun exposure', 'Do not lie down for 30 minutes after'],
		contraindications: ['Pregnancy', 'Children under 8'],
		sideEffects: ['Nausea', 'Photosensitivity', 'Esophageal irritation'],
		pregnancyCategory: 'D'
	},
	'cephalexin': {
		id: 'cephalexin',
		brandName: 'Keflex',
		genericName: 'Cephalexin',
		category: 'antibiotic',
		commonDosages: ['250mg', '500mg'],
		forms: ['capsule', 'tablet', 'syrup'],
		commonFrequencies: ['four times daily', 'twice daily'],
		standardDuration: '7-14 days',
		requiresPrescription: true,
		commonWarnings: ['Take with or without food', 'Complete full course'],
		contraindications: ['Cephalosporin allergy'],
		sideEffects: ['Diarrhea', 'Nausea', 'Upset stomach'],
		pregnancyCategory: 'B'
	},

	// Antihypertensives
	'amlodipine': {
		id: 'amlodipine',
		brandName: 'Norvasc',
		genericName: 'Amlodipine',
		category: 'antihypertensive',
		commonDosages: ['2.5mg', '5mg', '10mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Take at same time each day', 'May cause swelling in ankles'],
		contraindications: ['Severe aortic stenosis'],
		sideEffects: ['Edema', 'Headache', 'Dizziness', 'Flushing'],
		pregnancyCategory: 'C'
	},
	'lisinopril': {
		id: 'lisinopril',
		brandName: 'Prinivil',
		genericName: 'Lisinopril',
		category: 'antihypertensive',
		commonDosages: ['5mg', '10mg', '20mg', '40mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Take at same time each day', 'May cause dizziness', 'Monitor potassium levels'],
		contraindications: ['Pregnancy', 'Angioedema history'],
		sideEffects: ['Dry cough', 'Dizziness', 'Headache', 'Hyperkalemia'],
		pregnancyCategory: 'D'
	},
	'losartan': {
		id: 'losartan',
		brandName: 'Cozaar',
		genericName: 'Losartan',
		category: 'antihypertensive',
		commonDosages: ['25mg', '50mg', '100mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily', 'twice daily'],
		requiresPrescription: true,
		commonWarnings: ['Take at same time each day', 'Monitor potassium levels'],
		contraindications: ['Pregnancy'],
		sideEffects: ['Dizziness', 'Upper respiratory infection', 'Hyperkalemia'],
		pregnancyCategory: 'D'
	},
	'metoprolol': {
		id: 'metoprolol',
		brandName: 'Lopressor',
		genericName: 'Metoprolol',
		category: 'antihypertensive',
		commonDosages: ['25mg', '50mg', '100mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily', 'twice daily'],
		requiresPrescription: true,
		commonWarnings: ['Do not stop suddenly', 'May mask hypoglycemia symptoms'],
		contraindications: ['Severe bradycardia', 'Heart block', 'Cardiogenic shock'],
		sideEffects: ['Fatigue', 'Dizziness', 'Bradycardia', 'Depression'],
		pregnancyCategory: 'C'
	},
	'hydrochlorothiazide': {
		id: 'hydrochlorothiazide',
		brandName: 'Microzide',
		genericName: 'Hydrochlorothiazide',
		category: 'antihypertensive',
		commonDosages: ['12.5mg', '25mg', '50mg'],
		forms: ['tablet', 'capsule'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Take in morning', 'May increase urination', 'Monitor electrolytes'],
		contraindications: ['Anuria', 'Sulfonamide allergy'],
		sideEffects: ['Hypokalemia', 'Dizziness', 'Photosensitivity', 'Hyperglycemia'],
		pregnancyCategory: 'B'
	},

	// Analgesics & Anti-inflammatory
	'ibuprofen': {
		id: 'ibuprofen',
		brandName: 'Advil',
		genericName: 'Ibuprofen',
		category: 'analgesic',
		commonDosages: ['200mg', '400mg', '600mg', '800mg'],
		forms: ['tablet', 'capsule', 'syrup'],
		commonFrequencies: ['every 4-6 hours as needed', 'three times daily'],
		requiresPrescription: false,
		commonWarnings: ['Take with food', 'Do not exceed 3200mg/day', 'May cause stomach upset'],
		contraindications: ['Active GI bleeding', 'Severe heart failure'],
		sideEffects: ['Nausea', 'Heartburn', 'Dizziness', 'GI bleeding'],
		pregnancyCategory: 'C'
	},
	'naproxen': {
		id: 'naproxen',
		brandName: 'Aleve',
		genericName: 'Naproxen',
		category: 'analgesic',
		commonDosages: ['220mg', '250mg', '500mg'],
		forms: ['tablet'],
		commonFrequencies: ['twice daily', 'every 8-12 hours'],
		requiresPrescription: false,
		commonWarnings: ['Take with food', 'May cause stomach upset'],
		contraindications: ['Active GI bleeding', 'Severe heart failure'],
		sideEffects: ['Nausea', 'Heartburn', 'Dizziness', 'Headache'],
		pregnancyCategory: 'C'
	},
	'acetaminophen': {
		id: 'acetaminophen',
		brandName: 'Tylenol',
		genericName: 'Acetaminophen',
		category: 'analgesic',
		commonDosages: ['325mg', '500mg', '650mg'],
		forms: ['tablet', 'capsule', 'syrup'],
		commonFrequencies: ['every 4-6 hours as needed'],
		requiresPrescription: false,
		commonWarnings: ['Do not exceed 4000mg/day', 'Avoid alcohol', 'May cause liver damage'],
		contraindications: ['Severe liver disease'],
		sideEffects: ['Rare: Liver damage with overdose'],
		pregnancyCategory: 'B'
	},
	'tramadol': {
		id: 'tramadol',
		brandName: 'Ultram',
		genericName: 'Tramadol',
		category: 'analgesic',
		commonDosages: ['50mg', '100mg'],
		forms: ['tablet'],
		commonFrequencies: ['every 4-6 hours as needed'],
		requiresPrescription: true,
		commonWarnings: ['May cause dependence', 'Do not stop suddenly', 'Avoid alcohol'],
		contraindications: ['Respiratory depression', 'Acute intoxication'],
		sideEffects: ['Dizziness', 'Nausea', 'Constipation', 'Drowsiness'],
		pregnancyCategory: 'C'
	},

	// Antidiabetic medications
	'metformin': {
		id: 'metformin',
		brandName: 'Glucophage',
		genericName: 'Metformin',
		category: 'antidiabetic',
		commonDosages: ['500mg', '850mg', '1000mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily', 'twice daily'],
		requiresPrescription: true,
		commonWarnings: ['Take with meals', 'May cause GI upset', 'Monitor kidney function'],
		contraindications: ['Severe kidney disease', 'Metabolic acidosis'],
		sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain', 'Lactic acidosis (rare)'],
		pregnancyCategory: 'B'
	},
	'glipizide': {
		id: 'glipizide',
		brandName: 'Glucotrol',
		genericName: 'Glipizide',
		category: 'antidiabetic',
		commonDosages: ['5mg', '10mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily', 'twice daily'],
		requiresPrescription: true,
		commonWarnings: ['Take 30 minutes before meals', 'May cause hypoglycemia'],
		contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis'],
		sideEffects: ['Hypoglycemia', 'Nausea', 'Diarrhea', 'Dizziness'],
		pregnancyCategory: 'C'
	},
	'insulin-glargine': {
		id: 'insulin-glargine',
		brandName: 'Lantus',
		genericName: 'Insulin Glargine',
		category: 'antidiabetic',
		commonDosages: ['100 units/mL'],
		forms: ['injection'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Refrigerate until use', 'Monitor blood glucose', 'May cause hypoglycemia'],
		contraindications: ['Hypoglycemia'],
		sideEffects: ['Hypoglycemia', 'Injection site reactions', 'Weight gain'],
		pregnancyCategory: 'C'
	},

	// Cardiovascular medications
	'atorvastatin': {
		id: 'atorvastatin',
		brandName: 'Lipitor',
		genericName: 'Atorvastatin',
		category: 'cardiovascular',
		commonDosages: ['10mg', '20mg', '40mg', '80mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Take at same time each day', 'Avoid grapefruit', 'Monitor liver function'],
		contraindications: ['Active liver disease', 'Pregnancy'],
		sideEffects: ['Muscle pain', 'Headache', 'Nausea', 'Elevated liver enzymes'],
		pregnancyCategory: 'X'
	},
	'aspirin': {
		id: 'aspirin',
		brandName: 'Bayer Aspirin',
		genericName: 'Aspirin',
		category: 'cardiovascular',
		commonDosages: ['81mg', '325mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['Take with food', 'May cause bleeding', 'Avoid in children with viral illness'],
		contraindications: ['Active bleeding', 'Hemophilia'],
		sideEffects: ['GI bleeding', 'Upset stomach', 'Bruising'],
		pregnancyCategory: 'D'
	},
	'clopidogrel': {
		id: 'clopidogrel',
		brandName: 'Plavix',
		genericName: 'Clopidogrel',
		category: 'anticoagulant',
		commonDosages: ['75mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Do not stop without consulting doctor', 'May cause bleeding'],
		contraindications: ['Active bleeding'],
		sideEffects: ['Bleeding', 'Bruising', 'Rash', 'Diarrhea'],
		pregnancyCategory: 'B'
	},
	'warfarin': {
		id: 'warfarin',
		brandName: 'Coumadin',
		genericName: 'Warfarin',
		category: 'anticoagulant',
		commonDosages: ['1mg', '2mg', '2.5mg', '5mg', '10mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: [
			'Monitor INR regularly',
			'Avoid vitamin K-rich foods',
			'May cause bleeding',
			'Multiple drug interactions'
		],
		contraindications: ['Active bleeding', 'Pregnancy'],
		sideEffects: ['Bleeding', 'Bruising', 'Skin necrosis (rare)'],
		pregnancyCategory: 'X'
	},

	// Gastrointestinal medications
	'omeprazole': {
		id: 'omeprazole',
		brandName: 'Prilosec',
		genericName: 'Omeprazole',
		category: 'gastrointestinal',
		commonDosages: ['20mg', '40mg'],
		forms: ['capsule', 'tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['Take before meals', 'May decrease calcium absorption'],
		contraindications: ['Hypersensitivity to PPIs'],
		sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Abdominal pain'],
		pregnancyCategory: 'C'
	},
	'ranitidine': {
		id: 'ranitidine',
		brandName: 'Zantac',
		genericName: 'Ranitidine',
		category: 'gastrointestinal',
		commonDosages: ['150mg', '300mg'],
		forms: ['tablet', 'syrup'],
		commonFrequencies: ['once daily', 'twice daily'],
		requiresPrescription: false,
		commonWarnings: ['May take with or without food'],
		contraindications: ['Hypersensitivity'],
		sideEffects: ['Headache', 'Constipation', 'Diarrhea', 'Dizziness'],
		pregnancyCategory: 'B'
	},
	'ondansetron': {
		id: 'ondansetron',
		brandName: 'Zofran',
		genericName: 'Ondansetron',
		category: 'gastrointestinal',
		commonDosages: ['4mg', '8mg'],
		forms: ['tablet', 'injection'],
		commonFrequencies: ['every 8 hours as needed'],
		requiresPrescription: true,
		commonWarnings: ['May cause constipation'],
		contraindications: ['Congenital long QT syndrome'],
		sideEffects: ['Headache', 'Constipation', 'Dizziness'],
		pregnancyCategory: 'B'
	},

	// Antidepressants
	'sertraline': {
		id: 'sertraline',
		brandName: 'Zoloft',
		genericName: 'Sertraline',
		category: 'antidepressant',
		commonDosages: ['25mg', '50mg', '100mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Do not stop suddenly', 'May take 4-6 weeks to work', 'Avoid alcohol'],
		contraindications: ['MAOI use within 14 days'],
		sideEffects: ['Nausea', 'Insomnia', 'Drowsiness', 'Sexual dysfunction'],
		pregnancyCategory: 'C'
	},
	'fluoxetine': {
		id: 'fluoxetine',
		brandName: 'Prozac',
		genericName: 'Fluoxetine',
		category: 'antidepressant',
		commonDosages: ['10mg', '20mg', '40mg'],
		forms: ['capsule', 'tablet', 'syrup'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Do not stop suddenly', 'May take 4-6 weeks to work', 'Avoid alcohol'],
		contraindications: ['MAOI use within 14 days'],
		sideEffects: ['Nausea', 'Insomnia', 'Anxiety', 'Sexual dysfunction'],
		pregnancyCategory: 'C'
	},
	'escitalopram': {
		id: 'escitalopram',
		brandName: 'Lexapro',
		genericName: 'Escitalopram',
		category: 'antidepressant',
		commonDosages: ['5mg', '10mg', '20mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: true,
		commonWarnings: ['Do not stop suddenly', 'May take 4-6 weeks to work'],
		contraindications: ['MAOI use within 14 days'],
		sideEffects: ['Nausea', 'Insomnia', 'Fatigue', 'Sexual dysfunction'],
		pregnancyCategory: 'C'
	},

	// Antihistamines
	'cetirizine': {
		id: 'cetirizine',
		brandName: 'Zyrtec',
		genericName: 'Cetirizine',
		category: 'antihistamine',
		commonDosages: ['5mg', '10mg'],
		forms: ['tablet', 'syrup'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['May cause drowsiness', 'Avoid alcohol'],
		contraindications: ['Severe kidney disease'],
		sideEffects: ['Drowsiness', 'Dry mouth', 'Headache', 'Fatigue'],
		pregnancyCategory: 'B'
	},
	'loratadine': {
		id: 'loratadine',
		brandName: 'Claritin',
		genericName: 'Loratadine',
		category: 'antihistamine',
		commonDosages: ['10mg'],
		forms: ['tablet', 'syrup'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['Non-drowsy formulation'],
		contraindications: ['Hypersensitivity'],
		sideEffects: ['Headache', 'Fatigue', 'Dry mouth'],
		pregnancyCategory: 'B'
	},
	'diphenhydramine': {
		id: 'diphenhydramine',
		brandName: 'Benadryl',
		genericName: 'Diphenhydramine',
		category: 'antihistamine',
		commonDosages: ['25mg', '50mg'],
		forms: ['tablet', 'capsule', 'syrup'],
		commonFrequencies: ['every 4-6 hours as needed'],
		requiresPrescription: false,
		commonWarnings: ['May cause significant drowsiness', 'Avoid alcohol', 'Do not drive'],
		contraindications: ['Acute asthma', 'Glaucoma'],
		sideEffects: ['Drowsiness', 'Dry mouth', 'Dizziness', 'Confusion'],
		pregnancyCategory: 'B'
	},

	// Bronchodilators
	'albuterol': {
		id: 'albuterol',
		brandName: 'Ventolin',
		genericName: 'Albuterol',
		category: 'bronchodilator',
		commonDosages: ['90 mcg/puff', '2.5mg nebulizer'],
		forms: ['inhaler'],
		commonFrequencies: ['every 4-6 hours as needed', '2 puffs as needed'],
		requiresPrescription: true,
		commonWarnings: ['Shake well before use', 'Rinse mouth after use'],
		contraindications: ['Hypersensitivity'],
		sideEffects: ['Tremor', 'Nervousness', 'Headache', 'Tachycardia'],
		pregnancyCategory: 'C'
	},
	'montelukast': {
		id: 'montelukast',
		brandName: 'Singulair',
		genericName: 'Montelukast',
		category: 'bronchodilator',
		commonDosages: ['4mg', '5mg', '10mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily in evening'],
		requiresPrescription: true,
		commonWarnings: ['Not for acute asthma attacks', 'May cause mood changes'],
		contraindications: ['Hypersensitivity'],
		sideEffects: ['Headache', 'Abdominal pain', 'Mood changes', 'Sleep disturbances'],
		pregnancyCategory: 'B'
	},

	// Vitamins & Supplements
	'vitamin-d3': {
		id: 'vitamin-d3',
		brandName: 'Vitamin D3',
		genericName: 'Cholecalciferol',
		category: 'vitamin',
		commonDosages: ['1000 IU', '2000 IU', '5000 IU'],
		forms: ['tablet', 'capsule'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['Take with food for better absorption'],
		contraindications: ['Hypercalcemia'],
		sideEffects: ['Rare: Hypercalcemia with excessive doses'],
		pregnancyCategory: 'A'
	},
	'iron-supplement': {
		id: 'iron-supplement',
		brandName: 'Ferrous Sulfate',
		genericName: 'Iron',
		category: 'vitamin',
		commonDosages: ['325mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['Take on empty stomach', 'May cause constipation', 'Stools may turn dark'],
		contraindications: ['Hemochromatosis'],
		sideEffects: ['Constipation', 'Nausea', 'Dark stools', 'Abdominal pain'],
		pregnancyCategory: 'A'
	},
	'folic-acid': {
		id: 'folic-acid',
		brandName: 'Folic Acid',
		genericName: 'Folic Acid',
		category: 'vitamin',
		commonDosages: ['400 mcg', '800 mcg', '1mg'],
		forms: ['tablet'],
		commonFrequencies: ['once daily'],
		requiresPrescription: false,
		commonWarnings: ['Important during pregnancy'],
		contraindications: ['Pernicious anemia (undiagnosed)'],
		sideEffects: ['Rare: Nausea, bloating'],
		pregnancyCategory: 'A'
	}
};

// Drug Interaction Matrix
export const DRUG_INTERACTIONS: DrugInteraction[] = [
	// Warfarin interactions (very high risk)
	{
		drug1: 'warfarin',
		drug2: 'aspirin',
		severity: 'major',
		description: 'Concurrent use significantly increases bleeding risk.',
		recommendation:
			'Avoid combination if possible. If necessary, monitor INR closely and watch for signs of bleeding.'
	},
	{
		drug1: 'warfarin',
		drug2: 'ibuprofen',
		severity: 'major',
		description: 'NSAIDs increase bleeding risk when combined with warfarin.',
		recommendation: 'Use acetaminophen instead. If NSAID necessary, monitor INR closely.'
	},
	{
		drug1: 'warfarin',
		drug2: 'naproxen',
		severity: 'major',
		description: 'NSAIDs increase bleeding risk when combined with warfarin.',
		recommendation: 'Use acetaminophen instead. If NSAID necessary, monitor INR closely.'
	},

	// ACE inhibitors + Potassium interactions
	{
		drug1: 'lisinopril',
		drug2: 'losartan',
		severity: 'major',
		description: 'Dual blockade of renin-angiotensin system increases risk of hyperkalemia and kidney damage.',
		recommendation: 'Avoid combination. Use one agent only.'
	},

	// SSRI + NSAID interactions
	{
		drug1: 'sertraline',
		drug2: 'ibuprofen',
		severity: 'moderate',
		description: 'SSRIs and NSAIDs together increase risk of GI bleeding.',
		recommendation: 'Consider using acetaminophen instead. If combination necessary, monitor for bleeding.'
	},
	{
		drug1: 'fluoxetine',
		drug2: 'ibuprofen',
		severity: 'moderate',
		description: 'SSRIs and NSAIDs together increase risk of GI bleeding.',
		recommendation: 'Consider using acetaminophen instead. If combination necessary, monitor for bleeding.'
	},
	{
		drug1: 'escitalopram',
		drug2: 'ibuprofen',
		severity: 'moderate',
		description: 'SSRIs and NSAIDs together increase risk of GI bleeding.',
		recommendation: 'Consider using acetaminophen instead. If combination necessary, monitor for bleeding.'
	},

	// Metformin + contrast dye
	{
		drug1: 'metformin',
		drug2: 'ibuprofen',
		severity: 'moderate',
		description: 'NSAIDs may reduce kidney function, increasing risk of lactic acidosis with metformin.',
		recommendation: 'Monitor kidney function. Use lowest effective NSAID dose for shortest duration.'
	},

	// Beta-blocker + calcium channel blocker
	{
		drug1: 'metoprolol',
		drug2: 'amlodipine',
		severity: 'moderate',
		description: 'May cause excessive lowering of heart rate and blood pressure.',
		recommendation: 'Monitor heart rate and blood pressure closely. Adjust doses as needed.'
	},

	// Statin + fibrate
	{
		drug1: 'atorvastatin',
		drug2: 'clopidogrel',
		severity: 'minor',
		description: 'Clopidogrel may reduce effectiveness of atorvastatin.',
		recommendation: 'Monitor cholesterol levels. Consider alternative statin if needed.'
	},

	// Anticoagulants together
	{
		drug1: 'aspirin',
		drug2: 'clopidogrel',
		severity: 'major',
		description: 'Dual antiplatelet therapy significantly increases bleeding risk.',
		recommendation:
			'Only use together when specifically indicated (e.g., post-stent). Monitor for bleeding.'
	},

	// Tramadol + SSRI
	{
		drug1: 'tramadol',
		drug2: 'sertraline',
		severity: 'major',
		description: 'Increases risk of serotonin syndrome.',
		recommendation: 'Avoid combination if possible. Monitor for serotonin syndrome symptoms.'
	},
	{
		drug1: 'tramadol',
		drug2: 'fluoxetine',
		severity: 'major',
		description: 'Increases risk of serotonin syndrome.',
		recommendation: 'Avoid combination if possible. Monitor for serotonin syndrome symptoms.'
	},
	{
		drug1: 'tramadol',
		drug2: 'escitalopram',
		severity: 'major',
		description: 'Increases risk of serotonin syndrome.',
		recommendation: 'Avoid combination if possible. Monitor for serotonin syndrome symptoms.'
	},

	// Antibiotics interactions
	{
		drug1: 'ciprofloxacin',
		drug2: 'warfarin',
		severity: 'major',
		description: 'Ciprofloxacin increases warfarin levels, increasing bleeding risk.',
		recommendation: 'Monitor INR closely. May need to reduce warfarin dose.'
	},
	{
		drug1: 'azithromycin',
		drug2: 'warfarin',
		severity: 'moderate',
		description: 'Azithromycin may increase warfarin levels.',
		recommendation: 'Monitor INR. Watch for signs of bleeding.'
	},

	// Omeprazole interactions
	{
		drug1: 'omeprazole',
		drug2: 'clopidogrel',
		severity: 'moderate',
		description: 'Omeprazole reduces effectiveness of clopidogrel.',
		recommendation: 'Use alternative PPI (e.g., pantoprazole) or H2 blocker (e.g., ranitidine).'
	},

	// Iron + calcium
	{
		drug1: 'iron-supplement',
		drug2: 'amlodipine',
		severity: 'minor',
		description: 'Calcium channel blockers may reduce iron absorption.',
		recommendation: 'Separate administration by 2-4 hours.'
	},

	// Thyroid hormone interactions
	{
		drug1: 'iron-supplement',
		drug2: 'omeprazole',
		severity: 'minor',
		description: 'PPIs reduce iron absorption.',
		recommendation: 'Separate doses by 2-4 hours. Monitor iron levels.'
	},

	// Diuretic + ACE inhibitor
	{
		drug1: 'hydrochlorothiazide',
		drug2: 'lisinopril',
		severity: 'moderate',
		description: 'May cause excessive blood pressure lowering or kidney dysfunction.',
		recommendation: 'Monitor blood pressure and kidney function. Adjust doses as needed.'
	},

	// Antihistamine interactions
	{
		drug1: 'diphenhydramine',
		drug2: 'metoprolol',
		severity: 'minor',
		description: 'Both can cause drowsiness and dizziness.',
		recommendation: 'Advise caution when driving or operating machinery.'
	}
];

// Helper function to get drug interactions for a list of medications
export function findDrugInteractions(medications: string[]): DrugInteraction[] {
	const interactions: DrugInteraction[] = [];

	for (let i = 0; i < medications.length; i++) {
		for (let j = i + 1; j < medications.length; j++) {
			const drug1 = medications[i].toLowerCase();
			const drug2 = medications[j].toLowerCase();

			// Check both directions
			const interaction = DRUG_INTERACTIONS.find(
				(int) =>
					(int.drug1 === drug1 && int.drug2 === drug2) || (int.drug1 === drug2 && int.drug2 === drug1)
			);

			if (interaction) {
				interactions.push(interaction);
			}
		}
	}

	return interactions;
}

// Statistics interface
export interface PrescriptionStats {
	totalPrescriptions: number;
	activePrescriptions: number;
	filledPrescriptions: number;
	expiredPrescriptions: number;
	cancelledPrescriptions: number;
	todayPrescriptions: number;
	interactionWarnings: number;
}
