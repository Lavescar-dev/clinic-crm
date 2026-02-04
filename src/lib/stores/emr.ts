import { writable, derived } from 'svelte/store';
import type { MedicalRecord, Prescription } from '$types'; // Import Prescription
import { MockApi } from '$services/mockApi';
import { mockMedicalRecords } from '$data/emr';

// Initialize MockApi with medical records data
const emrApi = new MockApi<MedicalRecord>(mockMedicalRecords, 300);

interface EMRState {
	data: MedicalRecord[]; // Renamed from 'records'
	isLoading: boolean;
	error: string | null;
	filters: {
		patientId?: string;
		doctorId?: string;
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the EMR store
function createEMRStore() {
	const { subscribe, set, update } = writable<EMRState>({
		data: mockMedicalRecords, // Use 'data'
		isLoading: false,
		error: null,
		filters: {}
	});

	const self = { // Capture `this`
		subscribe,
		// Data getter for non-reactive access
		get data() {
			let value: EMRState;
			subscribe((s) => (value = s))();
			return value.data;
		},

		// Load all medical records
		loadRecords: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await emrApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!, // Use 'data'
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load medical records',
					isLoading: false
				}));
			}
		},

		// Get medical record by ID
		getRecord: async (id: string): Promise<MedicalRecord | null> => {
			const response = await emrApi.getById(id);
			return response.success && response.data ? response.data : null;
		},
		// Alias for getRecord for backward compatibility
		getMedicalRecordById: async (id: string): Promise<MedicalRecord | null> => {
			return await self.getRecord(id);
		},

		// Get records by patient ID
		getMedicalRecordsByPatientId: async (patientId: string): Promise<MedicalRecord[]> => {
			const response = await emrApi.search({
				filters: { patientId }
			});
			return response.success && response.data ? response.data : [];
		},

		// Create new medical record
		createRecord: async (record: MedicalRecord) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await emrApi.create(record);

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
					error: response.error || 'Failed to create medical record',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},
		// Alias for createRecord for backward compatibility
		addMedicalRecord: async (record: MedicalRecord) => {
			return await self.createRecord(record);
		},

		// Update medical record
		updateRecord: async (id: string, updates: Partial<MedicalRecord>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await emrApi.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((r) => (r.id === id ? response.data! : r)), // Use 'data'
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update medical record',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},
		// Alias for updateRecord for backward compatibility
		updateMedicalRecord: async (id: string, updates: Partial<MedicalRecord>) => {
			return await self.updateRecord(id, updates);
		},


		// Delete medical record
		deleteRecord: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await emrApi.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((r) => r.id !== id), // Use 'data'
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete medical record',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// --- Prescription specific methods (placeholder for now, full implementation would be more complex) ---
		// These would ideally interact with a dedicated prescriptions API or manage within medical records
		getPrescriptionById: async (patientId: string, prescriptionId: string) => {
			const medicalRecords = await self.getMedicalRecordsByPatientId(patientId);
			for (const record of medicalRecords) {
				const prescription = record.prescriptions?.find(p => p.id === prescriptionId);
				if (prescription) return prescription;
			}
			return null;
		},

		addPrescription: async (patientId: string, prescription: Prescription) => {
			const records = await self.getMedicalRecordsByPatientId(patientId);
			if (records.length > 0) {
				const latestRecord = records[0]; // Add to latest record or create new? For now, latest.
				latestRecord.prescriptions = [...(latestRecord.prescriptions || []), prescription];
				return await self.updateRecord(latestRecord.id, latestRecord);
			}
			return { success: false, error: 'No medical record found for patient to add prescription to.' };
		},

		updatePrescription: async (patientId: string, prescriptionId: string, updates: Partial<Prescription>) => {
			const records = await self.getMedicalRecordsByPatientId(patientId);
			if (records.length > 0) {
				const latestRecord = records[0];
				latestRecord.prescriptions = latestRecord.prescriptions?.map(p => p.id === prescriptionId ? { ...p, ...updates } : p);
				return await self.updateRecord(latestRecord.id, latestRecord);
			}
			return { success: false, error: 'No medical record found for patient to update prescription in.' };
		},
		// --- End Prescription specific methods ---


		// Filter by patient
		filterByPatient: (patientId: string) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, patientId }
			}));
		},

		// Filter by doctor
		filterByDoctor: (doctorId: string) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, doctorId }
			}));
		},

		// Filter by date range
		filterByDateRange: (dateFrom: Date, dateTo: Date) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, dateFrom, dateTo }
			}));
		},

		// Clear filters
		clearFilters: () => {
			update((state) => ({ ...state, filters: {} }));
		}
	};
	return self;
}

export const emr = createEMRStore();

// Derived store for filtered medical records
export const filteredRecords = derived(
	emr,
	($emr) => {
		let filtered = $emr.data; // Use 'data'

		// Apply filters
		if ($emr.filters.patientId) {
			filtered = filtered.filter((r) => r.patientId === $emr.filters.patientId);
		}

		if ($emr.filters.doctorId) {
			filtered = filtered.filter((r) => r.doctorId === $emr.filters.doctorId);
		}

		if ($emr.filters.dateFrom && $emr.filters.dateTo) {
			filtered = filtered.filter((r) => {
				const visitDate = new Date(r.visitDate);
				return visitDate >= $emr.filters.dateFrom! && visitDate <= $emr.filters.dateTo!;
			});
		}

		return filtered;
	}
);

// Derived store for recent records
export const recentRecords = derived(
	emr,
	($emr) => {
		return [...$emr.data] // Use 'data'
			.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
			.slice(0, 10);
	}
);

// Derived store for EMR statistics
export const emrStats = derived(
	emr,
	($emr) => {
		const withPrescriptions = $emr.data.filter((r) => r.prescriptions && r.prescriptions.length > 0).length; // Use 'data'
		const withLabResults = $emr.data.filter((r) => r.labResults && r.labResults.length > 0).length; // Use 'data'
		const withProcedures = $emr.data.filter((r) => r.procedures && r.procedures.length > 0).length; // Use 'data'

		return {
			total: $emr.data.length, // Use 'data'
			withPrescriptions,
			withLabResults,
			withProcedures
		};
	}
);
