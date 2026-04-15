/**
 * Prescription Seed Data Generator
 * Generates 120+ realistic prescription records with drug interactions and various scenarios
 */

import { faker } from '@faker-js/faker';
import type { PrescriptionTracking, PrescriptionMedication } from '$lib/types/prescription';
import { DRUG_DATABASE, findDrugInteractions } from '$lib/types/prescription';

/**
 * Generate prescription seed data
 */
export function generatePrescriptionData(
	patientIds: string[],
	doctorIds: string[],
	appointmentIds: string[],
	userNames: Map<string, string>
): PrescriptionTracking[] {
	const prescriptions: PrescriptionTracking[] = [];
	const drugIds = Object.keys(DRUG_DATABASE);

	// Generate 120+ prescriptions
	const targetCount = 120 + faker.number.int({ min: 0, max: 30 });

	// Common chronic medications for ongoing prescriptions
	const chronicMedications = [
		'amlodipine',
		'lisinopril',
		'losartan',
		'metoprolol',
		'atorvastatin',
		'metformin',
		'hydrochlorothiazide',
		'sertraline',
		'fluoxetine',
		'escitalopram'
	];

	// Track patients with chronic conditions for realistic ongoing prescriptions
	const chronicPatients = new Map<string, string[]>();

	for (let i = 0; i < targetCount; i++) {
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);
		const appointmentId = faker.helpers.arrayElement([
			...appointmentIds,
			undefined,
			undefined
		]); // Some prescriptions not linked to appointments

		const issuedAt = faker.date.between({
			from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
			to: new Date()
		});

		// Determine if this is a chronic medication prescription (30% chance)
		const isChronic = faker.datatype.boolean(0.3);

		let medications: PrescriptionMedication[] = [];

		if (isChronic) {
			// For chronic conditions, use ongoing medications
			const existingMeds = chronicPatients.get(patientId) || [];

			if (existingMeds.length === 0) {
				// New chronic patient - assign 1-3 chronic medications
				const numMeds = faker.number.int({ min: 1, max: 3 });
				const selectedMeds = faker.helpers
					.shuffle(chronicMedications)
					.slice(0, numMeds);

				chronicPatients.set(patientId, selectedMeds);
				medications = selectedMeds.map((drugId) => generateMedication(drugId, true));
			} else {
				// Refill existing chronic medications
				medications = existingMeds.map((drugId) => generateMedication(drugId, true));
			}
		} else {
			// Acute condition - prescribe 1-3 medications
			const numMeds = faker.number.int({ min: 1, max: 3 });

			// Choose appropriate medications (avoid duplicates in same prescription)
			const selectedDrugs = faker.helpers.shuffle(drugIds).slice(0, numMeds);
			medications = selectedDrugs.map((drugId) => generateMedication(drugId, false));
		}

		// Determine prescription status and dates
		let status: 'active' | 'filled' | 'expired' | 'cancelled';
		let validUntil: Date;
		let pharmacyFilled: PrescriptionTracking['pharmacyFilled'];

		// Calculate valid until date (typically 30-90 days for chronic, 7-30 days for acute)
		const daysValid = isChronic
			? faker.number.int({ min: 60, max: 90 })
			: faker.number.int({ min: 7, max: 30 });

		validUntil = new Date(issuedAt);
		validUntil.setDate(validUntil.getDate() + daysValid);

		// Determine status based on dates and randomness
		const now = new Date();
		if (validUntil < now) {
			// Past expiration date
			status = faker.helpers.weightedArrayElement([
				{ weight: 70, value: 'filled' as const },
				{ weight: 25, value: 'expired' as const },
				{ weight: 5, value: 'cancelled' as const }
			]);
		} else {
			// Still valid
			status = faker.helpers.weightedArrayElement([
				{ weight: 60, value: 'filled' as const },
				{ weight: 35, value: 'active' as const },
				{ weight: 5, value: 'cancelled' as const }
			]);
		}

		// If filled, add pharmacy information
		if (status === 'filled') {
			const pharmacyNames = [
				'Eczane Plus',
				'Sağlık Eczanesi',
				'Yeşil Eczane',
				'Kardelen Eczanesi',
				'Yaşam Eczanesi',
				'Şifa Eczanesi',
				'Merkez Eczane',
				'Gültepe Eczanesi'
			];

			const filledDate = faker.date.between({
				from: issuedAt,
				to: validUntil < now ? validUntil : now
			});

			pharmacyFilled = {
				pharmacyName: faker.helpers.arrayElement(pharmacyNames),
				pharmacyId: faker.string.alphanumeric(10),
				filledAt: filledDate,
				pharmacistName: faker.person.fullName()
			};
		}

		// Generate ICD-10 diagnosis codes for context
		const diagnosisCodes = [
			{ code: 'I10', name: 'Essential (primary) hypertension' },
			{ code: 'E11.9', name: 'Type 2 diabetes mellitus without complications' },
			{ code: 'J06.9', name: 'Acute upper respiratory infection' },
			{ code: 'M25.5', name: 'Pain in joint' },
			{ code: 'J02.9', name: 'Acute pharyngitis' },
			{ code: 'R51', name: 'Headache' },
			{ code: 'K21.9', name: 'Gastro-esophageal reflux disease' },
			{ code: 'F41.9', name: 'Anxiety disorder' },
			{ code: 'F32.9', name: 'Depressive episode' },
			{ code: 'E78.5', name: 'Hyperlipidemia' },
			{ code: 'J45.9', name: 'Asthma' },
			{ code: 'N39.0', name: 'Urinary tract infection' },
			{ code: 'L30.9', name: 'Dermatitis' }
		];

		const diagnosis = faker.helpers.arrayElement(diagnosisCodes);

		const prescriptionNumber = `RX-${issuedAt.getFullYear()}-${String(i + 1).padStart(6, '0')}`;

		const prescription: PrescriptionTracking = {
			id: faker.string.uuid(),
			prescriptionNumber,
			patientId,
			patientName: userNames.get(patientId),
			appointmentId,
			doctorId,
			doctorName: userNames.get(doctorId),
			medications,
			diagnosisICD10: diagnosis.code,
			diagnosisName: diagnosis.name,
			issuedAt,
			validUntil,
			status,
			pharmacyFilled,
			notes: faker.helpers.maybe(
				() =>
					faker.helpers.arrayElement([
						'Patient advised to take with food',
						'Monitor blood pressure regularly',
						'Follow-up in 2 weeks',
						'Continue current regimen',
						'Call if symptoms worsen',
						'Complete full course of treatment',
						'May cause drowsiness - avoid driving'
					]),
				{ probability: 0.3 }
			),
			createdAt: issuedAt,
			updatedAt: status === 'filled' && pharmacyFilled ? pharmacyFilled.filledAt : issuedAt
		};

		prescriptions.push(prescription);
	}

	// Create some interaction scenarios (patients with multiple active prescriptions that interact)
	const interactionScenarios = [
		// Scenario 1: Warfarin + Aspirin (major bleeding risk)
		{ drugs: ['warfarin', 'aspirin'], severity: 'major' },
		// Scenario 2: SSRI + NSAID (GI bleeding risk)
		{ drugs: ['sertraline', 'ibuprofen'], severity: 'moderate' },
		// Scenario 3: Tramadol + SSRI (serotonin syndrome risk)
		{ drugs: ['tramadol', 'fluoxetine'], severity: 'major' },
		// Scenario 4: ACE inhibitor + ARB (dual blockade)
		{ drugs: ['lisinopril', 'losartan'], severity: 'major' }
	];

	// Add 10-15 prescriptions with known interactions
	const interactionCount = faker.number.int({ min: 10, max: 15 });
	for (let i = 0; i < interactionCount; i++) {
		const scenario = faker.helpers.arrayElement(interactionScenarios);
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);

		const now = new Date();
		const issuedAt1 = faker.date.recent({ days: 60 });
		const issuedAt2 = faker.date.between({ from: issuedAt1, to: now });

		// Create two separate prescriptions for the same patient
		for (let j = 0; j < 2; j++) {
			const drugId = scenario.drugs[j];
			const issuedAt = j === 0 ? issuedAt1 : issuedAt2;

			const validUntil = new Date(issuedAt);
			validUntil.setDate(validUntil.getDate() + 90);

			const prescriptionNumber = `RX-${issuedAt.getFullYear()}-${String(prescriptions.length + 1).padStart(6, '0')}`;

			const prescription: PrescriptionTracking = {
				id: faker.string.uuid(),
				prescriptionNumber,
				patientId,
				patientName: userNames.get(patientId),
				appointmentId: undefined,
				doctorId,
				doctorName: userNames.get(doctorId),
				medications: [generateMedication(drugId, true)],
				diagnosisICD10: 'I10',
				diagnosisName: 'Essential (primary) hypertension',
				issuedAt,
				validUntil,
				status: 'active',
				notes: j === 1 ? '⚠️ Check for drug interactions with existing medications' : undefined,
				createdAt: issuedAt,
				updatedAt: issuedAt
			};

			prescriptions.push(prescription);
		}
	}

	// Sort prescriptions by issued date (most recent first)
	prescriptions.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

	// Log statistics
	const stats = {
		total: prescriptions.length,
		active: prescriptions.filter((p) => p.status === 'active').length,
		filled: prescriptions.filter((p) => p.status === 'filled').length,
		expired: prescriptions.filter((p) => p.status === 'expired').length,
		cancelled: prescriptions.filter((p) => p.status === 'cancelled').length,
		withInteractions: 0
	};

	// Count prescriptions with interactions
	let withInteractions = 0;
	const patientPrescriptions = new Map<string, PrescriptionTracking[]>();
	prescriptions.forEach((p) => {
		if (!patientPrescriptions.has(p.patientId)) {
			patientPrescriptions.set(p.patientId, []);
		}
		patientPrescriptions.get(p.patientId)!.push(p);
	});

	patientPrescriptions.forEach((pxs) => {
		const activePxs = pxs.filter((p) => p.status === 'active');
		if (activePxs.length > 1) {
			const allMeds = activePxs.flatMap((p) => p.medications.map((m) => m.drugName));
			const interactions = findDrugInteractions(allMeds);
			if (interactions.length > 0) {
				withInteractions++;
			}
		}
	});

	stats.withInteractions = withInteractions;

	console.log('💊 Prescription Statistics:');
	console.log(`   Total: ${stats.total}`);
	console.log(`   Active: ${stats.active}`);
	console.log(`   Filled: ${stats.filled}`);
	console.log(`   Expired: ${stats.expired}`);
	console.log(`   Cancelled: ${stats.cancelled}`);
	console.log(`   Patients with interaction warnings: ${stats.withInteractions}`);

	return prescriptions;
}

/**
 * Generate a single medication based on drug database
 */
function generateMedication(
	drugId: string,
	isChronic: boolean
): PrescriptionMedication {
	const drug = DRUG_DATABASE[drugId];

	if (!drug) {
		throw new Error(`Drug not found: ${drugId}`);
	}

	const dosage = faker.helpers.arrayElement(drug.commonDosages);
	const form = faker.helpers.arrayElement(drug.forms);
	const frequency = faker.helpers.arrayElement(drug.commonFrequencies);

	// Duration varies based on whether it's chronic or acute
	let duration: string;
	if (isChronic) {
		duration = faker.helpers.arrayElement(['30 days', '60 days', '90 days', 'ongoing']);
	} else {
		if (drug.standardDuration) {
			duration = drug.standardDuration;
		} else {
			duration = faker.helpers.arrayElement([
				'7 days',
				'10 days',
				'14 days',
				'21 days',
				'30 days'
			]);
		}
	}

	// Calculate quantity based on duration and frequency
	let quantity: number;
	const durationDays = parseInt(duration) || 30;

	// Estimate pills per day from frequency
	let pillsPerDay = 1;
	if (frequency.includes('twice')) pillsPerDay = 2;
	if (frequency.includes('three times') || frequency.includes('every 8 hours'))
		pillsPerDay = 3;
	if (frequency.includes('four times') || frequency.includes('every 6 hours'))
		pillsPerDay = 4;

	quantity = durationDays * pillsPerDay;

	// Add some extra for safety (10-20%)
	quantity = Math.ceil(quantity * faker.number.float({ min: 1.1, max: 1.2 }));

	// Instructions
	const instructions = faker.helpers.arrayElement([
		undefined,
		'Take with food',
		'Take on empty stomach',
		'Take with water',
		'Take before bedtime',
		'Take in the morning',
		'Take as needed for symptoms',
		'Do not crush or chew',
		'Swallow whole'
	]);

	return {
		drugName: drug.brandName,
		genericName: drug.genericName,
		dosage,
		form,
		frequency,
		duration,
		quantity,
		instructions,
		warnings: faker.helpers.maybe(() => drug.commonWarnings.slice(0, 2), {
			probability: 0.4
		}) || [],
		refillsAllowed: isChronic ? faker.number.int({ min: 2, max: 11 }) : 0
	};
}
