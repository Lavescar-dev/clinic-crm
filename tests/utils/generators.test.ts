/**
 * Test suite for data generators
 */

import { describe, it, expect } from 'vitest';
import {
	generateTurkishFirstName,
	generateTurkishLastName,
	generateTurkishFullName,
	generateTCKimlikNo,
	validateTCKimlikNo,
	generateTurkishAddress,
	generateTurkishPhoneNumber,
	generateTurkishEmail,
	generateBirthDate,
	generateTimeString,
	generateEmergencyContact
} from '$lib/utils/dataGenerator';

import {
	generateDiagnosis,
	generateProcedure,
	generateLabResult,
	generateMedication,
	generateVitalSigns,
	generateChiefComplaint,
	generateAssessment,
	generatePlan,
	generateLabPanel
} from '$lib/utils/medicalDataGenerator';

describe('Turkish Data Generators', () => {
	it('should generate valid Turkish first names', () => {
		const maleName = generateTurkishFirstName('male');
		const femaleName = generateTurkishFirstName('female');

		expect(maleName).toBeTruthy();
		expect(femaleName).toBeTruthy();
		expect(typeof maleName).toBe('string');
		expect(typeof femaleName).toBe('string');
	});

	it('should generate valid Turkish last names', () => {
		const lastName = generateTurkishLastName();
		expect(lastName).toBeTruthy();
		expect(typeof lastName).toBe('string');
	});

	it('should generate valid Turkish full names', () => {
		const name = generateTurkishFullName('male');
		expect(name.firstName).toBeTruthy();
		expect(name.lastName).toBeTruthy();
		expect(name.fullName).toBe(`${name.firstName} ${name.lastName}`);
	});

	it('should generate valid TC Kimlik No', () => {
		const tcNo = generateTCKimlikNo();
		expect(tcNo).toHaveLength(11);
		expect(tcNo).toMatch(/^\d{11}$/);
		expect(tcNo[0]).not.toBe('0');
		expect(validateTCKimlikNo(tcNo)).toBe(true);
	});

	it('should validate TC Kimlik No correctly', () => {
		// Invalid cases
		expect(validateTCKimlikNo('12345678901')).toBe(false); // Invalid checksum
		expect(validateTCKimlikNo('01234567890')).toBe(false); // Starts with 0
		expect(validateTCKimlikNo('1234567890')).toBe(false); // Too short
	});

	it('should generate valid Turkish addresses', () => {
		const address = generateTurkishAddress();
		expect(address.street).toBeTruthy();
		expect(address.city).toBeTruthy();
		expect(address.state).toBeTruthy();
		expect(address.district).toBeTruthy();
		expect(address.zipCode).toMatch(/^\d{5}$/);
		expect(address.country).toBe('Türkiye');
	});

	it('should generate valid Turkish phone numbers', () => {
		const phoneWithCode = generateTurkishPhoneNumber(true);
		const phoneWithoutCode = generateTurkishPhoneNumber(false);

		expect(phoneWithCode).toMatch(/^\+90 5\d{2} \d{3} \d{2} \d{2}$/);
		expect(phoneWithoutCode).toMatch(/^05\d{2} \d{3} \d{2} \d{2}$/);
	});

	it('should generate valid Turkish emails', () => {
		const email = generateTurkishEmail('Ahmet', 'Yılmaz');
		expect(email).toMatch(/^[a-z0-9._]+@[a-z]+\.com$/);
		expect(email).not.toContain('ı');
		expect(email).not.toContain('ğ');
		expect(email).not.toContain('ü');
		expect(email).not.toContain('ş');
		expect(email).not.toContain('ö');
		expect(email).not.toContain('ç');
	});

	it('should generate valid birth dates', () => {
		const birthDate = generateBirthDate(18, 80);
		const now = new Date();
		const age = now.getFullYear() - birthDate.getFullYear();

		expect(age).toBeGreaterThanOrEqual(18);
		expect(age).toBeLessThanOrEqual(81); // Allow one year buffer
	});

	it('should generate valid time strings', () => {
		const time = generateTimeString(8, 18);
		expect(time).toMatch(/^\d{2}:\d{2}$/);

		const [hours, minutes] = time.split(':').map(Number);
		expect(hours).toBeGreaterThanOrEqual(8);
		expect(hours).toBeLessThanOrEqual(18);
		expect([0, 15, 30, 45]).toContain(minutes);
	});

	it('should generate valid emergency contact', () => {
		const contact = generateEmergencyContact();
		expect(contact.name).toBeTruthy();
		expect(contact.relationship).toBeTruthy();
		expect(contact.phone).toMatch(/^\+90 5\d{2} \d{3} \d{2} \d{2}$/);
	});
});

describe('Medical Data Generators', () => {
	it('should generate valid ICD-10 diagnoses', () => {
		const diagnosis = generateDiagnosis();
		expect(diagnosis.code).toBeTruthy();
		expect(diagnosis.name).toBeTruthy();
		expect(['mild', 'moderate', 'severe']).toContain(diagnosis.severity);
	});

	it('should generate diagnoses with specific severity', () => {
		const mildDiagnosis = generateDiagnosis('mild');
		expect(mildDiagnosis.severity).toBe('mild');
	});

	it('should generate valid CPT procedures', () => {
		const procedure = generateProcedure();
		expect(procedure.code).toBeTruthy();
		expect(procedure.name).toBeTruthy();
		expect(procedure.price).toBeGreaterThan(0);
	});

	it('should generate valid lab results', () => {
		const labResult = generateLabResult();
		expect(labResult.testName).toBeTruthy();
		expect(labResult.testType).toBeTruthy();
		expect(labResult.result).toBeTruthy();
		expect(labResult.referenceRange).toBeTruthy();
		expect(['normal', 'abnormal', 'critical']).toContain(labResult.status);
	});

	it('should generate valid medications', () => {
		const medication = generateMedication();
		expect(medication.name).toBeTruthy();
		expect(medication.dosage).toBeTruthy();
		expect(medication.frequency).toBeTruthy();
		expect(medication.duration).toBeTruthy();
		expect(medication.instructions).toBeTruthy();
	});

	it('should generate valid vital signs', () => {
		const vitals = generateVitalSigns('adult');
		expect(vitals.temperature).toBeGreaterThan(35);
		expect(vitals.temperature).toBeLessThan(40);
		expect(vitals.bloodPressureSystolic).toBeGreaterThan(80);
		expect(vitals.bloodPressureDiastolic).toBeGreaterThan(40);
		expect(vitals.heartRate).toBeGreaterThan(40);
		expect(vitals.respiratoryRate).toBeGreaterThan(8);
		expect(vitals.oxygenSaturation).toBeGreaterThanOrEqual(95);
		expect(vitals.oxygenSaturation).toBeLessThanOrEqual(100);
		expect(vitals.weight).toBeGreaterThan(0);
		expect(vitals.height).toBeGreaterThan(0);
		expect(vitals.bmi).toBeGreaterThan(0);
	});

	it('should generate different vital signs for different age groups', () => {
		const childVitals = generateVitalSigns('child');
		const adultVitals = generateVitalSigns('adult');
		const elderlyVitals = generateVitalSigns('elderly');

		// Child should have lower weight and height
		expect(childVitals.weight).toBeLessThan(adultVitals.weight);
		expect(childVitals.height).toBeLessThan(adultVitals.height);
	});

	it('should generate valid SOAP note components', () => {
		const complaint = generateChiefComplaint();
		const assessment = generateAssessment();
		const plan = generatePlan();

		expect(complaint).toBeTruthy();
		expect(assessment).toBeTruthy();
		expect(plan).toBeTruthy();
	});

	it('should generate lab panels with multiple tests', () => {
		const cbcPanel = generateLabPanel('CBC');
		expect(cbcPanel.length).toBeGreaterThan(0);
		cbcPanel.forEach((result) => {
			expect(result.category).toBe('CBC');
		});
	});
});
