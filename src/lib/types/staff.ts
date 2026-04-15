import { z } from 'zod';
import type { AuditFields } from './common';

// Role enumeration
export const roleSchema = z.enum([
	'Doctor',
	'Nurse',
	'Receptionist',
	'LabTechnician',
	'Admin',
	'Pharmacist'
]);
export type Role = z.infer<typeof roleSchema>;

// Department enumeration
export const departmentSchema = z.enum([
	'Emergency',
	'Cardiology',
	'Pediatrics',
	'Surgery',
	'Radiology',
	'Laboratory',
	'Pharmacy',
	'Administration'
]);
export type Department = z.infer<typeof departmentSchema>;

// Specialization types per role
export const doctorSpecializationSchema = z.enum([
	'Cardiologist',
	'Pediatrician',
	'Surgeon',
	'Radiologist',
	'Emergency Medicine',
	'General Practitioner',
	'Orthopedist',
	'Neurologist',
	'Dermatologist',
	'Psychiatrist'
]);
export type DoctorSpecialization = z.infer<typeof doctorSpecializationSchema>;

export const nurseSpecializationSchema = z.enum([
	'Emergency Nurse',
	'Pediatric Nurse',
	'Surgical Nurse',
	'ICU Nurse',
	'General Nurse',
	'Anesthesia Nurse'
]);
export type NurseSpecialization = z.infer<typeof nurseSpecializationSchema>;

export const labTechnicianSpecializationSchema = z.enum([
	'Hematology',
	'Microbiology',
	'Clinical Chemistry',
	'Pathology',
	'General Lab'
]);
export type LabTechnicianSpecialization = z.infer<typeof labTechnicianSpecializationSchema>;

export const pharmacistSpecializationSchema = z.enum([
	'Clinical Pharmacist',
	'Dispensing Pharmacist',
	'General Pharmacist'
]);
export type PharmacistSpecialization = z.infer<typeof pharmacistSpecializationSchema>;

// Union type for all specializations
export type Specialization =
	| DoctorSpecialization
	| NurseSpecialization
	| LabTechnicianSpecialization
	| PharmacistSpecialization
	| null;

// Shift types
export const shiftTypeSchema = z.enum(['Morning', 'Afternoon', 'Night', 'OnCall']);
export type ShiftType = z.infer<typeof shiftTypeSchema>;

// Staff status
export const staffStatusSchema = z.enum(['Active', 'OnLeave', 'Inactive']);
export type StaffStatus = z.infer<typeof staffStatusSchema>;

// Schedule interface
export const scheduleSchema = z.object({
	shifts: z.array(z.string()), // Array of shift IDs
	availability: z.record(z.string(), z.boolean()), // Day of week -> available
	maxPatientsPerDay: z.number().min(1).optional(),
	consultationDuration: z.number().min(5).optional() // Duration in minutes
});
export type Schedule = z.infer<typeof scheduleSchema>;

// Granular permission flags
export const permissionFlagsSchema = z.object({
	canViewPatients: z.boolean().default(false),
	canEditPatients: z.boolean().default(false),
	canDeletePatients: z.boolean().default(false),
	canViewEMR: z.boolean().default(false),
	canEditEMR: z.boolean().default(false),
	canViewAppointments: z.boolean().default(false),
	canCreateAppointments: z.boolean().default(false),
	canEditAppointments: z.boolean().default(false),
	canCancelAppointments: z.boolean().default(false),
	canApprovePrescriptions: z.boolean().default(false),
	canDispenseMedication: z.boolean().default(false),
	canViewBilling: z.boolean().default(false),
	canCreateBilling: z.boolean().default(false),
	canProcessPayments: z.boolean().default(false),
	canViewInventory: z.boolean().default(false),
	canManageInventory: z.boolean().default(false),
	canViewLab: z.boolean().default(false),
	canManageLab: z.boolean().default(false),
	canViewStaff: z.boolean().default(false),
	canManageStaff: z.boolean().default(false),
	canViewReports: z.boolean().default(false),
	canManageSettings: z.boolean().default(false),
	canViewShifts: z.boolean().default(false),
	canManageShifts: z.boolean().default(false)
});
export type PermissionFlags = z.infer<typeof permissionFlagsSchema>;

// Staff interface
export const staffSchema = z.object({
	id: z.string(),
	userId: z.string(), // Links to User record
	role: roleSchema,
	department: departmentSchema,
	specialization: z
		.union([
			doctorSpecializationSchema,
			nurseSpecializationSchema,
			labTechnicianSpecializationSchema,
			pharmacistSpecializationSchema,
			z.null()
		])
		.optional(),
	licenseNumber: z.string().optional(),
	hireDate: z.date(),
	status: staffStatusSchema.default('Active'),
	schedule: scheduleSchema.optional(),
	permissions: permissionFlagsSchema.optional(),
	// Additional fields
	photo: z.string().url().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type Staff = z.infer<typeof staffSchema>;

// Role-based permission matrices
export const rolePermissionMatrix: Record<Role, PermissionFlags> = {
	Doctor: {
		canViewPatients: true,
		canEditPatients: true,
		canDeletePatients: false,
		canViewEMR: true,
		canEditEMR: true,
		canViewAppointments: true,
		canCreateAppointments: true,
		canEditAppointments: true,
		canCancelAppointments: true,
		canApprovePrescriptions: true,
		canDispenseMedication: false,
		canViewBilling: true,
		canCreateBilling: true,
		canProcessPayments: false,
		canViewInventory: true,
		canManageInventory: false,
		canViewLab: true,
		canManageLab: false,
		canViewStaff: true,
		canManageStaff: false,
		canViewReports: true,
		canManageSettings: false,
		canViewShifts: true,
		canManageShifts: false
	},
	Nurse: {
		canViewPatients: true,
		canEditPatients: true,
		canDeletePatients: false,
		canViewEMR: true,
		canEditEMR: true,
		canViewAppointments: true,
		canCreateAppointments: true,
		canEditAppointments: true,
		canCancelAppointments: false,
		canApprovePrescriptions: false,
		canDispenseMedication: false,
		canViewBilling: false,
		canCreateBilling: false,
		canProcessPayments: false,
		canViewInventory: true,
		canManageInventory: false,
		canViewLab: true,
		canManageLab: false,
		canViewStaff: true,
		canManageStaff: false,
		canViewReports: false,
		canManageSettings: false,
		canViewShifts: true,
		canManageShifts: false
	},
	Receptionist: {
		canViewPatients: true,
		canEditPatients: true,
		canDeletePatients: false,
		canViewEMR: false,
		canEditEMR: false,
		canViewAppointments: true,
		canCreateAppointments: true,
		canEditAppointments: true,
		canCancelAppointments: true,
		canApprovePrescriptions: false,
		canDispenseMedication: false,
		canViewBilling: true,
		canCreateBilling: true,
		canProcessPayments: true,
		canViewInventory: false,
		canManageInventory: false,
		canViewLab: false,
		canManageLab: false,
		canViewStaff: true,
		canManageStaff: false,
		canViewReports: false,
		canManageSettings: false,
		canViewShifts: true,
		canManageShifts: false
	},
	LabTechnician: {
		canViewPatients: true,
		canEditPatients: false,
		canDeletePatients: false,
		canViewEMR: true,
		canEditEMR: false,
		canViewAppointments: true,
		canCreateAppointments: false,
		canEditAppointments: false,
		canCancelAppointments: false,
		canApprovePrescriptions: false,
		canDispenseMedication: false,
		canViewBilling: false,
		canCreateBilling: false,
		canProcessPayments: false,
		canViewInventory: true,
		canManageInventory: false,
		canViewLab: true,
		canManageLab: true,
		canViewStaff: false,
		canManageStaff: false,
		canViewReports: true,
		canManageSettings: false,
		canViewShifts: true,
		canManageShifts: false
	},
	Admin: {
		canViewPatients: true,
		canEditPatients: true,
		canDeletePatients: true,
		canViewEMR: true,
		canEditEMR: true,
		canViewAppointments: true,
		canCreateAppointments: true,
		canEditAppointments: true,
		canCancelAppointments: true,
		canApprovePrescriptions: true,
		canDispenseMedication: true,
		canViewBilling: true,
		canCreateBilling: true,
		canProcessPayments: true,
		canViewInventory: true,
		canManageInventory: true,
		canViewLab: true,
		canManageLab: true,
		canViewStaff: true,
		canManageStaff: true,
		canViewReports: true,
		canManageSettings: true,
		canViewShifts: true,
		canManageShifts: true
	},
	Pharmacist: {
		canViewPatients: true,
		canEditPatients: false,
		canDeletePatients: false,
		canViewEMR: true,
		canEditEMR: false,
		canViewAppointments: true,
		canCreateAppointments: false,
		canEditAppointments: false,
		canCancelAppointments: false,
		canApprovePrescriptions: false,
		canDispenseMedication: true,
		canViewBilling: true,
		canCreateBilling: false,
		canProcessPayments: false,
		canViewInventory: true,
		canManageInventory: true,
		canViewLab: false,
		canManageLab: false,
		canViewStaff: false,
		canManageStaff: false,
		canViewReports: true,
		canManageSettings: false,
		canViewShifts: true,
		canManageShifts: false
	}
};

// DTOs for creating and updating staff
export const createStaffDtoSchema = staffSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});
export type CreateStaffDto = z.infer<typeof createStaffDtoSchema>;

export const updateStaffDtoSchema = staffSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateStaffDto = z.infer<typeof updateStaffDtoSchema>;
