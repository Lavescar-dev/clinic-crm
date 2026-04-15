/**
 * User Data - Integrates with seed data system
 *
 * This module exports staff members from the comprehensive seed dataset
 * and provides demo account credentials for easy testing.
 */

import type { User } from '$types';
import { seedStaff } from './seedData';

// Use generated staff from seedData
export const mockUsers: User[] = seedStaff;

// Demo account credentials for easy access
// These are fixed credentials mapped to specific roles in the generated dataset
export const mockPasswords: Record<string, string> = {};

// Create a password map for all generated staff
// Default password scheme: role123 (e.g., admin123, doctor123, nurse123)
mockUsers.forEach(user => {
	mockPasswords[user.email] = `${user.role}123`;
});

// Demo account credentials (for documentation and easy reference)
// Uses getters to ensure fresh data on each access (handles SSR empty arrays)
export const DEMO_CREDENTIALS = {
	get admin() {
		return {
			email: mockUsers.find(u => u.role === 'admin')?.email || 'admin@clinic.com',
			password: 'admin123'
		};
	},
	get doctor() {
		return {
			email: mockUsers.find(u => u.role === 'doctor')?.email || 'doctor@clinic.com',
			password: 'doctor123'
		};
	},
	get nurse() {
		return {
			email: mockUsers.find(u => u.role === 'nurse')?.email || 'nurse@clinic.com',
			password: 'nurse123'
		};
	},
	get receptionist() {
		return {
			email: mockUsers.find(u => u.role === 'receptionist')?.email || 'receptionist@clinic.com',
			password: 'receptionist123'
		};
	},
	get pharmacist() {
		return {
			email: mockUsers.find(u => u.role === 'pharmacist')?.email || 'pharmacist@clinic.com',
			password: 'pharmacist123'
		};
	}
};
