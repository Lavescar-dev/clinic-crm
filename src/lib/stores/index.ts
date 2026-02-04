// Theme store
export { theme } from './theme';
export type { Theme } from './theme';

// Auth store
export {
	auth,
	isAuthenticated,
	currentUser,
	userRole,
	isAuthLoading
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
