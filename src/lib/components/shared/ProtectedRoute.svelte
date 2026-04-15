<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser, staffRole, userPermissions } from '$lib/stores/auth';
	import { canAccessRoute } from '$lib/utils/rbac';
	import type { PermissionKey } from '$lib/utils/rbac';
	import { onMount } from 'svelte';

	interface ProtectedRouteProps {
		/**
		 * Required permissions (user must have at least one)
		 */
		requiredPermissions?: PermissionKey[];
		/**
		 * Redirect path if access is denied
		 */
		redirectTo?: string;
		/**
		 * Show unauthorized message instead of redirecting
		 */
		showUnauthorized?: boolean;
		/**
		 * Custom unauthorized message
		 */
		unauthorizedMessage?: string;
		/**
		 * Children content to render if authorized
		 */
		children?: import('svelte').Snippet;
	}

	let {
		requiredPermissions = [],
		redirectTo = '/dashboard',
		showUnauthorized = false,
		unauthorizedMessage = 'You do not have permission to access this page.',
		children
	}: ProtectedRouteProps = $props();

	let isAuthorized = $state(false);
	let isChecking = $state(true);

	// Check authorization whenever user, role, or permissions change
	$effect(() => {
		const user = $currentUser;
		const role = $staffRole;
		const permissions = $userPermissions;
		const currentPath = $page.url.pathname;

		// Start checking
		isChecking = true;

		// No user? Not authorized
		if (!user) {
			isAuthorized = false;
			isChecking = false;
			if (!showUnauthorized) {
				goto('/login');
			}
			return;
		}

		// Check route-level access
		const canAccess = canAccessRoute(user, currentPath, role);

		// If specific permissions are required, check them
		if (requiredPermissions.length > 0 && permissions) {
			const hasRequiredPermission = requiredPermissions.some(
				perm => permissions[perm] === true
			);
			isAuthorized = canAccess && hasRequiredPermission;
		} else {
			isAuthorized = canAccess;
		}

		isChecking = false;

		// Redirect if not authorized and not showing unauthorized message
		if (!isAuthorized && !showUnauthorized) {
			goto(redirectTo);
		}
	});
</script>

{#if isChecking}
	<!-- Loading state -->
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
			<p class="text-sm text-muted-foreground">Checking permissions...</p>
		</div>
	</div>
{:else if isAuthorized}
	<!-- Render protected content -->
	{#if children}
		{@render children()}
	{/if}
{:else if showUnauthorized}
	<!-- Show unauthorized message -->
	<div class="flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-lg">
			<div class="mb-4 flex justify-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8 text-destructive"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-9a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			</div>
			<h2 class="mb-2 text-xl font-semibold">Access Denied</h2>
			<p class="mb-6 text-sm text-muted-foreground">{unauthorizedMessage}</p>
			<button
				onclick={() => goto(redirectTo)}
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Go to Dashboard
			</button>
		</div>
	</div>
{/if}
