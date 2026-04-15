import { writable, derived } from 'svelte/store';
import type { Staff, Role, Department, StaffStatus } from '$types';
import { StaffService } from '$services/staffService';
import { mockStaff } from '$data/staff';

// Will be initialized with seed data
const staffService = new StaffService(mockStaff);

interface StaffState {
	data: Staff[];
	isLoading: boolean;
	error: string | null;
	selectedStaff: Staff | null;
	searchQuery: string;
	filters: {
		role?: Role;
		department?: Department;
		status?: StaffStatus;
		availability?: string; // Day of week
	};
}

// Create the staff store
function createStaffStore() {
	const { subscribe, set, update } = writable<StaffState>({
		data: mockStaff,
		isLoading: false,
		error: null,
		selectedStaff: null,
		searchQuery: '',
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: StaffState = {
				data: [],
				isLoading: false,
				error: null,
				selectedStaff: null,
				searchQuery: '',
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value.data;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedData: Staff[]) => {
			const service = new StaffService(seedData);
			// Replace the global staffService instance
			Object.setPrototypeOf(staffService, service);
			Object.assign(staffService, service);

			update((state) => ({
				...state,
				data: seedData
			}));
		},

		/**
		 * Load all staff members
		 */
		loadStaff: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await staffService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load staff',
					isLoading: false
				}));
			}
		},

		/**
		 * Get staff member by ID
		 */
		getStaff: async (id: string): Promise<Staff | null> => {
			const response = await staffService.getById(id);
			return response.success && response.data ? response.data : null;
		},

		/**
		 * Get staff members by role
		 */
		getStaffByRole: async (role: Role): Promise<Staff[]> => {
			const response = await staffService.getStaffByRole(role);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get staff members by department
		 */
		getStaffByDepartment: async (department: Department): Promise<Staff[]> => {
			const response = await staffService.getStaffByDepartment(department);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Create new staff member
		 */
		createStaff: async (staff: Staff) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await staffService.create(staff);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: [...state.data, response.data!],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create staff member',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update staff member
		 */
		updateStaff: async (id: string, updates: Partial<Staff>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await staffService.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((s) => (s.id === id ? response.data! : s)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update staff member',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Delete staff member
		 */
		deleteStaff: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await staffService.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((s) => s.id !== id),
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete staff member',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Assign shift to staff member
		 */
		assignShift: async (staffId: string, shiftId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await staffService.assignShift(staffId, shiftId);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((s) => (s.id === staffId ? response.data! : s)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to assign shift',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update staff availability
		 */
		updateAvailability: async (staffId: string, availability: Record<string, boolean>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await staffService.updateAvailability(staffId, availability);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((s) => (s.id === staffId ? response.data! : s)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update availability',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Set selected staff member
		 */
		selectStaff: (staff: Staff | null) => {
			update((state) => ({ ...state, selectedStaff: staff }));
		},

		/**
		 * Set search query
		 */
		setSearchQuery: (query: string) => {
			update((state) => ({ ...state, searchQuery: query }));
		},

		/**
		 * Set filters
		 */
		setFilters: (filters: StaffState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		/**
		 * Clear filters
		 */
		clearFilters: () => {
			update((state) => ({ ...state, filters: {}, searchQuery: '' }));
		}
	};

	return self;
}

export const staff = createStaffStore();

// Derived store for filtered staff
export const filteredStaff = derived(staff, ($staff) => {
	let filtered = $staff.data;

	// Apply search query
	if ($staff.searchQuery) {
		const query = $staff.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(member) =>
				// Search by user ID to get user details
				member.userId.toLowerCase().includes(query) ||
				member.role.toLowerCase().includes(query) ||
				member.department.toLowerCase().includes(query) ||
				member.licenseNumber?.toLowerCase().includes(query)
		);
	}

	// Apply filters
	if ($staff.filters.role) {
		filtered = filtered.filter((s) => s.role === $staff.filters.role);
	}

	if ($staff.filters.department) {
		filtered = filtered.filter((s) => s.department === $staff.filters.department);
	}

	if ($staff.filters.status) {
		filtered = filtered.filter((s) => s.status === $staff.filters.status);
	}

	if ($staff.filters.availability) {
		filtered = filtered.filter(
			(s) => s.schedule?.availability?.[$staff.filters.availability!] === true
		);
	}

	return filtered;
});

// Derived store for staff statistics by role
export const staffStatsByRole = derived(staff, ($staff) => ({
	total: $staff.data.length,
	doctors: $staff.data.filter((s) => s.role === 'Doctor').length,
	nurses: $staff.data.filter((s) => s.role === 'Nurse').length,
	receptionists: $staff.data.filter((s) => s.role === 'Receptionist').length,
	labTechnicians: $staff.data.filter((s) => s.role === 'LabTechnician').length,
	admins: $staff.data.filter((s) => s.role === 'Admin').length,
	pharmacists: $staff.data.filter((s) => s.role === 'Pharmacist').length
}));

// Derived store for staff statistics by department
export const staffStatsByDepartment = derived(staff, ($staff) => ({
	emergency: $staff.data.filter((s) => s.department === 'Emergency').length,
	cardiology: $staff.data.filter((s) => s.department === 'Cardiology').length,
	pediatrics: $staff.data.filter((s) => s.department === 'Pediatrics').length,
	surgery: $staff.data.filter((s) => s.department === 'Surgery').length,
	radiology: $staff.data.filter((s) => s.department === 'Radiology').length,
	laboratory: $staff.data.filter((s) => s.department === 'Laboratory').length,
	pharmacy: $staff.data.filter((s) => s.department === 'Pharmacy').length,
	administration: $staff.data.filter((s) => s.department === 'Administration').length
}));

// Derived store for active staff
export const activeStaff = derived(staff, ($staff) =>
	$staff.data.filter((s) => s.status === 'Active')
);

// Derived store for staff on leave
export const staffOnLeave = derived(staff, ($staff) =>
	$staff.data.filter((s) => s.status === 'OnLeave')
);
