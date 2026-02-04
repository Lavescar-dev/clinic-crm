import { writable, derived } from 'svelte/store';
import type { Invoice, Payment } from '$types';
import { MockApi } from '$services/mockApi';
import { mockInvoices, mockPayments } from '$data/billing';

// Initialize MockApi instances
const invoicesApi = new MockApi<Invoice>(mockInvoices, 300);
const paymentsApi = new MockApi<Payment>(mockPayments, 300);

interface BillingState {
	data: Invoice[]; // Renamed from 'invoices'
	payments: Payment[];
	isLoading: boolean;
	error: string | null;
	filters: {
		status?: Invoice['status'];
		patientId?: string;
		dateFrom?: Date;
		dateTo?: Date;
	};
}

// Create the billing store
function createBillingStore() {
	const { subscribe, set, update } = writable<BillingState>({
		data: mockInvoices, // Use 'data'
		payments: mockPayments,
		isLoading: false,
		error: null,
		filters: {}
	});

	const self = {
		subscribe,
		// Data getter for non-reactive access to invoices (now 'data')
		get data() {
			let value: BillingState = { data: [], payments: [], isLoading: false, error: null, filters: {} }; // Initialize value
			subscribe((s) => (value = s))();
			return value.data;
		},
		// Data getter for non-reactive access to payments
		get payments() {
			let value: BillingState = { data: [], payments: [], isLoading: false, error: null, filters: {} }; // Initialize value
			subscribe((s) => (value = s))();
			return value.payments;
		},

		// Load all invoices
		loadInvoices: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await invoicesApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!, // Use 'data'
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load invoices',
					isLoading: false
				}));
			}
		},

		// Load all payments
		loadPayments: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await paymentsApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					payments: response.data!,
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load payments',
					isLoading: false
				}));
			}
		},

		// Get invoice by ID
		getInvoice: async (id: string): Promise<Invoice | null> => {
			const response = await invoicesApi.getById(id);
			return response.success && response.data ? response.data : null;
		},
		// Alias for getInvoice for backward compatibility
		getInvoiceById: async (id: string): Promise<Invoice | null> => {
			return await self.getInvoice(id);
		},

		// Get payment by ID
		getPayment: async (id: string): Promise<Payment | null> => {
			const response = await paymentsApi.getById(id);
			return response.success && response.data ? response.data : null;
		},

		// Create new invoice
		createInvoice: async (invoice: Invoice) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await invoicesApi.create(invoice);

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
					error: response.error || 'Failed to create invoice',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Update invoice
		updateInvoice: async (id: string, updates: Partial<Invoice>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await invoicesApi.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((i) => (i.id === id ? response.data! : i)), // Use 'data'
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update invoice',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Delete invoice
		deleteInvoice: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await invoicesApi.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					data: state.data.filter((i) => i.id !== id), // Use 'data'
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete invoice',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Create new payment
		createPayment: async (payment: Payment) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await paymentsApi.create(payment);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					payments: [...state.payments, response.data!],
					isLoading: false
				}));

				// Also update the associated invoice's paid/remaining amounts and status
				update((state) => ({
					...state,
					data: state.data.map((inv) => {
						if (inv.id === payment.invoiceId) {
							const newPaidAmount = inv.paidAmount + payment.amount;
							const newRemainingAmount = inv.total - newPaidAmount;
							let newStatus: Invoice['status'] = inv.status;
							if (newRemainingAmount <= 0) {
								newStatus = 'paid';
							} else if (newPaidAmount > 0 && newRemainingAmount > 0) {
								newStatus = 'pending'; // Still pending if partially paid
							}
							return {
								...inv,
								paidAmount: newPaidAmount,
								remainingAmount: newRemainingAmount,
								status: newStatus
							};
						}
						return inv;
					}),
					isLoading: false
				}));

				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to create payment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},
		// Record payment (alias for createPayment)
		recordPayment: async (invoiceId: string, payment: Payment) => {
			// Ensure payment is linked to the invoice
			payment.invoiceId = invoiceId;
			return await self.createPayment(payment);
		},

		// Update payment
		updatePayment: async (id: string, updates: Partial<Payment>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await paymentsApi.update(id, updates);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					payments: state.payments.map((p) => (p.id === id ? response.data! : p)),
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to update payment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Delete payment
		deletePayment: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await paymentsApi.delete(id);

			if (response.success) {
				update((state) => ({
					...state,
					payments: state.payments.filter((p) => p.id !== id),
					isLoading: false
				}));
				return { success: true };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to delete payment',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Set filters
		setFilters: (filters: BillingState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		// Clear filters
		clearFilters: () => {
			update((state) => ({ ...state, filters: {} }));
		}
	};
	return self;
}

export const billing = createBillingStore();

// Derived store for filtered invoices
export const filteredInvoices = derived(
	billing,
	($billing) => {
		let filtered = $billing.data; // Use 'data'

		// Apply filters
		if ($billing.filters.status) {
			filtered = filtered.filter((i) => i.status === $billing.filters.status);
		}

		if ($billing.filters.patientId) {
			filtered = filtered.filter((i) => i.patientId === $billing.filters.patientId);
		}

		if ($billing.filters.dateFrom && $billing.filters.dateTo) {
			filtered = filtered.filter((i) => {
				const issueDate = new Date(i.issueDate);
				return issueDate >= $billing.filters.dateFrom! && issueDate <= $billing.filters.dateTo!;
			});
		}

		return filtered;
	}
);

// Derived store for billing statistics
export const billingStats = derived(
	billing,
	($billing) => {
		const totalRevenue = $billing.data // Use 'data'
			.filter((i) => i.status === 'paid')
			.reduce((sum, i) => sum + i.total, 0);

		const pendingAmount = $billing.data // Use 'data'
			.filter((i) => i.status === 'pending')
			.reduce((sum, i) => sum + i.remainingAmount, 0);

		const overdueAmount = $billing.data // Use 'data'
			.filter((i) => i.status === 'overdue')
			.reduce((sum, i) => sum + i.remainingAmount, 0);

		// Today's payments
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const todaysPayments = $billing.payments.filter((p) => {
			const paymentDate = new Date(p.paymentDate);
			return paymentDate >= today && paymentDate < tomorrow;
		});

		const todaysRevenue = todaysPayments.reduce((sum, p) => sum + p.amount, 0);

		// This month's revenue
		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);

		const monthlyPayments = $billing.payments.filter((p) => {
			const paymentDate = new Date(p.paymentDate);
			return paymentDate >= thisMonth;
		});

		const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

		return {
			totalInvoices: $billing.data.length, // Use 'data'
			paidInvoices: $billing.data.filter((i) => i.status === 'paid').length, // Use 'data'
			pendingInvoices: $billing.data.filter((i) => i.status === 'pending').length, // Use 'data'
			overdueInvoices: $billing.data.filter((i) => i.status === 'overdue').length, // Use 'data'
			totalRevenue,
			pendingAmount,
			overdueAmount,
			todaysRevenue,
			todaysPayments: todaysPayments.length,
			monthlyRevenue,
			monthlyPayments: monthlyPayments.length
		};
	}
);

// Derived store for recent payments
export const recentPayments = derived(
	billing,
	($billing) => {
		return [...$billing.payments]
			.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
			.slice(0, 10);
	}
);
