/**
 * Type definitions for mock services
 */

export interface MockStoreConfig {
	storageType: 'localStorage' | 'sessionStorage';
	prefix?: string;
}

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
	 * Entity name for storage (required)
	 */
	entityName: string;
}

export interface OptimisticUpdate<T> {
	id: string;
	previousData: T;
	newData: T;
	timestamp: number;
}

export interface MockServiceStats {
	totalRequests: number;
	successfulRequests: number;
	failedRequests: number;
	averageDelay: number;
	storageSize: number;
}
