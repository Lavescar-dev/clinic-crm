/**
 * Referral Service
 * Extends MockService to provide CRUD operations and specialized methods for referral management
 * including internal department referrals, external facility referrals, and workflow management
 */

import { MockService } from './mockService';
import type {
	Referral,
	ExternalFacility,
	CreateReferralDto,
	UpdateReferralDto,
	AcceptReferralDto,
	RejectReferralDto,
	ReferralStatus,
	UrgencyLevel,
	CreateExternalFacilityDto,
	UpdateExternalFacilityDto
} from '$lib/types/referral';
import type { ApiResponse } from '$types/common';

export class ReferralService extends MockService<Referral> {
	constructor(initialData: Referral[] = []) {
		super(initialData, {
			entityName: 'referrals',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Create a new referral
	 */
	async createReferral(referralData: CreateReferralDto): Promise<ApiResponse<Referral>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create referral'
			};
		}

		const now = new Date();
		const newReferral: Referral = {
			id: crypto.randomUUID(),
			...referralData,
			status: referralData.status || 'pending',
			urgency: referralData.urgency || 'routine',
			appointmentScheduled: false,
			diagnosisCodes: referralData.diagnosisCodes || [],
			relevantTests: referralData.relevantTests || [],
			medications: referralData.medications || [],
			createdAt: now,
			updatedAt: now
		};

		return await this.create(newReferral);
	}

	/**
	 * Update referral
	 */
	async updateReferral(
		referralId: string,
		updates: UpdateReferralDto
	): Promise<ApiResponse<Referral>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update referral'
			};
		}

		const updatesWithTimestamp = {
			...updates,
			updatedAt: new Date()
		};

		return await this.update(referralId, updatesWithTimestamp);
	}

	/**
	 * Accept a referral
	 */
	async acceptReferral(
		referralId: string,
		acceptData: AcceptReferralDto
	): Promise<ApiResponse<Referral>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to accept referral'
			};
		}

		const referralResult = await this.getById(referralId);
		if (!referralResult.success || !referralResult.data) {
			return {
				success: false,
				error: 'Referral not found'
			};
		}

		const referral = referralResult.data;

		// Validate referral can be accepted
		if (referral.status !== 'pending') {
			return {
				success: false,
				error: 'Only pending referrals can be accepted'
			};
		}

		const now = new Date();
		return await this.update(referralId, {
			status: 'accepted',
			respondedBy: acceptData.respondedBy,
			response: acceptData.response || 'Referral accepted',
			responseDate: now,
			appointmentDate: acceptData.appointmentDate,
			updatedAt: now
		});
	}

	/**
	 * Reject a referral
	 */
	async rejectReferral(
		referralId: string,
		rejectData: RejectReferralDto
	): Promise<ApiResponse<Referral>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to reject referral'
			};
		}

		const referralResult = await this.getById(referralId);
		if (!referralResult.success || !referralResult.data) {
			return {
				success: false,
				error: 'Referral not found'
			};
		}

		const referral = referralResult.data;

		// Validate referral can be rejected
		if (referral.status !== 'pending') {
			return {
				success: false,
				error: 'Only pending referrals can be rejected'
			};
		}

		const now = new Date();
		return await this.update(referralId, {
			status: 'rejected',
			respondedBy: rejectData.respondedBy,
			response: rejectData.response,
			responseDate: now,
			updatedAt: now
		});
	}

	/**
	 * Complete a referral
	 */
	async completeReferral(referralId: string): Promise<ApiResponse<Referral>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to complete referral'
			};
		}

		const referralResult = await this.getById(referralId);
		if (!referralResult.success || !referralResult.data) {
			return {
				success: false,
				error: 'Referral not found'
			};
		}

		const referral = referralResult.data;

		// Validate referral can be completed
		if (referral.status !== 'accepted') {
			return {
				success: false,
				error: 'Only accepted referrals can be completed'
			};
		}

		return await this.update(referralId, {
			status: 'completed',
			updatedAt: new Date()
		});
	}

	/**
	 * Schedule appointment for referral
	 */
	async scheduleReferralAppointment(
		referralId: string,
		appointmentId: string,
		appointmentDate: Date
	): Promise<ApiResponse<Referral>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to schedule appointment'
			};
		}

		return await this.update(referralId, {
			appointmentScheduled: true,
			appointmentId,
			appointmentDate,
			updatedAt: new Date()
		});
	}

	/**
	 * Notify referred doctor (placeholder for notification system integration)
	 */
	async notifyReferredDoctor(referralId: string): Promise<ApiResponse<void>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to send notification'
			};
		}

		const referralResult = await this.getById(referralId);
		if (!referralResult.success || !referralResult.data) {
			return {
				success: false,
				error: 'Referral not found'
			};
		}

		// In a real implementation, this would send a notification
		// For now, just simulate success
		return {
			success: true,
			message: 'Notification sent successfully'
		};
	}

	/**
	 * Get referrals by patient
	 */
	async getReferralsByPatient(patientId: string): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.patientId === patientId)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get referrals by referring doctor (outgoing referrals)
	 */
	async getReferralsByFromDoctor(doctorId: string): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.fromDoctorId === doctorId)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get referrals to a specific doctor (incoming referrals)
	 */
	async getReferralsByToDoctor(doctorId: string): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.toDoctorId === doctorId)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get referrals by status
	 */
	async getReferralsByStatus(status: ReferralStatus): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.status === status)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get referrals by urgency
	 */
	async getReferralsByUrgency(urgency: UrgencyLevel): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.urgency === urgency)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get internal referrals (within clinic)
	 */
	async getInternalReferrals(): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => !!r.toDoctorId && !r.externalFacility)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get external referrals (to external facilities)
	 */
	async getExternalReferrals(): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => !!r.externalFacility)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get pending referrals
	 */
	async getPendingReferrals(): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.status === 'pending')
			.sort((a, b) => {
				// Sort by urgency first (stat > urgent > routine), then by date
				const urgencyOrder = { stat: 0, urgent: 1, routine: 2 };
				const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
				if (urgencyDiff !== 0) return urgencyDiff;
				return b.createdAt.getTime() - a.createdAt.getTime();
			});

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get urgent referrals
	 */
	async getUrgentReferrals(): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.urgency === 'urgent' || r.urgency === 'stat')
			.filter((r) => r.status === 'pending' || r.status === 'accepted')
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Get referrals by department
	 */
	async getReferralsByDepartment(department: string): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch referrals'
			};
		}

		const referrals = this.getData()
			.filter((r) => r.toDepartment === department || r.fromDepartment === department)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			data: referrals
		};
	}

	/**
	 * Search referrals
	 */
	async searchReferrals(query: string): Promise<ApiResponse<Referral[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to search referrals'
			};
		}

		const lowerQuery = query.toLowerCase();
		const referrals = this.getData().filter(
			(r) =>
				r.patientName?.toLowerCase().includes(lowerQuery) ||
				r.fromDoctorName?.toLowerCase().includes(lowerQuery) ||
				r.toDoctorName?.toLowerCase().includes(lowerQuery) ||
				r.reason.toLowerCase().includes(lowerQuery) ||
				r.fromDepartment?.toLowerCase().includes(lowerQuery) ||
				r.toDepartment?.toLowerCase().includes(lowerQuery) ||
				r.externalFacility?.name.toLowerCase().includes(lowerQuery)
		);

		return {
			success: true,
			data: referrals
		};
	}
}

// External Facility Service (could be separate, but keeping here for simplicity)
export class ExternalFacilityService extends MockService<ExternalFacility> {
	constructor(initialData: ExternalFacility[] = []) {
		super(initialData, {
			entityName: 'externalFacilities',
			minDelay: 100,
			maxDelay: 300,
			failureRate: 0.02,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Create external facility
	 */
	async createFacility(facilityData: CreateExternalFacilityDto): Promise<ApiResponse<ExternalFacility>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create facility'
			};
		}

		const now = new Date();
		const newFacility: ExternalFacility = {
			id: crypto.randomUUID(),
			...facilityData,
			createdAt: now,
			updatedAt: now
		};

		return await this.create(newFacility);
	}

	/**
	 * Update external facility
	 */
	async updateFacility(
		facilityId: string,
		updates: UpdateExternalFacilityDto
	): Promise<ApiResponse<ExternalFacility>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update facility'
			};
		}

		const updatesWithTimestamp = {
			...updates,
			updatedAt: new Date()
		};

		return await this.update(facilityId, updatesWithTimestamp);
	}

	/**
	 * Search facilities by specialty
	 */
	async searchBySpecialty(specialty: string): Promise<ApiResponse<ExternalFacility[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to search facilities'
			};
		}

		const lowerSpecialty = specialty.toLowerCase();
		const facilities = this.getData().filter((f) =>
			f.specialty.toLowerCase().includes(lowerSpecialty)
		);

		return {
			success: true,
			data: facilities
		};
	}
}

// Export singleton instances
export const referralService = new ReferralService();
export const externalFacilityService = new ExternalFacilityService();
