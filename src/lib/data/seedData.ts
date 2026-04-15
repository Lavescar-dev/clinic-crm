/**
 * Comprehensive Seed Data Generator
 *
 * Generates 50+ interconnected patient records with complete profiles,
 * appointments, EMR records, and staff members using realistic Turkish data.
 *
 * This module creates a cohesive dataset with:
 * - 50-60 patients with demographics, contact info, insurance
 * - 30+ staff members (doctors, nurses, receptionists, lab techs, admins)
 * - 200+ appointments spanning last 6 months with various statuses
 * - 100+ EMR records with vitals, diagnoses, prescriptions, lab results
 * - Realistic interconnections showing continuity of care
 */

import { browser } from '$app/environment';
import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';
import type { Patient } from '$lib/types/patient';
import type { User } from '$lib/types/user';
import type { Appointment } from '$lib/types/appointment';
import type { MedicalRecord, Diagnosis, Prescription, LabResult as EmrLabResult, Medication } from '$lib/types/emr';
import {
	generateTurkishFullName,
	generateTCKimlikNo,
	generateTurkishAddress,
	generateTurkishPhoneNumber,
	generateTurkishEmail,
	generateBirthDate,
	generateEmergencyContact,
	generateTimeString
} from '$lib/utils/dataGenerator';
import {
	generateDiagnosis,
	generateVitalSigns,
	generateMedication,
	generateLabResult,
	generateChiefComplaint,
	generateAssessment,
	generatePlan,
	generateLabPanel,
	ICD10_CODES,
	COMMON_DRUGS
} from '$lib/utils/medicalDataGenerator';
import { generateLabOrderData } from './lab';
import type { LabOrder, LabSample, LabResult as LabTestResult } from '$lib/types/lab';
import { generatePrescriptionData } from './prescription';
import type { PrescriptionTracking } from '$lib/types/prescription';

// ============================================================================
// STAFF GENERATION (30+ staff members)
// ============================================================================

const SPECIALIZATIONS = [
	'Dahiliye', 'Kardiyoloji', 'Ortopedi', 'Nöroloji', 'Pediatri',
	'Genel Cerrahi', 'Göz Hastalıkları', 'Kulak Burun Boğaz', 'Dermatoloji',
	'Fizik Tedavi ve Rehabilitasyon'
];

const DEPARTMENTS = [
	'Yönetim', 'Dahiliye', 'Cerrahi', 'Hemşirelik', 'Resepsiyon',
	'Laboratuvar', 'Radyoloji', 'Eczane', 'Acil Servis'
];

function generateStaffMember(role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist'): User {
	const gender = faker.helpers.arrayElement(['male', 'female'] as const);
	const name = generateTurkishFullName(gender);
	const email = generateTurkishEmail(name.firstName, name.lastName);
	const address = generateTurkishAddress();
	const phone = generateTurkishPhoneNumber();

	const baseUser: User = {
		id: nanoid(),
		email: email.toLowerCase(),
		firstName: name.firstName,
		lastName: name.lastName,
		fullName: name.fullName,
		role,
		status: 'active',
		contact: {
			phone,
			email,
			address: {
				street: address.street,
				city: address.city,
				state: address.state,
				district: address.district,
				zipCode: address.zipCode,
				country: address.country
			}
		},
		permissions: [],
		createdAt: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }),
		updatedAt: new Date()
	};

	// Role-specific fields
	if (role === 'doctor') {
		const specialization = faker.helpers.arrayElement(SPECIALIZATIONS);
		baseUser.specialization = specialization;
		baseUser.licenseNumber = `TR-${specialization.substring(0, 3).toUpperCase()}-${faker.number.int({ min: 10000, max: 99999 })}`;
		baseUser.department = specialization;

		// Generate working hours (5 days a week, 8-9 hours per day)
		const startHour = faker.helpers.arrayElement([8, 9, 10]);
		const endHour = startHour + faker.helpers.arrayElement([8, 9]);
		baseUser.workingHours = {
			monday: [{ start: `${startHour.toString().padStart(2, '0')}:00`, end: `${endHour.toString().padStart(2, '0')}:00` }],
			tuesday: [{ start: `${startHour.toString().padStart(2, '0')}:00`, end: `${endHour.toString().padStart(2, '0')}:00` }],
			wednesday: [{ start: `${startHour.toString().padStart(2, '0')}:00`, end: `${endHour.toString().padStart(2, '0')}:00` }],
			thursday: [{ start: `${startHour.toString().padStart(2, '0')}:00`, end: `${endHour.toString().padStart(2, '0')}:00` }],
			friday: [{ start: `${startHour.toString().padStart(2, '0')}:00`, end: `${(endHour - 2).toString().padStart(2, '0')}:00` }]
		};
	} else {
		baseUser.department = faker.helpers.arrayElement(DEPARTMENTS);
	}

	return baseUser;
}

export function generateStaff(): User[] {
	const staff: User[] = [];

	// 1 Admin
	staff.push(generateStaffMember('admin'));

	// 15 Doctors (diverse specializations)
	for (let i = 0; i < 15; i++) {
		staff.push(generateStaffMember('doctor'));
	}

	// 10 Nurses
	for (let i = 0; i < 10; i++) {
		staff.push(generateStaffMember('nurse'));
	}

	// 3 Receptionists
	for (let i = 0; i < 3; i++) {
		staff.push(generateStaffMember('receptionist'));
	}

	// 2 Pharmacists
	for (let i = 0; i < 2; i++) {
		staff.push(generateStaffMember('pharmacist'));
	}

	return staff;
}

// ============================================================================
// PATIENT GENERATION (50-60 patients with complete profiles)
// ============================================================================

function generatePatient(): Patient {
	const gender = faker.helpers.arrayElement(['male', 'female'] as const);
	const name = generateTurkishFullName(gender);
	const tcNo = generateTCKimlikNo();

	// Generate age-appropriate birth date
	const ageGroup = faker.helpers.weightedArrayElement([
		{ value: 'child' as const, weight: 1 },
		{ value: 'adult' as const, weight: 6 },
		{ value: 'elderly' as const, weight: 3 }
	]);

	let minAge = 18, maxAge = 65;
	if (ageGroup === 'child') {
		minAge = 5;
		maxAge = 17;
	} else if (ageGroup === 'elderly') {
		minAge = 65;
		maxAge = 85;
	}

	const birthDate = generateBirthDate(minAge, maxAge);
	const address = generateTurkishAddress();
	const phone = generateTurkishPhoneNumber();
	const email = generateTurkishEmail(name.firstName, name.lastName);
	const emergencyContact = generateEmergencyContact();

	// Insurance
	const insuranceType = faker.helpers.weightedArrayElement([
		{ value: 'sgk' as const, weight: 7 },
		{ value: 'private' as const, weight: 2 },
		{ value: 'none' as const, weight: 1 }
	]);

	const insuranceCompanies = ['Axa Sigorta', 'Allianz', 'Anadolu Sigorta', 'Mapfre Sigorta', 'Groupama Sigorta'];

	// Medical history (some patients have chronic conditions)
	const hasChronicCondition = faker.datatype.boolean({ probability: 0.3 });
	const medicalHistory = {
		allergies: faker.helpers.maybe(() =>
			faker.helpers.arrayElements(['Penisilin', 'Polen', 'Fıstık', 'Laktoz'], faker.number.int({ min: 0, max: 2 })),
			{ probability: 0.2 }
		) || [],
		pastIllnesses: hasChronicCondition
			? faker.helpers.arrayElements(['Hipertansiyon', 'Diyabet', 'Astım', 'Migren'], faker.number.int({ min: 1, max: 2 }))
			: [],
		surgeries: faker.helpers.maybe(() =>
			faker.helpers.arrayElements(['Apendektomi', 'Safra kesesi ameliyatı', 'Ortopedik cerrahi'], faker.number.int({ min: 1, max: 2 })),
			{ probability: 0.15 }
		) || [],
		medications: hasChronicCondition
			? faker.helpers.arrayElements(COMMON_DRUGS.map(d => d.name), faker.number.int({ min: 1, max: 3 }))
			: []
	};

	return {
		id: nanoid(),
		tcNo,
		firstName: name.firstName,
		lastName: name.lastName,
		fullName: name.fullName,
		birthDate,
		gender,
		bloodType: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const),
		status: faker.helpers.weightedArrayElement([
			{ value: 'active' as const, weight: 9 },
			{ value: 'inactive' as const, weight: 1 }
		]),
		contact: {
			phone,
			email,
			address: {
				street: address.street,
				city: address.city,
				state: address.state,
				district: address.district,
				zipCode: address.zipCode,
				country: address.country
			}
		},
		emergencyContact: {
			name: emergencyContact.name,
			relationship: emergencyContact.relationship,
			phone: emergencyContact.phone
		},
		insurance: {
			type: insuranceType,
			company: insuranceType === 'private' ? faker.helpers.arrayElement(insuranceCompanies) : insuranceType === 'sgk' ? 'SGK' : undefined,
			provider: insuranceType === 'private' ? faker.helpers.arrayElement(insuranceCompanies) : undefined,
			policyNumber: insuranceType !== 'none' ? faker.string.alphanumeric(10).toUpperCase() : undefined
		},
		medicalHistory,
		createdAt: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }),
		updatedAt: new Date()
	};
}

export function generatePatients(count: number = 55): Patient[] {
	const patients: Patient[] = [];
	for (let i = 0; i < count; i++) {
		patients.push(generatePatient());
	}
	return patients;
}

// ============================================================================
// APPOINTMENT GENERATION (200+ appointments over 6 months)
// ============================================================================

function generateAppointment(
	patient: Patient,
	doctors: User[],
	appointmentDate: Date,
	previousAppointments: Appointment[]
): Appointment {
	const doctor = faker.helpers.arrayElement(doctors.filter(d => d.role === 'doctor'));

	// Determine appointment type based on patient history
	const patientAppointmentCount = previousAppointments.filter(a => a.patientId === patient.id).length;
	let appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup';

	if (patientAppointmentCount === 0) {
		appointmentType = 'consultation';
	} else if (patientAppointmentCount > 5) {
		appointmentType = faker.helpers.weightedArrayElement([
			{ value: 'follow-up' as const, weight: 6 },
			{ value: 'routine-checkup' as const, weight: 3 },
			{ value: 'emergency' as const, weight: 1 }
		]);
	} else {
		appointmentType = faker.helpers.weightedArrayElement([
			{ value: 'consultation' as const, weight: 4 },
			{ value: 'follow-up' as const, weight: 4 },
			{ value: 'routine-checkup' as const, weight: 2 }
		]);
	}

	// Generate time based on doctor's working hours
	const startTime = generateTimeString(8, 17);
	const duration = faker.helpers.arrayElement([15, 30, 45, 60]);
	const [hours, minutes] = startTime.split(':').map(Number);
	const endMinutes = minutes + duration;
	const endHours = hours + Math.floor(endMinutes / 60);
	const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

	// Status depends on appointment date (past vs future)
	const now = new Date();
	let status: Appointment['status'];

	if (appointmentDate > now) {
		status = faker.helpers.weightedArrayElement([
			{ value: 'scheduled' as const, weight: 6 },
			{ value: 'confirmed' as const, weight: 4 }
		]);
	} else {
		status = faker.helpers.weightedArrayElement([
			{ value: 'completed' as const, weight: 8 },
			{ value: 'cancelled' as const, weight: 1 },
			{ value: 'no-show' as const, weight: 1 }
		]);
	}

	// Reason based on type
	const consultationReasons = [
		'Baş ağrısı şikayeti', 'Karın ağrısı', 'Öksürük ve ateş', 'Bel ağrısı',
		'Göğüs ağrısı', 'Nefes darlığı', 'Yorgunluk ve halsizlik', 'Eklem ağrısı'
	];
	const followUpReasons = [
		'Kontrol muayenesi', 'İlaç tedavisi takibi', 'Tetkik sonuçları değerlendirmesi',
		'Kronik hastalık takibi', 'Ameliyat sonrası kontrol'
	];
	const routineReasons = ['Yıllık check-up', 'Genel sağlık kontrolü', 'Periyodik muayene'];

	let reason: string;
	if (appointmentType === 'consultation' || appointmentType === 'emergency') {
		reason = faker.helpers.arrayElement(consultationReasons);
	} else if (appointmentType === 'follow-up') {
		reason = faker.helpers.arrayElement(followUpReasons);
	} else {
		reason = faker.helpers.arrayElement(routineReasons);
	}

	return {
		id: nanoid(),
		patientId: patient.id,
		patientName: patient.fullName || `${patient.firstName} ${patient.lastName}`,
		doctorId: doctor.id,
		doctorName: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`,
		date: appointmentDate,
		startTime,
		endTime,
		duration,
		type: appointmentType,
		status,
		reason,
		notes: faker.helpers.maybe(() =>
			faker.helpers.arrayElement([
				'Hasta zamanında geldi',
				'İlaç yan etkisi sorgulandı',
				'Hasta bilgilendirildi',
				'Tetkik istendi'
			]),
			{ probability: 0.3 }
		),
		createdAt: faker.date.between({ from: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000), to: appointmentDate }),
		updatedAt: new Date()
	};
}

export function generateAppointments(patients: Patient[], staff: User[], count: number = 220): Appointment[] {
	const appointments: Appointment[] = [];
	const doctors = staff.filter(s => s.role === 'doctor');

	// Generate dates spanning last 6 months to 1 month in future
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - 6);
	const endDate = new Date();
	endDate.setMonth(endDate.getMonth() + 1);

	// Classify patients for realistic distribution
	const chronicPatients = patients.filter(p =>
		p.medicalHistory && p.medicalHistory.pastIllnesses.length > 0
	).slice(0, 15); // ~15 chronic patients with 10+ visits each

	const regularPatients = patients.filter(p =>
		!chronicPatients.includes(p)
	).slice(0, 30); // ~30 regular patients with 3-7 visits

	const newPatients = patients.filter(p =>
		!chronicPatients.includes(p) && !regularPatients.includes(p)
	); // Remaining patients with 1-2 visits

	// Generate appointments for chronic patients (10-15 appointments each)
	chronicPatients.forEach(patient => {
		const appointmentCount = faker.number.int({ min: 10, max: 15 });
		for (let i = 0; i < appointmentCount; i++) {
			const appointmentDate = faker.date.between({ from: startDate, to: endDate });
			appointments.push(generateAppointment(patient, doctors, appointmentDate, appointments));
		}
	});

	// Generate appointments for regular patients (3-7 appointments each)
	regularPatients.forEach(patient => {
		const appointmentCount = faker.number.int({ min: 3, max: 7 });
		for (let i = 0; i < appointmentCount; i++) {
			const appointmentDate = faker.date.between({ from: startDate, to: endDate });
			appointments.push(generateAppointment(patient, doctors, appointmentDate, appointments));
		}
	});

	// Generate appointments for new patients (1-2 appointments each)
	newPatients.forEach(patient => {
		const appointmentCount = faker.number.int({ min: 1, max: 2 });
		for (let i = 0; i < appointmentCount; i++) {
			const appointmentDate = faker.date.between({ from: startDate, to: endDate });
			appointments.push(generateAppointment(patient, doctors, appointmentDate, appointments));
		}
	});

	// Sort by date
	appointments.sort((a, b) => a.date.getTime() - b.date.getTime());

	return appointments.slice(0, count);
}

// ============================================================================
// EMR GENERATION (100+ medical records linked to appointments)
// ============================================================================

function generateMedicalRecordForAppointment(
	appointment: Appointment,
	patient: Patient,
	doctor: User
): MedicalRecord | null {
	// Only generate EMR for completed appointments
	if (appointment.status !== 'completed') {
		return null;
	}

	// Determine age group for vital signs
	const age = new Date().getFullYear() - patient.birthDate.getFullYear();
	let ageGroup: 'child' | 'adult' | 'elderly' = 'adult';
	if (age < 18) ageGroup = 'child';
	else if (age > 65) ageGroup = 'elderly';

	const vitalSigns = generateVitalSigns(ageGroup);

	// Generate 1-3 diagnoses
	const diagnosisCount = faker.number.int({ min: 1, max: 3 });
	const diagnoses: Diagnosis[] = [];

	for (let i = 0; i < diagnosisCount; i++) {
		const diagnosisData = generateDiagnosis();
		diagnoses.push({
			id: nanoid(),
			code: diagnosisData.code,
			name: diagnosisData.name,
			severity: diagnosisData.severity,
			status: faker.helpers.weightedArrayElement([
				{ value: 'active' as const, weight: 6 },
				{ value: 'resolved' as const, weight: 3 },
				{ value: 'chronic' as const, weight: 1 }
			]),
			diagnosedDate: appointment.date
		});
	}

	// Generate prescriptions (60% of visits have prescriptions)
	const prescriptions: Prescription[] = [];
	const hasPrescription = faker.datatype.boolean({ probability: 0.6 });

	if (hasPrescription) {
		const medicationCount = faker.number.int({ min: 1, max: 4 });
		const medications: Medication[] = [];

		for (let i = 0; i < medicationCount; i++) {
			const medData = generateMedication();
			medications.push({
				id: nanoid(),
				name: medData.name,
				dosage: medData.dosage,
				frequency: medData.frequency,
				duration: medData.duration,
				instructions: medData.instructions,
				startDate: appointment.date
			});
		}

		prescriptions.push({
			id: nanoid(),
			medications,
			prescribedDate: appointment.date,
			prescribedBy: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`
		});
	}

	// Generate lab results (30% of visits have lab work)
	const labResults: EmrLabResult[] = [];
	const hasLabWork = faker.datatype.boolean({ probability: 0.3 });

	if (hasLabWork) {
		const panels = faker.helpers.arrayElements(
			['CBC', 'Metabolic', 'Liver', 'Lipid', 'Thyroid', 'Diabetes', 'Urinalysis'] as const,
			faker.number.int({ min: 1, max: 3 })
		);

		panels.forEach(panel => {
			const panelResults = generateLabPanel(panel);
			panelResults.forEach(result => {
				labResults.push({
					id: nanoid(),
					testName: result.testName,
					testType: result.testType,
					result: result.result,
					unit: result.unit,
					referenceRange: result.referenceRange,
					status: result.status,
					testDate: appointment.date
				});
			});
		});
	}

	const chiefComplaint = appointment.reason || generateChiefComplaint();

	return {
		id: nanoid(),
		patientId: patient.id,
		patientName: patient.fullName || `${patient.firstName} ${patient.lastName}`,
		appointmentId: appointment.id,
		doctorId: doctor.id,
		doctorName: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`,
		visitDate: appointment.date,
		chiefComplaint,
		presentIllness: faker.helpers.maybe(() =>
			faker.helpers.arrayElement([
				'Şikayetler 3 gündür mevcut, ateş ve öksürük eşlik ediyor.',
				'Kronik hastalık takibinde, ilaç kullanımı düzenli.',
				'Akut başlayan karın ağrısı, bulantı eşlik ediyor.',
				'Yorgunluk ve halsizlik son 2 haftadır artmış.',
				'Bel ağrısı ağır kaldırma sonrası başlamış.'
			]),
			{ probability: 0.7 }
		),
		physicalExamination: faker.helpers.maybe(() =>
			faker.helpers.arrayElement([
				'Genel durum iyi, vital bulgular stabil.',
				'Akciğer sesleri bilateral doğal, ronküs saptanmadı.',
				'Karın muayenesi doğal, hassasiyet yok.',
				'Nörolojik muayene doğal.',
				'Lomber vertebral hassasiyet mevcut, hareket kısıtlılığı var.'
			]),
			{ probability: 0.6 }
		),
		vitalSigns,
		diagnoses,
		prescriptions,
		labResults,
		procedures: [],
		assessment: generateAssessment(),
		plan: generatePlan(),
		followUpInstructions: faker.helpers.maybe(() =>
			faker.helpers.arrayElement([
				'1 hafta sonra kontrol randevusu',
				'İlaç tedavisi bittikten sonra tekrar değerlendirme',
				'Tetkik sonuçları ile birlikte yeniden muayene',
				'Gerektiğinde başvuru',
				'2 hafta sonra kontrol, şikayetler artarsa hemen başvuru'
			]),
			{ probability: 0.5 }
		),
		createdAt: appointment.date,
		updatedAt: appointment.date
	};
}

export function generateMedicalRecords(
	appointments: Appointment[],
	patients: Patient[],
	staff: User[]
): MedicalRecord[] {
	const records: MedicalRecord[] = [];
	const completedAppointments = appointments.filter(a => a.status === 'completed');

	completedAppointments.forEach(appointment => {
		const patient = patients.find(p => p.id === appointment.patientId);
		const doctor = staff.find(s => s.id === appointment.doctorId);

		if (patient && doctor) {
			const record = generateMedicalRecordForAppointment(appointment, patient, doctor);
			if (record) {
				records.push(record);
			}
		}
	});

	return records;
}

// ============================================================================
// SEED DATA ORCHESTRATION
// ============================================================================

export interface SeedDataset {
	staff: User[];
	patients: Patient[];
	appointments: Appointment[];
	medicalRecords: MedicalRecord[];
	labOrders: LabOrder[];
	labSamples: LabSample[];
	labResults: LabTestResult[];
	prescriptions: PrescriptionTracking[];
	stats: {
		staffCount: number;
		patientCount: number;
		appointmentCount: number;
		medicalRecordCount: number;
		labOrderCount: number;
		labSampleCount: number;
		labResultCount: number;
		prescriptionCount: number;
		chronicPatients: number;
		completedAppointments: number;
		recordsWithPrescriptions: number;
		recordsWithLabResults: number;
		activePrescriptions: number;
		prescriptionsWithInteractions: number;
	};
}

/**
 * Generate complete seed dataset with all interconnections
 */
export function generateSeedData(): SeedDataset {
	console.log('🌱 Generating comprehensive seed data...');

	// Generate staff first
	console.log('👥 Generating 30+ staff members...');
	const staff = generateStaff();

	// Generate patients
	console.log('🏥 Generating 50-60 patients...');
	const patients = generatePatients(55);

	// Generate appointments
	console.log('📅 Generating 200+ appointments...');
	const appointments = generateAppointments(patients, staff, 220);

	// Generate medical records for completed appointments
	console.log('📋 Generating 100+ medical records...');
	const medicalRecords = generateMedicalRecords(appointments, patients, staff);

	// Generate lab orders, samples, and results
	console.log('🔬 Generating 80+ lab orders with samples and results...');
	const patientIds = patients.map(p => p.id);
	const doctorIds = staff.filter(s => s.role === 'doctor').map(s => s.id);
	const appointmentIds = appointments.map(a => a.id);

	// Create a map of user IDs to full names for lab data
	const userNames = new Map<string, string>();
	staff.forEach(s => userNames.set(s.id, s.fullName ?? `${s.firstName} ${s.lastName}`));
	patients.forEach(p => userNames.set(p.id, `${p.firstName} ${p.lastName}`));

	const { orders: labOrders, samples: labSamples, results: labResults } = generateLabOrderData(
		patientIds,
		doctorIds,
		appointmentIds,
		userNames
	);

	// Generate prescriptions
	console.log('💊 Generating 120+ prescriptions with interaction scenarios...');
	const prescriptions = generatePrescriptionData(
		patientIds,
		doctorIds,
		appointmentIds,
		userNames
	);

	const chronicPatients = patients.filter(p =>
		p.medicalHistory && p.medicalHistory.pastIllnesses.length > 0
	).length;

	const completedAppointments = appointments.filter(a => a.status === 'completed').length;
	const recordsWithPrescriptions = medicalRecords.filter(r => r.prescriptions.length > 0).length;
	const recordsWithLabResults = medicalRecords.filter(r => r.labResults.length > 0).length;

	// Calculate prescription statistics
	const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;

	// Count patients with interaction warnings
	const patientPrescriptions = new Map<string, typeof prescriptions>();
	prescriptions.forEach(p => {
		if (!patientPrescriptions.has(p.patientId)) {
			patientPrescriptions.set(p.patientId, []);
		}
		patientPrescriptions.get(p.patientId)!.push(p);
	});

	let prescriptionsWithInteractions = 0;
	patientPrescriptions.forEach(pxs => {
		const activePxs = pxs.filter(p => p.status === 'active');
		if (activePxs.length > 1) {
			prescriptionsWithInteractions++;
		}
	});

	console.log('✅ Seed data generation complete!');
	console.log(`   Staff: ${staff.length}`);
	console.log(`   Patients: ${patients.length} (${chronicPatients} chronic)`);
	console.log(`   Appointments: ${appointments.length} (${completedAppointments} completed)`);
	console.log(`   Medical Records: ${medicalRecords.length}`);
	console.log(`   Records with prescriptions: ${recordsWithPrescriptions}`);
	console.log(`   Records with lab results: ${recordsWithLabResults}`);
	console.log(`   Lab Orders: ${labOrders.length}`);
	console.log(`   Lab Samples: ${labSamples.length}`);
	console.log(`   Lab Results: ${labResults.length}`);
	console.log(`   Prescriptions: ${prescriptions.length} (${activePrescriptions} active)`);

	return {
		staff,
		patients,
		appointments,
		medicalRecords,
		labOrders,
		labSamples,
		labResults,
		prescriptions,
		stats: {
			staffCount: staff.length,
			patientCount: patients.length,
			appointmentCount: appointments.length,
			medicalRecordCount: medicalRecords.length,
			labOrderCount: labOrders.length,
			labSampleCount: labSamples.length,
			labResultCount: labResults.length,
			prescriptionCount: prescriptions.length,
			chronicPatients,
			completedAppointments,
			recordsWithPrescriptions,
			recordsWithLabResults,
			activePrescriptions,
			prescriptionsWithInteractions
		}
	};
}

// Generate and export the seed data with memoization to prevent regeneration on every import
// Only generate data in the browser to avoid SSR issues
let cachedSeedDataset: ReturnType<typeof generateSeedData> | null = null;

function getSeedDataset() {
	if (!cachedSeedDataset) {
		// Only generate data in the browser
		if (browser) {
			console.log('🌱 Generating seed data in browser...');
			cachedSeedDataset = generateSeedData();
		} else {
			// Return minimal empty data for SSR
			console.log('⚠️ Skipping seed generation during SSR');
			cachedSeedDataset = {
				staff: [],
				patients: [],
				appointments: [],
				medicalRecords: [],
				labOrders: [],
				labSamples: [],
				labResults: [],
				prescriptions: [],
				stats: {
					staffCount: 0,
					patientCount: 0,
					appointmentCount: 0,
					medicalRecordCount: 0,
					labOrderCount: 0,
					labSampleCount: 0,
					labResultCount: 0,
					prescriptionCount: 0,
					chronicPatients: 0,
					completedAppointments: 0,
					recordsWithPrescriptions: 0,
					recordsWithLabResults: 0,
					activePrescriptions: 0,
					prescriptionsWithInteractions: 0
				}
			};
		}
	}
	return cachedSeedDataset;
}

export const seedDataset = getSeedDataset();
export const {
	staff: seedStaff,
	patients: seedPatients,
	appointments: seedAppointments,
	medicalRecords: seedMedicalRecords,
	labOrders: seedLabOrders,
	labSamples: seedLabSamples,
	labResults: seedLabResults,
	prescriptions: seedPrescriptions
} = seedDataset;
