/**
 * Clinical Note Service
 * Extends MockService to provide CRUD operations and specialized methods for clinical note management
 * including SOAP note creation, locking, signing, and retrieval
 */

import { MockService } from './mockService';
import type {
	ClinicalNote,
	CreateClinicalNoteDto,
	UpdateClinicalNoteDto,
	LockClinicalNoteDto,
	NoteType,
	SOAP
} from '$lib/types/clinicalNote';
import type { ApiResponse } from '$types/common';
import { validateSOAPComplete } from '$lib/types/clinicalNote';

export class ClinicalNoteService extends MockService<ClinicalNote> {
	constructor(initialData: ClinicalNote[] = []) {
		super(initialData, {
			entityName: 'clinicalNotes',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.02,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Create a new clinical note
	 */
	async createNote(noteData: CreateClinicalNoteDto): Promise<ApiResponse<ClinicalNote>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create clinical note'
			};
		}

		// Validate SOAP structure has minimum content
		const soapValid = validateSOAPComplete(noteData.soap);
		if (!soapValid) {
			return {
				success: false,
				error: 'Invalid SOAP structure: All sections must have at least 10 characters'
			};
		}

		const now = new Date();
		const newNote: ClinicalNote = {
			id: crypto.randomUUID(),
			...noteData,
			locked: false,
			createdAt: now,
			updatedAt: now
		};

		return await this.create(newNote);
	}

	/**
	 * Update clinical note (only if not locked)
	 */
	async updateNote(
		noteId: string,
		updates: UpdateClinicalNoteDto
	): Promise<ApiResponse<ClinicalNote>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update clinical note'
			};
		}

		// Check if note exists and is locked
		const noteResult = await this.getById(noteId);
		if (!noteResult.success || !noteResult.data) {
			return {
				success: false,
				error: 'Clinical note not found'
			};
		}

		if (noteResult.data.locked) {
			return {
				success: false,
				error: 'Cannot update a locked note. Locked notes are read-only.'
			};
		}

		// Validate SOAP if being updated
		if (updates.soap) {
			const soapValid = validateSOAPComplete(updates.soap);
			if (!soapValid) {
				return {
					success: false,
					error: 'Invalid SOAP structure: All sections must have at least 10 characters'
				};
			}
		}

		const updatesWithTimestamp = {
			...updates,
			updatedAt: new Date()
		};

		return await this.update(noteId, updatesWithTimestamp);
	}

	/**
	 * Lock and sign a clinical note (irreversible)
	 */
	async lockNote(noteId: string, lockData: LockClinicalNoteDto): Promise<ApiResponse<ClinicalNote>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to lock clinical note'
			};
		}

		const noteResult = await this.getById(noteId);
		if (!noteResult.success || !noteResult.data) {
			return {
				success: false,
				error: 'Clinical note not found'
			};
		}

		const note = noteResult.data;

		if (note.locked) {
			return {
				success: false,
				error: 'Note is already locked'
			};
		}

		// Validate SOAP is complete before locking
		const soapValid = validateSOAPComplete(note.soap);
		if (!soapValid) {
			return {
				success: false,
				error: 'Cannot lock note: SOAP structure must be complete with all sections filled'
			};
		}

		const now = new Date();
		return await this.update(noteId, {
			locked: true,
			signedBy: lockData.signedBy,
			signedAt: now,
			updatedAt: now
		});
	}

	/**
	 * Sign note (alias for lockNote for semantic clarity)
	 */
	async signNote(noteId: string, signData: LockClinicalNoteDto): Promise<ApiResponse<ClinicalNote>> {
		return await this.lockNote(noteId, signData);
	}

	/**
	 * Get all clinical notes for a patient
	 */
	async getNotesByPatient(patientId: string): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch patient notes'
			};
		}

		const notes = this.getData()
			.filter((n) => n.patientId === patientId)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Get clinical notes by appointment
	 */
	async getNotesByAppointment(appointmentId: string): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch appointment notes'
			};
		}

		const notes = this.getData()
			.filter((n) => n.appointmentId === appointmentId)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Get clinical notes by doctor
	 */
	async getNotesByDoctor(doctorId: string): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch doctor notes'
			};
		}

		const notes = this.getData()
			.filter((n) => n.doctorId === doctorId)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Get clinical notes by type
	 */
	async getNotesByType(noteType: NoteType): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch notes by type'
			};
		}

		const notes = this.getData()
			.filter((n) => n.noteType === noteType)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Get locked notes
	 */
	async getLockedNotes(): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch locked notes'
			};
		}

		const notes = this.getData()
			.filter((n) => n.locked)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Get unlocked notes (drafts)
	 */
	async getUnlockedNotes(): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch unlocked notes'
			};
		}

		const notes = this.getData()
			.filter((n) => !n.locked)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Get recent clinical notes (last N days)
	 */
	async getRecentNotes(days: number = 30): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch recent notes'
			};
		}

		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		const notes = this.getData()
			.filter((n) => n.date >= cutoffDate)
			.sort((a, b) => b.date.getTime() - a.date.getTime());

		return {
			success: true,
			data: notes
		};
	}

	/**
	 * Search clinical notes by content
	 */
	async searchNotes(query: string): Promise<ApiResponse<ClinicalNote[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to search notes'
			};
		}

		const lowerQuery = query.toLowerCase();
		const notes = this.getData().filter((n) => {
			const soapText = `${n.soap.subjective} ${n.soap.objective} ${n.soap.assessment} ${n.soap.plan}`.toLowerCase();
			return soapText.includes(lowerQuery);
		});

		return {
			success: true,
			data: notes.sort((a, b) => b.date.getTime() - a.date.getTime())
		};
	}
}

// Export singleton instance
export const clinicalNoteService = new ClinicalNoteService();
