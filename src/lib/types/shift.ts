import { z } from 'zod';
import { departmentSchema, shiftTypeSchema } from './staff';

/**
 * Shift Schedule Types
 * Defines shift assignments for staff members
 */

// Shift status
export const shiftStatusSchema = z.enum(['Scheduled', 'InProgress', 'Completed', 'Cancelled']);
export type ShiftStatus = z.infer<typeof shiftStatusSchema>;

// Shift schedule interface
export const shiftScheduleSchema = z.object({
	id: z.string(),
	staffId: z.string(), // Reference to Staff
	date: z.date(),
	startTime: z.string(), // Format: "HH:MM" (24-hour format)
	endTime: z.string(), // Format: "HH:MM" (24-hour format)
	shiftType: shiftTypeSchema, // Morning, Afternoon, Night, OnCall
	assignedDepartment: departmentSchema,
	status: shiftStatusSchema.default('Scheduled'),
	notes: z.string().optional(),
	// Audit fields
	createdAt: z.date(),
	updatedAt: z.date()
});
export type ShiftSchedule = z.infer<typeof shiftScheduleSchema>;

// Shift conflict information
export interface ShiftConflict {
	shiftId: string;
	staffId: string;
	conflictingShiftId: string;
	reason: string;
	severity: 'warning' | 'error';
}

// Staff utilization metrics
export interface StaffUtilization {
	staffId: string;
	totalShifts: number;
	totalHours: number;
	shiftsByType: Record<string, number>;
	utilizationRate: number; // Percentage (0-100)
}

// Shift coverage for a specific date and department
export interface ShiftCoverage {
	date: Date;
	department: string;
	shiftType: string;
	assignedStaffCount: number;
	requiredStaffCount: number;
	isFullyCovered: boolean;
}

// Shift filter params
export interface ShiftFilterParams {
	staffId?: string;
	department?: string;
	shiftType?: string;
	status?: ShiftStatus;
	startDate?: Date;
	endDate?: Date;
}

// DTOs for creating and updating shifts
export const createShiftDtoSchema = shiftScheduleSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});
export type CreateShiftDto = z.infer<typeof createShiftDtoSchema>;

export const updateShiftDtoSchema = shiftScheduleSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateShiftDto = z.infer<typeof updateShiftDtoSchema>;
