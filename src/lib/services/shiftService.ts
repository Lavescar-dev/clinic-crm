/**
 * Shift Service
 * Extends MockService to provide shift scheduling, conflict detection, and staff utilization
 */

import { MockService } from './mockService';
import type {
	ShiftSchedule,
	ShiftConflict,
	StaffUtilization,
	ShiftCoverage,
	ShiftFilterParams,
	ShiftType
} from '$types';
import type { ApiResponse } from '$types/common';

export class ShiftService extends MockService<ShiftSchedule> {
	constructor(initialData: ShiftSchedule[] = []) {
		super(initialData, {
			entityName: 'shift',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Get shifts by staff ID
	 */
	async getShiftsByStaff(staffId: string): Promise<ApiResponse<ShiftSchedule[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch shifts by staff'
			};
		}

		const shifts = this.getData();
		const staffShifts = shifts.filter((shift) => shift.staffId === staffId);

		return {
			success: true,
			data: staffShifts
		};
	}

	/**
	 * Get shifts by date range
	 */
	async getShiftsByDateRange(
		startDate: Date,
		endDate: Date
	): Promise<ApiResponse<ShiftSchedule[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch shifts by date range'
			};
		}

		const shifts = this.getData();
		const filteredShifts = shifts.filter((shift) => {
			const shiftDate = new Date(shift.date);
			return shiftDate >= startDate && shiftDate <= endDate;
		});

		return {
			success: true,
			data: filteredShifts
		};
	}

	/**
	 * Get shifts with filters
	 */
	async getFilteredShifts(filters: ShiftFilterParams): Promise<ApiResponse<ShiftSchedule[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch filtered shifts'
			};
		}

		let shifts = this.getData();

		// Apply filters
		if (filters.staffId) {
			shifts = shifts.filter((shift) => shift.staffId === filters.staffId);
		}
		if (filters.department) {
			shifts = shifts.filter((shift) => shift.assignedDepartment === filters.department);
		}
		if (filters.shiftType) {
			shifts = shifts.filter((shift) => shift.shiftType === filters.shiftType);
		}
		if (filters.status) {
			shifts = shifts.filter((shift) => shift.status === filters.status);
		}
		if (filters.startDate && filters.endDate) {
			shifts = shifts.filter((shift) => {
				const shiftDate = new Date(shift.date);
				return (
					shiftDate >= filters.startDate! && shiftDate <= filters.endDate!
				);
			});
		}

		return {
			success: true,
			data: shifts
		};
	}

	/**
	 * Detect shift conflicts for a given staff member and date
	 */
	async detectShiftConflicts(
		staffId: string,
		date: Date,
		startTime: string,
		endTime: string,
		excludeShiftId?: string
	): Promise<ApiResponse<ShiftConflict[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to detect shift conflicts'
			};
		}

		const shifts = this.getData();
		const conflicts: ShiftConflict[] = [];

		// Get all shifts for the staff member on the same date
		const staffShifts = shifts.filter((shift) => {
			if (excludeShiftId && shift.id === excludeShiftId) {
				return false; // Skip the shift being edited
			}
			return (
				shift.staffId === staffId &&
				new Date(shift.date).toDateString() === date.toDateString()
			);
		});

		// Check for time overlaps
		for (const existingShift of staffShifts) {
			const hasOverlap = this.checkTimeOverlap(
				startTime,
				endTime,
				existingShift.startTime,
				existingShift.endTime
			);

			if (hasOverlap) {
				conflicts.push({
					shiftId: existingShift.id,
					staffId,
					conflictingShiftId: existingShift.id,
					reason: `Shift overlaps with ${existingShift.shiftType} shift (${existingShift.startTime} - ${existingShift.endTime})`,
					severity: 'error'
				});
			}
		}

		return {
			success: true,
			data: conflicts
		};
	}

	/**
	 * Check if two time ranges overlap
	 */
	private checkTimeOverlap(
		start1: string,
		end1: string,
		start2: string,
		end2: string
	): boolean {
		const startMinutes1 = this.timeToMinutes(start1);
		const endMinutes1 = this.timeToMinutes(end1);
		const startMinutes2 = this.timeToMinutes(start2);
		const endMinutes2 = this.timeToMinutes(end2);

		// Handle overnight shifts (end time < start time)
		const isOvernight1 = endMinutes1 < startMinutes1;
		const isOvernight2 = endMinutes2 < startMinutes2;

		if (!isOvernight1 && !isOvernight2) {
			// Standard case: both shifts within same day
			return startMinutes1 < endMinutes2 && endMinutes1 > startMinutes2;
		}

		// If either shift is overnight, there's likely an overlap
		// This is a simplified check - could be enhanced for production
		return true;
	}

	/**
	 * Convert time string (HH:MM) to minutes since midnight
	 */
	private timeToMinutes(time: string): number {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	/**
	 * Generate weekly shift schedule for a staff member
	 */
	async generateWeeklySchedule(
		staffId: string,
		startDate: Date,
		shiftType: ShiftType,
		department: string
	): Promise<ApiResponse<ShiftSchedule[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to generate weekly schedule'
			};
		}

		const shifts: ShiftSchedule[] = [];
		const shiftTimes = this.getShiftTimes(shiftType);

		// Generate shifts for 7 days
		for (let i = 0; i < 7; i++) {
			const shiftDate = new Date(startDate);
			shiftDate.setDate(shiftDate.getDate() + i);

			const shift: ShiftSchedule = {
				id: `shift-${Date.now()}-${i}`,
				staffId,
				date: shiftDate,
				startTime: shiftTimes.start,
				endTime: shiftTimes.end,
				shiftType,
				assignedDepartment: department as any,
				status: 'Scheduled',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			shifts.push(shift);
		}

		// Add shifts to storage
		for (const shift of shifts) {
			await this.create(shift);
		}

		return {
			success: true,
			data: shifts
		};
	}

	/**
	 * Get standard shift times based on shift type
	 */
	private getShiftTimes(shiftType: ShiftType): { start: string; end: string } {
		const shiftTimings: Record<ShiftType, { start: string; end: string }> = {
			Morning: { start: '06:00', end: '14:00' },
			Afternoon: { start: '14:00', end: '22:00' },
			Night: { start: '22:00', end: '06:00' },
			OnCall: { start: '00:00', end: '23:59' }
		};

		return shiftTimings[shiftType];
	}

	/**
	 * Calculate staff utilization for a given period
	 */
	async calculateStaffUtilization(
		staffId: string,
		startDate: Date,
		endDate: Date
	): Promise<ApiResponse<StaffUtilization>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to calculate staff utilization'
			};
		}

		const shiftsResult = await this.getFilteredShifts({
			staffId,
			startDate,
			endDate
		});

		if (!shiftsResult.success || !shiftsResult.data) {
			return {
				success: false,
				error: 'Failed to fetch shifts for utilization calculation'
			};
		}

		const shifts = shiftsResult.data;
		const totalShifts = shifts.length;
		let totalHours = 0;
		const shiftsByType: Record<string, number> = {};

		for (const shift of shifts) {
			// Calculate hours for this shift
			const hours = this.calculateShiftHours(shift.startTime, shift.endTime);
			totalHours += hours;

			// Count by shift type
			shiftsByType[shift.shiftType] = (shiftsByType[shift.shiftType] || 0) + 1;
		}

		// Calculate utilization rate
		// Assuming standard work hours: 40 hours/week, 160 hours/month
		const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		const expectedHours = (daysDiff / 7) * 40; // Approximate expected hours
		const utilizationRate = Math.min((totalHours / expectedHours) * 100, 100);

		return {
			success: true,
			data: {
				staffId,
				totalShifts,
				totalHours,
				shiftsByType,
				utilizationRate: Math.round(utilizationRate * 100) / 100
			}
		};
	}

	/**
	 * Calculate shift duration in hours
	 */
	private calculateShiftHours(startTime: string, endTime: string): number {
		const startMinutes = this.timeToMinutes(startTime);
		const endMinutes = this.timeToMinutes(endTime);

		let durationMinutes: number;
		if (endMinutes >= startMinutes) {
			durationMinutes = endMinutes - startMinutes;
		} else {
			// Overnight shift
			durationMinutes = (24 * 60 - startMinutes) + endMinutes;
		}

		return durationMinutes / 60;
	}

	/**
	 * Get shift coverage for a specific date and department
	 */
	async getShiftCoverage(
		date: Date,
		department: string
	): Promise<ApiResponse<ShiftCoverage[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to get shift coverage'
			};
		}

		const shiftsResult = await this.getFilteredShifts({
			department,
			startDate: date,
			endDate: date
		});

		if (!shiftsResult.success || !shiftsResult.data) {
			return {
				success: false,
				error: 'Failed to fetch shifts for coverage analysis'
			};
		}

		const shifts = shiftsResult.data;
		const shiftTypes: ShiftType[] = ['Morning', 'Afternoon', 'Night', 'OnCall'];
		const coverage: ShiftCoverage[] = [];

		// Required staff per shift (could be configurable per department)
		const requiredStaffPerShift = 2;

		for (const shiftType of shiftTypes) {
			const shiftsOfType = shifts.filter((s) => s.shiftType === shiftType);
			const assignedStaffCount = shiftsOfType.length;

			coverage.push({
				date,
				department,
				shiftType,
				assignedStaffCount,
				requiredStaffCount: requiredStaffPerShift,
				isFullyCovered: assignedStaffCount >= requiredStaffPerShift
			});
		}

		return {
			success: true,
			data: coverage
		};
	}
}

// Export singleton instance
export const shiftService = new ShiftService();
