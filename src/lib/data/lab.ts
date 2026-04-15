/**
 * Lab Order Seed Data Generator
 *
 * Generates 80+ historical lab orders with samples and results
 * Mix of statuses: 40% completed, 30% processing, 20% pending collection, 10% pending review
 */

import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';
import type { LabOrder, LabSample, LabResult, OrderStatus, LabPriority } from '$lib/types/lab';
import { LAB_TEST_CATALOG, LAB_TEST_PANELS } from '$lib/types/lab';

function randomFloatInRange(min: number, max: number, fractionDigits: number = 2): number {
	const lower = Math.min(min, max);
	const upper = Math.max(min, max);

	if (lower === upper) {
		return Number(lower.toFixed(fractionDigits));
	}

	const value = lower + Math.random() * (upper - lower);
	return Number(value.toFixed(fractionDigits));
}

/**
 * Generate a barcode for a lab sample
 */
function generateBarcode(): string {
	const prefix = 'LAB';
	const year = new Date().getFullYear();
	const randomNum = faker.number.int({ min: 100000, max: 999999 });
	return `${prefix}-${year}-${randomNum}`;
}

/**
 * Calculate result flag based on value and reference range
 */
function calculateResultFlag(
	value: number,
	min?: number,
	max?: number
): 'normal' | 'low' | 'high' | 'critical' {
	if (!min && !max) return 'normal';

	if (min && value < min) {
		// Critical if 30% below minimum
		return value < min * 0.7 ? 'critical' : 'low';
	}

	if (max && value > max) {
		// Critical if 30% above maximum
		return value > max * 1.3 ? 'critical' : 'high';
	}

	return 'normal';
}

/**
 * Generate a realistic test value within or near reference range
 */
function generateTestValue(
	min?: number,
	max?: number,
	abnormalChance: number = 0.3
): { value: number; flag: 'normal' | 'low' | 'high' | 'critical' } {
	const isAbnormal = Math.random() < abnormalChance;

	if (!min && !max) {
		return { value: randomFloatInRange(0, 100), flag: 'normal' };
	}

	let value: number;

	if (isAbnormal) {
		// Generate abnormal value
		const isLow = Math.random() < 0.5;
		if (isLow && min) {
			// 20% below minimum to slightly below minimum
			value = randomFloatInRange(min * 0.8, min * 0.98);
		} else if (max) {
			// Slightly above maximum to 20% above maximum
			value = randomFloatInRange(max * 1.02, max * 1.2);
		} else {
			value = randomFloatInRange(min || 0, (max || 100) * 1.1);
		}
	} else {
		// Generate normal value (within range)
		const lower = min || 0;
		const upper = max || 100;
		value = randomFloatInRange(lower, upper);
	}

	const flag = calculateResultFlag(value, min, max);
	return { value, flag };
}

/**
 * Format reference range string
 */
function formatReferenceRange(min?: number, max?: number, unit?: string): string {
	if (min && max) {
		return `${min}-${max}${unit ? ' ' + unit : ''}`;
	} else if (min) {
		return `>${min}${unit ? ' ' + unit : ''}`;
	} else if (max) {
		return `<${max}${unit ? ' ' + unit : ''}`;
	}
	return 'N/A';
}

/**
 * Generate lab orders with dependencies
 */
export function generateLabOrderData(
	patientIds: string[],
	doctorIds: string[],
	appointmentIds: string[],
	userNames: Map<string, string> // userId -> full name
) {
	const orders: LabOrder[] = [];
	const samples: LabSample[] = [];
	const results: LabResult[] = [];

	// Status distribution: 40% completed, 30% processing, 20% pending, 10% pending review
	const statusDistribution: OrderStatus[] = [
		...Array(32).fill('completed'),
		...Array(24).fill('processing'),
		...Array(16).fill('pending'),
		...Array(8).fill('collected') // Pending review
	];

	// Priority distribution: 70% routine, 20% urgent, 10% stat
	const priorityDistribution: LabPriority[] = [
		...Array(56).fill('routine'),
		...Array(16).fill('urgent'),
		...Array(8).fill('stat')
	];

	const testIds = Object.keys(LAB_TEST_CATALOG);
	const panelIds = Object.keys(LAB_TEST_PANELS);

	// Generate 80 lab orders
	for (let i = 0; i < 80; i++) {
		const orderId = `LAB-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`;
		const id = nanoid();
		const patientId = faker.helpers.arrayElement(patientIds);
		const doctorId = faker.helpers.arrayElement(doctorIds);
		const appointmentId = faker.helpers.arrayElement(appointmentIds);
		const status = faker.helpers.arrayElement(statusDistribution);
		const priority = faker.helpers.arrayElement(priorityDistribution);

		// Decide if this is a panel or individual tests
		const usePanel = Math.random() < 0.6; // 60% chance of using a panel
		let tests: string[];

		if (usePanel) {
			const panel = faker.helpers.arrayElement(panelIds) as keyof typeof LAB_TEST_PANELS;
			tests = LAB_TEST_PANELS[panel].tests;
		} else {
			// Select 1-5 individual tests
			const count = faker.number.int({ min: 1, max: 5 });
			tests = faker.helpers.arrayElements(testIds, count);
		}

		// Order date: last 60 days
		const orderedAt = faker.date.recent({ days: 60 });

		const order: LabOrder = {
			id,
			orderId,
			patientId,
			patientName: userNames.get(patientId) || 'Unknown Patient',
			doctorId,
			doctorName: userNames.get(doctorId) || 'Unknown Doctor',
			appointmentId,
			tests,
			priority,
			status,
			orderedAt,
			notes: Math.random() < 0.2 ? faker.lorem.sentence() : undefined,
			diagnosisICD10: Math.random() < 0.5 ? `E${faker.number.int({ min: 10, max: 99 })}.${faker.number.int({ min: 0, max: 9 })}` : undefined,
			createdAt: orderedAt,
			updatedAt: new Date()
		};

		orders.push(order);

		// Generate sample if status is not pending
		if (status !== 'pending') {
			const collectedBy = faker.helpers.arrayElement(doctorIds);
			const sampleType = LAB_TEST_CATALOG[tests[0]].sampleType;
			const collectedAt = new Date(orderedAt.getTime() + 30 * 60 * 1000); // +30 minutes

			const sample: LabSample = {
				id: nanoid(),
				orderId: id,
				collectedBy,
				collectedByName: userNames.get(collectedBy) || 'Unknown',
				collectedAt,
				sampleType,
				barcode: generateBarcode(),
				status,
				createdAt: collectedAt,
				updatedAt: new Date()
			};

			samples.push(sample);

			// Generate results if status is processing, collected, or completed
			if (status === 'processing' || status === 'collected' || status === 'completed') {
				const analyzedBy = faker.helpers.arrayElement(doctorIds);
				const analyzedAt = new Date(collectedAt.getTime() + faker.number.int({ min: 2, max: 6 }) * 60 * 60 * 1000); // +2-6 hours

				for (const testId of tests) {
					const test = LAB_TEST_CATALOG[testId];
					const refRange = test.referenceRange;

					// Generate value based on reference range
					const { value: numericValue, flag } = generateTestValue(
						refRange.min,
						refRange.max,
						status === 'completed' ? 0.25 : 0.35 // Less abnormal in completed
					);

					const result: LabResult = {
						id: nanoid(),
						orderId: id,
						testId,
						testName: test.name,
						value: numericValue.toString(),
						numericValue,
						unit: refRange.unit,
						referenceRange: formatReferenceRange(refRange.min, refRange.max, refRange.unit),
						flag,
						analyzedBy,
						analyzedByName: userNames.get(analyzedBy) || 'Unknown',
						analyzedAt,
						status: status === 'completed' ? 'verified' : status === 'collected' ? 'completed' : 'pending',
						createdAt: analyzedAt,
						updatedAt: new Date()
					};

					// Add review data if completed
					if (status === 'completed') {
						result.reviewedBy = doctorId;
						result.reviewedByName = userNames.get(doctorId) || 'Unknown';
						result.reviewedAt = new Date(analyzedAt.getTime() + 60 * 60 * 1000); // +1 hour
						result.status = 'verified';

						// Add notes for critical results
						if (flag === 'critical') {
							result.notes = 'Critical value - patient notified immediately';
						}
					}

					results.push(result);
				}
			}
		}
	}

	return { orders, samples, results };
}

// This file will be imported by seedData.ts to generate lab data
// No default exports here, only the generator function
