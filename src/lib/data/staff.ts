/**
 * Staff Data - Generates Staff records based on User seed data
 *
 * This module creates Staff records that link to the User records in seedData.ts,
 * adding role-specific information like schedules, permissions, and specializations.
 */

import type { Staff, Role, Department, Specialization } from '$types';
import { rolePermissionMatrix } from '$types/staff';
import { seedStaff as seedUsers } from './seedData';
import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';

// Map User roles to Staff Role enum
const roleMapping: Record<string, Role> = {
	admin: 'Admin',
	doctor: 'Doctor',
	nurse: 'Nurse',
	receptionist: 'Receptionist',
	pharmacist: 'Pharmacist',
	labTechnician: 'LabTechnician'
};

// Map Turkish department names to Department enum
const departmentMapping: Record<string, Department> = {
	Yönetim: 'Administration',
	Dahiliye: 'Cardiology',
	Cerrahi: 'Surgery',
	Hemşirelik: 'Emergency',
	Resepsiyon: 'Administration',
	Laboratuvar: 'Laboratory',
	Radyoloji: 'Radiology',
	Eczane: 'Pharmacy',
	'Acil Servis': 'Emergency',
	Kardiyoloji: 'Cardiology',
	Ortopedi: 'Surgery',
	Nöroloji: 'Surgery',
	Pediatri: 'Pediatrics',
	'Genel Cerrahi': 'Surgery',
	'Göz Hastalıkları': 'Surgery',
	'Kulak Burun Boğaz': 'Surgery',
	Dermatoloji: 'Surgery',
	'Fizik Tedavi ve Rehabilitasyon': 'Surgery'
};

// Map Turkish specializations to Specialization enum
const specializationMapping: Record<string, Specialization> = {
	Kardiyoloji: 'Cardiologist',
	Pediatri: 'Pediatrician',
	Cerrahi: 'Surgeon',
	'Genel Cerrahi': 'Surgeon',
	Radyoloji: 'Radiologist',
	'Acil Servis': 'Emergency Medicine',
	Dahiliye: 'General Practitioner',
	Ortopedi: 'Orthopedist',
	Nöroloji: 'Neurologist',
	Dermatoloji: 'Dermatologist',
	'Göz Hastalıkları': 'General Practitioner',
	'Kulak Burun Boğaz': 'General Practitioner',
	'Fizik Tedavi ve Rehabilitasyon': 'General Practitioner'
};

// Helper to generate shift IDs (will be replaced with actual shift data later)
function generateShiftIds(count: number = 3): string[] {
	return Array.from({ length: count }, () => nanoid());
}

// Helper to generate availability map
function generateAvailability(): Record<string, boolean> {
	return {
		monday: true,
		tuesday: true,
		wednesday: true,
		thursday: true,
		friday: true,
		saturday: faker.datatype.boolean({ probability: 0.3 }),
		sunday: false
	};
}

// Generate Staff records from User seed data
function generateStaffFromUsers(): Staff[] {
	return seedUsers.map((user) => {
		const mappedRole = roleMapping[user.role] || 'Admin';
		const mappedDepartment = departmentMapping[user.department || 'Yönetim'] || 'Administration';

		// Map specialization for doctors
		let specialization: Specialization = null;
		if (mappedRole === 'Doctor' && user.specialization) {
			specialization = specializationMapping[user.specialization] || 'General Practitioner';
		} else if (mappedRole === 'Nurse') {
			specialization = faker.helpers.arrayElement([
				'Emergency Nurse',
				'Pediatric Nurse',
				'Surgical Nurse',
				'ICU Nurse',
				'General Nurse'
			] as const);
		} else if (mappedRole === 'LabTechnician') {
			specialization = faker.helpers.arrayElement([
				'Hematology',
				'Microbiology',
				'Clinical Chemistry',
				'Pathology',
				'General Lab'
			] as const);
		} else if (mappedRole === 'Pharmacist') {
			specialization = faker.helpers.arrayElement([
				'Clinical Pharmacist',
				'Dispensing Pharmacist',
				'General Pharmacist'
			] as const);
		}

		// Generate schedule (for clinical staff)
		const needsSchedule = ['Doctor', 'Nurse', 'LabTechnician'].includes(mappedRole);
		const schedule = needsSchedule
			? {
					shifts: generateShiftIds(faker.number.int({ min: 2, max: 5 })),
					availability: generateAvailability(),
					maxPatientsPerDay:
						mappedRole === 'Doctor'
							? faker.number.int({ min: 15, max: 30 })
							: mappedRole === 'Nurse'
								? faker.number.int({ min: 20, max: 40 })
								: undefined,
					consultationDuration:
						mappedRole === 'Doctor' ? faker.helpers.arrayElement([15, 20, 30]) : undefined
				}
			: undefined;

		// Get permissions based on role
		const permissions = rolePermissionMatrix[mappedRole];

		const staff: Staff = {
			id: nanoid(),
			userId: user.id,
			role: mappedRole,
			department: mappedDepartment,
			specialization,
			licenseNumber: user.licenseNumber,
			hireDate: user.createdAt,
			status: user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Active',
			schedule,
			permissions,
			photo: user.avatar,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};

		return staff;
	});
}

// Export staff data
export const mockStaff: Staff[] = generateStaffFromUsers();

// Export staff by role for easy access
export const mockStaffByRole = {
	doctors: mockStaff.filter((s) => s.role === 'Doctor'),
	nurses: mockStaff.filter((s) => s.role === 'Nurse'),
	receptionists: mockStaff.filter((s) => s.role === 'Receptionist'),
	labTechnicians: mockStaff.filter((s) => s.role === 'LabTechnician'),
	admins: mockStaff.filter((s) => s.role === 'Admin'),
	pharmacists: mockStaff.filter((s) => s.role === 'Pharmacist')
};

// Export counts for verification
export const staffCounts = {
	total: mockStaff.length,
	doctors: mockStaffByRole.doctors.length,
	nurses: mockStaffByRole.nurses.length,
	receptionists: mockStaffByRole.receptionists.length,
	labTechnicians: mockStaffByRole.labTechnicians.length,
	admins: mockStaffByRole.admins.length,
	pharmacists: mockStaffByRole.pharmacists.length
};
