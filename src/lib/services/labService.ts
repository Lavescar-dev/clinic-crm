/**
 * Lab Service
 * Extends MockService to provide CRUD operations and specialized methods for lab order management
 */

import { MockService } from './mockService';
import type {
	LabOrder,
	LabSample,
	LabResult,
	OrderStatus,
	CreateLabOrderDto,
	UpdateLabOrderDto,
	CreateLabResultDto,
	UpdateLabResultDto
} from '$lib/types/lab';
import type { ApiResponse } from '$types/common';

export class LabOrderService extends MockService<LabOrder> {
	constructor(initialData: LabOrder[] = []) {
		super(initialData, {
			entityName: 'labOrders',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Create a new lab order
	 */
	async createOrder(orderData: CreateLabOrderDto): Promise<ApiResponse<LabOrder>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to create lab order'
			};
		}

		// Generate order ID
		const orderCount = this.getData().length + 1;
		const orderId = `LAB-${new Date().getFullYear()}-${String(orderCount).padStart(6, '0')}`;

		const newOrder: LabOrder = {
			id: crypto.randomUUID(),
			orderId,
			...orderData,
			status: orderData.status || 'pending',
			priority: orderData.priority || 'routine',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		return await this.create(newOrder);
	}

	/**
	 * Update order status with timestamp tracking
	 */
	async updateOrderStatus(
		orderId: string,
		status: OrderStatus
	): Promise<ApiResponse<LabOrder>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to update order status'
			};
		}

		const updates: Partial<LabOrder> = {
			status,
			updatedAt: new Date()
		};

		return await this.update(orderId, updates);
	}

	/**
	 * Get orders by patient ID
	 */
	async getOrdersByPatient(patientId: string): Promise<ApiResponse<LabOrder[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch orders'
			};
		}

		const orders = this.getData().filter((order) => order.patientId === patientId);

		return {
			success: true,
			data: orders
		};
	}

	/**
	 * Get orders by status
	 */
	async getOrdersByStatus(status: OrderStatus): Promise<ApiResponse<LabOrder[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch orders'
			};
		}

		const orders = this.getData().filter((order) => order.status === status);

		return {
			success: true,
			data: orders
		};
	}

	/**
	 * Get orders pending review
	 */
	async getPendingReviews(): Promise<ApiResponse<LabOrder[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch pending reviews'
			};
		}

		const orders = this.getData().filter((order) => order.status === 'completed');

		return {
			success: true,
			data: orders
		};
	}
}

export class LabSampleService extends MockService<LabSample> {
	constructor(initialData: LabSample[] = []) {
		super(initialData, {
			entityName: 'labSamples',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Assign sample to an order (mark as collected)
	 */
	async assignSample(
		orderId: string,
		collectedBy: string,
		sampleType: string,
		barcode: string
	): Promise<ApiResponse<LabSample>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to assign sample'
			};
		}

		const sample: LabSample = {
			id: crypto.randomUUID(),
			orderId,
			collectedBy,
			collectedAt: new Date(),
			sampleType: sampleType as any,
			barcode,
			status: 'collected',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		return await this.create(sample);
	}

	/**
	 * Process sample (update status to processing)
	 */
	async processSample(sampleId: string): Promise<ApiResponse<LabSample>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to process sample'
			};
		}

		return await this.update(sampleId, {
			status: 'processing',
			updatedAt: new Date()
		});
	}

	/**
	 * Get samples by order ID
	 */
	async getSamplesByOrder(orderId: string): Promise<ApiResponse<LabSample[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch samples'
			};
		}

		const samples = this.getData().filter((sample) => sample.orderId === orderId);

		return {
			success: true,
			data: samples
		};
	}
}

export class LabResultService extends MockService<LabResult> {
	constructor(initialData: LabResult[] = []) {
		super(initialData, {
			entityName: 'labResults',
			minDelay: 200,
			maxDelay: 500,
			failureRate: 0.03,
			enablePersistence: true,
			storageType: 'sessionStorage'
		});
	}

	/**
	 * Submit lab results
	 */
	async submitResults(resultData: CreateLabResultDto): Promise<ApiResponse<LabResult>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to submit results'
			};
		}

		const result: LabResult = {
			id: crypto.randomUUID(),
			...resultData,
			status: 'pending',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		return await this.create(result);
	}

	/**
	 * Doctor review of result
	 */
	async doctorReviewResult(
		resultId: string,
		reviewedBy: string,
		notes?: string
	): Promise<ApiResponse<LabResult>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to review result'
			};
		}

		return await this.update(resultId, {
			reviewedBy,
			reviewedAt: new Date(),
			status: 'verified',
			notes,
			updatedAt: new Date()
		});
	}

	/**
	 * Get results by order ID
	 */
	async getResultsByOrder(orderId: string): Promise<ApiResponse<LabResult[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch results'
			};
		}

		const results = this.getData().filter((result) => result.orderId === orderId);

		return {
			success: true,
			data: results
		};
	}

	/**
	 * Get pending review results
	 */
	async getPendingReviews(): Promise<ApiResponse<LabResult[]>> {
		await this.simulateRandomDelay();

		if (this.shouldSimulateFailure()) {
			return {
				success: false,
				error: 'Network error: Failed to fetch pending reviews'
			};
		}

		const results = this.getData().filter((result) => result.status === 'completed');

		return {
			success: true,
			data: results
		};
	}
}

// Export singleton instances
export const labOrderService = new LabOrderService();
export const labSampleService = new LabSampleService();
export const labResultService = new LabResultService();
