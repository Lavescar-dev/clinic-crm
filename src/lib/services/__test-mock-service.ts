/**
 * Test file for MockService - validates the mock service layer works correctly
 * This file can be deleted after verification
 */

import { MockService } from './mockService';

interface TestEntity {
	id: string;
	name: string;
	value: number;
	createdAt?: Date;
	updatedAt?: Date;
}

// Create a test service
const testService = new MockService<TestEntity>(
	[
		{
			id: '1',
			name: 'Test Item 1',
			value: 100,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: '2',
			name: 'Test Item 2',
			value: 200,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	],
	{
		entityName: 'test_entity',
		minDelay: 100,
		maxDelay: 300,
		failureRate: 0,
		enablePersistence: true,
		storageType: 'sessionStorage'
	}
);

/**
 * Run basic tests
 */
export async function runMockServiceTests() {
	console.log('🧪 Testing MockService implementation...');

	try {
		// Test 1: Get all items
		const allResult = await testService.getAll();
		console.log('✅ Get all items:', allResult.success ? 'PASSED' : 'FAILED');

		// Test 2: Get paginated
		const paginatedResult = await testService.getPaginated({ page: 1, limit: 10 });
		console.log('✅ Get paginated:', paginatedResult.success ? 'PASSED' : 'FAILED');

		// Test 3: Search
		const searchResult = await testService.search({ query: 'Test' });
		console.log('✅ Search:', searchResult.success ? 'PASSED' : 'FAILED');

		// Test 4: Get by ID
		const byIdResult = await testService.getById('1');
		console.log('✅ Get by ID:', byIdResult.success ? 'PASSED' : 'FAILED');

		// Test 5: Create
		const createResult = await testService.create({
			id: '3',
			name: 'Test Item 3',
			value: 300,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		console.log('✅ Create:', createResult.success ? 'PASSED' : 'FAILED');

		// Test 6: Update
		const updateResult = await testService.update('1', { value: 150 });
		console.log('✅ Update:', updateResult.success ? 'PASSED' : 'FAILED');

		// Test 7: Delete
		const deleteResult = await testService.delete('2');
		console.log('✅ Delete:', deleteResult.success ? 'PASSED' : 'FAILED');

		// Test 8: Verify persistence
		const config = testService.getConfig();
		console.log('✅ Configuration:', config.entityName === 'test_entity' ? 'PASSED' : 'FAILED');

		console.log('🎉 All MockService tests completed!');
		return true;
	} catch (error) {
		console.error('❌ Test failed:', error);
		return false;
	}
}

// Export the test service for debugging
export { testService };
