/**
 * Staff Service
 * Extends MockService to provide CRUD operations and specialized methods for staff management
 */

import { MockService } from './mockService';
import type { Staff, Role, Department } from '$types';
import type { ApiResponse } from '$types/common';

export class StaffService extends MockService<Staff> {
	constructor(initialData: Staff[] = []) {
		super(initialData, {
			entityName: 'staff',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Get staff members by role
	 */
	async getStaffByRole(role: Role): Promise<ApiResponse<Staff[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch staff by role'
			};
		}

		const staffData = this.getData();
		const filteredStaff = staffData.filter((staff) => staff.role === role);

		return {
			success: true,
			data: filteredStaff
		};
	}

	/**
	 * Get staff members by department
	 */
	async getStaffByDepartment(department: Department): Promise<ApiResponse<Staff[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch staff by department'
			};
		}

		const staffData = this.getData();
		const filteredStaff = staffData.filter((staff) => staff.department === department);

		return {
			success: true,
			data: filteredStaff
		};
	}

	/**
	 * Assign a shift to a staff member
	 */
	async assignShift(staffId: string, shiftId: string): Promise<ApiResponse<Staff>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to assign shift'
			};
		}

		const staffResult = await this.getById(staffId);
		if (!staffResult.success || !staffResult.data) {
			return {
				success: false,
				error: 'Staff member not found'
			};
		}

		const staff = staffResult.data;
		const currentShifts = staff.schedule?.shifts || [];

		// Check if shift is already assigned
		if (currentShifts.includes(shiftId)) {
			return {
				success: false,
				error: 'Shift already assigned to this staff member'
			};
		}

		// Add shift to staff schedule
		const updatedShifts = [...currentShifts, shiftId];
		const updateResult = await this.update(staffId, {
			schedule: {
				...staff.schedule,
				shifts: updatedShifts,
				availability: staff.schedule?.availability || {},
				maxPatientsPerDay: staff.schedule?.maxPatientsPerDay,
				consultationDuration: staff.schedule?.consultationDuration
			}
		});

		return updateResult;
	}

	/**
	 * Update staff availability
	 */
	async updateAvailability(
		staffId: string,
		availability: Record<string, boolean>
	): Promise<ApiResponse<Staff>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update availability'
			};
		}

		const staffResult = await this.getById(staffId);
		if (!staffResult.success || !staffResult.data) {
			return {
				success: false,
				error: 'Staff member not found'
			};
		}

		const staff = staffResult.data;
		const updateResult = await this.update(staffId, {
			schedule: {
				shifts: staff.schedule?.shifts || [],
				availability,
				maxPatientsPerDay: staff.schedule?.maxPatientsPerDay,
				consultationDuration: staff.schedule?.consultationDuration
			}
		});

		return updateResult;
	}

	/**
	 * Get staff members by availability
	 * @param dayOfWeek - Day of week (e.g., 'monday', 'tuesday', etc.)
	 */
	async getStaffByAvailability(dayOfWeek: string): Promise<ApiResponse<Staff[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch staff by availability'
			};
		}

		const staffData = this.getData();
		const availableStaff = staffData.filter((staff) => {
			return staff.schedule?.availability?.[dayOfWeek] === true;
		});

		return {
			success: true,
			data: availableStaff
		};
	}

	/**
	 * Validate shift assignment for conflicts
	 * @param staffId - Staff member ID
	 * @param newShiftId - New shift ID to assign
	 * @returns True if no conflicts, false otherwise
	 */
	async validateShiftConflict(staffId: string, newShiftId: string): Promise<boolean> {
		const staffResult = await this.getById(staffId);
		if (!staffResult.success || !staffResult.data) {
			return false;
		}

		const currentShifts = staffResult.data.schedule?.shifts || [];
		// In a real implementation, you would check shift times for overlaps
		// For now, we just check if the shift is already assigned
		return !currentShifts.includes(newShiftId);
	}

	/**
	 * Check capacity limits for a staff member
	 * @param staffId - Staff member ID
	 * @returns True if under capacity, false otherwise
	 */
	async checkCapacityLimit(staffId: string): Promise<ApiResponse<{ underCapacity: boolean; currentLoad: number; maxCapacity?: number }>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to check capacity'
			};
		}

		const staffResult = await this.getById(staffId);
		if (!staffResult.success || !staffResult.data) {
			return {
				success: false,
				error: 'Staff member not found'
			};
		}

		const staff = staffResult.data;
		const maxCapacity = staff.schedule?.maxPatientsPerDay;
		const currentShifts = staff.schedule?.shifts || [];

		// In a real implementation, you would calculate current patient load
		// For now, we'll use shift count as a proxy
		const currentLoad = currentShifts.length;

		return {
			success: true,
			data: {
				underCapacity: maxCapacity ? currentLoad < maxCapacity : true,
				currentLoad,
				maxCapacity
			}
		};
	}
}

// Export singleton instance (will be initialized with seed data in the store)
export const staffService = new StaffService();
