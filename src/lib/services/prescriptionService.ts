/**
 * Prescription Service
 * Extends MockService to provide CRUD operations and specialized methods for prescription management
 * including drug interaction checking and prescription validation
 */

import { MockService } from './mockService';
import type {
	PrescriptionTracking,
	CreatePrescriptionDto,
	UpdatePrescriptionDto,
	PrescriptionStatus,
	DrugInteraction
} from '$lib/types/prescription';
import { findDrugInteractions } from '$lib/types/prescription';
import type { ApiResponse } from '$types/common';

export class PrescriptionService extends MockService<PrescriptionTracking> {
	constructor(initialData: PrescriptionTracking[] = []) {
		super(initialData, {
			entityName: 'prescriptions',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Create a new prescription
	 */
	async createPrescription(
		prescriptionData: CreatePrescriptionDto
	): Promise<ApiResponse<PrescriptionTracking>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create prescription'
			};
		}

		// Validate prescription before creation
		const validationResult = await this.validatePrescription(prescriptionData);
		if (!validationResult.isValid) {
			return {
				success: false,
				error: validationResult.errors.join(', ')
			};
		}

		// Generate prescription number
		const prescriptionCount = this.getData().length + 1;
		const prescriptionNumber = `RX-${new Date().getFullYear()}-${String(prescriptionCount).padStart(6, '0')}`;

		const now = new Date();
		const newPrescription: PrescriptionTracking = {
			id: crypto.randomUUID(),
			prescriptionNumber,
			...prescriptionData,
			status: prescriptionData.status || 'active',
			createdAt: now,
			updatedAt: now
		};

		return await this.create(newPrescription);
	}

	/**
	 * Update prescription
	 */
	async updatePrescription(
		prescriptionId: string,
		updates: UpdatePrescriptionDto
	): Promise<ApiResponse<PrescriptionTracking>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update prescription'
			};
		}

		const updatesWithTimestamp = {
			...updates,
			updatedAt: new Date()
		};

		return await this.update(prescriptionId, updatesWithTimestamp);
	}

	/**
	 * Check for drug interactions in a list of medications
	 */
	checkDrugInteractions(medicationNames: string[]): DrugInteraction[] {
		return findDrugInteractions(medicationNames);
	}

	/**
	 * Get drug interactions for a specific prescription
	 */
	async getPrescriptionInteractions(
		prescriptionId: string
	): Promise<ApiResponse<DrugInteraction[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to check interactions'
			};
		}

		const prescription = this.getData().find((p) => p.id === prescriptionId);
		if (!prescription) {
			return {
				success: false,
				error: 'Prescription not found'
			};
		}

		const medicationNames = prescription.medications.map((m) => m.drugName);
		const interactions = this.checkDrugInteractions(medicationNames);

		return {
			success: true,
			data: interactions
		};
	}

	/**
	 * Get drug interactions for a patient's active prescriptions
	 */
	async getPatientInteractions(patientId: string): Promise<ApiResponse<DrugInteraction[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to check patient interactions'
			};
		}

		// Get all active prescriptions for the patient
		const activePrescriptions = this.getData().filter(
			(p) => p.patientId === patientId && p.status === 'active'
		);

		// Collect all medication names
		const allMedications = activePrescriptions.flatMap((p) =>
			p.medications.map((m) => m.drugName)
		);

		// Check for interactions
		const interactions = this.checkDrugInteractions(allMedications);

		return {
			success: true,
			data: interactions
		};
	}

	/**
	 * Validate prescription before creation
	 */
	private async validatePrescription(
		prescriptionData: CreatePrescriptionDto
	): Promise<{ isValid: boolean; errors: string[] }> {
		const errors: string[] = [];

		// Check for duplicate medications in the same prescription
		const medicationNames = prescriptionData.medications.map((m) => m.drugName.toLowerCase());
		const duplicates = medicationNames.filter(
			(name, index) => medicationNames.indexOf(name) !== index
		);
		if (duplicates.length > 0) {
			errors.push(`Duplicate medications found: ${duplicates.join(', ')}`);
		}

		// Check for drug interactions
		const interactions = this.checkDrugInteractions(
			prescriptionData.medications.map((m) => m.drugName)
		);
		const contraindicatedInteractions = interactions.filter(
			(i) => i.severity === 'contraindicated'
		);
		if (contraindicatedInteractions.length > 0) {
			errors.push(
				`Contraindicated drug interactions detected: ${contraindicatedInteractions.map((i) => `${i.drug1}+${i.drug2}`).join(', ')}`
			);
		}

		// Check for existing active prescriptions with same medications (to prevent duplicates)
		const existingPrescriptions = this.getData().filter(
			(p) =>
				p.patientId === prescriptionData.patientId &&
				p.status === 'active' &&
				new Date(p.validUntil) > new Date()
		);

		for (const medication of prescriptionData.medications) {
			const isDuplicate = existingPrescriptions.some((p) =>
				p.medications.some(
					(m) => m.drugName.toLowerCase() === medication.drugName.toLowerCase()
				)
			);
			if (isDuplicate) {
				errors.push(
					`Patient already has an active prescription for ${medication.drugName}`
				);
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	/**
	 * Calculate dosage based on patient weight and age
	 * This is a simplified version - real implementations would use more complex formulas
	 */
	calculateDosage(
		drugName: string,
		patientWeight: number,
		patientAge: number,
		standardDosage: string
	): { calculatedDosage: string; notes: string[] } {
		const notes: string[] = [];

		// For pediatric patients (under 18), adjust dosages
		if (patientAge < 18) {
			notes.push('Pediatric dosage adjustment may be required');

			// Very simplified pediatric adjustment (real implementations would be drug-specific)
			if (patientAge < 12) {
				notes.push('Consult pediatric dosing guidelines');
			}
		}

		// For elderly patients (over 65), consider dose reduction
		if (patientAge > 65) {
			notes.push('Consider dose reduction for elderly patient');
		}

		// Weight-based adjustments (very simplified)
		if (patientWeight < 50) {
			notes.push('Consider lower dose for patient weight');
		} else if (patientWeight > 100) {
			notes.push('Verify dose is appropriate for patient weight');
		}

		return {
			calculatedDosage: standardDosage,
			notes
		};
	}

	/**
	 * Get prescription history for a patient
	 */
	async getPrescriptionHistory(patientId: string): Promise<ApiResponse<PrescriptionTracking[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch prescription history'
			};
		}

		const prescriptions = this.getData()
			.filter((p) => p.patientId === patientId)
			.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

		return {
			success: true,
			data: prescriptions
		};
	}

	/**
	 * Get prescriptions by status
	 */
	async getPrescriptionsByStatus(
		status: PrescriptionStatus
	): Promise<ApiResponse<PrescriptionTracking[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch prescriptions'
			};
		}

		const prescriptions = this.getData().filter((p) => p.status === status);

		return {
			success: true,
			data: prescriptions
		};
	}

	/**
	 * Get prescriptions by doctor
	 */
	async getPrescriptionsByDoctor(doctorId: string): Promise<ApiResponse<PrescriptionTracking[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch prescriptions'
			};
		}

		const prescriptions = this.getData()
			.filter((p) => p.doctorId === doctorId)
			.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

		return {
			success: true,
			data: prescriptions
		};
	}

	/**
	 * Auto-expire prescriptions that are past their validUntil date
	 */
	async expireOldPrescriptions(): Promise<ApiResponse<number>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to expire prescriptions'
			};
		}

		const now = new Date();
		const prescriptions = this.getData();
		let expiredCount = 0;

		for (const prescription of prescriptions) {
			if (
				prescription.status === 'active' &&
				new Date(prescription.validUntil) < now
			) {
				await this.update(prescription.id, {
					status: 'expired',
					updatedAt: new Date()
				});
				expiredCount++;
			}
		}

		return {
			success: true,
			data: expiredCount
		};
	}

	/**
	 * Mark prescription as filled by pharmacy
	 */
	async fillPrescription(
		prescriptionId: string,
		pharmacyName: string,
		pharmacyId?: string,
		pharmacistName?: string
	): Promise<ApiResponse<PrescriptionTracking>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fill prescription'
			};
		}

		return await this.update(prescriptionId, {
			status: 'filled',
			pharmacyFilled: {
				pharmacyName,
				pharmacyId,
				filledAt: new Date(),
				pharmacistName
			},
			updatedAt: new Date()
		});
	}

	/**
	 * Cancel prescription
	 */
	async cancelPrescription(
		prescriptionId: string,
		reason?: string
	): Promise<ApiResponse<PrescriptionTracking>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to cancel prescription'
			};
		}

		return await this.update(prescriptionId, {
			status: 'cancelled',
			notes: reason || undefined,
			updatedAt: new Date()
		});
	}

	/**
	 * Search prescriptions by medication name
	 */
	async searchByMedication(medicationName: string): Promise<ApiResponse<PrescriptionTracking[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to search prescriptions'
			};
		}

		const searchTerm = medicationName.toLowerCase();
		const prescriptions = this.getData().filter((p) =>
			p.medications.some(
				(m) =>
					m.drugName.toLowerCase().includes(searchTerm) ||
					m.genericName?.toLowerCase().includes(searchTerm)
			)
		);

		return {
			success: true,
			data: prescriptions
		};
	}

	/**
	 * Get active prescriptions for a patient
	 */
	async getActivePrescriptions(patientId: string): Promise<ApiResponse<PrescriptionTracking[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch active prescriptions'
			};
		}

		const now = new Date();
		const prescriptions = this.getData().filter(
			(p) =>
				p.patientId === patientId &&
				p.status === 'active' &&
				new Date(p.validUntil) > now
		);

		return {
			success: true,
			data: prescriptions
		};
	}
}

// Export singleton instance
export const prescriptionService = new PrescriptionService();
