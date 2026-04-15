import { writable, derived } from 'svelte/store';
import type { Appointment } from '$types';
import { MockApi } from '$services/mockApi';
import { mockAppointments } from '$data/appointments';

// Initialize MockApi with appointments data
const appointmentsApi = new MockApi<Appointment>(mockAppointments, 300);

interface AppointmentsState {
	data: Appointment[]; // Renamed from 'appointments'
	isLoading: boolean;
	error: string | null;
	filters: {
		status?: Appointment['status'];
		doctorId?: string;
		patientId?: string;
		type?: Appointment['type'];
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the appointments store
function createAppointmentsStore() {
	const { subscribe, set, update } = writable<AppointmentsState>({
		data: mockAppointments, // Use 'data'
		isLoading: false,
		error: null,
		filters: {}
	});

	const self = {
		subscribe,
		// Data getter for non-reactive access
		get data() {
			let value: AppointmentsState = { data: [], isLoading: false, error: null, filters: {} }; // Initialize value
			subscribe((s) => (value = s))();
			return value.data;
		},

		// Load all appointments
		loadAppointments: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await appointmentsApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!, // Use 'data'
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load appointments',
					isLoading: false
				}));
			}
		},

		// Get appointment by ID
		getAppointment: async (id: string): Promise<Appointment | null> => {
			const response = await appointmentsApi.getById(id);
			return response.success && response.data ? response.data : null;
		},
		// Alias for getAppointment for backward compatibility
		getAppointmentById: async (id: string): Promise<Appointment | null> => {
			return await self.getAppointment(id);
		},

		// Create new appointment
		createAppointment: async (appointment: Appointment) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await appointmentsApi.create(appointment);

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
					error: response.error || 'Failed to create appointment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Update appointment
		updateAppointment: async (id: string, updates: Partial<Appointment>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await appointmentsApi.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((a) => (a.id === id ? response.data! : a)), // Use 'data'
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update appointment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Delete appointment
		deleteAppointment: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await appointmentsApi.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((a) => a.id !== id), // Use 'data'
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete appointment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Set filters
		setFilters: (filters: AppointmentsState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		// Filter by date
		filterByDate: (date: Date) => {
			update((state) => ({
				...state,
				filters: {
					...state.filters,
					dateFrom: new Date(date.setHours(0, 0, 0, 0)),
					dateTo: new Date(date.setHours(23, 59, 59, 999))
				}
			}));
		},

		// Filter by doctor
		filterByDoctor: (doctorId: string) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, doctorId }
			}));
		},

		// Filter by patient
		filterByPatient: (patientId: string) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, patientId }
			}));
		},

		// Filter by status
		filterByStatus: (status: Appointment['status']) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, status }
			}));
		},

		// Clear filters
		clearFilters: () => {
			update((state) => ({ ...state, filters: {} }));
		}
	};
	return self;
}

export const appointments = createAppointmentsStore();

// Derived store for filtered appointments
export const filteredAppointments = derived(
	appointments,
	($appointments) => {
		let filtered = $appointments.data; // Use 'data'

		// Apply filters
		if ($appointments.filters.status) {
			filtered = filtered.filter((a) => a.status === $appointments.filters.status);
		}

		if ($appointments.filters.doctorId) {
			filtered = filtered.filter((a) => a.doctorId === $appointments.filters.doctorId);
		}

		if ($appointments.filters.patientId) {
			filtered = filtered.filter((a) => a.patientId === $appointments.filters.patientId);
		}

		if ($appointments.filters.type) {
			filtered = filtered.filter((a) => a.type === $appointments.filters.type);
		}

		if ($appointments.filters.dateFrom && $appointments.filters.dateTo) {
			filtered = filtered.filter((a) => {
				const appointmentDate = new Date(a.date); // Use a.date
				return appointmentDate >= $appointments.filters.dateFrom! && appointmentDate <= $appointments.filters.dateTo!;
			});
		}

		return filtered;
	}
);

// Derived store for today's appointments
export const todaysAppointments = derived(
	appointments,
	($appointments) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return $appointments.data.filter((a) => { // Use 'data'
			const appointmentDate = new Date(a.date); // Use a.date
			return appointmentDate >= today && appointmentDate < tomorrow;
		});
	}
);

// Derived store for upcoming appointments
export const upcomingAppointments = derived(
	appointments,
	($appointments) => {
		const now = new Date();
		return $appointments.data.filter((a) => // Use 'data'
			a.date >= now && // Use a.date
			(a.status === 'scheduled' || a.status === 'confirmed')
		).slice(0, 10); // Limit to next 10
	}
);

// Derived store for appointment statistics
export const appointmentStats = derived(
	appointments,
	($appointments) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayAppointments = $appointments.data.filter((a) => { // Use 'data'
			const appointmentDate = new Date(a.date); // Use a.date
			appointmentDate.setHours(0, 0, 0, 0);
			return appointmentDate.getTime() === today.getTime();
		});

		return {
			total: $appointments.data.length, // Use 'data'
			today: todayAppointments.length,
			scheduled: todayAppointments.filter((a) => a.status === 'scheduled').length,
			confirmed: todayAppointments.filter((a) => a.status === 'confirmed').length,
			inProgress: todayAppointments.filter((a) => a.status === 'in-progress').length,
			completed: todayAppointments.filter((a) => a.status === 'completed').length,
			cancelled: todayAppointments.filter((a) => a.status === 'cancelled').length,
			noShow: todayAppointments.filter((a) => a.status === 'no-show').length
		};
	}
);
