import { z } from 'zod';

// Referral Status Enum
export const referralStatusSchema = z.enum([
	'pending',
	'accepted',
	'rejected',
	'completed',
	'expired'
]);
export type ReferralStatus = z.infer<typeof referralStatusSchema>;

// Urgency Levels
export const urgencyLevelSchema = z.enum([
	'routine',
	'urgent',
	'stat'
]);
export type UrgencyLevel = z.infer<typeof urgencyLevelSchema>;

// External Facility Schema
export const externalFacilitySchema = z.object({
	id: z.string(),
	name: z.string().min(2, 'Facility name must be at least 2 characters'),
	specialty: z.string().min(2, 'Specialty must be at least 2 characters'),
	address: z.string().min(5, 'Address must be at least 5 characters'),
	contact: z.object({
		phone: z.string().min(5, 'Phone must be at least 5 characters'),
		email: z.string().email().optional(),
		fax: z.string().optional()
	}),
	// Additional metadata
	website: z.string().url().optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type ExternalFacility = z.infer<typeof externalFacilitySchema>;

// Referral Schema
export const referralSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	patientName: z.string().optional(), // Derived for display

	// Source information
	fromDoctorId: z.string(),
	fromDoctorName: z.string().optional(), // Derived for display
	fromDepartment: z.string().optional(), // Department name

	// Destination information (either internal or external)
	toDoctorId: z.string().optional(), // For internal referrals
	toDoctorName: z.string().optional(), // Derived for display
	toDepartment: z.string().optional(), // For internal referrals
	externalFacility: externalFacilitySchema.optional(), // For external referrals

	// Referral details
	reason: z.string().min(10, 'Reason must be at least 10 characters'),
	urgency: urgencyLevelSchema.default('routine'),
	status: referralStatusSchema.default('pending'),

	// Scheduling
	appointmentScheduled: z.boolean().default(false),
	appointmentId: z.string().optional(), // Link to scheduled appointment
	appointmentDate: z.date().optional(),

	// Clinical information
	clinicalSummary: z.string().optional(), // Brief patient history
	diagnosisCodes: z.array(z.string()).default([]), // ICD-10 codes
	relevantTests: z.array(z.string()).default([]), // Lab/imaging results to share
	medications: z.array(z.string()).default([]), // Current medications

	// Response from receiving provider
	response: z.string().optional(),
	responseDate: z.date().optional(),
	respondedBy: z.string().optional(), // DoctorId who responded

	// Notes and metadata
	notes: z.string().optional(),
	expiresAt: z.date().optional(), // For time-sensitive referrals
	createdAt: z.date(),
	updatedAt: z.date()
});
export type Referral = z.infer<typeof referralSchema>;

// DTOs for API operations
export const createReferralDtoSchema = referralSchema.omit({
	id: true,
	patientName: true,
	fromDoctorName: true,
	toDoctorName: true,
	appointmentScheduled: true,
	response: true,
	responseDate: true,
	respondedBy: true,
	createdAt: true,
	updatedAt: true
});
export type CreateReferralDto = z.infer<typeof createReferralDtoSchema>;

export const updateReferralDtoSchema = referralSchema
	.omit({
		id: true,
		patientName: true,
		fromDoctorName: true,
		toDoctorName: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateReferralDto = z.infer<typeof updateReferralDtoSchema>;

// Accept Referral DTO
export const acceptReferralDtoSchema = z.object({
	respondedBy: z.string(),
	response: z.string().optional(),
	appointmentDate: z.date().optional()
});
export type AcceptReferralDto = z.infer<typeof acceptReferralDtoSchema>;

// Reject Referral DTO
export const rejectReferralDtoSchema = z.object({
	respondedBy: z.string(),
	response: z.string().min(10, 'Please provide a reason for rejection')
});
export type RejectReferralDto = z.infer<typeof rejectReferralDtoSchema>;

// Create External Facility DTO
export const createExternalFacilityDtoSchema = externalFacilitySchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});
export type CreateExternalFacilityDto = z.infer<typeof createExternalFacilityDtoSchema>;

export const updateExternalFacilityDtoSchema = externalFacilitySchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateExternalFacilityDto = z.infer<typeof updateExternalFacilityDtoSchema>;

// Helper function to check if referral is internal
export function isInternalReferral(referral: Referral): boolean {
	return !!referral.toDoctorId && !referral.externalFacility;
}

// Helper function to check if referral is external
export function isExternalReferral(referral: Referral): boolean {
	return !!referral.externalFacility;
}

// Helper function to check if referral is expired
export function isReferralExpired(referral: Referral): boolean {
	if (!referral.expiresAt) return false;
	return new Date() > referral.expiresAt;
}

// Helper function to get urgency display color
export function getUrgencyColor(urgency: UrgencyLevel): string {
	switch (urgency) {
		case 'routine':
			return 'blue';
		case 'urgent':
			return 'orange';
		case 'stat':
			return 'red';
		default:
			return 'gray';
	}
}

// Helper function to get status display color
export function getStatusColor(status: ReferralStatus): string {
	switch (status) {
		case 'pending':
			return 'yellow';
		case 'accepted':
			return 'green';
		case 'rejected':
			return 'red';
		case 'completed':
			return 'blue';
		case 'expired':
			return 'gray';
		default:
			return 'gray';
	}
}

// Statistics interface
export interface ReferralStats {
	total: number;
	byStatus: Record<ReferralStatus, number>;
	byUrgency: Record<UrgencyLevel, number>;
	internal: number;
	external: number;
	pending: number;
	thisMonth: number;
	thisWeek: number;
}

// Pre-defined external facilities for common referral destinations
export const COMMON_EXTERNAL_FACILITIES: Omit<ExternalFacility, 'id' | 'createdAt' | 'updatedAt'>[] = [
	{
		name: 'University Hospital Imaging Center',
		specialty: 'Diagnostic Imaging (MRI, CT, PET)',
		address: '123 Medical Plaza, Downtown',
		contact: {
			phone: '555-0100',
			email: 'imaging@universityhospital.org',
			fax: '555-0101'
		},
		website: 'https://universityhospital.org/imaging',
		notes: 'Advanced imaging capabilities, same-day stat appointments available'
	},
	{
		name: 'Regional Oncology Center',
		specialty: 'Oncology & Radiation Therapy',
		address: '456 Cancer Treatment Way, Medical District',
		contact: {
			phone: '555-0200',
			email: 'referrals@regionaloncology.org',
			fax: '555-0201'
		},
		website: 'https://regionaloncology.org',
		notes: 'Comprehensive cancer care, clinical trials available'
	},
	{
		name: 'City Cardiac Institute',
		specialty: 'Cardiology & Cardiac Surgery',
		address: '789 Heart Lane, Medical District',
		contact: {
			phone: '555-0300',
			email: 'referrals@citycardiac.org',
			fax: '555-0301'
		},
		website: 'https://citycardiac.org',
		notes: 'Full cardiac catheterization lab, emergency cardiac services'
	},
	{
		name: 'Specialty Orthopedic Clinic',
		specialty: 'Orthopedic Surgery & Sports Medicine',
		address: '321 Sports Medicine Blvd, West End',
		contact: {
			phone: '555-0400',
			email: 'appointments@specialtyortho.com',
			fax: '555-0401'
		},
		website: 'https://specialtyortho.com',
		notes: 'Joint replacement specialists, sports injury rehabilitation'
	},
	{
		name: 'Advanced Neurology Associates',
		specialty: 'Neurology & Neurosurgery',
		address: '654 Brain Center Dr, Medical Campus',
		contact: {
			phone: '555-0500',
			email: 'neuro-referrals@advancedneuro.org',
			fax: '555-0501'
		},
		website: 'https://advancedneuro.org',
		notes: 'Comprehensive neurological care, stroke center, epilepsy program'
	},
	{
		name: 'Children\'s Hospital Pediatric Specialists',
		specialty: 'Pediatric Multi-Specialty',
		address: '987 Children\'s Way, Family District',
		contact: {
			phone: '555-0600',
			email: 'referrals@childrenshospital.org',
			fax: '555-0601'
		},
		website: 'https://childrenshospital.org',
		notes: 'Full pediatric specialty services, NICU, pediatric surgery'
	}
];
