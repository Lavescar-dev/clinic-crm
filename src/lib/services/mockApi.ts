import type { ApiResponse, PaginatedResponse, PaginationParams, SearchParams } from '$types';

export class MockApi<T extends { id: string }> {
	private data: Map<string, T>;
	private delay: number;

	constructor(initialData: T[] = [], delay = 300) {
		this.data = new Map(initialData.map((item) => [item.id, item]));
		this.delay = delay;
	}

	private async simulateDelay(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, this.delay));
	}

	async getAll(): Promise<ApiResponse<T[]>> {
		await this.simulateDelay();
		try {
			return {
				success: true,
				data: Array.from(this.data.values())
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async getPaginated(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<T>>> {
		await this.simulateDelay();
		try {
			const allData = Array.from(this.data.values());
			const start = (params.page - 1) * params.limit;
			const end = start + params.limit;
			const paginatedData = allData.slice(start, end);

			return {
				success: true,
				data: {
					data: paginatedData,
					total: allData.length,
					page: params.page,
					limit: params.limit,
					totalPages: Math.ceil(allData.length / params.limit)
				}
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async search(params: SearchParams): Promise<ApiResponse<T[]>> {
		await this.simulateDelay();
		try {
			let results = Array.from(this.data.values());

			// Simple search implementation
			if (params.query) {
				const query = params.query.toLowerCase();
				results = results.filter((item) =>
					JSON.stringify(item).toLowerCase().includes(query)
				);
			}

			// Apply filters
			if (params.filters) {
				results = results.filter((item) => {
					return Object.entries(params.filters!).every(([key, value]) => {
						return (item as any)[key] === value;
					});
				});
			}

			// Apply sorting
			if (params.sort) {
				results.sort((a, b) => {
					const aVal = (a as any)[params.sort!.field];
					const bVal = (b as any)[params.sort!.field];
					const order = params.sort!.order === 'asc' ? 1 : -1;
					return aVal > bVal ? order : aVal < bVal ? -order : 0;
				});
			}

			return {
				success: true,
				data: results
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async getById(id: string): Promise<ApiResponse<T>> {
		await this.simulateDelay();
		try {
			const item = this.data.get(id);
			if (!item) {
				return {
					success: false,
					error: 'Item not found'
				};
			}
			return {
				success: true,
				data: item
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async create(item: T): Promise<ApiResponse<T>> {
		await this.simulateDelay();
		try {
			if (this.data.has(item.id)) {
				return {
					success: false,
					error: 'Item already exists'
				};
			}
			this.data.set(item.id, item);
			return {
				success: true,
				data: item,
				message: 'Item created successfully'
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async update(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
		await this.simulateDelay();
		try {
			const item = this.data.get(id);
			if (!item) {
				return {
					success: false,
					error: 'Item not found'
				};
			}
			const updated = { ...item, ...updates, updatedAt: new Date() };
			this.data.set(id, updated);
			return {
				success: true,
				data: updated,
				message: 'Item updated successfully'
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	async delete(id: string): Promise<ApiResponse<void>> {
		await this.simulateDelay();
		try {
			if (!this.data.has(id)) {
				return {
					success: false,
					error: 'Item not found'
				};
			}
			this.data.delete(id);
			return {
				success: true,
				message: 'Item deleted successfully'
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	// Utility methods for managing data
	setData(data: T[]): void {
		this.data = new Map(data.map((item) => [item.id, item]));
	}

	getData(): T[] {
		return Array.from(this.data.values());
	}

	clear(): void {
		this.data.clear();
	}
}
