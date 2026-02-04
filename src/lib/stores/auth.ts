import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$types';
import { mockUsers, mockPasswords } from '$data/users';

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
}

// Storage keys
const STORAGE_KEY_USER = 'auth_user';
const STORAGE_KEY_TOKEN = 'auth_token';

// Get initial state from localStorage
function getInitialAuthState(): AuthState {
	if (!browser) {
		return { user: null, token: null, isLoading: false };
	}

	try {
		const storedUser = localStorage.getItem(STORAGE_KEY_USER);
		const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);

		if (storedUser && storedToken) {
			return {
				user: JSON.parse(storedUser),
				token: storedToken,
				isLoading: false
			};
		}
	} catch (error) {
		console.error('Failed to load auth state from localStorage:', error);
	}

	return { user: null, token: null, isLoading: false };
}

// Create the auth store
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(getInitialAuthState());

	// Save to localStorage
	function saveToStorage(user: User | null, token: string | null) {
		if (!browser) return;

		try {
			if (user && token) {
				localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
				localStorage.setItem(STORAGE_KEY_TOKEN, token);
			} else {
				localStorage.removeItem(STORAGE_KEY_USER);
				localStorage.removeItem(STORAGE_KEY_TOKEN);
			}
		} catch (error) {
			console.error('Failed to save auth state to localStorage:', error);
		}
	}

	return {
		subscribe,

		// Login function
		login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
			// Set loading state
			update(state => ({ ...state, isLoading: true }));

			// Simulate network delay
			await new Promise(resolve => setTimeout(resolve, 500));

			// Find user by email
			const user = mockUsers.find(u => u.email === email);

			if (!user) {
				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: 'Kullanıcı bulunamadı' };
			}

			// Check password
			const expectedPassword = mockPasswords[email];
			if (password !== expectedPassword) {
				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: 'Hatalı şifre' };
			}

			// Check if user is active
			if (user.status !== 'active') {
				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: 'Hesap aktif değil' };
			}

			// Generate a simple token (in real app, this would come from backend)
			const token = `token_${user.id}_${Date.now()}`;

			// Update store
			set({ user, token, isLoading: false });

			// Save to storage
			saveToStorage(user, token);

			return { success: true };
		},

		// Logout function
		logout: () => {
			// Clear store
			set({ user: null, token: null, isLoading: false });

			// Clear storage
			saveToStorage(null, null);
		},

		// Update user profile
		updateUser: (updates: Partial<User>) => {
			update(state => {
				if (!state.user) return state;

				const updatedUser = {
					...state.user,
					...updates,
					updatedAt: new Date()
				};

				// Save to storage
				saveToStorage(updatedUser, state.token);

				return {
					...state,
					user: updatedUser
				};
			});
		},

		// Check if token is valid (simplified)
		validateSession: async (): Promise<boolean> => {
			const state = getInitialAuthState();

			if (!state.user || !state.token) {
				return false;
			}

			// In a real app, validate with backend
			// For now, just check if user still exists and is active
			const user = mockUsers.find(u => u.id === state.user!.id);

			if (!user || user.status !== 'active') {
				// Clear invalid session
				saveToStorage(null, null);
				set({ user: null, token: null, isLoading: false });
				return false;
			}

			return true;
		}
	};
}

export const auth = createAuthStore();

// Derived store for authentication status
export const isAuthenticated = derived(
	auth,
	$auth => $auth.user !== null && $auth.token !== null
);

// Derived store for current user
export const currentUser = derived(
	auth,
	$auth => $auth.user
);

// Derived store for user role
export const userRole = derived(
	auth,
	$auth => $auth.user?.role
);

// Derived store for loading state
export const isAuthLoading = derived(
	auth,
	$auth => $auth.isLoading
);
