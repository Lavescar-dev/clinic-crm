/**
 * Shift Data - Generates ShiftSchedule records for staff members
 *
 * This module creates realistic shift schedules with:
 * - 2 weeks of historical shifts (completed/in-progress)
 * - 1 month of upcoming shifts (scheduled)
 */

import type { ShiftSchedule, ShiftType, ShiftStatus } from '$types';
import { mockStaff } from './staff';
import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';

// Standard shift times
const shiftTimes: Record<ShiftType, { start: string; end: string }> = {
	Morning: { start: '06:00', end: '14:00' },
	Afternoon: { start: '14:00', end: '22:00' },
	Night: { start: '22:00', end: '06:00' },
	OnCall: { start: '00:00', end: '23:59' }
};

// Helper to get a date offset from today
function getDateOffset(daysOffset: number): Date {
	const date = new Date();
	date.setDate(date.getDate() + daysOffset);
	date.setHours(0, 0, 0, 0);
	return date;
}

// Helper to determine shift status based on date
function getShiftStatus(shiftDate: Date): ShiftStatus {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const shift = new Date(shiftDate);
	shift.setHours(0, 0, 0, 0);

	if (shift < today) {
		// Historical shift - mostly completed
		return faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Cancelled']);
	} else if (shift.getTime() === today.getTime()) {
		// Today - in progress or scheduled
		return faker.helpers.arrayElement(['InProgress', 'Scheduled']);
	} else {
		// Future shift - scheduled
		return 'Scheduled';
	}
}

// Generate shifts for a single staff member
function generateStaffShifts(
	staffId: string,
	staffDepartment: string,
	startDayOffset: number,
	endDayOffset: number
): ShiftSchedule[] {
	const shifts: ShiftSchedule[] = [];

	// Get staff availability from mockStaff
	const staff = mockStaff.find((s) => s.id === staffId);
	if (!staff || !staff.schedule) {
		return shifts;
	}

	const availability = staff.schedule.availability || {};
	const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

	// Generate shifts for the date range
	for (let dayOffset = startDayOffset; dayOffset <= endDayOffset; dayOffset++) {
		const shiftDate = getDateOffset(dayOffset);
		const dayName = dayNames[shiftDate.getDay()];

		// Check if staff is available on this day
		if (!availability[dayName]) {
			continue;
		}

		// Determine shift type based on role and random distribution
		let shiftType: ShiftType;
		if (staff.role === 'Doctor') {
			// Doctors typically work morning or afternoon shifts
			shiftType = faker.helpers.arrayElement(['Morning', 'Afternoon', 'Morning', 'Afternoon', 'OnCall']);
		} else if (staff.role === 'Nurse') {
			// Nurses work all shift types
			shiftType = faker.helpers.arrayElement(['Morning', 'Afternoon', 'Night', 'Morning']);
		} else {
			// Lab technicians, pharmacists work mostly morning/afternoon
			shiftType = faker.helpers.arrayElement(['Morning', 'Afternoon']);
		}

		const times = shiftTimes[shiftType];
		const status = getShiftStatus(shiftDate);

		const shift: ShiftSchedule = {
			id: nanoid(),
			staffId,
			date: shiftDate,
			startTime: times.start,
			endTime: times.end,
			shiftType,
			assignedDepartment: staffDepartment as any,
			status,
			notes: status === 'Cancelled' ? faker.helpers.arrayElement([
				'Personal emergency',
				'Sick leave',
				'Family matter',
				'Swapped with colleague'
			]) : undefined,
			createdAt: new Date(shiftDate.getTime() - 7 * 24 * 60 * 60 * 1000), // Created 1 week before
			updatedAt: new Date()
		};

		shifts.push(shift);
	}

	return shifts;
}

// Generate all shift schedules
function generateAllShifts(): ShiftSchedule[] {
	const allShifts: ShiftSchedule[] = [];

	// Only generate shifts for clinical staff (doctors, nurses, lab technicians)
	const clinicalStaff = mockStaff.filter((s) =>
		['Doctor', 'Nurse', 'LabTechnician'].includes(s.role)
	);

	for (const staff of clinicalStaff) {
		// Historical shifts: -14 to -1 days (2 weeks ago to yesterday)
		const historicalShifts = generateStaffShifts(staff.id, staff.department, -14, -1);
		allShifts.push(...historicalShifts);

		// Upcoming shifts: 0 to +30 days (today to 1 month from now)
		const upcomingShifts = generateStaffShifts(staff.id, staff.department, 0, 30);
		allShifts.push(...upcomingShifts);
	}

	return allShifts;
}

// Export shift data
export const mockShifts: ShiftSchedule[] = generateAllShifts();

// Export shifts grouped by status
export const mockShiftsByStatus = {
	scheduled: mockShifts.filter((s) => s.status === 'Scheduled'),
	inProgress: mockShifts.filter((s) => s.status === 'InProgress'),
	completed: mockShifts.filter((s) => s.status === 'Completed'),
	cancelled: mockShifts.filter((s) => s.status === 'Cancelled')
};

// Export shifts grouped by shift type
export const mockShiftsByType = {
	morning: mockShifts.filter((s) => s.shiftType === 'Morning'),
	afternoon: mockShifts.filter((s) => s.shiftType === 'Afternoon'),
	night: mockShifts.filter((s) => s.shiftType === 'Night'),
	onCall: mockShifts.filter((s) => s.shiftType === 'OnCall')
};

// Export counts for verification
export const shiftCounts = {
	total: mockShifts.length,
	scheduled: mockShiftsByStatus.scheduled.length,
	inProgress: mockShiftsByStatus.inProgress.length,
	completed: mockShiftsByStatus.completed.length,
	cancelled: mockShiftsByStatus.cancelled.length,
	morning: mockShiftsByType.morning.length,
	afternoon: mockShiftsByType.afternoon.length,
	night: mockShiftsByType.night.length,
	onCall: mockShiftsByType.onCall.length
};
