import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$types';
import type { Role, PermissionFlags } from '$types/staff';
import { mockUsers, mockPasswords } from '$data/users';
import { mockStaff } from '$data/staff';

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	staffRole: Role | null;
	permissions: PermissionFlags | null;
}

// Storage keys
const STORAGE_KEY_USER = 'auth_user';
const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_STAFF_ROLE = 'auth_staff_role';
const STORAGE_KEY_PERMISSIONS = 'auth_permissions';

// Helper to get staff info for a user
function getStaffInfoForUser(userId: string): { role: Role | null; permissions: PermissionFlags | null } {
	const staffRecord = mockStaff.find((s) => s.userId === userId);
	if (staffRecord) {
		return {
			role: staffRecord.role,
			permissions: staffRecord.permissions || null
		};
	}
	return { role: null, permissions: null };
}

// Get initial state from localStorage
function getInitialAuthState(): AuthState {
	if (!browser) {
		return { user: null, token: null, isLoading: false, staffRole: null, permissions: null };
	}

	try {
		const storedUser = localStorage.getItem(STORAGE_KEY_USER);
		const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
		const storedStaffRole = localStorage.getItem(STORAGE_KEY_STAFF_ROLE);
		const storedPermissions = localStorage.getItem(STORAGE_KEY_PERMISSIONS);

		if (storedUser && storedToken) {
			return {
				user: JSON.parse(storedUser),
				token: storedToken,
				staffRole: storedStaffRole ? (JSON.parse(storedStaffRole) as Role) : null,
				permissions: storedPermissions ? (JSON.parse(storedPermissions) as PermissionFlags) : null,
				isLoading: false
			};
		}
	} catch (error) {
		console.error('Failed to load auth state from localStorage:', error);
	}

	return { user: null, token: null, isLoading: false, staffRole: null, permissions: null };
}

// Create the auth store
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(getInitialAuthState());

	// Save to localStorage
	function saveToStorage(user: User | null, token: string | null, staffRole: Role | null, permissions: PermissionFlags | null) {
		if (!browser) return;

		try {
			if (user && token) {
				localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
				localStorage.setItem(STORAGE_KEY_TOKEN, token);
				if (staffRole) {
					localStorage.setItem(STORAGE_KEY_STAFF_ROLE, JSON.stringify(staffRole));
				}
				if (permissions) {
					localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
				}
			} else {
				localStorage.removeItem(STORAGE_KEY_USER);
				localStorage.removeItem(STORAGE_KEY_TOKEN);
				localStorage.removeItem(STORAGE_KEY_STAFF_ROLE);
				localStorage.removeItem(STORAGE_KEY_PERMISSIONS);
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

			// Get staff info (role and permissions)
			const { role: staffRole, permissions } = getStaffInfoForUser(user.id);

			// Update store
			set({ user, token, staffRole, permissions, isLoading: false });

			// Save to storage
			saveToStorage(user, token, staffRole, permissions);

			return { success: true };
		},

		// Logout function
		logout: () => {
			// Clear store
			set({ user: null, token: null, staffRole: null, permissions: null, isLoading: false });

			// Clear storage
			saveToStorage(null, null, null, null);
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
				saveToStorage(updatedUser, state.token, state.staffRole, state.permissions);

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
				saveToStorage(null, null, null, null);
				set({ user: null, token: null, staffRole: null, permissions: null, isLoading: false });
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

// Derived store for staff role
export const staffRole = derived(
	auth,
	$auth => $auth.staffRole
);

// Derived store for permissions
export const userPermissions = derived(
	auth,
	$auth => $auth.permissions
);
