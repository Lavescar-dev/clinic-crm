import { writable, derived } from 'svelte/store';
import type { InventoryItem, StockMovement, ItemStatus } from '$types'; // Import StockMovement, ItemStatus
import { MockApi } from '$services/mockApi';
import { mockInventoryItems } from '$data/inventory';
import { nanoid } from 'nanoid'; // Import nanoid

// Initialize MockApi with inventory data
const inventoryApi = new MockApi<InventoryItem>(mockInventoryItems, 300);

interface InventoryState {
	data: InventoryItem[]; // Renamed from 'items'
	stockMovements: StockMovement[]; // Add stockMovements
	isLoading: boolean;
	error: string | null;
	filters: {
		category?: InventoryItem['category'];
		status?: InventoryItem['status'];
		location?: string;
	};
	searchQuery: string;
}

// Create the inventory store
function createInventoryStore() {
	const { subscribe, set, update } = writable<InventoryState>({
		data: mockInventoryItems, // Use 'data'
		stockMovements: [], // Initialize stockMovements
		isLoading: false,
		error: null,
		filters: {},
		searchQuery: ''
	});

	const self = {
		subscribe,
		// Data getter for non-reactive access
		get data() {
			let value: InventoryState = { data: [], stockMovements: [], isLoading: false, error: null, filters: {}, searchQuery: '' }; // Initialize value
			subscribe((s) => (value = s))();
			return value.data;
		},

		// getter for stock movements
		get stockMovements() {
			let value: InventoryState = { data: [], stockMovements: [], isLoading: false, error: null, filters: {}, searchQuery: '' };
			subscribe((s) => (value = s))();
			return value.stockMovements;
		},

		// Load all inventory items
		loadItems: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await inventoryApi.getAll();

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: response.data!, // Use 'data'
					isLoading: false
				}));
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to load inventory items',
					isLoading: false
				}));
			}
		},

		// Get item by ID
		getItem: async (id: string): Promise<InventoryItem | null> => {
			const response = await inventoryApi.getById(id);
			return response.success && response.data ? response.data : null;
		},
		// Alias for getItem for backward compatibility
		getInventoryItemById: async (id: string): Promise<InventoryItem | null> => {
			return await self.getItem(id);
		},

		// Create new inventory item
		createItem: async (item: InventoryItem) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await inventoryApi.create(item);

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
					error: response.error || 'Failed to create inventory item',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Update inventory item
		updateItem: async (id: string, updates: Partial<InventoryItem>) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await inventoryApi.update(id, updates);

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
					error: response.error || 'Failed to update inventory item',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Delete inventory item
		deleteItem: async (id: string) => {
			update((state) => ({ ...state, isLoading: true, error: null }));

			const response = await inventoryApi.delete(id);

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
					error: response.error || 'Failed to delete inventory item',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Update stock quantity and record movement
		recordStockMovement: async (itemId: string, movement: StockMovement) => {
			update((state) => ({ ...state, isLoading: true, error: null }));
			const currentItem = (await inventoryApi.getById(itemId)).data;

			if (!currentItem) {
				return { success: false, error: 'Item not found' };
			}

			const newStock = currentItem.currentStock + (movement.type === 'purchase' || movement.type === 'return' || movement.type === 'adjustment' ? movement.quantity : -movement.quantity);

			let status: ItemStatus = currentItem.status;
			if (newStock <= 0) {
				status = 'out-of-stock';
			} else if (newStock <= currentItem.minStockLevel) {
				status = 'low-stock';
			} else {
				status = 'in-stock';
			}

			const updatedItem = { ...currentItem, currentStock: newStock, status };
			const response = await inventoryApi.update(itemId, updatedItem);

			if (response.success && response.data) {
				update((state) => ({
					...state,
					data: state.data.map((i) => (i.id === itemId ? response.data! : i)), // Use 'data'
					stockMovements: [...state.stockMovements, { ...movement, id: nanoid(), createdAt: new Date(), updatedAt: new Date(), previousStock: currentItem.currentStock, newStock: newStock }],
					isLoading: false
				}));
				return { success: true, data: response.data };
			} else {
				update((state) => ({
					...state,
					error: response.error || 'Failed to record stock movement',
					isLoading: false
				}));
				return { success: false, error: response.error };
			}
		},

		// Search items
		setSearchQuery: (query: string) => {
			update((state) => ({ ...state, searchQuery: query }));
		},

		// Set filters
		setFilters: (filters: InventoryState['filters']) => {
			update((state) => ({ ...state, filters }));
		},

		// Filter by category
		filterByCategory: (category: InventoryItem['category']) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, category }
			}));
		},

		// Filter by status
		filterByStatus: (status: InventoryItem['status']) => {
			update((state) => ({
				...state,
				filters: { ...state.filters, status }
			}));
		},

		// Clear filters
		clearFilters: () => {
			update((state) => ({ ...state, filters: {}, searchQuery: '' }));
		}
	};
	return self;
}

export const inventory = createInventoryStore();

// Derived store for filtered inventory items
export const filteredInventory = derived(
	inventory,
	($inventory) => {
		let filtered = $inventory.data; // Use 'data'

		// Apply search query
		if ($inventory.searchQuery) {
			const query = $inventory.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(query) ||
					item.sku?.toLowerCase().includes(query) ||
					item.manufacturer?.toLowerCase().includes(query) ||
					item.barcode?.toLowerCase().includes(query)
			);
		}

		// Apply filters
		if ($inventory.filters.category) {
			filtered = filtered.filter((i) => i.category === $inventory.filters.category);
		}

		if ($inventory.filters.status) {
			filtered = filtered.filter((i) => i.status === $inventory.filters.status);
		}

		if ($inventory.filters.location) {
			filtered = filtered.filter((i) => i.location === $inventory.filters.location);
		}

		return filtered;
	}
);

// Derived store for stock alerts (low stock, out of stock, expiring)
export const stockAlerts = derived(
	inventory,
	($inventory) => {
		const alerts = [];

		// Out of stock items
		const outOfStock = $inventory.data.filter((i) => i.currentStock <= 0); // Use 'data'
		alerts.push(
			...outOfStock.map((item) => ({
				id: item.id,
				type: 'out-of-stock' as const,
				priority: 'urgent' as const,
				item,
				message: `${item.name} stok tükendi`
			}))
		);

		// Low stock items
		const lowStock = $inventory.data.filter((i) => i.currentStock > 0 && i.currentStock <= i.minStockLevel); // Use 'data'
		alerts.push(
			...lowStock.map((item) => ({
				id: item.id,
				type: 'low-stock' as const,
				priority: 'high' as const,
				item,
				message: `${item.name} düşük stokta (${item.currentStock} ${item.unit})`
			}))
		);

		// Expired items
		const expired = $inventory.data.filter((i) => i.expiryDate && new Date(i.expiryDate) < new Date()); // Use 'data'
		alerts.push(
			...expired.map((item) => ({
				id: item.id,
				type: 'expired' as const,
				priority: 'high' as const,
				item,
				message: `${item.name} son kullanma tarihi geçmiş`
			}))
		);

		// Expiring soon (within 60 days)
		const expiringDate = new Date();
		expiringDate.setDate(expiringDate.getDate() + 60);

		const expiringSoon = $inventory.data.filter(
			(i) => i.expiryDate && new Date(i.expiryDate) <= expiringDate && new Date(i.expiryDate) > new Date() // Use 'data'
		);

		alerts.push(
			...expiringSoon.map((item) => ({
				id: item.id,
				type: 'expiring-soon' as const,
				priority: 'medium' as const,
				item,
				message: `${item.name} son kullanma tarihi yaklaşıyor (${new Date(item.expiryDate!).toLocaleDateString('tr-TR')})`
			}))
		);

		return alerts;
	}
);

// Derived store for inventory statistics
export const inventoryStats = derived(
	inventory,
	($inventory) => {
		const totalValue = $inventory.data.reduce(
			(sum, item) => sum + item.currentStock * item.unitPrice, // Use 'data'
			0
		);

		const byCategory = {
			medication: $inventory.data.filter((i) => i.category === 'medication').length, // Use 'data'
			equipment: $inventory.data.filter((i) => i.category === 'equipment').length, // Use 'data'
			consumable: $inventory.data.filter((i) => i.category === 'consumable').length // Use 'data'
		};

		const byStatus = {
			inStock: $inventory.data.filter((i) => i.status === 'in-stock').length, // Use 'data'
			lowStock: $inventory.data.filter((i) => i.status === 'low-stock').length, // Use 'data'
			outOfStock: $inventory.data.filter((i) => i.status === 'out-of-stock').length, // Use 'data'
			expired: $inventory.data.filter((i) => i.status === 'expired').length // Use 'data'
		};

		return {
			total: $inventory.data.length, // Use 'data'
			totalValue,
			byCategory,
			byStatus,
			alertCount: byStatus.lowStock + byStatus.outOfStock + byStatus.expired
		};
	}
);

// Derived store for items needing reorder
export const itemsNeedingReorder = derived(
	inventory,
	($inventory) => {
		return $inventory.data
			.filter((item) => item.status === 'out-of-stock' || item.status === 'low-stock') // Use 'data'
			.map((item) => ({
				...item,
				recommendedOrderQuantity: Math.max(item.maxStockLevel - item.currentStock, item.minStockLevel * 2)
			}));
	}
);
