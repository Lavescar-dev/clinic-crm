/**
 * Mock Service - Enhanced base class for mock API services
 * Extends MockApi with configurable delays, session persistence, optimistic updates, and error simulation
 */

import { MockApi } from './mockApi';
import { MockStore } from './mockStore';
import type { ApiResponse, PaginatedResponse, PaginationParams, SearchParams } from '$types';

export interface MockServiceConfig {
	/**
	 * Minimum delay in milliseconds
	 * @default 200
	 */
	minDelay?: number;

	/**
	 * Maximum delay in milliseconds
	 * @default 500
	 */
	maxDelay?: number;

	/**
	 * Random failure rate (0-1)
	 * @default 0.05 (5%)
	 */
	failureRate?: number;

	/**
	 * Enable session persistence
	 * @default true
	 */
	enablePersistence?: boolean;

	/**
	 * Storage type for persistence
	 * @default 'sessionStorage'
	 */
	storageType?: 'localStorage' | 'sessionStorage';

	/**
	 * Storage key prefix
	 * @default 'mock_'
	 */
	storagePrefix?: string;

	/**
	 * Entity name for storage
	 */
	entityName: string;
}

export interface OptimisticUpdate<T> {
	id: string;
	previousData: T;
	newData: T;
	timestamp: number;
}

export class MockService<T extends { id: string }> extends MockApi<T> {
	protected config: Required<MockServiceConfig>;
	protected store: MockStore<T>;
	protected optimisticUpdates: Map<string, OptimisticUpdate<T>>;

	constructor(initialData: T[] = [], config: MockServiceConfig) {
		// Initialize parent with a placeholder delay (will be overridden)
		super(initialData, 300);

		// Set default config
		this.config = {
			minDelay: config.minDelay ?? 200,
			maxDelay: config.maxDelay ?? 500,
			failureRate: config.failureRate ?? 0.05,
			enablePersistence: config.enablePersistence ?? true,
			storageType: config.storageType ?? 'sessionStorage',
			storagePrefix: config.storagePrefix ?? 'mock_',
			entityName: config.entityName
		};

		// Initialize store
		this.store = new MockStore<T>(this.config.entityName, {
			storageType: this.config.storageType,
			prefix: this.config.storagePrefix
		});

		// Initialize optimistic updates tracker
		this.optimisticUpdates = new Map();

		// Load persisted data if available
		this.loadPersistedData(initialData);
	}

	/**
	 * Load data from storage or use initial data
	 */
	private loadPersistedData(initialData: T[]): void {
		if (!this.config.enablePersistence) {
			this.setData(initialData);
			return;
		}

		const persistedData = this.store.load();
		if (persistedData.length > 0) {
			this.setData(persistedData);
		} else {
			this.setData(initialData);
			this.persistData();
		}
	}

	/**
	 * Persist current data to storage
	 */
	protected persistData(): void {
		if (!this.config.enablePersistence) {
			return;
		}

		this.store.save(this.getData());
	}

	/**
	 * Generate a random delay within configured range
	 */
	protected getRandomDelay(): number {
		const { minDelay, maxDelay } = this.config;
		return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
	}

	/**
	 * Simulate a network delay with randomized timing
	 */
	protected async simulateRandomDelay(): Promise<void> {
		const delay = this.getRandomDelay();
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	/**
	 * Simulate random failures for realism
	 */
	protected shouldSimulateFailure(): boolean {
		return Math.random() < this.config.failureRate;
	}

	/**
	 * Get all items with enhanced features
	 */
	async getAll(): Promise<ApiResponse<T[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch data'
			};
		}

		return super.getAll();
	}

	/**
	 * Get paginated items with enhanced features
	 */
	async getPaginated(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<T>>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch paginated data'
			};
		}

		return super.getPaginated(params);
	}

	/**
	 * Search items with enhanced features
	 */
	async search(params: SearchParams): Promise<ApiResponse<T[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to search data'
			};
		}

		return super.search(params);
	}

	/**
	 * Get item by ID with enhanced features
	 */
	async getById(id: string): Promise<ApiResponse<T>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch item'
			};
		}

		return super.getById(id);
	}

	/**
	 * Create item with optimistic update and rollback on failure
	 */
	async create(item: T): Promise<ApiResponse<T>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create item'
			};
		}

		const result = await super.create(item);

		if (result.success) {
			this.persistData();
		}

		return result;
	}

	/**
	 * Update item with optimistic update and rollback on failure
	 */
	async update(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
		// Store original data for potential rollback
		const originalResult = await super.getById(id);
		if (!originalResult.success || !originalResult.data) {
			return {
				success: false,
				error: 'Item not found'
			};
		}

		const previousData = originalResult.data;

		// Apply optimistic update (immediate update before network call)
		const optimisticData = { ...previousData, ...updates } as T;
		this.optimisticUpdates.set(id, {
			id,
			previousData,
			newData: optimisticData,
			timestamp: Date.now()
		});

		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			// Rollback on failure
			this.rollbackOptimisticUpdate(id);
			return {
				success: false,
				error: 'Network error: Failed to update item'
			};
		}

		const result = await super.update(id, updates);

		if (result.success) {
			// Commit the update
			this.optimisticUpdates.delete(id);
			this.persistData();
		} else {
			// Rollback on failure
			this.rollbackOptimisticUpdate(id);
		}

		return result;
	}

	/**
	 * Delete item with optimistic update and rollback on failure
	 */
	async delete(id: string): Promise<ApiResponse<void>> {
		// Store original data for potential rollback
		const originalResult = await super.getById(id);
		if (!originalResult.success || !originalResult.data) {
			return {
				success: false,
				error: 'Item not found'
			};
		}

		const previousData = originalResult.data;

		// Store for potential rollback
		this.optimisticUpdates.set(id, {
			id,
			previousData,
			newData: previousData, // Same as previous for delete
			timestamp: Date.now()
		});

		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			// Rollback on failure
			this.rollbackOptimisticUpdate(id);
			return {
				success: false,
				error: 'Network error: Failed to delete item'
			};
		}

		const result = await super.delete(id);

		if (result.success) {
			this.optimisticUpdates.delete(id);
			this.persistData();
		} else {
			this.rollbackOptimisticUpdate(id);
		}

		return result;
	}

	/**
	 * Rollback an optimistic update
	 */
	protected rollbackOptimisticUpdate(id: string): void {
		const update = this.optimisticUpdates.get(id);
		if (!update) {
			return;
		}

		// Restore previous data
		const currentData = this.getData();
		const index = currentData.findIndex((item) => item.id === id);

		if (index !== -1) {
			currentData[index] = update.previousData;
			this.setData(currentData);
		}

		this.optimisticUpdates.delete(id);
	}

	/**
	 * Reset to initial data
	 */
	reset(initialData: T[]): void {
		this.setData(initialData);
		this.persistData();
		this.optimisticUpdates.clear();
	}

	/**
	 * Clear all persisted data
	 */
	clearPersisted(): void {
		this.store.clear();
	}

	/**
	 * Get current configuration
	 */
	getConfig(): Readonly<Required<MockServiceConfig>> {
		return { ...this.config };
	}

	/**
	 * Update configuration
	 */
	updateConfig(updates: Partial<MockServiceConfig>): void {
		this.config = {
			...this.config,
			...updates
		} as Required<MockServiceConfig>;
	}
}
