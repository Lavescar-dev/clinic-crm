/**
 * Treatment Plan Service
 * Extends MockService to provide CRUD operations and specialized methods for treatment plan management
 * including session scheduling, progress tracking, and plan management
 */

import { MockService } from './mockService';
import type {
	TreatmentPlan,
	TreatmentSession,
	CreateTreatmentPlanDto,
	UpdateTreatmentPlanDto,
	TreatmentPlanStatus,
	TreatmentProtocol
} from '$lib/types/treatmentPlan';
import type { ApiResponse } from '$types/common';

export class TreatmentPlanService extends MockService<TreatmentPlan> {
	constructor(initialData: TreatmentPlan[] = []) {
		super(initialData, {
			entityName: 'treatmentPlans',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Create a new treatment plan
	 */
	async createPlan(planData: CreateTreatmentPlanDto): Promise<ApiResponse<TreatmentPlan>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create treatment plan'
			};
		}

		const now = new Date();
		const newPlan: TreatmentPlan = {
			id: crypto.randomUUID(),
			...planData,
			completedSessions: 0,
			status: planData.status || 'not-started',
			createdAt: now,
			updatedAt: now
		};

		return await this.create(newPlan);
	}

	/**
	 * Update treatment plan
	 */
	async updatePlan(
		planId: string,
		updates: UpdateTreatmentPlanDto
	): Promise<ApiResponse<TreatmentPlan>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update treatment plan'
			};
		}

		const updatesWithTimestamp = {
			...updates,
			updatedAt: new Date()
		};

		return await this.update(planId, updatesWithTimestamp);
	}

	/**
	 * Schedule next session based on protocol frequency
	 */
	async scheduleNextSession(planId: string): Promise<ApiResponse<TreatmentPlan>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to schedule session'
			};
		}

		const planResult = await this.getById(planId);
		if (!planResult.success || !planResult.data) {
			return {
				success: false,
				error: 'Treatment plan not found'
			};
		}

		const plan = planResult.data;

		// Check if all sessions are completed
		if (plan.completedSessions >= plan.totalSessions) {
			return {
				success: false,
				error: 'All sessions have been completed'
			};
		}

		// Calculate next session date based on protocol frequency
		const nextSessionDate = this.calculateNextSessionDate(
			plan.startDate,
			plan.completedSessions,
			plan.protocol.frequency
		);

		return {
			success: true,
			data: plan,
			message: `Next session scheduled for ${nextSessionDate.toLocaleDateString()}`
		};
	}

	/**
	 * Mark a session as complete
	 */
	async markSessionComplete(
		planId: string,
		sessionData: {
			attendedBy: string;
			notes?: string;
			outcome?: string;
		}
	): Promise<ApiResponse<TreatmentPlan>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to mark session complete'
			};
		}

		const planResult = await this.getById(planId);
		if (!planResult.success || !planResult.data) {
			return {
				success: false,
				error: 'Treatment plan not found'
			};
		}

		const plan = planResult.data;

		// Check if already completed all sessions
		if (plan.completedSessions >= plan.totalSessions) {
			return {
				success: false,
				error: 'All sessions have already been completed'
			};
		}

		const newCompletedSessions = plan.completedSessions + 1;
		const newStatus: TreatmentPlanStatus =
			newCompletedSessions >= plan.totalSessions ? 'completed' : 'in-progress';

		return await this.update(planId, {
			completedSessions: newCompletedSessions,
			status: newStatus,
			updatedAt: new Date()
		});
	}

	/**
	 * Update progress manually
	 */
	async updateProgress(
		planId: string,
		completedSessions: number
	): Promise<ApiResponse<TreatmentPlan>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update progress'
			};
		}

		const planResult = await this.getById(planId);
		if (!planResult.success || !planResult.data) {
			return {
				success: false,
				error: 'Treatment plan not found'
			};
		}

		const plan = planResult.data;

		if (completedSessions < 0 || completedSessions > plan.totalSessions) {
			return {
				success: false,
				error: 'Invalid completed sessions count'
			};
		}

		const newStatus: TreatmentPlanStatus =
			completedSessions >= plan.totalSessions
				? 'completed'
				: completedSessions > 0
					? 'in-progress'
					: 'not-started';

		return await this.update(planId, {
			completedSessions,
			status: newStatus,
			updatedAt: new Date()
		});
	}

	/**
	 * Discontinue a treatment plan
	 */
	async discontinuePlan(planId: string, reason?: string): Promise<ApiResponse<TreatmentPlan>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to discontinue plan'
			};
		}

		return await this.update(planId, {
			status: 'discontinued',
			endDate: new Date(),
			updatedAt: new Date()
		});
	}

	/**
	 * Get active treatment plans for a patient
	 */
	async getPatientActivePlans(patientId: string): Promise<ApiResponse<TreatmentPlan[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch active plans'
			};
		}

		const plans = this.getData().filter(
			(p) =>
				p.patientId === patientId &&
				(p.status === 'in-progress' || p.status === 'not-started')
		);

		return {
			success: true,
			data: plans
		};
	}

	/**
	 * Get all treatment plans for a patient
	 */
	async getPatientPlans(patientId: string): Promise<ApiResponse<TreatmentPlan[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch patient plans'
			};
		}

		const plans = this.getData()
			.filter((p) => p.patientId === patientId)
			.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

		return {
			success: true,
			data: plans
		};
	}

	/**
	 * Get upcoming sessions across all active plans
	 */
	async getUpcomingSessions(): Promise<
		ApiResponse<
			Array<{
				plan: TreatmentPlan;
				nextSessionNumber: number;
				estimatedDate: Date;
			}>
		>
	> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch upcoming sessions'
			};
		}

		const activePlans = this.getData().filter((p) => p.status === 'in-progress');

		const upcomingSessions = activePlans
			.map((plan) => ({
				plan,
				nextSessionNumber: plan.completedSessions + 1,
				estimatedDate: this.calculateNextSessionDate(
					plan.startDate,
					plan.completedSessions,
					plan.protocol.frequency
				)
			}))
			.filter((session) => session.nextSessionNumber <= session.plan.totalSessions)
			.sort((a, b) => a.estimatedDate.getTime() - b.estimatedDate.getTime());

		return {
			success: true,
			data: upcomingSessions
		};
	}

	/**
	 * Get treatment plans by status
	 */
	async getPlansByStatus(status: TreatmentPlanStatus): Promise<ApiResponse<TreatmentPlan[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch plans'
			};
		}

		const plans = this.getData().filter((p) => p.status === status);

		return {
			success: true,
			data: plans
		};
	}

	/**
	 * Get treatment plans by doctor
	 */
	async getPlansByDoctor(doctorId: string): Promise<ApiResponse<TreatmentPlan[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch plans'
			};
		}

		const plans = this.getData()
			.filter((p) => p.doctorId === doctorId)
			.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

		return {
			success: true,
			data: plans
		};
	}

	/**
	 * Get treatment plans by protocol
	 */
	async getPlansByProtocol(protocolName: string): Promise<ApiResponse<TreatmentPlan[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch plans'
			};
		}

		const plans = this.getData().filter(
			(p) => p.protocol.name.toLowerCase() === protocolName.toLowerCase()
		);

		return {
			success: true,
			data: plans
		};
	}

	/**
	 * Calculate next session date based on frequency
	 */
	private calculateNextSessionDate(
		startDate: Date,
		completedSessions: number,
		frequency: string
	): Date {
		const nextDate = new Date(startDate);

		// Parse frequency string (e.g., "3x per week", "daily", "weekly", "every 3 weeks")
		const frequencyLower = frequency.toLowerCase();

		if (frequencyLower.includes('daily')) {
			nextDate.setDate(nextDate.getDate() + completedSessions);
		} else if (frequencyLower.includes('per week') || frequencyLower.includes('weekly')) {
			// Extract number if present (e.g., "3x per week" -> 3)
			const match = frequencyLower.match(/(\d+)x?\s*per week/);
			if (match) {
				const sessionsPerWeek = parseInt(match[1], 10);
				const daysPerSession = Math.floor(7 / sessionsPerWeek);
				nextDate.setDate(nextDate.getDate() + (completedSessions + 1) * daysPerSession);
			} else {
				// Default to weekly
				nextDate.setDate(nextDate.getDate() + (completedSessions + 1) * 7);
			}
		} else if (frequencyLower.includes('twice weekly')) {
			nextDate.setDate(nextDate.getDate() + (completedSessions + 1) * 3.5);
		} else if (frequencyLower.includes('monthly')) {
			nextDate.setMonth(nextDate.getMonth() + completedSessions + 1);
		} else if (frequencyLower.includes('every')) {
			// Parse "every X weeks/days"
			const match = frequencyLower.match(/every\s+(\d+)\s+(week|day)s?/);
			if (match) {
				const interval = parseInt(match[1], 10);
				const unit = match[2];
				if (unit === 'week') {
					nextDate.setDate(nextDate.getDate() + (completedSessions + 1) * interval * 7);
				} else {
					nextDate.setDate(nextDate.getDate() + (completedSessions + 1) * interval);
				}
			}
		} else {
			// Default: weekly
			nextDate.setDate(nextDate.getDate() + (completedSessions + 1) * 7);
		}

		return nextDate;
	}

	/**
	 * Auto-schedule sessions for a treatment plan
	 * This creates a schedule of all sessions based on the protocol
	 */
	autoScheduleSessions(plan: TreatmentPlan): TreatmentSession[] {
		const sessions: TreatmentSession[] = [];

		for (let i = 0; i < plan.totalSessions; i++) {
			const scheduledDate = this.calculateNextSessionDate(
				plan.startDate,
				i,
				plan.protocol.frequency
			);

			sessions.push({
				id: crypto.randomUUID(),
				planId: plan.id,
				sessionNumber: i + 1,
				scheduledDate
			});
		}

		return sessions;
	}
}

// Export singleton instance
export const treatmentPlanService = new TreatmentPlanService();
