import { writable, derived } from 'svelte/store';
import type {
	Referral,
	CreateReferralDto,
	UpdateReferralDto,
	AcceptReferralDto,
	RejectReferralDto,
	ReferralStatus,
	UrgencyLevel,
	ReferralStats
} from '$lib/types/referral';
import { ReferralService } from '$lib/services/referralService';
import { notifications } from './notifications';
import type { Notification } from '$types';

// Service instance (will be initialized with seed data)
const referralService = new ReferralService();

/**
 * Create a referral notification
 */
async function createReferralNotification(
	referral: Referral,
	type: 'referral-received' | 'referral-accepted' | 'referral-rejected' | 'referral-expired'
) {
	const notification: Notification = {
		id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		userId: type === 'referral-received' ? referral.toDoctorId || '' : referral.fromDoctorId,
		type,
		priority: referral.urgency === 'stat' ? 'urgent' : referral.urgency === 'urgent' ? 'high' : 'medium',
		status: 'unread',
		title: getNotificationTitle(type),
		message: getNotificationMessage(referral, type),
		data: {
			referralId: referral.id,
			patientId: referral.patientId,
			urgency: referral.urgency
		},
		actionUrl: `/referrals/${referral.id}`,
		read: false,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	await notifications.createNotification(notification);
}

function getNotificationTitle(type: string): string {
	switch (type) {
		case 'referral-received':
			return 'New Referral Received';
		case 'referral-accepted':
			return 'Referral Accepted';
		case 'referral-rejected':
			return 'Referral Rejected';
		case 'referral-expired':
			return 'Referral Expired';
		default:
			return 'Referral Update';
	}
}

function getNotificationMessage(referral: Referral, type: string): string {
	const patientName = referral.patientName || 'a patient';
	switch (type) {
		case 'referral-received':
			return `You have received a new ${referral.urgency} referral for ${patientName}. ${referral.reason.substring(0, 50)}${referral.reason.length > 50 ? '...' : ''}`;
		case 'referral-accepted':
			return `Your referral for ${patientName} has been accepted.`;
		case 'referral-rejected':
			return `Your referral for ${patientName} has been rejected. ${referral.response || ''}`;
		case 'referral-expired':
			return `Your referral for ${patientName} has expired without a response.`;
		default:
			return `Referral for ${patientName} has been updated.`;
	}
}

interface ReferralState {
	referrals: Referral[];
	isLoading: boolean;
	error: string | null;
	selectedReferral: Referral | null;
	filters: {
		status?: ReferralStatus;
		urgency?: UrgencyLevel;
		patientId?: string;
		fromDoctorId?: string;
		toDoctorId?: string;
		department?: string;
		isInternal?: boolean;
		isExternal?: boolean;
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the referral store
function createReferralStore() {
	const { subscribe, set, update } = writable<ReferralState>({
		referrals: [],
		isLoading: false,
		error: null,
		selectedReferral: null,
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: ReferralState = {
				referrals: [],
				isLoading: false,
				error: null,
				selectedReferral: null,
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedReferrals: Referral[]) => {
			const service = new ReferralService(seedReferrals);

			// Replace service instance
			Object.setPrototypeOf(referralService, service);
			Object.assign(referralService, service);

			update((state) => ({
				...state,
				referrals: seedReferrals
			}));
		},

		/**
		 * Load all referrals
		 */
		loadReferrals: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load referrals',
					isLoading: false
				}));
			}
		},

		/**
		 * Create new referral
		 */
		createReferral: async (referralData: CreateReferralDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.createReferral(referralData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: [...state.referrals, response.data!],
					isLoading: false
				}));

				// Create notification for the receiving doctor (for internal referrals)
				if (response.data.toDoctorId && !response.data.externalFacility) {
					await createReferralNotification(response.data, 'referral-received');
				}

				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create referral',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update referral
		 */
		updateReferral: async (referralId: string, updates: UpdateReferralDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.updateReferral(referralId, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: state.referrals.map((r) => (r.id === referralId ? response.data! : r)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update referral',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Accept referral
		 */
		acceptReferral: async (referralId: string, acceptData: AcceptReferralDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.acceptReferral(referralId, acceptData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: state.referrals.map((r) => (r.id === referralId ? response.data! : r)),
					isLoading: false
				}));

				// Notify the referring doctor
				await createReferralNotification(response.data, 'referral-accepted');

				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to accept referral',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Reject referral
		 */
		rejectReferral: async (referralId: string, rejectData: RejectReferralDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.rejectReferral(referralId, rejectData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: state.referrals.map((r) => (r.id === referralId ? response.data! : r)),
					isLoading: false
				}));

				// Notify the referring doctor
				await createReferralNotification(response.data, 'referral-rejected');

				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to reject referral',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Complete referral
		 */
		completeReferral: async (referralId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.completeReferral(referralId);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: state.referrals.map((r) => (r.id === referralId ? response.data! : r)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to complete referral',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Schedule appointment for referral
		 */
		scheduleReferralAppointment: async (
			referralId: string,
			appointmentId: string,
			appointmentDate: Date
		) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await referralService.scheduleReferralAppointment(
				referralId,
				appointmentId,
				appointmentDate
			);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					referrals: state.referrals.map((r) => (r.id === referralId ? response.data! : r)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to schedule appointment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Notify referred doctor
		 */
		notifyReferredDoctor: async (referralId: string) => {
			const response = await referralService.notifyReferredDoctor(referralId);
			return response.success
				? { success: true, message: response.message }
				: { success: false, error: response.error };
		},

		/**
		 * Get referrals by patient
		 */
		getReferralsByPatient: async (patientId: string): Promise<Referral[]> => {
			const response = await referralService.getReferralsByPatient(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get outgoing referrals by doctor
		 */
		getReferralsByFromDoctor: async (doctorId: string): Promise<Referral[]> => {
			const response = await referralService.getReferralsByFromDoctor(doctorId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get incoming referrals by doctor
		 */
		getReferralsByToDoctor: async (doctorId: string): Promise<Referral[]> => {
			const response = await referralService.getReferralsByToDoctor(doctorId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get referrals by status
		 */
		getReferralsByStatus: async (status: ReferralStatus): Promise<Referral[]> => {
			const response = await referralService.getReferralsByStatus(status);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get referrals by urgency
		 */
		getReferralsByUrgency: async (urgency: UrgencyLevel): Promise<Referral[]> => {
			const response = await referralService.getReferralsByUrgency(urgency);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get internal referrals
		 */
		getInternalReferrals: async (): Promise<Referral[]> => {
			const response = await referralService.getInternalReferrals();
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get external referrals
		 */
		getExternalReferrals: async (): Promise<Referral[]> => {
			const response = await referralService.getExternalReferrals();
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get pending referrals
		 */
		getPendingReferrals: async (): Promise<Referral[]> => {
			const response = await referralService.getPendingReferrals();
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get urgent referrals
		 */
		getUrgentReferrals: async (): Promise<Referral[]> => {
			const response = await referralService.getUrgentReferrals();
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get referrals by department
		 */
		getReferralsByDepartment: async (department: string): Promise<Referral[]> => {
			const response = await referralService.getReferralsByDepartment(department);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Search referrals
		 */
		searchReferrals: async (query: string): Promise<Referral[]> => {
			const response = await referralService.searchReferrals(query);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Select referral
		 */
		selectReferral: (referral: Referral | null) => {
			update((state) => ({ ...state, selectedReferral: referral }));
		},

		/**
		 * Set filters
		 */
		setFilters: (filters: ReferralState['filters']) => {
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

export const referrals = createReferralStore();

// Derived store for pending referrals
export const pendingReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.status === 'pending')
);

// Derived store for accepted referrals
export const acceptedReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.status === 'accepted')
);

// Derived store for rejected referrals
export const rejectedReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.status === 'rejected')
);

// Derived store for completed referrals
export const completedReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.status === 'completed')
);

// Derived store for expired referrals
export const expiredReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.status === 'expired')
);

// Derived store for internal referrals
export const internalReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => !!r.toDoctorId && !r.externalFacility)
);

// Derived store for external referrals
export const externalReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => !!r.externalFacility)
);

// Derived store for urgent referrals
export const urgentReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.urgency === 'urgent' || r.urgency === 'stat')
);

// Derived store for stat referrals
export const statReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.urgency === 'stat')
);

// Derived store for routine referrals
export const routineReferrals = derived(referrals, ($referrals) =>
	$referrals.referrals.filter((r) => r.urgency === 'routine')
);

// Derived store for filtered referrals
export const filteredReferrals = derived(referrals, ($referrals) => {
	let filtered = $referrals.referrals;

	if ($referrals.filters.status) {
		filtered = filtered.filter((r) => r.status === $referrals.filters.status);
	}

	if ($referrals.filters.urgency) {
		filtered = filtered.filter((r) => r.urgency === $referrals.filters.urgency);
	}

	if ($referrals.filters.patientId) {
		filtered = filtered.filter((r) => r.patientId === $referrals.filters.patientId);
	}

	if ($referrals.filters.fromDoctorId) {
		filtered = filtered.filter((r) => r.fromDoctorId === $referrals.filters.fromDoctorId);
	}

	if ($referrals.filters.toDoctorId) {
		filtered = filtered.filter((r) => r.toDoctorId === $referrals.filters.toDoctorId);
	}

	if ($referrals.filters.department) {
		filtered = filtered.filter(
			(r) =>
				r.fromDepartment?.toLowerCase().includes($referrals.filters.department!.toLowerCase()) ||
				r.toDepartment?.toLowerCase().includes($referrals.filters.department!.toLowerCase())
		);
	}

	if ($referrals.filters.isInternal !== undefined) {
		if ($referrals.filters.isInternal) {
			filtered = filtered.filter((r) => !!r.toDoctorId && !r.externalFacility);
		} else {
			filtered = filtered.filter((r) => !!r.externalFacility);
		}
	}

	if ($referrals.filters.isExternal !== undefined) {
		if ($referrals.filters.isExternal) {
			filtered = filtered.filter((r) => !!r.externalFacility);
		} else {
			filtered = filtered.filter((r) => !!r.toDoctorId && !r.externalFacility);
		}
	}

	if ($referrals.filters.dateFrom) {
		filtered = filtered.filter((r) => r.createdAt >= $referrals.filters.dateFrom!);
	}

	if ($referrals.filters.dateTo) {
		filtered = filtered.filter((r) => r.createdAt <= $referrals.filters.dateTo!);
	}

	return filtered;
});

// Derived store for referral statistics
export const referralStats = derived(referrals, ($referrals) => {
	const now = new Date();
	const thisWeekStart = new Date(now);
	thisWeekStart.setDate(now.getDate() - now.getDay());
	thisWeekStart.setHours(0, 0, 0, 0);

	const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const stats: ReferralStats = {
		total: $referrals.referrals.length,
		byStatus: {
			pending: $referrals.referrals.filter((r) => r.status === 'pending').length,
			accepted: $referrals.referrals.filter((r) => r.status === 'accepted').length,
			rejected: $referrals.referrals.filter((r) => r.status === 'rejected').length,
			completed: $referrals.referrals.filter((r) => r.status === 'completed').length,
			expired: $referrals.referrals.filter((r) => r.status === 'expired').length
		},
		byUrgency: {
			routine: $referrals.referrals.filter((r) => r.urgency === 'routine').length,
			urgent: $referrals.referrals.filter((r) => r.urgency === 'urgent').length,
			stat: $referrals.referrals.filter((r) => r.urgency === 'stat').length
		},
		internal: $referrals.referrals.filter((r) => !!r.toDoctorId && !r.externalFacility).length,
		external: $referrals.referrals.filter((r) => !!r.externalFacility).length,
		pending: $referrals.referrals.filter((r) => r.status === 'pending').length,
		thisMonth: $referrals.referrals.filter((r) => r.createdAt >= thisMonthStart).length,
		thisWeek: $referrals.referrals.filter((r) => r.createdAt >= thisWeekStart).length
	};

	return stats;
});
