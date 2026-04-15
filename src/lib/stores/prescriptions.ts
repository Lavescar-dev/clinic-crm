import { writable, derived } from 'svelte/store';
import type {
	PrescriptionTracking,
	CreatePrescriptionDto,
	UpdatePrescriptionDto,
	PrescriptionStatus,
	DrugInteraction,
	PrescriptionStats
} from '$lib/types/prescription';
import { PrescriptionService } from '$lib/services/prescriptionService';

// Service instance (will be initialized with seed data)
const prescriptionService = new PrescriptionService();

interface PrescriptionState {
	prescriptions: PrescriptionTracking[];
	isLoading: boolean;
	error: string | null;
	selectedPrescription: PrescriptionTracking | null;
	filters: {
		status?: PrescriptionStatus;
		patientId?: string;
		doctorId?: string;
		dateFrom?: Date;
		dateTo?: Date;
		searchTerm?: string;
	};
}

// Create the prescription store
function createPrescriptionStore() {
	const { subscribe, set, update } = writable<PrescriptionState>({
		prescriptions: [],
		isLoading: false,
		error: null,
		selectedPrescription: null,
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: PrescriptionState = {
				prescriptions: [],
				isLoading: false,
				error: null,
				selectedPrescription: null,
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedPrescriptions: PrescriptionTracking[]) => {
			const service = new PrescriptionService(seedPrescriptions);

			// Replace service instance
			Object.setPrototypeOf(prescriptionService, service);
			Object.assign(prescriptionService, service);

			update((state) => ({
				...state,
				prescriptions: seedPrescriptions
			}));
		},

		/**
		 * Load all prescriptions
		 */
		loadPrescriptions: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await prescriptionService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					prescriptions: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load prescriptions',
					isLoading: false
				}));
			}
		},

		/**
		 * Create new prescription
		 */
		createPrescription: async (prescriptionData: CreatePrescriptionDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await prescriptionService.createPrescription(prescriptionData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					prescriptions: [...state.prescriptions, response.data!],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create prescription',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update prescription
		 */
		updatePrescription: async (prescriptionId: string, updates: UpdatePrescriptionDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await prescriptionService.updatePrescription(prescriptionId, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					prescriptions: state.prescriptions.map((p) =>
						p.id === prescriptionId ? response.data! : p
					),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update prescription',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Check drug interactions for a list of medications
		 */
		checkDrugInteractions: (medicationNames: string[]): DrugInteraction[] => {
			return prescriptionService.checkDrugInteractions(medicationNames);
		},

		/**
		 * Get drug interactions for a specific prescription
		 */
		getPrescriptionInteractions: async (
			prescriptionId: string
		): Promise<DrugInteraction[]> => {
			const response = await prescriptionService.getPrescriptionInteractions(prescriptionId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get drug interactions for a patient's active prescriptions
		 */
		getPatientInteractions: async (patientId: string): Promise<DrugInteraction[]> => {
			const response = await prescriptionService.getPatientInteractions(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get prescription history for a patient
		 */
		getPrescriptionHistory: async (
			patientId: string
		): Promise<PrescriptionTracking[]> => {
			const response = await prescriptionService.getPrescriptionHistory(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get prescriptions by status
		 */
		getPrescriptionsByStatus: async (
			status: PrescriptionStatus
		): Promise<PrescriptionTracking[]> => {
			const response = await prescriptionService.getPrescriptionsByStatus(status);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get prescriptions by doctor
		 */
		getPrescriptionsByDoctor: async (doctorId: string): Promise<PrescriptionTracking[]> => {
			const response = await prescriptionService.getPrescriptionsByDoctor(doctorId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get active prescriptions for a patient
		 */
		getActivePrescriptions: async (patientId: string): Promise<PrescriptionTracking[]> => {
			const response = await prescriptionService.getActivePrescriptions(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Auto-expire old prescriptions
		 */
		expireOldPrescriptions: async () => {
			const response = await prescriptionService.expireOldPrescriptions();
			if (response.success) {
				// Reload prescriptions to get updated statuses
				await self.loadPrescriptions();
				return response.data || 0;
			}
			return 0;
		},

		/**
		 * Fill prescription
		 */
		fillPrescription: async (
			prescriptionId: string,
			pharmacyName: string,
			pharmacyId?: string,
			pharmacistName?: string
		) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await prescriptionService.fillPrescription(
				prescriptionId,
				pharmacyName,
				pharmacyId,
				pharmacistName
			);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					prescriptions: state.prescriptions.map((p) =>
						p.id === prescriptionId ? response.data! : p
					),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to fill prescription',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Cancel prescription
		 */
		cancelPrescription: async (prescriptionId: string, reason?: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await prescriptionService.cancelPrescription(prescriptionId, reason);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					prescriptions: state.prescriptions.map((p) =>
						p.id === prescriptionId ? response.data! : p
					),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to cancel prescription',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Search prescriptions by medication name
		 */
		searchByMedication: async (medicationName: string): Promise<PrescriptionTracking[]> => {
			const response = await prescriptionService.searchByMedication(medicationName);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Select prescription
		 */
		selectPrescription: (prescription: PrescriptionTracking | null) => {
			update((state) => ({ ...state, selectedPrescription: prescription }));
		},

		/**
		 * Set filters
		 */
		setFilters: (filters: PrescriptionState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		/**
		 * Clear filters
		 */
		clearFilters: () => {
			update((state) => ({ ...state, filters: {} }));
		}
	};

	return self;
}

export const prescriptions = createPrescriptionStore();

// Derived store for active prescriptions
export const activePrescriptions = derived(prescriptions, ($prescriptions) => {
	const now = new Date();
	return $prescriptions.prescriptions.filter(
		(p) => p.status === 'active' && new Date(p.validUntil) > now
	);
});

// Derived store for filled prescriptions
export const filledPrescriptions = derived(prescriptions, ($prescriptions) =>
	$prescriptions.prescriptions.filter((p) => p.status === 'filled')
);

// Derived store for expired prescriptions
export const expiredPrescriptions = derived(prescriptions, ($prescriptions) =>
	$prescriptions.prescriptions.filter((p) => p.status === 'expired')
);

// Derived store for cancelled prescriptions
export const cancelledPrescriptions = derived(prescriptions, ($prescriptions) =>
	$prescriptions.prescriptions.filter((p) => p.status === 'cancelled')
);

// Derived store for filtered prescriptions
export const filteredPrescriptions = derived(prescriptions, ($prescriptions) => {
	let filtered = $prescriptions.prescriptions;

	if ($prescriptions.filters.status) {
		filtered = filtered.filter((p) => p.status === $prescriptions.filters.status);
	}

	if ($prescriptions.filters.patientId) {
		filtered = filtered.filter((p) => p.patientId === $prescriptions.filters.patientId);
	}

	if ($prescriptions.filters.doctorId) {
		filtered = filtered.filter((p) => p.doctorId === $prescriptions.filters.doctorId);
	}

	if ($prescriptions.filters.dateFrom) {
		filtered = filtered.filter(
			(p) => new Date(p.issuedAt) >= $prescriptions.filters.dateFrom!
		);
	}

	if ($prescriptions.filters.dateTo) {
		filtered = filtered.filter(
			(p) => new Date(p.issuedAt) <= $prescriptions.filters.dateTo!
		);
	}

	if ($prescriptions.filters.searchTerm) {
		const searchTerm = $prescriptions.filters.searchTerm.toLowerCase();
		filtered = filtered.filter(
			(p) =>
				p.patientName?.toLowerCase().includes(searchTerm) ||
				p.doctorName?.toLowerCase().includes(searchTerm) ||
				p.prescriptionNumber.toLowerCase().includes(searchTerm) ||
				p.medications.some(
					(m) =>
						m.drugName.toLowerCase().includes(searchTerm) ||
						m.genericName?.toLowerCase().includes(searchTerm)
				)
		);
	}

	return filtered;
});

// Derived store for prescription statistics
export const prescriptionStats = derived(prescriptions, ($prescriptions) => {
	const now = new Date();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const stats: PrescriptionStats = {
		totalPrescriptions: $prescriptions.prescriptions.length,
		activePrescriptions: $prescriptions.prescriptions.filter(
			(p) => p.status === 'active' && new Date(p.validUntil) > now
		).length,
		filledPrescriptions: $prescriptions.prescriptions.filter((p) => p.status === 'filled')
			.length,
		expiredPrescriptions: $prescriptions.prescriptions.filter((p) => p.status === 'expired')
			.length,
		cancelledPrescriptions: $prescriptions.prescriptions.filter(
			(p) => p.status === 'cancelled'
		).length,
		todayPrescriptions: $prescriptions.prescriptions.filter((p) => {
			const issuedDate = new Date(p.issuedAt);
			return issuedDate >= today;
		}).length,
		interactionWarnings: 0 // Will be calculated on demand
	};

	return stats;
});

// Derived store for prescriptions with interactions
export const prescriptionsWithInteractions = derived(prescriptions, ($prescriptions) => {
	return $prescriptions.prescriptions
		.map((p) => ({
			prescription: p,
			interactions: prescriptionService.checkDrugInteractions(
				p.medications.map((m) => m.drugName)
			)
		}))
		.filter((item) => item.interactions.length > 0);
});

// Derived store for major interaction warnings
export const majorInteractionWarnings = derived(
	prescriptionsWithInteractions,
	($withInteractions) => {
		return $withInteractions.filter((item) =>
			item.interactions.some((i) => i.severity === 'major' || i.severity === 'contraindicated')
		);
	}
);
