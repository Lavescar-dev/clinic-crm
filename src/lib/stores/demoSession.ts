/**
 * Demo Session Store
 * Tracks session activity and provides reset functionality for demo environment
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { clearAllMockData } from '$lib/services/mockStore';

export interface DemoSessionState {
	startTime: Date;
	actionCount: number;
	lastActionTime: Date;
}

const SESSION_KEY = 'demo_session_state';

// Get initial session state from sessionStorage or create new
function getInitialState(): DemoSessionState {
	if (!browser) {
		return {
			startTime: new Date(),
			actionCount: 0,
			lastActionTime: new Date()
		};
	}

	try {
		const stored = sessionStorage.getItem(SESSION_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				startTime: new Date(parsed.startTime),
				actionCount: parsed.actionCount || 0,
				lastActionTime: new Date(parsed.lastActionTime)
			};
		}
	} catch (error) {
		console.error('Failed to load demo session state:', error);
	}

	return {
		startTime: new Date(),
		actionCount: 0,
		lastActionTime: new Date()
	};
}

// Save state to sessionStorage
function saveState(state: DemoSessionState): void {
	if (!browser) return;

	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save demo session state:', error);
	}
}

// Create the demo session store
function createDemoSessionStore() {
	const { subscribe, set, update } = writable<DemoSessionState>(getInitialState());

	return {
		subscribe,

		/**
		 * Increment the action counter
		 */
		incrementAction: () => {
			update((state) => {
				const newState = {
					...state,
					actionCount: state.actionCount + 1,
					lastActionTime: new Date()
				};
				saveState(newState);
				return newState;
			});
		},

		/**
		 * Reset the demo session and clear all mock data
		 */
		reset: () => {
			if (!browser) return;

			// Clear all mock data from storage
			clearAllMockData();

			// Clear session state
			sessionStorage.removeItem(SESSION_KEY);

			// Reset store to initial state
			const newState: DemoSessionState = {
				startTime: new Date(),
				actionCount: 0,
				lastActionTime: new Date()
			};

			set(newState);
			saveState(newState);

			// Reload the page to re-initialize seed data
			window.location.reload();
		},

		/**
		 * Get session duration in minutes
		 */
		getSessionDuration: (state: DemoSessionState): number => {
			const now = new Date();
			const durationMs = now.getTime() - state.startTime.getTime();
			return Math.floor(durationMs / 60000); // Convert to minutes
		},

		/**
		 * Get formatted session duration
		 */
		getFormattedDuration: (state: DemoSessionState): string => {
			const durationMinutes = Math.floor(
				(new Date().getTime() - state.startTime.getTime()) / 60000
			);

			if (durationMinutes < 60) {
				return `${durationMinutes}m`;
			}

			const hours = Math.floor(durationMinutes / 60);
			const minutes = durationMinutes % 60;
			return `${hours}h ${minutes}m`;
		}
	};
}

export const demoSession = createDemoSessionStore();
