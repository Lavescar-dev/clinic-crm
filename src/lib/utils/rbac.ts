/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * This module provides helper functions for checking user permissions,
 * route access, and determining default dashboards based on roles.
 */

import type { User } from '$types';
import type { Role, PermissionFlags } from '$types/staff';
import { rolePermissionMatrix } from '$types/staff';

// Type for permission keys
export type PermissionKey = keyof PermissionFlags;

/**
 * Check if a user has a specific permission
 * @param user - The current user
 * @param permission - The permission to check
 * @param permissions - Optional explicit permissions object (overrides user lookup)
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(
	user: User | null,
	permission: PermissionKey,
	permissions?: PermissionFlags | null
): boolean {
	if (!user) return false;

	// If explicit permissions are provided, use them
	if (permissions) {
		return permissions[permission] === true;
	}

	// Admin users have all permissions
	if (user.role === 'admin') {
		return true;
	}

	// For other users, we need to check their staff role permissions
	// This requires getting the staff record - handled at the store level
	return false;
}

/**
 * Check if a user has any of the specified permissions
 * @param user - The current user
 * @param requiredPermissions - Array of permissions to check (any match grants access)
 * @param permissions - Optional explicit permissions object
 * @returns true if user has at least one of the permissions
 */
export function hasAnyPermission(
	user: User | null,
	requiredPermissions: PermissionKey[],
	permissions?: PermissionFlags | null
): boolean {
	if (!user) return false;
	return requiredPermissions.some(perm => hasPermission(user, perm, permissions));
}

/**
 * Check if a user has all of the specified permissions
 * @param user - The current user
 * @param requiredPermissions - Array of permissions to check (all must match)
 * @param permissions - Optional explicit permissions object
 * @returns true if user has all of the permissions
 */
export function hasAllPermissions(
	user: User | null,
	requiredPermissions: PermissionKey[],
	permissions?: PermissionFlags | null
): boolean {
	if (!user) return false;
	return requiredPermissions.every(perm => hasPermission(user, perm, permissions));
}

/**
 * Check if a user can access a specific route
 * @param user - The current user
 * @param route - The route path to check
 * @param staffRole - The user's staff role (if available)
 * @returns true if user can access the route
 */
export function canAccessRoute(user: User | null, route: string, staffRole?: Role | null): boolean {
	if (!user) return false;

	// Admin can access all routes
	if (user.role === 'admin') return true;

	// Route-based access control
	const routePermissions: Record<string, PermissionKey[]> = {
		'/patients': ['canViewPatients'],
		'/appointments': ['canViewAppointments'],
		'/emr': ['canViewEMR'],
		'/billing': ['canViewBilling'],
		'/inventory': ['canViewInventory'],
		'/reports': ['canViewReports'],
		'/users': ['canManageSettings'], // Only admins
		'/staff': ['canViewStaff'],
		'/settings': ['canManageSettings'] // Only admins
	};

	// Check if route requires specific permissions
	for (const [routePath, permissions] of Object.entries(routePermissions)) {
		if (route.startsWith(routePath)) {
			// Get user's actual permissions based on their staff role
			if (staffRole) {
				const userPermissions = rolePermissionMatrix[staffRole];
				return permissions.some(perm => userPermissions[perm] === true);
			}
			return false;
		}
	}

	// Default: allow access to dashboard and common routes
	if (route === '/dashboard' || route === '/notifications' || route === '/settings/profile') {
		return true;
	}

	return false;
}

/**
 * Get the default dashboard/landing page for a role
 * @param role - The user's staff role
 * @returns The default route path for the role
 */
export function getDefaultDashboard(role: Role | null): string {
	if (!role) return '/dashboard';

	const dashboardMap: Record<Role, string> = {
		Admin: '/dashboard',
		Doctor: '/appointments',
		Nurse: '/patients',
		Receptionist: '/appointments',
		LabTechnician: '/emr', // Lab results and EMR
		Pharmacist: '/inventory'
	};

	return dashboardMap[role] || '/dashboard';
}

/**
 * Get permission flags for a specific role
 * @param role - The staff role
 * @returns The permission flags for the role
 */
export function getPermissionsForRole(role: Role): PermissionFlags {
	return rolePermissionMatrix[role];
}

/**
 * Check if a staff role has access to a specific module
 * @param role - The staff role
 * @param module - The module name (patients, appointments, billing, etc.)
 * @returns true if the role can access the module
 */
export function canAccessModule(role: Role | null, module: string): boolean {
	if (!role) return false;

	const permissions = rolePermissionMatrix[role];
	if (!permissions) return false;

	// Map modules to their view permissions
	const modulePermissions: Record<string, PermissionKey> = {
		patients: 'canViewPatients',
		appointments: 'canViewAppointments',
		emr: 'canViewEMR',
		billing: 'canViewBilling',
		inventory: 'canViewInventory',
		reports: 'canViewReports',
		staff: 'canViewStaff',
		lab: 'canViewLab',
		shifts: 'canViewShifts'
	};

	const permissionKey = modulePermissions[module];
	if (!permissionKey) return false;

	return permissions[permissionKey] === true;
}

/**
 * Filter navigation items based on user permissions
 * @param navItems - Array of navigation items with optional requiredPermissions
 * @param permissions - User's permission flags
 * @param staffRole - User's staff role
 * @returns Filtered array of navigation items
 */
export function filterNavByPermissions<T extends { requiredPermissions?: PermissionKey[], requiredRole?: Role[] }>(
	navItems: T[],
	permissions: PermissionFlags | null,
	staffRole: Role | null
): T[] {
	if (!permissions || !staffRole) return [];

	return navItems.filter(item => {
		// Check role requirement if specified
		if (item.requiredRole && item.requiredRole.length > 0) {
			if (!item.requiredRole.includes(staffRole)) {
				return false;
			}
		}

		// Check permission requirement if specified
		if (item.requiredPermissions && item.requiredPermissions.length > 0) {
			// User must have at least one of the required permissions
			return item.requiredPermissions.some(perm => permissions[perm] === true);
		}

		// If no requirements specified, include the item
		return true;
	});
}
