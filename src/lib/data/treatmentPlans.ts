/**
 * Treatment Plan Seed Data Generator
 * Generates 25+ realistic treatment plan records with various protocols and completion stages
 */

import { faker } from '@faker-js/faker';
import type { TreatmentPlan, TreatmentPlanStatus } from '$lib/types/treatmentPlan';
import { PREDEFINED_PROTOCOLS } from '$lib/types/treatmentPlan';

/**
 * Generate treatment plan seed data
 */
export function generateTreatmentPlanData(
	patientIds: string[],
	doctorIds: string[]
): TreatmentPlan[] {
	const plans: TreatmentPlan[] = [];
	const protocolKeys = Object.keys(PREDEFINED_PROTOCOLS);

	// Track patients with multiple plans
	const patientsWithPlans = new Map<string, number>();

	// Generate 25+ treatment plans with specific distribution
	// 10 in-progress physiotherapy plans
	for (let i = 0; i < 10; i++) {
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);
		const protocolKey = faker.helpers.arrayElement([
			'physiotherapy_standard',
			'physiotherapy_postop'
		]);
		const protocol = PREDEFINED_PROTOCOLS[protocolKey];

		const startDate = faker.date.between({
			from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
			to: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
		});

		// Various completion stages for in-progress plans (25% to 90%)
		const completionRate = faker.number.float({ min: 0.25, max: 0.9 });
		const completedSessions = Math.floor(protocol.sessionCount * completionRate);

		plans.push({
			id: crypto.randomUUID(),
			patientId,
			doctorId,
			diagnosisICD10: getRandomDiagnosisForProtocol(protocolKey),
			startDate,
			endDate: undefined,
			status: 'in-progress',
			totalSessions: protocol.sessionCount,
			completedSessions,
			protocol,
			createdAt: startDate,
			updatedAt: new Date()
		});

		patientsWithPlans.set(patientId, (patientsWithPlans.get(patientId) || 0) + 1);
	}

	// Generate 8 dental treatment plans
	for (let i = 0; i < 8; i++) {
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);
		const protocolKey = faker.helpers.arrayElement(['dental_treatment_phases', 'dental_implant']);
		const protocol = PREDEFINED_PROTOCOLS[protocolKey];

		// Mix of statuses for dental plans
		const statusOptions: Array<{ status: TreatmentPlanStatus; weight: number }> = [
			{ status: 'in-progress', weight: 0.5 },
			{ status: 'not-started', weight: 0.2 },
			{ status: 'completed', weight: 0.2 },
			{ status: 'on-hold', weight: 0.1 }
		];

		const randomValue = faker.number.float({ min: 0, max: 1 });
		let cumulativeWeight = 0;
		let selectedStatus: TreatmentPlanStatus = 'not-started';

		for (const option of statusOptions) {
			cumulativeWeight += option.weight;
			if (randomValue <= cumulativeWeight) {
				selectedStatus = option.status;
				break;
			}
		}

		const startDate = faker.date.between({
			from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
			to: new Date()
		});

		let completedSessions = 0;
		let endDate: Date | undefined = undefined;

		if (selectedStatus === 'in-progress') {
			completedSessions = faker.number.int({ min: 1, max: protocol.sessionCount - 1 });
		} else if (selectedStatus === 'completed') {
			completedSessions = protocol.sessionCount;
			endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + protocol.sessionCount * 7); // Approximate completion date
		} else if (selectedStatus === 'on-hold') {
			completedSessions = faker.number.int({ min: 1, max: Math.floor(protocol.sessionCount / 2) });
		}

		plans.push({
			id: crypto.randomUUID(),
			patientId,
			doctorId,
			diagnosisICD10: getRandomDiagnosisForProtocol(protocolKey),
			startDate,
			endDate,
			status: selectedStatus,
			totalSessions: protocol.sessionCount,
			completedSessions,
			protocol,
			createdAt: startDate,
			updatedAt: new Date()
		});

		patientsWithPlans.set(patientId, (patientsWithPlans.get(patientId) || 0) + 1);
	}

	// Generate 5 completed plans (various protocols)
	for (let i = 0; i < 5; i++) {
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);
		const protocolKey = faker.helpers.arrayElement(protocolKeys);
		const protocol = PREDEFINED_PROTOCOLS[protocolKey];

		const startDate = faker.date.between({
			from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
			to: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
		});

		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + protocol.sessionCount * 7); // Approximate completion

		plans.push({
			id: crypto.randomUUID(),
			patientId,
			doctorId,
			diagnosisICD10: getRandomDiagnosisForProtocol(protocolKey),
			startDate,
			endDate,
			status: 'completed',
			totalSessions: protocol.sessionCount,
			completedSessions: protocol.sessionCount,
			protocol,
			createdAt: startDate,
			updatedAt: endDate
		});

		patientsWithPlans.set(patientId, (patientsWithPlans.get(patientId) || 0) + 1);
	}

	// Generate 2 discontinued plans
	for (let i = 0; i < 2; i++) {
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);
		const protocolKey = faker.helpers.arrayElement(protocolKeys);
		const protocol = PREDEFINED_PROTOCOLS[protocolKey];

		const startDate = faker.date.between({
			from: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
			to: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
		});

		// Discontinued partway through
		const completedSessions = faker.number.int({ min: 1, max: Math.floor(protocol.sessionCount / 2) });

		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + completedSessions * 7);

		plans.push({
			id: crypto.randomUUID(),
			patientId,
			doctorId,
			diagnosisICD10: getRandomDiagnosisForProtocol(protocolKey),
			startDate,
			endDate,
			status: 'discontinued',
			totalSessions: protocol.sessionCount,
			completedSessions,
			protocol,
			createdAt: startDate,
			updatedAt: endDate
		});

		patientsWithPlans.set(patientId, (patientsWithPlans.get(patientId) || 0) + 1);
	}

	// Add some patients with multiple concurrent plans (2-3 patients)
	const patientsForMultiple = faker.helpers.shuffle(
		Array.from(patientIds).filter(id => !patientsWithPlans.has(id) || patientsWithPlans.get(id)! < 2)
	).slice(0, 3);

	for (const patientId of patientsForMultiple) {
		const doctorId = faker.helpers.arrayElement(doctorIds);

		// First plan: wound care
		const woundProtocolKey = faker.helpers.arrayElement([
			'wound_care_standard',
			'wound_care_diabetic'
		]);
		const woundProtocol = PREDEFINED_PROTOCOLS[woundProtocolKey];

		const woundStartDate = faker.date.between({
			from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			to: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
		});

		plans.push({
			id: crypto.randomUUID(),
			patientId,
			doctorId,
			diagnosisICD10: getRandomDiagnosisForProtocol(woundProtocolKey),
			startDate: woundStartDate,
			endDate: undefined,
			status: 'in-progress',
			totalSessions: woundProtocol.sessionCount,
			completedSessions: faker.number.int({ min: 2, max: Math.floor(woundProtocol.sessionCount / 2) }),
			protocol: woundProtocol,
			createdAt: woundStartDate,
			updatedAt: new Date()
		});

		// Second plan: physiotherapy (for the same patient)
		const physioProtocol = PREDEFINED_PROTOCOLS['physiotherapy_standard'];
		const physioStartDate = faker.date.between({
			from: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
			to: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
		});

		plans.push({
			id: crypto.randomUUID(),
			patientId,
			doctorId,
			diagnosisICD10: 'M79.3', // Musculoskeletal pain
			startDate: physioStartDate,
			endDate: undefined,
			status: 'in-progress',
			totalSessions: physioProtocol.sessionCount,
			completedSessions: faker.number.int({ min: 1, max: 5 }),
			protocol: physioProtocol,
			createdAt: physioStartDate,
			updatedAt: new Date()
		});
	}

	return plans;
}

/**
 * Get a random diagnosis ICD-10 code appropriate for the protocol
 */
function getRandomDiagnosisForProtocol(protocolKey: string): string {
	const diagnosisMap: Record<string, string[]> = {
		physiotherapy_standard: [
			'M54.5', // Low back pain
			'M25.5', // Joint pain
			'M79.3', // Myalgia
			'M75.1', // Rotator cuff syndrome
			'M77.9' // Enthesopathy, unspecified
		],
		physiotherapy_postop: [
			'M96.1', // Postlaminectomy syndrome
			'Z98.89', // Other specified postprocedural states
			'M25.57', // Pain in ankle and joints of foot
			'T84.9' // Complication of internal orthopedic prosthetic device
		],
		dental_treatment_phases: [
			'K02.9', // Dental caries, unspecified
			'K04.7', // Periapical abscess without sinus
			'K05.6', // Periodontal disease, unspecified
			'K08.1' // Loss of teeth due to accident
		],
		dental_implant: [
			'K08.1', // Loss of teeth due to accident
			'K08.4', // Partial loss of teeth
			'Z96.5' // Presence of tooth-root and mandibular implants
		],
		chemotherapy_standard: [
			'C50.9', // Malignant neoplasm of breast
			'C18.9', // Malignant neoplasm of colon
			'C34.9', // Malignant neoplasm of bronchus and lung
			'C61' // Malignant neoplasm of prostate
		],
		wound_care_standard: [
			'L89.9', // Pressure ulcer
			'T14.1', // Open wound
			'L98.4', // Chronic ulcer of skin
			'S01.9' // Open wound of head
		],
		wound_care_diabetic: [
			'E11.621', // Type 2 diabetes with foot ulcer
			'E11.622', // Type 2 diabetes with other skin ulcer
			'L97.9' // Non-pressure chronic ulcer
		]
	};

	const diagnoses = diagnosisMap[protocolKey] || ['Z00.00']; // General examination
	return faker.helpers.arrayElement(diagnoses);
}

/**
 * Export for use in seed data orchestrator
 */
export const seedTreatmentPlans = (patientIds: string[], doctorIds: string[]) =>
	generateTreatmentPlanData(patientIds, doctorIds);
