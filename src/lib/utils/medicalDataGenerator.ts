/**
 * Medical Data Generator Utilities
 * Generates realistic medical data including ICD-10 codes, CPT codes, lab tests, drugs, and medical terminology
 */

import { faker } from '@faker-js/faker';

// ICD-10 Diagnosis codes with Turkish descriptions (50+ common conditions)
export const ICD10_CODES = [
	{ code: 'J00', name: 'Akut nazofarenjit (nezle)', severity: 'mild' as const },
	{ code: 'J06.9', name: 'Akut üst solunum yolu enfeksiyonu', severity: 'mild' as const },
	{ code: 'J20.9', name: 'Akut bronşit', severity: 'moderate' as const },
	{ code: 'J18.9', name: 'Pnömoni', severity: 'severe' as const },
	{ code: 'J45.9', name: 'Astım', severity: 'moderate' as const },
	{ code: 'I10', name: 'Esansiyel (primer) hipertansiyon', severity: 'moderate' as const },
	{ code: 'I25.1', name: 'Aterosklerotik kalp hastalığı', severity: 'severe' as const },
	{ code: 'I48', name: 'Atriyal fibrilasyon', severity: 'severe' as const },
	{ code: 'I50.9', name: 'Kalp yetmezliği', severity: 'severe' as const },
	{ code: 'E11.9', name: 'Tip 2 diyabet mellitus', severity: 'moderate' as const },
	{ code: 'E78.5', name: 'Hiperlipidemi', severity: 'moderate' as const },
	{ code: 'E66.9', name: 'Obezite', severity: 'moderate' as const },
	{ code: 'E04.9', name: 'Guatr', severity: 'mild' as const },
	{ code: 'K21.9', name: 'Gastroözofageal reflü hastalığı (GÖRH)', severity: 'mild' as const },
	{ code: 'K29.7', name: 'Gastrit', severity: 'mild' as const },
	{ code: 'K58.9', name: 'İrritabl barsak sendromu', severity: 'mild' as const },
	{ code: 'K80.2', name: 'Kolesistit (safra kesesi iltihabı)', severity: 'moderate' as const },
	{ code: 'N30.9', name: 'Sistit (idrar yolu enfeksiyonu)', severity: 'mild' as const },
	{ code: 'N39.0', name: 'İdrar yolu enfeksiyonu', severity: 'mild' as const },
	{ code: 'N18.9', name: 'Kronik böbrek hastalığı', severity: 'severe' as const },
	{ code: 'M79.1', name: 'Miyalji (kas ağrısı)', severity: 'mild' as const },
	{ code: 'M54.5', name: 'Bel ağrısı', severity: 'mild' as const },
	{ code: 'M25.5', name: 'Eklem ağrısı', severity: 'mild' as const },
	{ code: 'M15.9', name: 'Osteoartrit', severity: 'moderate' as const },
	{ code: 'M81.9', name: 'Osteoporoz', severity: 'moderate' as const },
	{ code: 'G43.9', name: 'Migren', severity: 'moderate' as const },
	{ code: 'G44.2', name: 'Tansiyon tipi baş ağrısı', severity: 'mild' as const },
	{ code: 'F41.9', name: 'Anksiyete bozukluğu', severity: 'moderate' as const },
	{ code: 'F32.9', name: 'Depresif bozukluk', severity: 'moderate' as const },
	{ code: 'F51.0', name: 'Uykusuzluk', severity: 'mild' as const },
	{ code: 'L20.9', name: 'Atopik dermatit (egzama)', severity: 'mild' as const },
	{ code: 'L30.9', name: 'Dermatit', severity: 'mild' as const },
	{ code: 'L40.9', name: 'Psoriasis', severity: 'moderate' as const },
	{ code: 'H10.9', name: 'Konjonktivit', severity: 'mild' as const },
	{ code: 'H52.1', name: 'Miyopi (yakın görme)', severity: 'mild' as const },
	{ code: 'R05', name: 'Öksürük', severity: 'mild' as const },
	{ code: 'R06.0', name: 'Dispne (nefes darlığı)', severity: 'moderate' as const },
	{ code: 'R10.4', name: 'Karın ağrısı', severity: 'mild' as const },
	{ code: 'R51', name: 'Baş ağrısı', severity: 'mild' as const },
	{ code: 'R50.9', name: 'Ateş', severity: 'mild' as const },
	{ code: 'R11.0', name: 'Bulantı', severity: 'mild' as const },
	{ code: 'R11.1', name: 'Kusma', severity: 'mild' as const },
	{ code: 'R19.7', name: 'İshal', severity: 'mild' as const },
	{ code: 'R42', name: 'Baş dönmesi', severity: 'mild' as const },
	{ code: 'R53', name: 'Halsizlik, yorgunluk', severity: 'mild' as const },
	{ code: 'Z00.0', name: 'Genel tıbbi muayene', severity: 'mild' as const },
	{ code: 'Z01.4', name: 'Göz ve görme muayenesi', severity: 'mild' as const },
	{ code: 'Z13.6', name: 'Kardiyovasküler bozukluklar için tarama', severity: 'mild' as const },
	{ code: 'Z23', name: 'Tek bir bakteriyel hastalığa karşı aşılama', severity: 'mild' as const },
	{ code: 'B34.9', name: 'Viral enfeksiyon', severity: 'mild' as const },
	{ code: 'A09', name: 'Gastroenterit', severity: 'moderate' as const }
];

// CPT Procedure codes with Turkish descriptions and TRY pricing
export const CPT_CODES = [
	{ code: '99213', name: 'Ofis/poliklinik muayenesi (orta düzey)', price: 500 },
	{ code: '99214', name: 'Ofis/poliklinik muayenesi (detaylı)', price: 750 },
	{ code: '99215', name: 'Ofis/poliklinik muayenesi (kapsamlı)', price: 1000 },
	{ code: '99203', name: 'Yeni hasta muayenesi (orta düzey)', price: 800 },
	{ code: '99204', name: 'Yeni hasta muayenesi (kapsamlı)', price: 1200 },
	{ code: '85025', name: 'Tam kan sayımı (hemogram)', price: 150 },
	{ code: '80053', name: 'Kapsamlı metabolik panel', price: 300 },
	{ code: '80061', name: 'Lipid paneli', price: 250 },
	{ code: '83036', name: 'Hemoglobin A1C', price: 200 },
	{ code: '84443', name: 'TSH (Tiroid Stimülan Hormon)', price: 180 },
	{ code: '84439', name: 'Serbest T4', price: 180 },
	{ code: '82947', name: 'Glukoz, kan', price: 100 },
	{ code: '84154', name: 'PSA (Prostat Spesifik Antijen)', price: 220 },
	{ code: '87086', name: 'İdrar kültürü', price: 200 },
	{ code: '81001', name: 'İdrar analizi', price: 120 },
	{ code: '71020', name: 'Göğüs röntgeni', price: 400 },
	{ code: '70450', name: 'Beyin BT taraması', price: 1500 },
	{ code: '70553', name: 'Beyin MRI', price: 2500 },
	{ code: '73721', name: 'Diz MRI', price: 2000 },
	{ code: '93000', name: 'EKG (elektrokardiyogram)', price: 300 },
	{ code: '93005', name: 'Elektrokardiyogram yorumlama', price: 200 },
	{ code: '94010', name: 'Spirometri', price: 350 },
	{ code: '76700', name: 'Batın ultrasonu', price: 600 },
	{ code: '76856', name: 'Pelvik ultrasonu', price: 700 },
	{ code: '77080', name: 'Kemik dansitometrisi (DXA)', price: 500 }
];

// Lab test reference ranges
export interface LabTestReference {
	testName: string;
	testType: string;
	normalRange: string;
	unit: string;
	category: string;
}

export const LAB_TEST_REFERENCES: LabTestReference[] = [
	// Complete Blood Count (CBC)
	{ testName: 'Hemoglobin', testType: 'Hemogram', normalRange: 'Erkek: 13.5-17.5, Kadın: 12.0-16.0', unit: 'g/dL', category: 'CBC' },
	{ testName: 'Hematokrit', testType: 'Hemogram', normalRange: 'Erkek: 38.8-50.0, Kadın: 34.9-44.5', unit: '%', category: 'CBC' },
	{ testName: 'Lökosit', testType: 'Hemogram', normalRange: '4.5-11.0', unit: 'x10³/µL', category: 'CBC' },
	{ testName: 'Trombosit', testType: 'Hemogram', normalRange: '150-400', unit: 'x10³/µL', category: 'CBC' },
	{ testName: 'Eritrosit', testType: 'Hemogram', normalRange: 'Erkek: 4.5-5.9, Kadın: 4.0-5.2', unit: 'x10⁶/µL', category: 'CBC' },
	{ testName: 'MCV', testType: 'Hemogram', normalRange: '80-100', unit: 'fL', category: 'CBC' },
	{ testName: 'MCH', testType: 'Hemogram', normalRange: '27-31', unit: 'pg', category: 'CBC' },
	{ testName: 'MCHC', testType: 'Hemogram', normalRange: '32-36', unit: 'g/dL', category: 'CBC' },

	// Metabolic Panel
	{ testName: 'Glukoz (Açlık)', testType: 'Metabolik Panel', normalRange: '70-100', unit: 'mg/dL', category: 'Metabolic' },
	{ testName: 'Üre', testType: 'Metabolik Panel', normalRange: '15-45', unit: 'mg/dL', category: 'Metabolic' },
	{ testName: 'Kreatinin', testType: 'Metabolik Panel', normalRange: 'Erkek: 0.7-1.3, Kadın: 0.6-1.1', unit: 'mg/dL', category: 'Metabolic' },
	{ testName: 'Sodyum (Na)', testType: 'Metabolik Panel', normalRange: '136-145', unit: 'mmol/L', category: 'Metabolic' },
	{ testName: 'Potasyum (K)', testType: 'Metabolik Panel', normalRange: '3.5-5.0', unit: 'mmol/L', category: 'Metabolic' },
	{ testName: 'Klorür (Cl)', testType: 'Metabolik Panel', normalRange: '98-107', unit: 'mmol/L', category: 'Metabolic' },
	{ testName: 'Kalsiyum (Ca)', testType: 'Metabolik Panel', normalRange: '8.5-10.5', unit: 'mg/dL', category: 'Metabolic' },

	// Liver Function
	{ testName: 'ALT (SGPT)', testType: 'Karaciğer Fonksiyon', normalRange: '7-56', unit: 'U/L', category: 'Liver' },
	{ testName: 'AST (SGOT)', testType: 'Karaciğer Fonksiyon', normalRange: '10-40', unit: 'U/L', category: 'Liver' },
	{ testName: 'Alkalen Fosfataz (ALP)', testType: 'Karaciğer Fonksiyon', normalRange: '44-147', unit: 'U/L', category: 'Liver' },
	{ testName: 'Bilirubin (Total)', testType: 'Karaciğer Fonksiyon', normalRange: '0.3-1.2', unit: 'mg/dL', category: 'Liver' },
	{ testName: 'Albumin', testType: 'Karaciğer Fonksiyon', normalRange: '3.5-5.5', unit: 'g/dL', category: 'Liver' },

	// Lipid Panel
	{ testName: 'Total Kolesterol', testType: 'Lipid Paneli', normalRange: '<200', unit: 'mg/dL', category: 'Lipid' },
	{ testName: 'LDL Kolesterol', testType: 'Lipid Paneli', normalRange: '<100', unit: 'mg/dL', category: 'Lipid' },
	{ testName: 'HDL Kolesterol', testType: 'Lipid Paneli', normalRange: 'Erkek: >40, Kadın: >50', unit: 'mg/dL', category: 'Lipid' },
	{ testName: 'Trigliserit', testType: 'Lipid Paneli', normalRange: '<150', unit: 'mg/dL', category: 'Lipid' },

	// Thyroid Function
	{ testName: 'TSH', testType: 'Tiroid Fonksiyon', normalRange: '0.4-4.0', unit: 'mIU/L', category: 'Thyroid' },
	{ testName: 'Serbest T3', testType: 'Tiroid Fonksiyon', normalRange: '2.3-4.2', unit: 'pg/mL', category: 'Thyroid' },
	{ testName: 'Serbest T4', testType: 'Tiroid Fonksiyon', normalRange: '0.8-1.8', unit: 'ng/dL', category: 'Thyroid' },

	// Diabetes
	{ testName: 'HbA1C', testType: 'Diyabet', normalRange: '<5.7', unit: '%', category: 'Diabetes' },

	// Urinalysis
	{ testName: 'pH (İdrar)', testType: 'İdrar Analizi', normalRange: '4.5-8.0', unit: '', category: 'Urinalysis' },
	{ testName: 'Yoğunluk (İdrar)', testType: 'İdrar Analizi', normalRange: '1.005-1.030', unit: '', category: 'Urinalysis' },
	{ testName: 'Protein (İdrar)', testType: 'İdrar Analizi', normalRange: 'Negatif', unit: '', category: 'Urinalysis' },
	{ testName: 'Glukoz (İdrar)', testType: 'İdrar Analizi', normalRange: 'Negatif', unit: '', category: 'Urinalysis' }
];

// Common Turkish pharmacy drugs
export interface DrugData {
	name: string;
	genericName: string;
	category: string;
	commonDosages: string[];
	commonFrequencies: string[];
	commonDurations: string[];
}

export const COMMON_DRUGS: DrugData[] = [
	{
		name: 'Parol',
		genericName: 'Parasetamol',
		category: 'Analjezik/Antipiretik',
		commonDosages: ['500 mg', '1000 mg'],
		commonFrequencies: ['Günde 3 kez', 'Günde 4 kez', 'İhtiyaç halinde'],
		commonDurations: ['5 gün', '7 gün', '10 gün']
	},
	{
		name: 'Majezik',
		genericName: 'Dexketoprofen',
		category: 'Analjezik/Antienflamatuar',
		commonDosages: ['25 mg'],
		commonFrequencies: ['Günde 2 kez', 'Günde 3 kez'],
		commonDurations: ['5 gün', '7 gün']
	},
	{
		name: 'Augmentin',
		genericName: 'Amoksisilin/Klavulanik Asit',
		category: 'Antibiyotik',
		commonDosages: ['1000 mg', '625 mg'],
		commonFrequencies: ['Günde 2 kez', 'Günde 3 kez'],
		commonDurations: ['7 gün', '10 gün', '14 gün']
	},
	{
		name: 'Talliton',
		genericName: 'Azitromisin',
		category: 'Antibiyotik',
		commonDosages: ['500 mg', '250 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['3 gün', '5 gün']
	},
	{
		name: 'Lansor',
		genericName: 'Lansoprazol',
		category: 'Proton Pompa İnhibitörü',
		commonDosages: ['30 mg', '15 mg'],
		commonFrequencies: ['Günde 1 kez', 'Günde 2 kez'],
		commonDurations: ['14 gün', '28 gün', '3 ay']
	},
	{
		name: 'Pantpas',
		genericName: 'Pantoprazol',
		category: 'Proton Pompa İnhibitörü',
		commonDosages: ['40 mg', '20 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['14 gün', '28 gün']
	},
	{
		name: 'Diovan',
		genericName: 'Valsartan',
		category: 'Antihipertansif',
		commonDosages: ['80 mg', '160 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['Sürekli', '3 ay']
	},
	{
		name: 'Norvasc',
		genericName: 'Amlodipin',
		category: 'Antihipertansif',
		commonDosages: ['5 mg', '10 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['Sürekli', '3 ay']
	},
	{
		name: 'Glucophage',
		genericName: 'Metformin',
		category: 'Antidiyabetik',
		commonDosages: ['500 mg', '850 mg', '1000 mg'],
		commonFrequencies: ['Günde 2 kez', 'Günde 3 kez'],
		commonDurations: ['Sürekli', '3 ay']
	},
	{
		name: 'Coraspin',
		genericName: 'Asetilsalisilik Asit',
		category: 'Antiplatelet',
		commonDosages: ['100 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['Sürekli', '3 ay']
	},
	{
		name: 'Plavix',
		genericName: 'Klopidogrel',
		category: 'Antiplatelet',
		commonDosages: ['75 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['Sürekli', '1 yıl']
	},
	{
		name: 'Lipitor',
		genericName: 'Atorvastatin',
		category: 'Statin',
		commonDosages: ['10 mg', '20 mg', '40 mg'],
		commonFrequencies: ['Günde 1 kez (akşam)'],
		commonDurations: ['Sürekli', '3 ay']
	},
	{
		name: 'Ventolin',
		genericName: 'Salbutamol',
		category: 'Bronkodilatör',
		commonDosages: ['100 mcg inhaler'],
		commonFrequencies: ['İhtiyaç halinde', 'Günde 4 kez'],
		commonDurations: ['Sürekli', '1 ay']
	},
	{
		name: 'Concor',
		genericName: 'Bisoprolol',
		category: 'Beta-bloker',
		commonDosages: ['5 mg', '10 mg'],
		commonFrequencies: ['Günde 1 kez'],
		commonDurations: ['Sürekli', '3 ay']
	},
	{
		name: 'Xanax',
		genericName: 'Alprazolam',
		category: 'Anksiyolitik',
		commonDosages: ['0.25 mg', '0.5 mg'],
		commonFrequencies: ['Günde 2-3 kez', 'İhtiyaç halinde'],
		commonDurations: ['2 hafta', '1 ay']
	}
];

/**
 * Generate a random ICD-10 diagnosis
 */
export function generateDiagnosis(severity?: 'mild' | 'moderate' | 'severe'): {
	code: string;
	name: string;
	severity: 'mild' | 'moderate' | 'severe';
} {
	let filteredCodes = ICD10_CODES;
	if (severity) {
		filteredCodes = ICD10_CODES.filter((d) => d.severity === severity);
	}
	return faker.helpers.arrayElement(filteredCodes);
}

/**
 * Generate a random CPT procedure
 */
export function generateProcedure(): {
	code: string;
	name: string;
	price: number;
} {
	return faker.helpers.arrayElement(CPT_CODES);
}

/**
 * Generate a random lab test result
 */
export function generateLabResult(testRef?: LabTestReference): {
	testName: string;
	testType: string;
	result: string;
	unit: string;
	referenceRange: string;
	status: 'normal' | 'abnormal' | 'critical';
	category: string;
} {
	if (!testRef) {
		testRef = faker.helpers.arrayElement(LAB_TEST_REFERENCES);
	}

	// Parse normal range and generate a value
	const status = faker.helpers.weightedArrayElement([
		{ value: 'normal' as const, weight: 8 },
		{ value: 'abnormal' as const, weight: 2 },
		{ value: 'critical' as const, weight: 0.5 }
	]);

	// Generate result based on status
	let result: string;
	const rangeMatch = testRef.normalRange.match(/(\d+\.?\d*)-(\d+\.?\d*)/);

	if (rangeMatch) {
		const min = parseFloat(rangeMatch[1]);
		const max = parseFloat(rangeMatch[2]);
		const range = max - min;
		// Use more decimal places for precision
		const fractionDigits = 2;

		if (status === 'normal') {
			result = faker.number.float({ min, max, fractionDigits }).toString();
		} else if (status === 'abnormal') {
			const isHigh = faker.datatype.boolean();
			// Use larger multipliers to ensure sufficient range
			const abnormalRange = Math.max(range * 0.3, 1); // At least 1 unit difference
			result = isHigh
				? faker.number.float({ min: max + 0.1, max: max + abnormalRange, fractionDigits }).toString()
				: faker.number.float({ min: Math.max(0, min - abnormalRange), max: Math.max(0.01, min - 0.1), fractionDigits }).toString();
		} else {
			// critical
			const isHigh = faker.datatype.boolean();
			const criticalRange = Math.max(range, 2); // At least 2 units difference for critical
			result = isHigh
				? faker.number.float({ min: max + criticalRange * 0.5, max: max + criticalRange, fractionDigits }).toString()
				: faker.number.float({ min: Math.max(0, min - criticalRange), max: Math.max(0.01, min - criticalRange * 0.5), fractionDigits }).toString();
		}
	} else if (testRef.normalRange.includes('Negatif')) {
		result = status === 'normal' ? 'Negatif' : 'Pozitif';
	} else {
		result = testRef.normalRange; // Default to normal range text
	}

	return {
		testName: testRef.testName,
		testType: testRef.testType,
		result,
		unit: testRef.unit,
		referenceRange: testRef.normalRange,
		status,
		category: testRef.category
	};
}

/**
 * Generate a medication prescription
 */
export function generateMedication(drugData?: DrugData): {
	name: string;
	dosage: string;
	frequency: string;
	duration: string;
	instructions: string;
} {
	if (!drugData) {
		drugData = faker.helpers.arrayElement(COMMON_DRUGS);
	}

	const dosage = faker.helpers.arrayElement(drugData.commonDosages);
	const frequency = faker.helpers.arrayElement(drugData.commonFrequencies);
	const duration = faker.helpers.arrayElement(drugData.commonDurations);

	const instructions = [
		'Tok karnına alınız',
		'Aç karnına alınız',
		'Yemekten sonra alınız',
		'Yemekten önce alınız',
		'Bol su ile alınız',
		'Gerektiğinde kullanınız',
		'Sabah akşam kullanınız'
	];

	return {
		name: `${drugData.name} (${drugData.genericName})`,
		dosage,
		frequency,
		duration,
		instructions: faker.helpers.arrayElement(instructions)
	};
}

/**
 * Generate vital signs
 */
export function generateVitalSigns(ageGroup: 'child' | 'adult' | 'elderly' = 'adult'): {
	temperature: number;
	bloodPressureSystolic: number;
	bloodPressureDiastolic: number;
	heartRate: number;
	respiratoryRate: number;
	oxygenSaturation: number;
	weight: number;
	height: number;
	bmi: number;
} {
	let temperature: number, systolic: number, diastolic: number, heartRate: number, respiratoryRate: number, weight: number, height: number;

	switch (ageGroup) {
		case 'child':
			temperature = faker.number.float({ min: 36.5, max: 37.2, fractionDigits: 1 });
			systolic = faker.number.int({ min: 90, max: 110 });
			diastolic = faker.number.int({ min: 50, max: 70 });
			heartRate = faker.number.int({ min: 80, max: 120 });
			respiratoryRate = faker.number.int({ min: 18, max: 25 });
			weight = faker.number.float({ min: 20, max: 50, fractionDigits: 1 });
			height = faker.number.int({ min: 120, max: 160 });
			break;
		case 'elderly':
			temperature = faker.number.float({ min: 36.3, max: 37.0, fractionDigits: 1 });
			systolic = faker.number.int({ min: 120, max: 150 });
			diastolic = faker.number.int({ min: 70, max: 95 });
			heartRate = faker.number.int({ min: 60, max: 85 });
			respiratoryRate = faker.number.int({ min: 14, max: 20 });
			weight = faker.number.float({ min: 55, max: 90, fractionDigits: 1 });
			height = faker.number.int({ min: 150, max: 180 });
			break;
		default: // adult
			temperature = faker.number.float({ min: 36.5, max: 37.2, fractionDigits: 1 });
			systolic = faker.number.int({ min: 100, max: 140 });
			diastolic = faker.number.int({ min: 60, max: 90 });
			heartRate = faker.number.int({ min: 60, max: 100 });
			respiratoryRate = faker.number.int({ min: 12, max: 20 });
			weight = faker.number.float({ min: 50, max: 120, fractionDigits: 1 });
			height = faker.number.int({ min: 150, max: 195 });
	}

	const heightInMeters = height / 100;
	const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
	const oxygenSaturation = faker.number.int({ min: 95, max: 100 });

	return {
		temperature,
		bloodPressureSystolic: systolic,
		bloodPressureDiastolic: diastolic,
		heartRate,
		respiratoryRate,
		oxygenSaturation,
		weight,
		height,
		bmi
	};
}

/**
 * Generate SOAP note templates
 */
export const SOAP_NOTE_TEMPLATES = {
	chiefComplaints: [
		'Baş ağrısı',
		'Karın ağrısı',
		'Öksürük ve balgam',
		'Ateş ve halsizlik',
		'Boğaz ağrısı',
		'Bel ağrısı',
		'Nefes darlığı',
		'Baş dönmesi',
		'Göğüs ağrısı',
		'Bulantı kusma',
		'İshal',
		'Eklem ağrısı',
		'Yorgunluk',
		'Uyku problemi',
		'Çarpıntı'
	],
	assessmentTemplates: [
		'Hasta genel durumu iyi, vital bulguları stabil.',
		'Fizik muayenede patolojik bulguya rastlanmadı.',
		'Hastanın şikayetleri değerlendirildi, tetkikler planlandı.',
		'Kronik hastalık takibi yapıldı, tedavi düzenlendi.',
		'Hasta semptomları ile uyumlu tanı konuldu.',
		'İlaç tedavisine yanıt değerlendirildi.',
		'Hasta stabil, ayaktan takip planlandı.',
		'Acil müdahale gerektiren durum saptanmadı.'
	],
	planTemplates: [
		'İlaç tedavisi başlandı, 1 hafta sonra kontrol önerildi.',
		'Tetkik sonuçları bekleniyor, sonuç geldiğinde değerlendirilecek.',
		'Mevcut tedavi devam edildi, 2 hafta sonra kontrol.',
		'Hasta bilgilendirildi, ihtiyaç halinde başvuru önerildi.',
		'Diyet ve yaşam tarzı değişiklikleri önerildi.',
		'Konsültasyon istendi, sonuç bekleniyor.',
		'Tedaviye yanıt iyi, mevcut tedavi ile devam.',
		'İleri tetkik ve görüntüleme planlandı.'
	]
};

/**
 * Generate a random chief complaint
 */
export function generateChiefComplaint(): string {
	return faker.helpers.arrayElement(SOAP_NOTE_TEMPLATES.chiefComplaints);
}

/**
 * Generate an assessment note
 */
export function generateAssessment(): string {
	return faker.helpers.arrayElement(SOAP_NOTE_TEMPLATES.assessmentTemplates);
}

/**
 * Generate a plan note
 */
export function generatePlan(): string {
	return faker.helpers.arrayElement(SOAP_NOTE_TEMPLATES.planTemplates);
}

/**
 * Generate multiple lab results for a panel
 */
export function generateLabPanel(category: 'CBC' | 'Metabolic' | 'Liver' | 'Lipid' | 'Thyroid' | 'Diabetes' | 'Urinalysis'): Array<ReturnType<typeof generateLabResult>> {
	const testsInCategory = LAB_TEST_REFERENCES.filter((test) => test.category === category);
	return testsInCategory.map((test) => generateLabResult(test));
}
