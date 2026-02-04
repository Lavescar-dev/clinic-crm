import { writable, get } from 'svelte/store';
import { MockApi } from '$services/mockApi';
import type { User, CreateUserDto, UpdateUserDto, ApiResponse, PaginationParams, SearchParams } from '$types';
import { mockUsers } from '$data/users';

// Initialize MockApi with users data
const usersApi = new MockApi<User>(mockUsers, 300);

interface UsersState {
	data: User[];
	isLoading: boolean;
	error: string | null;
	filters: {}; // Add filters if needed
	searchQuery: string; // Add search query if needed
	currentUser: User | null; // Keep track of the current user
}

// Create the users store
function createUsersStore() {
	const { subscribe, set, update } = writable<UsersState>({
		data: mockUsers,
		isLoading: false,
		error: null,
		filters: {},
		searchQuery: '',
		currentUser: null
	});

	const self = { // Capture `this`
		subscribe,
		// Data getter for non-reactive access
		get data() {
			let value: UsersState = { data: [], isLoading: false, error: null, filters: {}, searchQuery: '', currentUser: null }; // Initialize value
			subscribe((s) => (value = s))();
			return value.data;
		},

		// Load all users
		loadUsers: async (params?: PaginationParams & SearchParams): Promise<void> => {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const response: ApiResponse<User[]> = await usersApi.getAll(params);
				if (response.success) {
					update((state) => ({ ...state, data: response.data || [], isLoading: false }));
				} else {
					update((state) => ({ ...state, error: response.message || 'Failed to load users.', isLoading: false }));
				}
			} catch (e: any) {
				update((state) => ({ ...state, error: e.message || 'An unexpected error occurred.', isLoading: false }));
			}
		},

		// Get user by ID
		getUser: async (id: string): Promise<ApiResponse<User>> => {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const response: ApiResponse<User> = await usersApi.getById(id);
				if (response.success) {
					update((state) => ({ ...state, isLoading: false }));
					return response;
				} else {
					update((state) => ({ ...state, error: response.message || 'Failed to get user.', isLoading: false }));
					return { success: false, message: response.message || 'Failed to get user.' };
				}
			} catch (e: any) {
				update((state) => ({ ...state, error: e.message || 'An unexpected error occurred.', isLoading: false }));
				return { success: false, message: e.message || 'An unexpected error occurred.' };
			}
		},
		// Alias for getUser for backward compatibility
		getUserById: async (id: string): Promise<ApiResponse<User>> => {
			return await self.getUser(id);
		},


		// Create new user
		createUser: async (userData: CreateUserDto): Promise<ApiResponse<User>> => {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const newUser: User = {
					...userData,
					id: 'usr_' + Date.now().toString(),
					fullName: `${userData.firstName} ${userData.lastName}`,
					createdAt: new Date(),
					updatedAt: new Date()
				};
				const response: ApiResponse<User> = await usersApi.create(newUser);
				if (response.success && response.data) {
					update((state) => ({ ...state, data: [...state.data, response.data!], isLoading: false }));
					return response;
				} else {
					update((state) => ({ ...state, error: response.message || 'Failed to create user.', isLoading: false }));
					return { success: false, message: response.message || 'Failed to create user.' };
				}
			} catch (e: any) {
				update((state) => ({ ...state, error: e.message || 'An unexpected error occurred.', isLoading: false }));
				return { success: false, message: e.message || 'An unexpected error occurred.' };
			}
		},

		// Update user
		updateUser: async (id: string, userData: UpdateUserDto): Promise<ApiResponse<User>> => {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				// Get current user data to ensure fullName is correctly updated if only one part changes
				const currentUsersState = get(users);
				const currentUserData = currentUsersState.data.find(u => u.id === id);

				const updatedUser: User = {
					...currentUserData!,
					...userData,
					fullName: `${userData.firstName || currentUserData!.firstName} ${userData.lastName || currentUserData!.lastName}`,
					updatedAt: new Date()
				};
				const response: ApiResponse<User> = await usersApi.update(id, updatedUser);
				if (response.success && response.data) {
					update((state) => ({ ...state, data: state.data.map((u) => (u.id === id ? response.data! : u)), isLoading: false }));
					return response;
				} else {
					update((state) => ({ ...state, error: response.message || 'Failed to update user.', isLoading: false }));
					return { success: false, message: response.message || 'Failed to update user.' };
				}
			} catch (e: any) {
				update((state) => ({ ...state, error: e.message || 'An unexpected error occurred.', isLoading: false }));
				return { success: false, message: e.message || 'An unexpected error occurred.' };
			}
		},

		// Delete user
		deleteUser: async (id: string): Promise<ApiResponse<boolean>> => {
			update((state) => ({ ...state, isLoading: true, error: null }));
			try {
				const response: ApiResponse<boolean> = await usersApi.delete(id);
				if (response.success) {
					update((state) => ({ ...state, data: state.data.filter((u) => u.id !== id), isLoading: false }));
					return response;
				} else {
					update((state) => ({ ...state, error: response.message || 'Failed to delete user.', isLoading: false }));
					return { success: false, message: response.message || 'Failed to delete user.' };
				}
			} catch (e: any) {
				update((state) => ({ ...state, error: e.message || 'An unexpected error occurred.', isLoading: false }));
				return { success: false, message: e.message || 'An unexpected error occurred.' };
			}
		},
		// Set current user (for authentication context)
		setCurrentUser: (user: User | null) => {
			update(state => ({ ...state, currentUser: user }));
		}
	};
	return self;
}

export const users = createUsersStore();
