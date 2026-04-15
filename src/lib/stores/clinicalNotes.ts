import { writable, derived } from 'svelte/store';
import type {
	ClinicalNote,
	CreateClinicalNoteDto,
	UpdateClinicalNoteDto,
	LockClinicalNoteDto,
	NoteType,
	ClinicalNoteStats
} from '$lib/types/clinicalNote';
import { ClinicalNoteService } from '$lib/services/clinicalNoteService';

// Service instance (will be initialized with seed data)
const clinicalNoteService = new ClinicalNoteService();

interface ClinicalNoteState {
	notes: ClinicalNote[];
	isLoading: boolean;
	error: string | null;
	selectedNote: ClinicalNote | null;
	filters: {
		patientId?: string;
		doctorId?: string;
		appointmentId?: string;
		noteType?: NoteType;
		locked?: boolean;
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the clinical note store
function createClinicalNoteStore() {
	const { subscribe, set, update } = writable<ClinicalNoteState>({
		notes: [],
		isLoading: false,
		error: null,
		selectedNote: null,
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: ClinicalNoteState = {
				notes: [],
				isLoading: false,
				error: null,
				selectedNote: null,
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedNotes: ClinicalNote[]) => {
			const service = new ClinicalNoteService(seedNotes);

			// Replace service instance
			Object.setPrototypeOf(clinicalNoteService, service);
			Object.assign(clinicalNoteService, service);

			update((state) => ({
				...state,
				notes: seedNotes
			}));
		},

		/**
		 * Load all clinical notes
		 */
		loadNotes: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load clinical notes',
					isLoading: false
				}));
			}
		},

		/**
		 * Create new clinical note
		 */
		createNote: async (noteData: CreateClinicalNoteDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.createNote(noteData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: [...state.notes, response.data!],
					isLoading: false
				}));
				return response;
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create note',
					isLoading: false
				}));
				return response;
			}
		},

		/**
		 * Update clinical note
		 */
		updateNote: async (noteId: string, updates: UpdateClinicalNoteDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.updateNote(noteId, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: state.notes.map((note) => (note.id === noteId ? response.data! : note)),
					selectedNote:
						state.selectedNote?.id === noteId ? response.data! : state.selectedNote,
					isLoading: false
				}));
				return response;
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update note',
					isLoading: false
				}));
				return response;
			}
		},

		/**
		 * Lock and sign a clinical note
		 */
		lockNote: async (noteId: string, lockData: LockClinicalNoteDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.lockNote(noteId, lockData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: state.notes.map((note) => (note.id === noteId ? response.data! : note)),
					selectedNote:
						state.selectedNote?.id === noteId ? response.data! : state.selectedNote,
					isLoading: false
				}));
				return response;
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to lock note',
					isLoading: false
				}));
				return response;
			}
		},

		/**
		 * Get note by ID
		 */
		getNote: async (noteId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.getById(noteId);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					selectedNote: response.data!,
					isLoading: false
				}));
				return response;
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to fetch note',
					isLoading: false
				}));
				return response;
			}
		},

		/**
		 * Get notes by patient
		 */
		loadPatientNotes: async (patientId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.getNotesByPatient(patientId);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load patient notes',
					isLoading: false
				}));
			}
		},

		/**
		 * Get notes by appointment
		 */
		loadAppointmentNotes: async (appointmentId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.getNotesByAppointment(appointmentId);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load appointment notes',
					isLoading: false
				}));
			}
		},

		/**
		 * Get notes by doctor
		 */
		loadDoctorNotes: async (doctorId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.getNotesByDoctor(doctorId);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load doctor notes',
					isLoading: false
				}));
			}
		},

		/**
		 * Search notes
		 */
		searchNotes: async (query: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await clinicalNoteService.searchNotes(query);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					notes: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to search notes',
					isLoading: false
				}));
			}
		},

		/**
		 * Set filters
		 */
		setFilters: (
			filters: Partial<{
				patientId?: string;
				doctorId?: string;
				appointmentId?: string;
				noteType?: NoteType;
				locked?: boolean;
				dateFrom?: Date;
				dateTo?: Date;
			}>
		) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, ...filters }
			}));
		},

		/**
		 * Clear filters
		 */
		clearFilters: () => {
			update((state) => ({
				...state,
				filters: {}
			}));
		},

		/**
		 * Select a note
		 */
		selectNote: (note: ClinicalNote | null) => {
			update((state) => ({
				...state,
				selectedNote: note
			}));
		},

		/**
		 * Clear error
		 */
		clearError: () => {
			update((state) => ({
				...state,
				error: null
			}));
		}
	};

	return self;
}

// Export the store
export const clinicalNotes = createClinicalNoteStore();

// Derived stores for filtering
export const lockedNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => note.locked)
);

export const unlockedNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => !note.locked)
);

export const consultationNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => note.noteType === 'consultation')
);

export const followupNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => note.noteType === 'followup')
);

export const emergencyNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => note.noteType === 'emergency')
);

export const procedureNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => note.noteType === 'procedure')
);

export const dischargeNotes = derived(clinicalNotes, ($clinicalNotes) =>
	$clinicalNotes.notes.filter((note) => note.noteType === 'discharge')
);

// Filtered notes based on current filters
export const filteredClinicalNotes = derived(clinicalNotes, ($clinicalNotes) => {
	let filtered = $clinicalNotes.notes;

	if ($clinicalNotes.filters.patientId) {
		filtered = filtered.filter((note) => note.patientId === $clinicalNotes.filters.patientId);
	}

	if ($clinicalNotes.filters.doctorId) {
		filtered = filtered.filter((note) => note.doctorId === $clinicalNotes.filters.doctorId);
	}

	if ($clinicalNotes.filters.appointmentId) {
		filtered = filtered.filter(
			(note) => note.appointmentId === $clinicalNotes.filters.appointmentId
		);
	}

	if ($clinicalNotes.filters.noteType) {
		filtered = filtered.filter((note) => note.noteType === $clinicalNotes.filters.noteType);
	}

	if ($clinicalNotes.filters.locked !== undefined) {
		filtered = filtered.filter((note) => note.locked === $clinicalNotes.filters.locked);
	}

	if ($clinicalNotes.filters.dateFrom) {
		filtered = filtered.filter(
			(note) => note.date >= $clinicalNotes.filters.dateFrom!
		);
	}

	if ($clinicalNotes.filters.dateTo) {
		filtered = filtered.filter((note) => note.date <= $clinicalNotes.filters.dateTo!);
	}

	return filtered;
});

// Statistics
export const clinicalNoteStats = derived(clinicalNotes, ($clinicalNotes): ClinicalNoteStats => {
	const notes = $clinicalNotes.notes;
	const now = new Date();
	const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	return {
		total: notes.length,
		byType: {
			consultation: notes.filter((n) => n.noteType === 'consultation').length,
			followup: notes.filter((n) => n.noteType === 'followup').length,
			emergency: notes.filter((n) => n.noteType === 'emergency').length,
			procedure: notes.filter((n) => n.noteType === 'procedure').length,
			discharge: notes.filter((n) => n.noteType === 'discharge').length
		},
		locked: notes.filter((n) => n.locked).length,
		unlocked: notes.filter((n) => !n.locked).length,
		thisMonth: notes.filter((n) => n.date >= oneMonthAgo).length,
		thisWeek: notes.filter((n) => n.date >= oneWeekAgo).length
	};
});
