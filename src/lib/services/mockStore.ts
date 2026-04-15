/**
 * Mock Store - Session-based state persistence
 * Provides localStorage/sessionStorage-based persistence for mock data
 */

export interface MockStoreConfig {
	storageType: 'localStorage' | 'sessionStorage';
	prefix?: string;
}

export class MockStore<T extends { id: string }> {
	private storage: Storage;
	private storageKey: string;

	constructor(
		entityName: string,
		config: MockStoreConfig = { storageType: 'sessionStorage', prefix: 'mock_' }
	) {
		this.storage =
			config.storageType === 'localStorage'
				? typeof window !== 'undefined'
					? window.localStorage
					: ({} as Storage)
				: typeof window !== 'undefined'
					? window.sessionStorage
					: ({} as Storage);

		const prefix = config.prefix || 'mock_';
		this.storageKey = `${prefix}${entityName}`;
	}

	/**
	 * Load data from storage
	 */
	load(): T[] {
		if (typeof window === 'undefined') {
			return [];
		}

		try {
			const stored = this.storage.getItem(this.storageKey);
			if (!stored) {
				return [];
			}

			const parsed = JSON.parse(stored);
			// Convert date strings back to Date objects
			return this.deserializeDates(parsed);
		} catch (error) {
			console.error(`Failed to load ${this.storageKey} from storage:`, error);
			return [];
		}
	}

	/**
	 * Save data to storage
	 */
	save(data: T[]): void {
		if (typeof window === 'undefined') {
			return;
		}

		try {
			const serialized = JSON.stringify(data);
			this.storage.setItem(this.storageKey, serialized);
		} catch (error) {
			console.error(`Failed to save ${this.storageKey} to storage:`, error);
		}
	}

	/**
	 * Clear all data from storage
	 */
	clear(): void {
		if (typeof window === 'undefined') {
			return;
		}

		try {
			this.storage.removeItem(this.storageKey);
		} catch (error) {
			console.error(`Failed to clear ${this.storageKey} from storage:`, error);
		}
	}

	/**
	 * Check if storage has data
	 */
	hasData(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		return this.storage.getItem(this.storageKey) !== null;
	}

	/**
	 * Recursively convert date strings to Date objects
	 */
	private deserializeDates(obj: any): any {
		if (obj === null || obj === undefined) {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.map((item) => this.deserializeDates(item));
		}

		if (typeof obj === 'object') {
			const result: any = {};
			for (const key in obj) {
				const value = obj[key];

				// Check if the value is a date string
				if (
					typeof value === 'string' &&
					(key.toLowerCase().includes('date') ||
						key.toLowerCase().includes('at') ||
						key === 'birthday' ||
						key === 'dob')
				) {
					const parsed = new Date(value);
					// Validate it's a valid date
					if (!isNaN(parsed.getTime())) {
						result[key] = parsed;
						continue;
					}
				}

				// Recursively process nested objects
				result[key] = this.deserializeDates(value);
			}
			return result;
		}

		return obj;
	}

	/**
	 * Get storage size in bytes
	 */
	getStorageSize(): number {
		if (typeof window === 'undefined') {
			return 0;
		}

		const stored = this.storage.getItem(this.storageKey);
		return stored ? new Blob([stored]).size : 0;
	}
}

/**
 * Utility function to clear all mock data from storage
 */
export function clearAllMockData(prefix = 'mock_'): void {
	if (typeof window === 'undefined') {
		return;
	}

	// Clear from sessionStorage
	const sessionKeys = Object.keys(window.sessionStorage).filter((key) => key.startsWith(prefix));
	sessionKeys.forEach((key) => window.sessionStorage.removeItem(key));

	// Clear from localStorage
	const localKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(prefix));
	localKeys.forEach((key) => window.localStorage.removeItem(key));
}

/**
 * Utility function to get all mock data keys
 */
export function getAllMockDataKeys(prefix = 'mock_'): string[] {
	if (typeof window === 'undefined') {
		return [];
	}

	const sessionKeys = Object.keys(window.sessionStorage).filter((key) => key.startsWith(prefix));
	const localKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(prefix));

	// Combine and deduplicate keys
	const allKeys = [...sessionKeys, ...localKeys];
	const uniqueKeys = allKeys.filter((key, index) => allKeys.indexOf(key) === index);
	return uniqueKeys;
}
