/**
 * End-to-End Tests for Mock API Layer
 * Tests the complete mock service layer with persistence, delays, and error simulation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockService } from '$lib/services/mockService';
import { generateSeedData } from '$lib/data/seedData';

// Mock browser environment
const sessionStorageMock = {
	data: {},
	length: 0,
	clear() {
		this.data = {};
		this.length = 0;
	},
	getItem(key: string) {
		return this.data[key] || null;
	},
	key(index: number) {
		return Object.keys(this.data)[index] ?? null;
	},
	removeItem(key: string) {
		delete this.data[key];
		this.length = Object.keys(this.data).length;
	},
	setItem(key: string, value: string) {
		this.data[key] = value;
		this.length = Object.keys(this.data).length;
	}
} as Storage & { data: Record<string, string>; length: number };

vi.stubGlobal('sessionStorage', sessionStorageMock);

interface TestPatient {
	id: string;
	firstName: string;
	lastName: string;
	tcNo: string;
	contact: {
		phone: string;
		email: string | undefined;
	};
}

describe('Mock API E2E Tests', () => {
	let patientService: MockService<TestPatient>;
	let seedData: ReturnType<typeof generateSeedData>;

	beforeEach(() => {
		// Clear storage before each test
		sessionStorage.clear();

		// Generate seed data
		seedData = generateSeedData();

		// Transform seed patients to test format
		const testPatients: TestPatient[] = seedData.patients.map((p) => ({
			id: p.id,
			firstName: p.firstName,
			lastName: p.lastName,
			tcNo: p.tcNo,
			contact: {
				phone: p.contact.phone,
				email: p.contact.email
			}
		}));

		// Create service with test configuration
		patientService = new MockService<TestPatient>(testPatients, {
			entityName: 'test_patients',
			minDelay: 0, // No delay for tests
			maxDelay: 0,
			failureRate: 0, // No random failures for tests
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	});

	describe('Test 1: Patient List with 50+ Turkish Data', () => {
		it('should load 50+ patients with realistic Turkish data', async () => {
			const result = await patientService.getAll();

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();

			if (result.data) {
				// Verify we have 50+ patients
				expect(result.data.length).toBeGreaterThanOrEqual(50);

				// Check first few patients for Turkish data
				const samplePatients = result.data.slice(0, 5);

				for (const patient of samplePatients) {
					// TC Kimlik should be 11 digits
					expect(patient.tcNo).toMatch(/^\d{11}$/);

					// Phone should be Turkish format
					expect(patient.contact.phone).toMatch(/^\+90 5\d{2} \d{3} \d{2} \d{2}$/);

					// Email should be valid
					expect(patient.contact.email).toContain('@');

					// Names should exist
					expect(patient.firstName.length).toBeGreaterThan(0);
					expect(patient.lastName.length).toBeGreaterThan(0);
				}
			}
		});
	});

	describe('Test 2: Pagination and Search', () => {
		it('should paginate patients correctly', async () => {
			const page1 = await patientService.getPaginated({ page: 1, limit: 10 });
			const page2 = await patientService.getPaginated({ page: 2, limit: 10 });

			expect(page1.success).toBe(true);
			expect(page2.success).toBe(true);

			if (page1.data && page2.data) {
				expect(page1.data.data.length).toBe(10);
				expect(page2.data.data.length).toBe(10);

				// Pages should have different data
				expect(page1.data.data[0].id).not.toBe(page2.data.data[0].id);

				// Total should be consistent
				expect(page1.data.total).toBe(page2.data.total);
			}
		});

		it('should search patients by name', async () => {
			const allPatients = await patientService.getAll();
			expect(allPatients.success).toBe(true);

			if (allPatients.data && allPatients.data.length > 0) {
				const targetPatient = allPatients.data[0];
				const searchQuery = targetPatient.firstName.substring(0, 3);

				const searchResult = await patientService.search({
					query: searchQuery
				});

				expect(searchResult.success).toBe(true);
				expect(searchResult.data).toBeDefined();

				if (searchResult.data) {
					expect(searchResult.data.length).toBeGreaterThan(0);

					// Verify search results contain the query
					const found = searchResult.data.some(
						(p) =>
							p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
							p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
					);
					expect(found).toBe(true);
				}
			}
		});
	});

	describe('Test 3: Create New Patient', () => {
		it('should create a new patient and show immediately in list', async () => {
			const newPatient: TestPatient = {
				id: 'test-patient-001',
				firstName: 'Test',
				lastName: 'Hasta',
				tcNo: '12345678901',
				contact: {
					phone: '+90 555 123 45 67',
					email: 'test@example.com'
				}
			};

			const createResult = await patientService.create(newPatient);

			expect(createResult.success).toBe(true);
			expect(createResult.data).toEqual(newPatient);

			// Verify it appears in the list
			const allPatients = await patientService.getAll();
			expect(allPatients.success).toBe(true);

			if (allPatients.data) {
				const found = allPatients.data.find((p) => p.id === 'test-patient-001');
				expect(found).toBeDefined();
				expect(found?.firstName).toBe('Test');
			}
		});
	});

	describe('Test 4: Edit Patient', () => {
		it('should edit a patient and persist changes', async () => {
			const allPatients = await patientService.getAll();
			expect(allPatients.success).toBe(true);

			if (allPatients.data && allPatients.data.length > 0) {
				const patientToEdit = allPatients.data[0];
				const originalName = patientToEdit.firstName;
				const updatedName = 'Güncellendi';

				const updateResult = await patientService.update(patientToEdit.id, {
					firstName: updatedName
				});

				expect(updateResult.success).toBe(true);
				expect(updateResult.data?.firstName).toBe(updatedName);

				// Verify change persisted
				const getResult = await patientService.getById(patientToEdit.id);
				expect(getResult.success).toBe(true);
				expect(getResult.data?.firstName).toBe(updatedName);
			}
		});
	});

	describe('Test 5: Session Persistence', () => {
		it('should persist new patient across service instances', async () => {
			// Create a patient
			const newPatient: TestPatient = {
				id: 'persist-test-001',
				firstName: 'Persist',
				lastName: 'Test',
				tcNo: '98765432109',
				contact: {
					phone: '+90 555 999 88 77',
					email: 'persist@example.com'
				}
			};

			await patientService.create(newPatient);

			// Create a new service instance (simulating page refresh)
			const seedDataCopy = generateSeedData();
			const testPatientsCopy: TestPatient[] = seedDataCopy.patients.map((p) => ({
				id: p.id,
				firstName: p.firstName,
				lastName: p.lastName,
				tcNo: p.tcNo,
				contact: {
					phone: p.contact.phone,
					email: p.contact.email
				}
			}));

			const newServiceInstance = new MockService<TestPatient>(testPatientsCopy, {
				entityName: 'test_patients',
				minDelay: 0,
				maxDelay: 0,
				failureRate: 0,
				enablePersistence: true,
				storageType: 'sessionStorage'
			});

			// Verify patient still exists
			const result = await newServiceInstance.getById('persist-test-001');
			expect(result.success).toBe(true);
			expect(result.data?.firstName).toBe('Persist');
		});
	});

	describe('Test 6: Demo Data Reset', () => {
		it('should reset to seed data and clear modifications', async () => {
			// Create a new patient
			const newPatient: TestPatient = {
				id: 'reset-test-001',
				firstName: 'WillBeRemoved',
				lastName: 'Test',
				tcNo: '11111111111',
				contact: {
					phone: '+90 555 111 11 11',
					email: 'removed@example.com'
				}
			};

			await patientService.create(newPatient);

			// Verify it exists
			let result = await patientService.getById('reset-test-001');
			expect(result.success).toBe(true);

			// Reset to seed data
			const seedDataReset = generateSeedData();
			const resetPatients: TestPatient[] = seedDataReset.patients.map((p) => ({
				id: p.id,
				firstName: p.firstName,
				lastName: p.lastName,
				tcNo: p.tcNo,
				contact: {
					phone: p.contact.phone,
					email: p.contact.email
				}
			}));

			patientService.reset(resetPatients);

			// Verify new patient is removed
			result = await patientService.getById('reset-test-001');
			expect(result.success).toBe(false);

			// Verify we're back to original count
			const allPatients = await patientService.getAll();
			expect(allPatients.success).toBe(true);
			if (allPatients.data) {
				expect(allPatients.data.length).toBe(resetPatients.length);
			}
		});
	});

	describe('Test 7: Error Simulation', () => {
		it('should simulate random failures when configured', async () => {
			// Create service with 100% failure rate
			const testPatients: TestPatient[] = seedData.patients.slice(0, 10).map((p) => ({
				id: p.id,
				firstName: p.firstName,
				lastName: p.lastName,
				tcNo: p.tcNo,
				contact: {
					phone: p.contact.phone,
					email: p.contact.email
				}
			}));

			const failingService = new MockService<TestPatient>(testPatients, {
				entityName: 'failing_test',
				minDelay: 0,
				maxDelay: 0,
				failureRate: 1.0, // 100% failure
				enablePersistence: false
			});

			const result = await failingService.getAll();
			expect(result.success).toBe(false);
			expect(result.error).toContain('Network error');
		});

		it('should not have errors with 0% failure rate', async () => {
			// Service already configured with 0% failure in beforeEach
			const result = await patientService.getAll();
			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
		});
	});
});
