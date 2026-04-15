// Theme store
export { theme } from './theme';
export type { Theme } from './theme';

// Auth store
export {
	auth,
	isAuthenticated,
	currentUser,
	userRole,
	isAuthLoading,
	staffRole,
	userPermissions
} from './auth';

// Patients store
export {
	patients,
	filteredPatients,
	patientStats
} from './patients';

// Appointments store
export {
	appointments,
	filteredAppointments,
	todaysAppointments,
	upcomingAppointments,
	appointmentStats
} from './appointments';

// EMR store
export {
	emr,
	filteredRecords,
	recentRecords,
	emrStats
} from './emr';

// Billing store
export {
	billing,
	filteredInvoices,
	billingStats,
	recentPayments
} from './billing';

// Inventory store
export {
	inventory,
	filteredInventory,
	stockAlerts,
	inventoryStats,
	itemsNeedingReorder
} from './inventory';

// Notifications store
export {
	notifications,
	filteredNotifications,
	unreadCount,
	unreadNotifications,
	recentNotifications
} from './notifications';

// Staff store
export {
	staff,
	filteredStaff,
	staffStatsByRole,
	staffStatsByDepartment,
	activeStaff,
	staffOnLeave
} from './staff';

// Shifts store
export {
	shifts,
	filteredShifts as filteredShiftSchedules,
	upcomingShifts,
	todayShifts
} from './shifts';

// Lab store
export {
	lab,
	pendingCollectionOrders,
	inProgressOrders,
	pendingReviewOrders,
	completedOrders,
	statOrders,
	filteredOrders,
	labStats
} from './lab';

// Prescriptions store
export {
	prescriptions,
	activePrescriptions,
	filledPrescriptions,
	expiredPrescriptions,
	cancelledPrescriptions,
	filteredPrescriptions,
	prescriptionStats,
	prescriptionsWithInteractions,
	majorInteractionWarnings
} from './prescriptions';

// Treatment Plans store
export {
	treatmentPlans,
	activeTreatmentPlans,
	completedTreatmentPlans,
	discontinuedTreatmentPlans,
	notStartedTreatmentPlans,
	onHoldTreatmentPlans,
	filteredTreatmentPlans,
	treatmentPlanStats,
	plansNearingCompletion
} from './treatmentPlans';

// Clinical Notes store
export {
	clinicalNotes,
	lockedNotes,
	unlockedNotes,
	consultationNotes,
	followupNotes,
	emergencyNotes,
	procedureNotes,
	dischargeNotes,
	filteredClinicalNotes,
	clinicalNoteStats
} from './clinicalNotes';

// Referrals store
export {
	referrals,
	pendingReferrals,
	acceptedReferrals,
	rejectedReferrals,
	completedReferrals,
	expiredReferrals,
	internalReferrals,
	externalReferrals,
	urgentReferrals,
	statReferrals,
	routineReferrals,
	filteredReferrals,
	referralStats
} from './referrals';

// Demo session store
export { demoSession } from './demoSession';
export type { DemoSessionState } from './demoSession';
