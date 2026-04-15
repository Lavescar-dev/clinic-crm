import { writable, derived } from 'svelte/store';
import type { Notification } from '$types';
import { MockApi } from '$services/mockApi';
import { mockNotifications } from '$data/notifications';

// Initialize MockApi with notifications data
const notificationsApi = new MockApi<Notification>(mockNotifications, 300);

interface NotificationsState {
	data: Notification[]; // Renamed from 'notifications'
	isLoading: boolean;
	error: string | null;
	filters: {
		type?: Notification['type'];
		priority?: Notification['priority'];
		status?: Notification['status'];
	};
}

// Create the notifications store
function createNotificationsStore() {
	const { subscribe, set, update } = writable<NotificationsState>({
		data: mockNotifications, // Use 'data'
		isLoading: false,
		error: null,
		filters: {}
	});

	return {
		subscribe,
		// Data getter for non-reactive access
		get data() {
			let value: NotificationsState = { data: [], isLoading: false, error: null, filters: {} }; // Initialize value
			subscribe((s) => (value = s))();
			return value.data;
		},

		// Load all notifications
		loadNotifications: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await notificationsApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!, // Use 'data'
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load notifications',
					isLoading: false
				}));
			}
		},

		// Get notification by ID
		getNotification: async (id: string): Promise<Notification | null> => {
			const response = await notificationsApi.getById(id);
			return response.success && response.data ? response.data : null;
		},

		// Create new notification
		createNotification: async (notification: Notification) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await notificationsApi.create(notification);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: [response.data!, ...state.data], // Use 'data'
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create notification',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Mark notification as read
		markAsRead: async (id: string) => {
			const response = await notificationsApi.update(id, {
				read: true, // Assuming 'read' field in Notification type
				readAt: new Date()
			});

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((n) => (n.id === id ? response.data! : n)) // Use 'data'
				}));
				return { success: true };
			} else {
				return { success: false, error: response.error };
			}
		},

		// Mark multiple notifications as read
		markMultipleAsRead: async (ids: string[]) => {
			const promises = ids.map((id) =>
				notificationsApi.update(id, {
					read: true,
					readAt: new Date()
				})
			);

			const results = await Promise.all(promises);
			const successfulIds = results.filter((r) => r.success).map((r) => r.data!.id);

			update((state) => ({
				...state,
				data: state.data.map((n) =>
					successfulIds.includes(n.id) ? { ...n, read: true, readAt: new Date() } : n
				) // Use 'data'
			}));

			return { success: true, count: successfulIds.length };
		},

		// Mark all as read (operates on all notifications in store for simplicity)
		markAllAsRead: async () => {
			update((state) => {
				const unreadIds = state.data.filter((n) => !n.read).map((n) => n.id); // Use 'data'

				// Update all unread notifications
				unreadIds.forEach((id) => {
					notificationsApi.update(id, {
						read: true,
						readAt: new Date()
					});
				});

				return {
					...state,
					data: state.data.map((n) => (!n.read ? { ...n, read: true, readAt: new Date() } : n)) // Use 'data'
				};
			});
		},

		// Archive notification
		archiveNotification: async (id: string) => {
			const response = await notificationsApi.update(id, {
				status: 'archived'
			});

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((n) => (n.id === id ? response.data! : n)) // Use 'data'
				}));
				return { success: true };
			} else {
				return { success: false, error: response.error };
			}
		},

		// Delete notification
		deleteNotification: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await notificationsApi.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((n) => n.id !== id), // Use 'data'
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete notification',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Clear all archived notifications (operates on all archived in store)
		clearArchived: async () => {
			const archivedIds = mockNotifications.filter((n) => n.status === 'archived').map((n) => n.id);

			const promises = archivedIds.map((id) => notificationsApi.delete(id));
			await Promise.all(promises);

			update((state) => ({
				...state,
				data: state.data.filter((n) => n.status !== 'archived') // Use 'data'
			}));
		},

		// Set filters
		setFilters: (filters: NotificationsState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		// Clear filters
		clearFilters: () => {
			update((state) => ({ ...state, filters: {} }));
		}
	};
}

export const notifications = createNotificationsStore();

// Derived store for filtered notifications
export const filteredNotifications = derived(
	notifications,
	($notifications) => {
		let filtered = $notifications.data; // Use 'data'

		// Apply filters
		if ($notifications.filters.type) {
			filtered = filtered.filter((n) => n.type === $notifications.filters.type);
		}

		if ($notifications.filters.priority) {
			filtered = filtered.filter((n) => n.priority === $notifications.filters.priority);
		}

		if ($notifications.filters.status) {
			filtered = filtered.filter((n) => n.status === $notifications.filters.status);
		}

		return filtered;
	}
);

// Derived store for unread count
// Note: This needs to be context-aware (e.g., for a specific user), but
// current mock API and store state doesn't have per-user notifications.
// For now, it will return a global unread count.
export const unreadCount = derived(notifications, ($notifications) => {
	return $notifications.data.filter((n) => !n.read).length; // Use 'data'
});

// Derived store for unread notifications
export const unreadNotifications = derived(notifications, ($notifications) => {
	return $notifications.data
		.filter((n) => !n.read) // Use 'data'
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// Derived store for recent notifications
export const recentNotifications = derived(notifications, ($notifications) => {
	return $notifications.data
		.filter((n) => !n.read) // Display unread as recent for the demo
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 10);
});

