import { writable, derived } from 'svelte/store';
import type { Patient } from '$types';
import { MockApi } from '$services/mockApi';
import { mockPatients } from '$data/patients';

// Initialize MockApi with patients data
const patientsApi = new MockApi<Patient>(mockPatients, 300);

interface PatientsState {
	data: Patient[]; // Renamed from 'patients'
	isLoading: boolean;
	error: string | null;
	searchQuery: string;
	filters: {
		status?: 'active' | 'inactive';
		gender?: 'male' | 'female';
		insuranceType?: 'sgk' | 'private' | 'none';
	};
}

// Create the patients store
function createPatientsStore() {
	const { subscribe, set, update } = writable<PatientsState>({
		data: mockPatients,
		isLoading: false,
		error: null,
		searchQuery: '',
		filters: {}
	});

	const self = {
		subscribe,
		// Data getter for non-reactive access
		get data() {
			let value: PatientsState = { data: [], isLoading: false, error: null, searchQuery: '', filters: {} }; // Initialize value
			subscribe((s) => (value = s))();
			return value.data;
		},

		// Load all patients
		loadPatients: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await patientsApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!, // Use 'data'
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load patients',
					isLoading: false
				}));
			}
		},

		// Get patient by ID
		getPatient: async (id: string): Promise<Patient | null> => {
			const response = await patientsApi.getById(id);
			return response.success && response.data ? response.data : null;
		},
		// Alias for getPatient for backward compatibility
		getPatientById: async (id: string): Promise<Patient | null> => {
			return await self.getPatient(id);
		},

		// Create new patient
		createPatient: async (patient: Patient) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await patientsApi.create(patient);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: [...state.data, response.data!], // Use 'data'
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create patient',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Update patient
		updatePatient: async (id: string, updates: Partial<Patient>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await patientsApi.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((p) => (p.id === id ? response.data! : p)), // Use 'data'
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update patient',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Delete patient
		deletePatient: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await patientsApi.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((p) => p.id !== id), // Use 'data'
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete patient',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Search patients
		setSearchQuery: (query: string) => {
			update((state) => ({ ...state, searchQuery: query }));
		},

		// Set filters
		setFilters: (filters: PatientsState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		// Clear filters
		clearFilters: () => {
			update((state) => ({ ...state, filters: {}, searchQuery: '' }));
		}
	};
	return self;
}

export const patients = createPatientsStore();

// Derived store for filtered patients
export const filteredPatients = derived(patients, ($patients) => {
	let filtered = $patients.data; // Use 'data'

	// Apply search query
	if ($patients.searchQuery) {
		const query = $patients.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(patient) =>
				patient.fullName.toLowerCase().includes(query) ||
				patient.tcNo.includes(query) ||
				patient.contact.phone.includes(query) ||
				patient.contact.email?.toLowerCase().includes(query)
		);
	}

	// Apply filters
	if ($patients.filters.status) {
		filtered = filtered.filter((p) => p.status === $patients.filters.status);
	}

	if ($patients.filters.gender) {
		filtered = filtered.filter((p) => p.gender === $patients.filters.gender);
	}

	if ($patients.filters.insuranceType) {
		filtered = filtered.filter((p) => p.insurance.type === $patients.filters.insuranceType);
	}

	return filtered;
});

// Derived store for patient statistics
export const patientStats = derived(patients, ($patients) => ({
	total: $patients.data.length, // Use 'data'
	active: $patients.data.filter((p) => p.status === 'active').length, // Use 'data'
	inactive: $patients.data.filter((p) => p.status === 'inactive').length, // Use 'data'
	withSGK: $patients.data.filter((p) => p.insurance.type === 'sgk').length, // Use 'data'
	withPrivateInsurance: $patients.data.filter((p) => p.insurance.type === 'private').length, // Use 'data'
	withoutInsurance: $patients.data.filter((p) => p.insurance.type === 'none').length // Use 'data'
}));
