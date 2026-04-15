import { z } from 'zod';

// Treatment Plan Status
export const treatmentPlanStatusSchema = z.enum([
	'not-started',
	'in-progress',
	'completed',
	'discontinued',
	'on-hold'
]);
export type TreatmentPlanStatus = z.infer<typeof treatmentPlanStatusSchema>;

// Treatment Protocol Schema
export const treatmentProtocolSchema = z.object({
	name: z.string().min(2, 'Protocol name must be at least 2 characters'),
	description: z.string().min(10, 'Protocol description must be at least 10 characters'),
	sessionCount: z.number().int().positive('Session count must be positive'),
	frequency: z.string().describe('e.g., "3x per week", "daily", "weekly"'),
	sessionDuration: z.number().int().positive('Session duration must be positive (in minutes)'),
	procedures: z.array(z.string()).default([]),
	goals: z.array(z.string()).default([]),
	successCriteria: z.array(z.string()).default([])
});
export type TreatmentProtocol = z.infer<typeof treatmentProtocolSchema>;

// Treatment Session Schema
export const treatmentSessionSchema = z.object({
	id: z.string(),
	planId: z.string(),
	sessionNumber: z.number().int().positive(),
	scheduledDate: z.date(),
	completedDate: z.date().optional(),
	attendedBy: z.string().optional(), // doctorId or therapistId
	notes: z.string().optional(),
	outcome: z.string().optional(),
	nextSessionDate: z.date().optional()
});
export type TreatmentSession = z.infer<typeof treatmentSessionSchema>;

// Treatment Plan Schema
export const treatmentPlanSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	doctorId: z.string(),
	diagnosisICD10: z.string().optional(),
	startDate: z.date(),
	endDate: z.date().optional(),
	status: treatmentPlanStatusSchema.default('not-started'),
	totalSessions: z.number().int().positive(),
	completedSessions: z.number().int().min(0).default(0),
	protocol: treatmentProtocolSchema,
	createdAt: z.date(),
	updatedAt: z.date()
});
export type TreatmentPlan = z.infer<typeof treatmentPlanSchema>;

// DTOs for API operations
export const createTreatmentPlanDtoSchema = treatmentPlanSchema.omit({
	id: true,
	completedSessions: true,
	createdAt: true,
	updatedAt: true
});
export type CreateTreatmentPlanDto = z.infer<typeof createTreatmentPlanDtoSchema>;

export const updateTreatmentPlanDtoSchema = treatmentPlanSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateTreatmentPlanDto = z.infer<typeof updateTreatmentPlanDtoSchema>;

// Pre-defined treatment protocols
export const PREDEFINED_PROTOCOLS: Record<string, Omit<TreatmentProtocol, 'description'> & { description: string }> = {
	physiotherapy_standard: {
		name: 'Standard Physiotherapy',
		description: 'Standard physiotherapy protocol for musculoskeletal rehabilitation',
		sessionCount: 12,
		frequency: '3x per week',
		sessionDuration: 45,
		procedures: ['Manual therapy', 'Therapeutic exercises', 'Electrotherapy', 'Patient education'],
		goals: [
			'Reduce pain and inflammation',
			'Improve range of motion',
			'Restore functional movement',
			'Prevent recurrence'
		],
		successCriteria: [
			'Pain level reduced to 2/10 or less',
			'Full range of motion restored',
			'Return to normal daily activities'
		]
	},
	physiotherapy_postop: {
		name: 'Post-Operative Physiotherapy',
		description: 'Rehabilitation protocol following orthopedic surgery',
		sessionCount: 18,
		frequency: '2x per week',
		sessionDuration: 60,
		procedures: ['Wound care assessment', 'Gentle mobilization', 'Progressive strengthening', 'Gait training'],
		goals: [
			'Promote healing',
			'Prevent complications',
			'Restore strength and mobility',
			'Return to pre-surgery function level'
		],
		successCriteria: [
			'Surgical site healed',
			'No signs of complications',
			'Strength at 80% or greater of unaffected side'
		]
	},
	dental_treatment_phases: {
		name: 'Multi-Phase Dental Treatment',
		description: 'Comprehensive dental treatment plan with multiple visit phases',
		sessionCount: 6,
		frequency: 'Weekly',
		sessionDuration: 60,
		procedures: ['Initial assessment', 'Cleaning and scaling', 'Restorative work', 'Crown preparation', 'Crown placement', 'Follow-up'],
		goals: [
			'Restore oral health',
			'Eliminate decay and infection',
			'Restore function and aesthetics',
			'Establish preventive care routine'
		],
		successCriteria: [
			'All active decay treated',
			'No pain or infection',
			'Proper occlusion restored',
			'Patient satisfaction with appearance'
		]
	},
	dental_implant: {
		name: 'Dental Implant Treatment',
		description: 'Complete dental implant placement and restoration protocol',
		sessionCount: 4,
		frequency: 'Monthly',
		sessionDuration: 90,
		procedures: ['Pre-surgical consultation', 'Implant placement', 'Healing assessment', 'Crown placement'],
		goals: [
			'Successful implant integration',
			'Restore missing tooth function',
			'Natural appearance',
			'Long-term stability'
		],
		successCriteria: [
			'Implant osseointegration confirmed',
			'No signs of infection or rejection',
			'Proper bite alignment',
			'Patient comfort and satisfaction'
		]
	},
	chemotherapy_standard: {
		name: 'Standard Chemotherapy Cycle',
		description: 'Standard multi-cycle chemotherapy protocol',
		sessionCount: 6,
		frequency: 'Every 3 weeks',
		sessionDuration: 180,
		procedures: ['Pre-treatment labs', 'IV chemotherapy infusion', 'Post-treatment monitoring', 'Side effect management'],
		goals: [
			'Tumor size reduction',
			'Prevent cancer progression',
			'Minimize side effects',
			'Maintain quality of life'
		],
		successCriteria: [
			'Tumor markers decreased by 50% or more',
			'Imaging shows tumor shrinkage',
			'Manageable side effects',
			'Treatment completed as planned'
		]
	},
	wound_care_standard: {
		name: 'Standard Wound Care Protocol',
		description: 'Comprehensive wound care and healing protocol',
		sessionCount: 8,
		frequency: 'Twice weekly',
		sessionDuration: 30,
		procedures: ['Wound assessment', 'Debridement if needed', 'Dressing change', 'Patient education'],
		goals: [
			'Promote wound healing',
			'Prevent infection',
			'Minimize scarring',
			'Patient independence in care'
		],
		successCriteria: [
			'Wound size reduced by 75% or more',
			'No signs of infection',
			'Healthy granulation tissue',
			'Patient able to perform self-care'
		]
	},
	wound_care_diabetic: {
		name: 'Diabetic Wound Care',
		description: 'Specialized wound care protocol for diabetic patients',
		sessionCount: 12,
		frequency: 'Twice weekly',
		sessionDuration: 45,
		procedures: [
			'Comprehensive assessment',
			'Blood sugar monitoring',
			'Specialized dressing',
			'Pressure offloading',
			'Vascular assessment'
		],
		goals: [
			'Achieve complete wound closure',
			'Prevent infection and complications',
			'Optimize blood sugar control',
			'Prevent recurrence'
		],
		successCriteria: [
			'Complete wound closure',
			'HbA1c under 7%',
			'No signs of infection or necrosis',
			'Patient adherent to prevention strategies'
		]
	}
};

// Helper function to get protocol by key
export function getPredefinedProtocol(key: keyof typeof PREDEFINED_PROTOCOLS): TreatmentProtocol {
	return PREDEFINED_PROTOCOLS[key];
}

// Helper function to get all protocol names
export function getAllProtocolNames(): string[] {
	return Object.values(PREDEFINED_PROTOCOLS).map(p => p.name);
}

// Statistics interface
export interface TreatmentPlanStats {
	total: number;
	notStarted: number;
	inProgress: number;
	completed: number;
	discontinued: number;
	onHold: number;
	avgCompletionRate: number;
}
