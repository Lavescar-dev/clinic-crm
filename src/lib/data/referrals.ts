/**
 * Referral Seed Data
 * Generates realistic referral data linking patients, doctors, and external facilities
 * Includes internal referrals (GP -> specialist) and external referrals (clinic -> external facility)
 */

import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';
import type { Referral, ExternalFacility } from '$lib/types/referral';
import { COMMON_EXTERNAL_FACILITIES } from '$lib/types/referral';

/**
 * Generate external facilities seed data
 */
export function generateExternalFacilities(): ExternalFacility[] {
	const facilities: ExternalFacility[] = [];
	const now = new Date();

	// Add common pre-defined facilities
	COMMON_EXTERNAL_FACILITIES.forEach((facility) => {
		facilities.push({
			id: nanoid(),
			...facility,
			createdAt: faker.date.between({ from: '2024-01-01', to: '2025-12-31' }),
			updatedAt: now
		});
	});

	return facilities;
}

/**
 * Generate referral seed data
 * Creates 30+ realistic referrals with various scenarios:
 * - Internal referrals (GP -> Specialist within clinic)
 * - External referrals (to imaging centers, specialized hospitals)
 * - Various statuses and urgency levels
 */
export function seedReferrals(
	patientIds: string[],
	doctorIds: string[],
	doctorSpecializations: Map<string, string>,
	doctorNames: Map<string, string>,
	patientNames: Map<string, string>
): Referral[] {
	if (patientIds.length === 0 || doctorIds.length === 0) {
		return [];
	}

	const referrals: Referral[] = [];
	const externalFacilities = generateExternalFacilities();

	// ICD-10 codes for common referral scenarios
	const referralScenarios = [
		{
			reason: 'Persistent chest pain with abnormal ECG findings. Requires cardiology evaluation for possible coronary artery disease.',
			fromDept: 'Dahiliye',
			toDept: 'Kardiyoloji',
			urgency: 'urgent' as const,
			diagnosisCodes: ['I20.0', 'I25.1'],
			clinicalSummary: 'Patient presents with chest pain radiating to left arm, elevated troponin levels',
			relevantTests: ['ECG', 'Troponin T', 'Lipid Panel']
		},
		{
			reason: 'Chronic knee pain with suspected meniscal tear. Orthopedic consultation needed for possible arthroscopy.',
			fromDept: 'Dahiliye',
			toDept: 'Ortopedi',
			urgency: 'routine' as const,
			diagnosisCodes: ['M23.2', 'M17.9'],
			clinicalSummary: 'Patient reports clicking sensation, joint line tenderness, positive McMurray test',
			relevantTests: ['Knee X-ray']
		},
		{
			reason: 'Recurrent severe headaches with visual disturbances. Neurology evaluation for possible migraine vs. other neurological pathology.',
			fromDept: 'Dahiliye',
			toDept: 'Nöroloji',
			urgency: 'urgent' as const,
			diagnosisCodes: ['G43.1', 'R51'],
			clinicalSummary: 'Severe throbbing headaches, photophobia, aura symptoms, no focal neurological signs',
			relevantTests: []
		},
		{
			reason: 'Pediatric growth delay and developmental concerns. Requires pediatric endocrinology assessment.',
			fromDept: 'Dahiliye',
			toDept: 'Pediatri',
			urgency: 'routine' as const,
			diagnosisCodes: ['E34.3', 'R62.52'],
			clinicalSummary: 'Height and weight below 5th percentile, delayed bone age',
			relevantTests: ['Growth hormone panel', 'Thyroid function']
		},
		{
			reason: 'Suspected skin malignancy. Requires dermatology evaluation and possible biopsy.',
			fromDept: 'Dahiliye',
			toDept: 'Dermatoloji',
			urgency: 'urgent' as const,
			diagnosisCodes: ['D23.9', 'L82'],
			clinicalSummary: 'Irregular pigmented lesion on back, asymmetric borders, recent changes',
			relevantTests: []
		},
		{
			reason: 'Complex abdominal pain with suspected appendicitis. Surgical evaluation needed.',
			fromDept: 'Acil Servis',
			toDept: 'Genel Cerrahi',
			urgency: 'stat' as const,
			diagnosisCodes: ['K35.80', 'R10.31'],
			clinicalSummary: 'RLQ pain, rebound tenderness, elevated WBC, positive Rovsing sign',
			relevantTests: ['CBC', 'Abdominal ultrasound']
		},
		{
			reason: 'Chronic sinusitis not responding to medical management. ENT consultation for possible surgical intervention.',
			fromDept: 'Dahiliye',
			toDept: 'Kulak Burun Boğaz',
			urgency: 'routine' as const,
			diagnosisCodes: ['J32.9', 'J01.90'],
			clinicalSummary: 'Recurrent sinus infections, facial pain, post-nasal drip, failed multiple antibiotic courses',
			relevantTests: ['Sinus CT']
		},
		{
			reason: 'Progressive vision loss and cataracts. Ophthalmology consultation for surgical planning.',
			fromDept: 'Dahiliye',
			toDept: 'Göz Hastalıkları',
			urgency: 'routine' as const,
			diagnosisCodes: ['H25.9', 'H26.9'],
			clinicalSummary: 'Bilateral cataracts, decreased visual acuity, glare symptoms',
			relevantTests: ['Visual acuity test']
		},
		{
			reason: 'Post-stroke rehabilitation. Requires physical therapy assessment and treatment plan.',
			fromDept: 'Nöroloji',
			toDept: 'Fizik Tedavi ve Rehabilitasyon',
			urgency: 'urgent' as const,
			diagnosisCodes: ['I63.9', 'G81.9'],
			clinicalSummary: 'Recent ischemic stroke, left-sided weakness, ambulatory with assistance',
			relevantTests: ['MRI Brain']
		}
	];

	// External referral scenarios
	const externalScenarios = [
		{
			reason: 'Complex cardiac imaging required for coronary artery evaluation. MRI with stress protocol needed.',
			urgency: 'urgent' as const,
			diagnosisCodes: ['I25.10', 'I20.9'],
			facilityIndex: 0, // University Hospital Imaging Center
			clinicalSummary: 'Abnormal stress test, chest pain, family history of CAD'
		},
		{
			reason: 'Newly diagnosed malignancy requiring oncology consultation and treatment planning.',
			urgency: 'urgent' as const,
			diagnosisCodes: ['C50.9', 'C79.9'],
			facilityIndex: 1, // Regional Oncology Center
			clinicalSummary: 'Biopsy-confirmed breast cancer, staging required'
		},
		{
			reason: 'Complex cardiac arrhythmia requiring electrophysiology study and possible ablation.',
			urgency: 'urgent' as const,
			diagnosisCodes: ['I47.1', 'I48.91'],
			facilityIndex: 2, // City Cardiac Institute
			clinicalSummary: 'Recurrent SVT episodes, medication refractory'
		},
		{
			reason: 'Severe osteoarthritis requiring total knee replacement evaluation.',
			urgency: 'routine' as const,
			diagnosisCodes: ['M17.0', 'M17.1'],
			facilityIndex: 3, // Specialty Orthopedic Clinic
			clinicalSummary: 'Bilateral knee pain, limited mobility, failed conservative management'
		},
		{
			reason: 'Intractable seizures requiring advanced neurological evaluation and possible surgery.',
			urgency: 'urgent' as const,
			diagnosisCodes: ['G40.909', 'G40.119'],
			facilityIndex: 4, // Advanced Neurology Associates
			clinicalSummary: 'Multiple medication trials failed, frequent seizures affecting quality of life'
		},
		{
			reason: 'Pediatric congenital heart defect requiring specialized cardiac surgery.',
			urgency: 'stat' as const,
			diagnosisCodes: ['Q21.0', 'Q21.1'],
			facilityIndex: 5, // Children\'s Hospital Pediatric Specialists
			clinicalSummary: 'Ventricular septal defect, symptoms of heart failure'
		}
	];

	// Select general practitioners (Dahiliye) as primary referring doctors
	const gpDoctors = Array.from(doctorSpecializations.entries())
		.filter(([_, spec]) => spec === 'Dahiliye')
		.map(([id, _]) => id);
	const referringDoctors = gpDoctors.length > 0 ? gpDoctors : doctorIds;

	// Create map of specialization to doctor IDs
	const specialtyDoctorMap = new Map<string, string[]>();
	doctorSpecializations.forEach((spec, docId) => {
		if (!specialtyDoctorMap.has(spec)) {
			specialtyDoctorMap.set(spec, []);
		}
		specialtyDoctorMap.get(spec)!.push(docId);
	});

	const now = new Date();

	// Generate internal referrals (20 referrals)
	for (let i = 0; i < 20; i++) {
		const scenario = faker.helpers.arrayElement(referralScenarios);
		const patientId = faker.helpers.arrayElement(patientIds);
		const fromDoctorId = faker.helpers.arrayElement(referringDoctors);

		// Find a doctor with the target specialization
		const specialtyDoctors = specialtyDoctorMap.get(scenario.toDept);
		const targetDoctors = specialtyDoctors && specialtyDoctors.length > 0
			? specialtyDoctors
			: doctorIds;
		const toDoctorId = faker.helpers.arrayElement(targetDoctors);

		// Determine status based on creation date
		const createdDaysAgo = faker.number.int({ min: 1, max: 90 });
		const createdAt = new Date(now);
		createdAt.setDate(now.getDate() - createdDaysAgo);

		let status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired';
		let respondedBy: string | undefined;
		let response: string | undefined;
		let responseDate: Date | undefined;
		let appointmentScheduled = false;
		let appointmentDate: Date | undefined;

		if (createdDaysAgo < 3) {
			// Recent referrals - mostly pending
			status = faker.helpers.weightedArrayElement([
				{ value: 'pending' as const, weight: 8 },
				{ value: 'accepted' as const, weight: 2 }
			]);
		} else if (createdDaysAgo < 14) {
			// Mid-range - mostly accepted, some pending
			status = faker.helpers.weightedArrayElement([
				{ value: 'accepted' as const, weight: 7 },
				{ value: 'pending' as const, weight: 2 },
				{ value: 'completed' as const, weight: 1 }
			]);
		} else {
			// Older referrals - mostly completed
			status = faker.helpers.weightedArrayElement([
				{ value: 'completed' as const, weight: 7 },
				{ value: 'accepted' as const, weight: 2 },
				{ value: 'rejected' as const, weight: 1 }
			]);
		}

		// Set response data for non-pending referrals
		if (status !== 'pending') {
			respondedBy = toDoctorId;
			responseDate = new Date(createdAt);
			responseDate.setDate(createdAt.getDate() + faker.number.int({ min: 1, max: 3 }));

			if (status === 'accepted') {
				response = faker.helpers.arrayElement([
					'Referral accepted. Patient scheduled for consultation.',
					'Will evaluate patient. Appointment scheduled.',
					'Accepted for evaluation. Please send relevant imaging.',
					'Confirmed. Patient added to clinic schedule.'
				]);
				appointmentScheduled = true;
				appointmentDate = new Date(responseDate);
				appointmentDate.setDate(responseDate.getDate() + faker.number.int({ min: 3, max: 14 }));
			} else if (status === 'rejected') {
				response = faker.helpers.arrayElement([
					'Patient does not meet criteria for specialty consultation at this time.',
					'Recommend completing additional workup before referral.',
					'This can be managed in primary care. Specialty consultation not indicated.',
					'Please optimize medical management first.'
				]);
			} else if (status === 'completed') {
				response = 'Patient evaluated and treatment plan established.';
				appointmentScheduled = true;
				appointmentDate = new Date(responseDate);
				appointmentDate.setDate(responseDate.getDate() + faker.number.int({ min: 7, max: 21 }));
			}
		}

		referrals.push({
			id: nanoid(),
			patientId,
			patientName: patientNames.get(patientId),
			fromDoctorId,
			fromDoctorName: doctorNames.get(fromDoctorId),
			fromDepartment: scenario.fromDept,
			toDoctorId,
			toDoctorName: doctorNames.get(toDoctorId),
			toDepartment: scenario.toDept,
			reason: scenario.reason,
			urgency: scenario.urgency,
			status,
			appointmentScheduled,
			appointmentDate,
			clinicalSummary: scenario.clinicalSummary,
			diagnosisCodes: scenario.diagnosisCodes,
			relevantTests: scenario.relevantTests,
			medications: faker.helpers.maybe(
				() =>
					faker.helpers.arrayElements(
						['Lisinopril 10mg', 'Metformin 500mg', 'Atorvastatin 20mg', 'Aspirin 81mg'],
						faker.number.int({ min: 1, max: 3 })
					),
				{ probability: 0.6 }
			) || [],
			response,
			responseDate,
			respondedBy,
			notes: faker.helpers.maybe(() => 'Patient informed of referral. Contact information provided.', {
				probability: 0.4
			}),
			expiresAt: scenario.urgency === 'stat' || scenario.urgency === 'urgent'
				? new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
				: undefined,
			createdAt,
			updatedAt: responseDate || createdAt
		});
	}

	// Generate external referrals (12 referrals)
	for (let i = 0; i < 12; i++) {
		const scenario = faker.helpers.arrayElement(externalScenarios);
		const patientId = faker.helpers.arrayElement(patientIds);
		const fromDoctorId = faker.helpers.arrayElement(referringDoctors);
		const facility = externalFacilities[scenario.facilityIndex];

		const createdDaysAgo = faker.number.int({ min: 1, max: 60 });
		const createdAt = new Date(now);
		createdAt.setDate(now.getDate() - createdDaysAgo);

		let status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired';
		let response: string | undefined;
		let responseDate: Date | undefined;

		// External referrals are typically pending or completed (no real-time integration)
		if (createdDaysAgo < 7) {
			status = 'pending';
		} else if (createdDaysAgo < 21) {
			status = faker.helpers.arrayElement(['pending', 'accepted']);
			if (status === 'accepted') {
				response = 'External facility contacted patient. Appointment scheduled directly with facility.';
				responseDate = new Date(createdAt);
				responseDate.setDate(createdAt.getDate() + faker.number.int({ min: 3, max: 7 }));
			}
		} else {
			status = faker.helpers.arrayElement(['completed', 'accepted']);
			response = status === 'completed'
				? 'Patient evaluated at external facility. Report received.'
				: 'External facility contacted patient. Appointment scheduled.';
			responseDate = new Date(createdAt);
			responseDate.setDate(createdAt.getDate() + faker.number.int({ min: 5, max: 14 }));
		}

		referrals.push({
			id: nanoid(),
			patientId,
			patientName: patientNames.get(patientId),
			fromDoctorId,
			fromDoctorName: doctorNames.get(fromDoctorId),
			fromDepartment: 'Dahiliye',
			externalFacility: facility,
			reason: scenario.reason,
			urgency: scenario.urgency,
			status,
			appointmentScheduled: false, // External appointments tracked separately
			clinicalSummary: scenario.clinicalSummary,
			diagnosisCodes: scenario.diagnosisCodes,
			relevantTests: [],
			medications: faker.helpers.arrayElements(
				['Lisinopril 10mg', 'Metformin 500mg', 'Atorvastatin 20mg'],
				faker.number.int({ min: 0, max: 2 })
			),
			response,
			responseDate,
			notes: 'Referral letter sent to external facility. Patient given contact information.',
			expiresAt: scenario.urgency === 'stat'
				? new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days for stat
				: scenario.urgency === 'urgent'
					? new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days for urgent
					: undefined,
			createdAt,
			updatedAt: responseDate || createdAt
		});
	}

	return referrals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
