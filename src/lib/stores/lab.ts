import { writable, derived } from 'svelte/store';
import type {
	LabOrder,
	LabSample,
	LabResult,
	OrderStatus,
	LabPriority,
	CreateLabOrderDto
} from '$lib/types/lab';
import {
	LabOrderService,
	LabSampleService,
	LabResultService
} from '$lib/services/labService';
import { notifications } from './notifications';
import type { Notification } from '$lib/types/notification';
import { nanoid } from 'nanoid';

// Service instances (will be initialized with seed data)
const labOrderService = new LabOrderService();
const labSampleService = new LabSampleService();
const labResultService = new LabResultService();

/**
 * Helper function to create lab result notifications
 * Creates notifications for both doctor and patient when results are ready
 */
async function createLabResultNotifications(
	order: LabOrder,
	results: LabResult[],
	reviewedBy: string
) {
	// Check if any results have critical flags
	const hasCriticalResults = results.some((r) => r.flag === 'critical');
	const hasAbnormalResults = results.some((r) => r.flag === 'high' || r.flag === 'low' || r.flag === 'critical');

	// Get test names
	const testNames = results.map((r) => r.testName).filter(Boolean).join(', ');

	// Notification to doctor: Lab results ready for review
	const doctorNotification: Notification = {
		id: nanoid(),
		userId: order.doctorId,
		type: 'lab-result-ready',
		priority: hasCriticalResults ? 'urgent' : hasAbnormalResults ? 'high' : 'medium',
		status: 'unread',
		title: hasCriticalResults ? 'Kritik Laboratuvar Sonucu' : 'Laboratuvar Sonucu Hazır',
		message: `${order.patientName || 'Hasta'} için laboratuvar test sonuçları hazır - ${testNames || 'Testler'}`,
		data: {
			orderId: order.id,
			orderNumber: order.orderId,
			patientId: order.patientId,
			patientName: order.patientName,
			testCount: results.length,
			hasCriticalResults,
			hasAbnormalResults,
			testNames
		},
		actionUrl: `/lab/orders/${order.id}`,
		read: false,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	await notifications.createNotification(doctorNotification);

	// After doctor review, also notify patient (via their portal or receptionist)
	// For now, we'll skip patient notification since we don't have a patient portal
	// But we could add a notification to reception to inform the patient
}

interface LabState {
	orders: LabOrder[];
	samples: LabSample[];
	results: LabResult[];
	isLoading: boolean;
	error: string | null;
	selectedOrder: LabOrder | null;
	filters: {
		status?: OrderStatus;
		priority?: LabPriority;
		patientId?: string;
		doctorId?: string;
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the lab store
function createLabStore() {
	const { subscribe, set, update } = writable<LabState>({
		orders: [],
		samples: [],
		results: [],
		isLoading: false,
		error: null,
		selectedOrder: null,
		filters: {}
	});

	const self = {
		subscribe,

		// Data getter for non-reactive access
		get data() {
			let value: LabState = {
				orders: [],
				samples: [],
				results: [],
				isLoading: false,
				error: null,
				selectedOrder: null,
				filters: {}
			};
			subscribe((s) => (value = s))();
			return value;
		},

		/**
		 * Initialize the store with seed data
		 */
		init: (seedOrders: LabOrder[], seedSamples: LabSample[], seedResults: LabResult[]) => {
			const orderSvc = new LabOrderService(seedOrders);
			const sampleSvc = new LabSampleService(seedSamples);
			const resultSvc = new LabResultService(seedResults);

			// Replace service instances
			Object.setPrototypeOf(labOrderService, orderSvc);
			Object.assign(labOrderService, orderSvc);
			Object.setPrototypeOf(labSampleService, sampleSvc);
			Object.assign(labSampleService, sampleSvc);
			Object.setPrototypeOf(labResultService, resultSvc);
			Object.assign(labResultService, resultSvc);

			update((state) => ({
				...state,
				orders: seedOrders,
				samples: seedSamples,
				results: seedResults
			}));
		},

		/**
		 * Load all lab orders
		 */
		loadOrders: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labOrderService.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					orders: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load lab orders',
					isLoading: false
				}));
			}
		},

		/**
		 * Create new lab order
		 */
		createOrder: async (orderData: CreateLabOrderDto) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labOrderService.createOrder(orderData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					orders: [...state.orders, response.data!],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create lab order',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Update order status
		 */
		updateOrderStatus: async (orderId: string, status: OrderStatus) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labOrderService.updateOrderStatus(orderId, status);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					orders: state.orders.map((o) => (o.id === orderId ? response.data! : o)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update order status',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Assign sample to order
		 */
		assignSample: async (
			orderId: string,
			collectedBy: string,
			sampleType: string,
			barcode: string
		) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labSampleService.assignSample(
				orderId,
				collectedBy,
				sampleType,
				barcode
			);

			if (response.success && response.data) {
				// Update order status to collected
				await self.updateOrderStatus(orderId, 'collected');

				update((state) => ({
					...state,
					samples: [...state.samples, response.data!],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to assign sample',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Process sample
		 */
		processSample: async (sampleId: string, orderId: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labSampleService.processSample(sampleId);

			if (response.success && response.data) {
				// Update order status to processing
				await self.updateOrderStatus(orderId, 'processing');

				update((state) => ({
					...state,
					samples: state.samples.map((s) => (s.id === sampleId ? response.data! : s)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to process sample',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Submit lab results
		 */
		submitResults: async (resultData: any) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labResultService.submitResults(resultData);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					results: [...state.results, response.data!],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to submit results',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Doctor review result
		 */
		doctorReviewResult: async (resultId: string, reviewedBy: string, notes?: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await labResultService.doctorReviewResult(resultId, reviewedBy, notes);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					results: state.results.map((r) => (r.id === resultId ? response.data! : r)),
					isLoading: false
				}));

				// Update order status to completed if all results reviewed
				const result = response.data;
				const orderResults = self.data.results.filter((r) => r.orderId === result.orderId);
				const allReviewed = orderResults.every((r) => r.status === 'verified');

				if (allReviewed) {
					await self.updateOrderStatus(result.orderId, 'completed');

					// Create notifications when all results are reviewed and order is completed
					const order = self.data.orders.find((o) => o.id === result.orderId);
					if (order) {
						const allResults = self.data.results.filter((r) => r.orderId === result.orderId);
						await createLabResultNotifications(order, allResults, reviewedBy);
					}
				}

				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to review result',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		/**
		 * Get orders by patient
		 */
		getOrdersByPatient: async (patientId: string): Promise<LabOrder[]> => {
			const response = await labOrderService.getOrdersByPatient(patientId);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get orders by status
		 */
		getOrdersByStatus: async (status: OrderStatus): Promise<LabOrder[]> => {
			const response = await labOrderService.getOrdersByStatus(status);
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Get pending reviews
		 */
		getPendingReviews: async (): Promise<LabOrder[]> => {
			const response = await labOrderService.getPendingReviews();
			return response.success && response.data ? response.data : [];
		},

		/**
		 * Select order
		 */
		selectOrder: (order: LabOrder | null) => {
			update((state) => ({ ...state, selectedOrder: order }));
		},

		/**
		 * Set filters
		 */
		setFilters: (filters: LabState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		/**
		 * Clear filters
		 */
		clearFilters: () => {
			update((state) => ({ ...state, filters: {} }));
		}
	};

	return self;
}

export const lab = createLabStore();

// Derived store for pending collection orders
export const pendingCollectionOrders = derived(lab, ($lab) =>
	$lab.orders.filter((order) => order.status === 'pending')
);

// Derived store for orders in progress (collected or processing)
export const inProgressOrders = derived(lab, ($lab) =>
	$lab.orders.filter((order) => order.status === 'collected' || order.status === 'processing')
);

// Derived store for orders pending review
export const pendingReviewOrders = derived(lab, ($lab) =>
	$lab.orders.filter((order) => {
		// Check if order has results that are not yet verified
		const orderResults = $lab.results.filter((r) => r.orderId === order.id);
		return orderResults.some((r) => r.status !== 'verified');
	})
);

// Derived store for completed orders
export const completedOrders = derived(lab, ($lab) =>
	$lab.orders.filter((order) => order.status === 'completed')
);

// Derived store for stat (urgent) orders
export const statOrders = derived(lab, ($lab) =>
	$lab.orders.filter((order) => order.priority === 'stat')
);

// Derived store for filtered orders
export const filteredOrders = derived(lab, ($lab) => {
	let filtered = $lab.orders;

	if ($lab.filters.status) {
		filtered = filtered.filter((o) => o.status === $lab.filters.status);
	}

	if ($lab.filters.priority) {
		filtered = filtered.filter((o) => o.priority === $lab.filters.priority);
	}

	if ($lab.filters.patientId) {
		filtered = filtered.filter((o) => o.patientId === $lab.filters.patientId);
	}

	if ($lab.filters.doctorId) {
		filtered = filtered.filter((o) => o.doctorId === $lab.filters.doctorId);
	}

	if ($lab.filters.dateFrom) {
		filtered = filtered.filter((o) => new Date(o.orderedAt) >= $lab.filters.dateFrom!);
	}

	if ($lab.filters.dateTo) {
		filtered = filtered.filter((o) => new Date(o.orderedAt) <= $lab.filters.dateTo!);
	}

	return filtered;
});

// Derived store for lab statistics
export const labStats = derived(lab, ($lab) => ({
	totalOrders: $lab.orders.length,
	pendingCollection: $lab.orders.filter((o) => o.status === 'pending').length,
	processing: $lab.orders.filter((o) => o.status === 'processing').length,
	pendingReview: $lab.orders.filter((o) => {
		const orderResults = $lab.results.filter((r) => r.orderId === o.id);
		return orderResults.some((r) => r.status !== 'verified');
	}).length,
	completed: $lab.orders.filter((o) => o.status === 'completed').length,
	todayOrders: $lab.orders.filter((o) => {
		const today = new Date();
		const orderDate = new Date(o.orderedAt);
		return (
			orderDate.getDate() === today.getDate() &&
			orderDate.getMonth() === today.getMonth() &&
			orderDate.getFullYear() === today.getFullYear()
		);
	}).length,
	statOrders: $lab.orders.filter((o) => o.priority === 'stat').length,
	averageTurnaroundTime: 0 // Will be calculated based on completed orders
}));
