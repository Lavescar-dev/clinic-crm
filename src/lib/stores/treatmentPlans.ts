import { writable, derived } from 'svelte/store';
import type {
	TreatmentPlan,
	CreateTreatmentPlanDto,
	UpdateTreatmentPlanDto,
	TreatmentPlanStatus,
	TreatmentPlanStats
} from '$lib/types/treatmentPlan';
import { TreatmentPlanService } from '$lib/services/treatmentPlanService';

// Service instance (will be initialized with seed data)
const treatmentPlanService = new TreatmentPlanService();

interface TreatmentPlanState {
	plans: TreatmentPlan[];
	isLoading: boolean;
	error: string | null;
	selectedPlan: TreatmentPlan | null;
	filters: {
		status?: TreatmentPlanStatus;
		patientId?: string;
		doctorId?: string;
		protocolName?: string;
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the treatment plan store
function createTreatmentPlanStore() {
	const { subscribe, set, update } = writable<TreatmentPlanState>({
		plans: [],
		isLoading: false,
		error: null,
		selectedPlan: null,
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: TreatmentPlanState = {
				plans: [],
				isLoading: false,
				error: null,
				selectedPlan: null,
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedPlans: TreatmentPlan[]) => {
			const service = new TreatmentPlanService(seedPlans);

			// Replace service instance
			Object.setPrototypeOf(treatmentPlanService, service);
			Object.assign(treatmentPlanService, service);

			update((state) => ({
				...state,
				plans: seedPlans
			}));
		},

		/**
		 * Load all treatment plans
		 */
		loadPlans: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					plans: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load treatment plans',
					isLoading: false
				}));
			}
		},

		/**
		 * Create new treatment plan
		 */
		createPlan: async (planData: CreateTreatmentPlanDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.createPlan(planData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					plans: [...state.plans, response.data!],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create treatment plan',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update treatment plan
		 */
		updatePlan: async (planId: string, updates: UpdateTreatmentPlanDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.updatePlan(planId, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					plans: state.plans.map((p) => (p.id === planId ? response.data! : p)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update treatment plan',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Schedule next session for a plan
		 */
		scheduleNextSession: async (planId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.scheduleNextSession(planId);

			if (response.success) {
				update((state) => ({
					...state,
					isLoading: false
				}));
				return { success: true, message: response.message };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to schedule session',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Mark a session as complete
		 */
		markSessionComplete: async (
			planId: string,
			sessionData: {
				attendedBy: string;
				notes?: string;
				outcome?: string;
			}
		) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.markSessionComplete(planId, sessionData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					plans: state.plans.map((p) => (p.id === planId ? response.data! : p)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to mark session complete',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update progress
		 */
		updateProgress: async (planId: string, completedSessions: number) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.updateProgress(planId, completedSessions);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					plans: state.plans.map((p) => (p.id === planId ? response.data! : p)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update progress',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Discontinue a treatment plan
		 */
		discontinuePlan: async (planId: string, reason?: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await treatmentPlanService.discontinuePlan(planId, reason);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					plans: state.plans.map((p) => (p.id === planId ? response.data! : p)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to discontinue plan',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Get active plans for a patient
		 */
		getPatientActivePlans: async (patientId: string): Promise<TreatmentPlan[]> => {
			const response = await treatmentPlanService.getPatientActivePlans(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get all plans for a patient
		 */
		getPatientPlans: async (patientId: string): Promise<TreatmentPlan[]> => {
			const response = await treatmentPlanService.getPatientPlans(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get upcoming sessions
		 */
		getUpcomingSessions: async () => {
			const response = await treatmentPlanService.getUpcomingSessions();
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get plans by status
		 */
		getPlansByStatus: async (status: TreatmentPlanStatus): Promise<TreatmentPlan[]> => {
			const response = await treatmentPlanService.getPlansByStatus(status);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get plans by doctor
		 */
		getPlansByDoctor: async (doctorId: string): Promise<TreatmentPlan[]> => {
			const response = await treatmentPlanService.getPlansByDoctor(doctorId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get plans by protocol
		 */
		getPlansByProtocol: async (protocolName: string): Promise<TreatmentPlan[]> => {
			const response = await treatmentPlanService.getPlansByProtocol(protocolName);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Select plan
		 */
		selectPlan: (plan: TreatmentPlan | null) => {
			update((state) => ({ ...state, selectedPlan: plan }));
		},

		/**
		 * Set filters
		 */
		setFilters: (filters: TreatmentPlanState['filters']) => {
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

export const treatmentPlans = createTreatmentPlanStore();

// Derived store for active plans
export const activeTreatmentPlans = derived(treatmentPlans, ($treatmentPlans) =>
	$treatmentPlans.plans.filter((p) => p.status === 'in-progress')
);

// Derived store for completed plans
export const completedTreatmentPlans = derived(treatmentPlans, ($treatmentPlans) =>
	$treatmentPlans.plans.filter((p) => p.status === 'completed')
);

// Derived store for discontinued plans
export const discontinuedTreatmentPlans = derived(treatmentPlans, ($treatmentPlans) =>
	$treatmentPlans.plans.filter((p) => p.status === 'discontinued')
);

// Derived store for not started plans
export const notStartedTreatmentPlans = derived(treatmentPlans, ($treatmentPlans) =>
	$treatmentPlans.plans.filter((p) => p.status === 'not-started')
);

// Derived store for on-hold plans
export const onHoldTreatmentPlans = derived(treatmentPlans, ($treatmentPlans) =>
	$treatmentPlans.plans.filter((p) => p.status === 'on-hold')
);

// Derived store for filtered plans
export const filteredTreatmentPlans = derived(treatmentPlans, ($treatmentPlans) => {
	let filtered = $treatmentPlans.plans;

	if ($treatmentPlans.filters.status) {
		filtered = filtered.filter((p) => p.status === $treatmentPlans.filters.status);
	}

	if ($treatmentPlans.filters.patientId) {
		filtered = filtered.filter((p) => p.patientId === $treatmentPlans.filters.patientId);
	}

	if ($treatmentPlans.filters.doctorId) {
		filtered = filtered.filter((p) => p.doctorId === $treatmentPlans.filters.doctorId);
	}

	if ($treatmentPlans.filters.protocolName) {
		filtered = filtered.filter(
			(p) =>
				p.protocol.name.toLowerCase().includes($treatmentPlans.filters.protocolName!.toLowerCase())
		);
	}

	if ($treatmentPlans.filters.dateFrom) {
		filtered = filtered.filter((p) => p.startDate >= $treatmentPlans.filters.dateFrom!);
	}

	if ($treatmentPlans.filters.dateTo) {
		filtered = filtered.filter((p) => p.startDate <= $treatmentPlans.filters.dateTo!);
	}

	return filtered;
});

// Derived store for treatment plan statistics
export const treatmentPlanStats = derived(treatmentPlans, ($treatmentPlans) => {
	const stats: TreatmentPlanStats = {
		total: $treatmentPlans.plans.length,
		notStarted: $treatmentPlans.plans.filter((p) => p.status === 'not-started').length,
		inProgress: $treatmentPlans.plans.filter((p) => p.status === 'in-progress').length,
		completed: $treatmentPlans.plans.filter((p) => p.status === 'completed').length,
		discontinued: $treatmentPlans.plans.filter((p) => p.status === 'discontinued').length,
		onHold: $treatmentPlans.plans.filter((p) => p.status === 'on-hold').length,
		avgCompletionRate: 0
	};

	// Calculate average completion rate
	if (stats.total > 0) {
		const totalCompletion = $treatmentPlans.plans.reduce((sum, plan) => {
			return sum + (plan.completedSessions / plan.totalSessions) * 100;
		}, 0);
		stats.avgCompletionRate = totalCompletion / stats.total;
	}

	return stats;
});

// Derived store for plans nearing completion (>75% complete)
export const plansNearingCompletion = derived(treatmentPlans, ($treatmentPlans) =>
	$treatmentPlans.plans.filter(
		(p) =>
			p.status === 'in-progress' &&
			(p.completedSessions / p.totalSessions) * 100 >= 75
	)
);
