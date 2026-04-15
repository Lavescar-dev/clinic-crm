import { writable, derived } from 'svelte/store';
import type { ShiftSchedule, ShiftType, Department, ShiftStatus } from '$types';
import { ShiftService } from '$services/shiftService';

// Will be initialized with seed data
const shiftService = new ShiftService();

interface ShiftState {
	data: ShiftSchedule[];
	isLoading: boolean;
	error: string | null;
	selectedShift: ShiftSchedule | null;
	filters: {
		staffId?: string;
		shiftType?: ShiftType;
		department?: Department;
		status?: ShiftStatus;
		dateRange?: { start: Date; end: Date };
	};
}

// Create the shifts store
function createShiftStore() {
	const { subscribe, set, update } = writable<ShiftState>({
		data: [],
		isLoading: false,
		error: null,
		selectedShift: null,
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: ShiftState = {
				data: [],
				isLoading: false,
				error: null,
				selectedShift: null,
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value.data;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedData: ShiftSchedule[]) => {
			const service = new ShiftService(seedData);
			// Replace the global shiftService instance
			Object.setPrototypeOf(shiftService, service);
			Object.assign(shiftService, service);

			update((state) => ({
				...state,
				data: seedData
			}));
		},

		/**
		 * Load all shifts
		 */
		loadShifts: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await shiftService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load shifts',
					isLoading: false
				}));
			}
		},

		/**
		 * Get shift by ID
		 */
		getShift: async (id: string): Promise<ShiftSchedule | null> => {
			const response = await shiftService.getById(id);
			return response.success && response.data ? response.data : null;
		},

		/**
		 * Get shifts by staff ID
		 */
		getShiftsByStaff: async (staffId: string): Promise<ShiftSchedule[]> => {
			const response = await shiftService.getShiftsByStaff(staffId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get shifts by date range
		 */
		getShiftsByDateRange: async (startDate: Date, endDate: Date): Promise<ShiftSchedule[]> => {
			const response = await shiftService.getShiftsByDateRange(startDate, endDate);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Create a new shift
		 */
		createShift: async (shiftData: Omit<ShiftSchedule, 'id'>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await shiftService.create(shiftData as ShiftSchedule);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: [...state.data, response.data!],
					isLoading: false
				}));
				return response.data;
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create shift',
					isLoading: false
				}));
				return null;
			}
		},

		/**
		 * Update a shift
		 */
		updateShift: async (id: string, updates: Partial<ShiftSchedule>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await shiftService.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((s) => (s.id === id ? { ...s, ...response.data! } : s)),
					isLoading: false
				}));
				return response.data;
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update shift',
					isLoading: false
				}));
				return null;
			}
		},

		/**
		 * Delete a shift
		 */
		deleteShift: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await shiftService.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((s) => s.id !== id),
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete shift',
					isLoading: false
				}));
			}
		},

		/**
		 * Set selected shift
		 */
		selectShift: (shift: ShiftSchedule | null) => {
			update((state) => ({ ...state, selectedShift: shift }));
		},

		/**
		 * Set filters
		 */
		setFilters: (filters: ShiftState['filters']) => {
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

export const shifts = createShiftStore();

// Derived stores
export const filteredShifts = derived(shifts, ($shifts) => {
	let filtered = $shifts.data;
	const { filters } = $shifts;

	if (filters.staffId) {
		filtered = filtered.filter((shift) => shift.staffId === filters.staffId);
	}
	if (filters.shiftType) {
		filtered = filtered.filter((shift) => shift.shiftType === filters.shiftType);
	}
	if (filters.department) {
		filtered = filtered.filter((shift) => shift.assignedDepartment === filters.department);
	}
	if (filters.status) {
		filtered = filtered.filter((shift) => shift.status === filters.status);
	}
	if (filters.dateRange) {
		filtered = filtered.filter((shift) => {
			const shiftDate = new Date(shift.date);
			return (
				shiftDate >= filters.dateRange!.start && shiftDate <= filters.dateRange!.end
			);
		});
	}

	return filtered;
});

export const upcomingShifts = derived(shifts, ($shifts) => {
	const now = new Date();
	return $shifts.data.filter((shift) => new Date(shift.date) >= now && shift.status === 'Scheduled');
});

export const todayShifts = derived(shifts, ($shifts) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return $shifts.data.filter((shift) => {
		const shiftDate = new Date(shift.date);
		return shiftDate >= today && shiftDate < tomorrow;
	});
});
