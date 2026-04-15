<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import { WifiOff, RefreshCw, Home } from 'lucide-svelte';

	let isOnline = $state(false);
	let retrying = $state(false);
	let lastChecked = $state<Date | null>(null);
	let autoRetryInterval: ReturnType<typeof setInterval> | null = null;

	// List of cached pages that should be available offline
	const cachedPages = [
		{ path: '/dashboard', label: 'Dashboard' },
		{ path: '/patients', label: 'Patients' },
		{ path: '/appointments', label: 'Appointments' },
		{ path: '/staff', label: 'Staff' },
		{ path: '/settings', label: 'Settings' }
	];

	onMount(() => {
		// Check initial online status
		isOnline = navigator.onLine;

		// Listen for online/offline events
		const handleOnline = () => {
			isOnline = true;
			// Automatically redirect to dashboard when back online
			window.location.href = '/dashboard';
		};

		const handleOffline = () => {
			isOnline = false;
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Auto-retry connection every 10 seconds
		autoRetryInterval = setInterval(() => {
			checkConnection();
		}, 10000);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			if (autoRetryInterval) {
				clearInterval(autoRetryInterval);
			}
		};
	});

	async function checkConnection() {
		retrying = true;
		lastChecked = new Date();

		try {
			// Attempt to fetch a small resource to check connectivity
			const response = await fetch('/favicon.png', {
				method: 'HEAD',
				cache: 'no-cache'
			});

			if (response.ok) {
				isOnline = true;
				// Redirect to dashboard if connection is restored
				window.location.href = '/dashboard';
			}
		} catch (err) {
			isOnline = false;
		} finally {
			retrying = false;
		}
	}

	function handleRetry() {
		checkConnection();
	}
</script>

<svelte:head>
	<title>Offline - Clinic CRM</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
	<div class="w-full max-w-2xl">
		<!-- Offline Icon and Title -->
		<div class="mb-8 text-center">
			<div class="mb-6 flex items-center justify-center">
				<div class="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<WifiOff class="h-12 w-12" />
				</div>
			</div>
			<h1 class="mb-2 text-4xl font-bold">You're Offline</h1>
			<p class="text-lg text-muted-foreground">
				{$t('common.offline') || 'No internet connection available'}
			</p>
		</div>

		<!-- Main Card -->
		<Card class="p-8">
			<div class="mb-6">
				<h2 class="mb-2 text-xl font-semibold">Connection Status</h2>
				<div class="flex items-center gap-2">
					<div class={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
					<span class="text-sm text-muted-foreground">
						{isOnline ? 'Connected' : 'Disconnected'}
					</span>
				</div>
				{#if lastChecked}
					<p class="mt-1 text-xs text-muted-foreground">
						Last checked: {lastChecked.toLocaleTimeString()}
					</p>
				{/if}
			</div>

			<!-- Retry Button -->
			<div class="mb-8">
				<Button onclick={handleRetry} disabled={retrying} class="w-full">
					<RefreshCw class={`mr-2 h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
					{retrying ? 'Checking Connection...' : 'Retry Connection'}
				</Button>
				<p class="mt-2 text-center text-xs text-muted-foreground">
					Automatically retrying every 10 seconds
				</p>
			</div>

			<!-- Cached Pages Section -->
			<div class="border-t pt-6">
				<h3 class="mb-4 text-lg font-semibold">Available Pages (Cached)</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					These pages may be available offline if you've visited them recently:
				</p>
				<div class="grid gap-2">
					{#each cachedPages as page}
						<a
							href={page.path}
							class="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 transition-colors hover:bg-muted"
						>
							<Home class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm font-medium">{page.label}</span>
						</a>
					{/each}
				</div>
			</div>

			<!-- Help Text -->
			<div class="mt-6 rounded-md bg-muted/50 p-4">
				<p class="text-sm text-muted-foreground">
					<strong>What happened?</strong><br />
					It looks like you've lost your internet connection. Some features may be limited while offline,
					but you can still access recently visited pages from the cache.
				</p>
			</div>
		</Card>

		<!-- Footer -->
		<div class="mt-8 text-center text-sm text-muted-foreground">
			<p>Clinic CRM - Progressive Web App</p>
		</div>
	</div>
</div>
