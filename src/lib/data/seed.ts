/**
 * Seed Data Orchestrator
 *
 * This module provides comprehensive seed data for the Clinic CRM system.
 * All data is realistic, Turkish-localized, and interconnected.
 *
 * Usage:
 * ```typescript
 * import { seedDatabase, seedData } from '$lib/data/seed';
 *
 * // Get all seed data
 * const data = seedData;
 *
 * // Or seed the database (when API is ready)
 * await seedDatabase();
 * ```
 */

// Import all seed data
import { mockUsers, mockPasswords } from './users';
import { mockPatients } from './patients';
import { mockAppointments } from './appointments';
import { mockMedicalRecords } from './emr';
import { mockInvoices, mockPayments } from './billing';
import { mockInventoryItems } from './inventory';
import { mockNotifications } from './notifications';

// Re-export for convenient access
export { mockUsers, mockPasswords } from './users';
export { mockPatients } from './patients';
export { mockAppointments } from './appointments';
export { mockMedicalRecords } from './emr';
export { mockInvoices, mockPayments } from './billing';
export { mockInventoryItems } from './inventory';
export { mockNotifications } from './notifications';

/**
 * Comprehensive seed data object containing all mock data
 */
export const seedData = {
	users: mockUsers,
	passwords: mockPasswords,
	patients: mockPatients,
	appointments: mockAppointments,
	medicalRecords: mockMedicalRecords,
	invoices: mockInvoices,
	payments: mockPayments,
	inventory: mockInventoryItems,
	notifications: mockNotifications
};

/**
 * Get summary statistics of seed data
 */
export function getSeedDataStats() {
	return {
		users: {
			total: mockUsers.length,
			doctors: mockUsers.filter((u) => u.role === 'doctor').length,
			nurses: mockUsers.filter((u) => u.role === 'nurse').length,
			receptionists: mockUsers.filter((u) => u.role === 'receptionist').length,
			admins: mockUsers.filter((u) => u.role === 'admin').length
		},
		patients: {
			total: mockPatients.length,
			active: mockPatients.filter((p) => p.status === 'active').length,
			inactive: mockPatients.filter((p) => p.status === 'inactive').length,
			male: mockPatients.filter((p) => p.gender === 'male').length,
			female: mockPatients.filter((p) => p.gender === 'female').length
		},
		appointments: {
			total: mockAppointments.length,
			scheduled: mockAppointments.filter((a) => a.status === 'scheduled').length,
			confirmed: mockAppointments.filter((a) => a.status === 'confirmed').length,
			inProgress: mockAppointments.filter((a) => a.status === 'in-progress').length,
			completed: mockAppointments.filter((a) => a.status === 'completed').length,
			cancelled: mockAppointments.filter((a) => a.status === 'cancelled').length,
			noShow: mockAppointments.filter((a) => a.status === 'no-show').length
		},
		medicalRecords: {
			total: mockMedicalRecords.length,
			withPrescriptions: mockMedicalRecords.filter((m) => m.prescriptions.length > 0).length,
			withLabResults: mockMedicalRecords.filter((m) => m.labResults && m.labResults.length > 0)
				.length
		},
		billing: {
			totalInvoices: mockInvoices.length,
			totalRevenue: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
			paid: mockInvoices.filter((i) => i.status === 'paid').length,
			pending: mockInvoices.filter((i) => i.status === 'pending').length,
			overdue: mockInvoices.filter((i) => i.status === 'overdue').length,
			totalPayments: mockPayments.length,
			totalPaid: mockPayments.reduce((sum, pay) => sum + pay.amount, 0)
		},
		inventory: {
			total: mockInventoryItems.length,
			medications: mockInventoryItems.filter((i) => i.category === 'medication').length,
			equipment: mockInventoryItems.filter((i) => i.category === 'equipment').length,
			consumables: mockInventoryItems.filter((i) => i.category === 'consumable').length,
			inStock: mockInventoryItems.filter((i) => i.status === 'in-stock').length,
			lowStock: mockInventoryItems.filter((i) => i.status === 'low-stock').length,
			outOfStock: mockInventoryItems.filter((i) => i.status === 'out-of-stock').length,
			expired: mockInventoryItems.filter((i) => i.status === 'expired').length,
			totalValue: mockInventoryItems.reduce(
				(sum, item) => sum + item.currentStock * item.unitPrice,
				0
			)
		},
		notifications: {
			total: mockNotifications.length,
			unread: mockNotifications.filter((n) => n.status === 'unread').length,
			read: mockNotifications.filter((n) => n.status === 'read').length,
			urgent: mockNotifications.filter((n) => n.priority === 'urgent').length,
			high: mockNotifications.filter((n) => n.priority === 'high').length
		}
	};
}

/**
 * Seed the database with mock data
 * This function will be used when the API endpoints are ready
 *
 * @param apiBaseUrl - Base URL for the API (default: '/api')
 * @param options - Seeding options
 */
export async function seedDatabase(
	apiBaseUrl: string = '/api',
	options: {
		clearExisting?: boolean;
		skipUsers?: boolean;
		skipPatients?: boolean;
		skipAppointments?: boolean;
		skipMedicalRecords?: boolean;
		skipBilling?: boolean;
		skipInventory?: boolean;
		skipNotifications?: boolean;
		onProgress?: (message: string, progress: number) => void;
	} = {}
): Promise<void> {
	const {
		clearExisting = false,
		skipUsers = false,
		skipPatients = false,
		skipAppointments = false,
		skipMedicalRecords = false,
		skipBilling = false,
		skipInventory = false,
		skipNotifications = false,
		onProgress
	} = options;

	const totalSteps = 8;
	let currentStep = 0;

	const reportProgress = (message: string) => {
		currentStep++;
		const progress = (currentStep / totalSteps) * 100;
		if (onProgress) {
			onProgress(message, progress);
		} else {
			console.log(`[${progress.toFixed(0)}%] ${message}`);
		}
	};

	try {
		// Clear existing data if requested
		if (clearExisting) {
			reportProgress('Clearing existing data...');
			// TODO: Implement clearing logic when API is ready
		}

		// Seed users
		if (!skipUsers) {
			reportProgress(`Seeding ${mockUsers.length} users...`);
			// TODO: POST to ${apiBaseUrl}/users/seed
		}

		// Seed patients
		if (!skipPatients) {
			reportProgress(`Seeding ${mockPatients.length} patients...`);
			// TODO: POST to ${apiBaseUrl}/patients/seed
		}

		// Seed appointments
		if (!skipAppointments) {
			reportProgress(`Seeding ${mockAppointments.length} appointments...`);
			// TODO: POST to ${apiBaseUrl}/appointments/seed
		}

		// Seed medical records
		if (!skipMedicalRecords) {
			reportProgress(`Seeding ${mockMedicalRecords.length} medical records...`);
			// TODO: POST to ${apiBaseUrl}/emr/seed
		}

		// Seed billing (invoices and payments)
		if (!skipBilling) {
			reportProgress(
				`Seeding ${mockInvoices.length} invoices and ${mockPayments.length} payments...`
			);
			// TODO: POST to ${apiBaseUrl}/billing/invoices/seed
			// TODO: POST to ${apiBaseUrl}/billing/payments/seed
		}

		// Seed inventory
		if (!skipInventory) {
			reportProgress(`Seeding ${mockInventoryItems.length} inventory items...`);
			// TODO: POST to ${apiBaseUrl}/inventory/seed
		}

		// Seed notifications
		if (!skipNotifications) {
			reportProgress(`Seeding ${mockNotifications.length} notifications...`);
			// TODO: POST to ${apiBaseUrl}/notifications/seed
		}

		reportProgress('Database seeding completed successfully!');

		// Print summary
		const stats = getSeedDataStats();
		console.log('\n=== Seed Data Summary ===');
		console.log('Users:', stats.users);
		console.log('Patients:', stats.patients);
		console.log('Appointments:', stats.appointments);
		console.log('Medical Records:', stats.medicalRecords);
		console.log('Billing:', stats.billing);
		console.log('Inventory:', stats.inventory);
		console.log('Notifications:', stats.notifications);
		console.log('========================\n');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}

/**
 * Get seed data for a specific entity type
 */
export function getSeedData<T extends keyof typeof seedData>(entity: T): (typeof seedData)[T] {
	return seedData[entity];
}

/**
 * Export default seed data object
 */
export default seedData;
