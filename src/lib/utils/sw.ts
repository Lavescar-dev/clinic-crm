/**
 * Service Worker Utilities
 * Handles service worker registration, update detection, and lifecycle management
 */

/**
 * Service worker registration state
 */
interface ServiceWorkerState {
	registration: ServiceWorkerRegistration | null;
	updateAvailable: boolean;
	installing: boolean;
	waiting: ServiceWorker | null;
	active: ServiceWorker | null;
}

/**
 * Global state for service worker
 */
const swState: ServiceWorkerState = {
	registration: null,
	updateAvailable: false,
	installing: false,
	waiting: null,
	active: null
};

/**
 * Event listeners for update events
 */
type UpdateListener = (worker: ServiceWorker) => void;
const updateListeners: UpdateListener[] = [];

/**
 * Register the service worker
 * @returns Promise that resolves with the registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		console.log('[SW Utils] Service workers are not supported');
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.register('/service-worker.js', {
			type: 'module',
			updateViaCache: 'none' // Always check for updates
		});

		console.log('[SW Utils] Service worker registered successfully');
		swState.registration = registration;
		swState.active = registration.active;

		// Set up event listeners for updates
		setupUpdateListeners(registration);

		// Check for updates every 60 seconds
		setInterval(
			() => {
				checkForUpdates();
			},
			60 * 1000
		);

		return registration;
	} catch (error) {
		console.error('[SW Utils] Service worker registration failed:', error);
		return null;
	}
}

/**
 * Set up listeners for service worker lifecycle events
 */
function setupUpdateListeners(registration: ServiceWorkerRegistration): void {
	// Listen for new service worker installing
	registration.addEventListener('updatefound', () => {
		const installingWorker = registration.installing;
		if (!installingWorker) return;

		console.log('[SW Utils] New service worker installing');
		swState.installing = true;
		swState.waiting = installingWorker;

		installingWorker.addEventListener('statechange', () => {
			console.log('[SW Utils] Service worker state changed:', installingWorker.state);

			if (installingWorker.state === 'installed') {
				swState.installing = false;

				if (navigator.serviceWorker.controller) {
					// A new service worker is available
					console.log('[SW Utils] New service worker available');
					swState.updateAvailable = true;
					swState.waiting = installingWorker;

					// Notify listeners
					updateListeners.forEach((listener) => listener(installingWorker));

					// Show update notification
					console.log('[SW Utils] New version available. Click to update.');
				} else {
					// This is the first install
					console.log('[SW Utils] Service worker installed for the first time');
				}
			}

			if (installingWorker.state === 'activated') {
				console.log('[SW Utils] Service worker activated');
				swState.active = installingWorker;
				swState.waiting = null;
				swState.updateAvailable = false;
			}
		});
	});

	// Listen for controller change (when new SW takes over)
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		console.log('[SW Utils] Service worker controller changed');
		// Don't reload automatically - let user trigger reload
	});

	// Listen for messages from service worker
	navigator.serviceWorker.addEventListener('message', (event) => {
		console.log('[SW Utils] Message from service worker:', event.data);

		if (event.data && event.data.type === 'SYNC_COMPLETE') {
			console.log('[SW Utils] Offline changes synced successfully');
		}
	});
}

/**
 * Check for service worker updates
 * @returns Promise that resolves when update check is complete
 */
export async function checkForUpdates(): Promise<boolean> {
	if (!swState.registration) {
		console.log('[SW Utils] No service worker registration found');
		return false;
	}

	try {
		console.log('[SW Utils] Checking for updates...');
		await swState.registration.update();

		// Check if an update is waiting
		if (swState.registration.waiting) {
			console.log('[SW Utils] Update found and waiting');
			swState.updateAvailable = true;
			swState.waiting = swState.registration.waiting;
			return true;
		}

		return false;
	} catch (error) {
		console.error('[SW Utils] Update check failed:', error);
		return false;
	}
}

/**
 * Skip waiting and activate the new service worker
 * This will cause the new service worker to take control immediately
 */
export function skipWaiting(): void {
	if (!swState.waiting) {
		console.log('[SW Utils] No waiting service worker to activate');
		return;
	}

	console.log('[SW Utils] Sending SKIP_WAITING message to service worker');

	// Send message to waiting service worker
	swState.waiting.postMessage({ type: 'SKIP_WAITING' });

	// Listen for controller change and reload
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		console.log('[SW Utils] Controller changed, reloading page');
		window.location.reload();
	});
}

/**
 * Prompt user to reload and activate the update
 * This is a convenience function that shows a toast and reloads on confirmation
 */
export function promptUserForReload(): void {
	if (!swState.updateAvailable || !swState.waiting) {
		console.log('[SW Utils] No update available to activate');
		return;
	}

	// Skip waiting will trigger reload via controllerchange listener
	skipWaiting();
}

/**
 * Add a listener for update events
 * @param listener Function to call when an update is available
 */
export function onUpdateAvailable(listener: UpdateListener): () => void {
	updateListeners.push(listener);

	// Return unsubscribe function
	return () => {
		const index = updateListeners.indexOf(listener);
		if (index > -1) {
			updateListeners.splice(index, 1);
		}
	};
}

/**
 * Unregister the service worker
 * Useful for debugging or cleanup
 */
export async function unregisterServiceWorker(): Promise<boolean> {
	if (!swState.registration) {
		console.log('[SW Utils] No service worker registration to unregister');
		return false;
	}

	try {
		const success = await swState.registration.unregister();
		if (success) {
			console.log('[SW Utils] Service worker unregistered successfully');
			swState.registration = null;
			swState.updateAvailable = false;
			swState.waiting = null;
			swState.active = null;
		}
		return success;
	} catch (error) {
		console.error('[SW Utils] Failed to unregister service worker:', error);
		return false;
	}
}

/**
 * Get the current service worker state
 * Reactive - will update when state changes
 */
export function getServiceWorkerState(): Readonly<ServiceWorkerState> {
	return swState;
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
	return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get all registered service workers
 */
export async function getRegistrations(): Promise<ServiceWorkerRegistration[]> {
	if (!isServiceWorkerSupported()) {
		return [];
	}

	try {
		return Array.from(await navigator.serviceWorker.getRegistrations());
	} catch (error) {
		console.error('[SW Utils] Failed to get registrations:', error);
		return [];
	}
}

/**
 * Send a message to the active service worker
 * @param message Message to send
 */
export function postMessageToServiceWorker(message: unknown): void {
	if (!navigator.serviceWorker.controller) {
		console.warn('[SW Utils] No active service worker to send message to');
		return;
	}

	navigator.serviceWorker.controller.postMessage(message);
}

/**
 * Get sync status from service worker
 * @returns Promise that resolves with sync tags
 */
export async function getSyncStatus(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		if (!navigator.serviceWorker.controller) {
			reject(new Error('No active service worker'));
			return;
		}

		const messageChannel = new MessageChannel();

		messageChannel.port1.onmessage = (event) => {
			if (event.data && event.data.type === 'SYNC_STATUS') {
				resolve(event.data.tags || []);
			} else {
				reject(new Error('Invalid response from service worker'));
			}
		};

		// Set timeout
		setTimeout(() => {
			reject(new Error('Timeout waiting for sync status'));
		}, 5000);

		// Send message with MessageChannel port for response
		navigator.serviceWorker.controller.postMessage(
			{ type: 'GET_SYNC_STATUS' },
			[messageChannel.port2]
		);
	});
}

/**
 * Initialize service worker utilities
 * Call this once when your app starts
 */
export async function initServiceWorker(): Promise<void> {
	if (!isServiceWorkerSupported()) {
		console.log('[SW Utils] Service workers not supported, skipping initialization');
		return;
	}

	if (import.meta.env.DEV) {
		console.log('[SW Utils] Skipping service worker registration during local development');
		return;
	}

	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname;
		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			console.log('[SW Utils] Skipping service worker registration on local preview hosts');
			return;
		}
	}

	// Register service worker
	await registerServiceWorker();

	// Set up periodic update checks
	console.log('[SW Utils] Service worker utilities initialized');
}
