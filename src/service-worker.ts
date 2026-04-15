/**
 * Custom Service Worker with Background Sync API
 * Handles caching, offline support, and background sync for critical operations
 */

/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

/**
 * Background Sync Queue Names
 */
const SYNC_QUEUES = {
	CRITICAL_MUTATIONS: 'critical-mutations-queue',
	FORM_SUBMISSIONS: 'form-submissions-queue',
	DATA_UPDATES: 'data-updates-queue',
	FILE_UPLOADS: 'file-uploads-queue'
} as const;

/**
 * Background Sync Plugins for different operation types
 */
const criticalMutationsPlugin = new BackgroundSyncPlugin(SYNC_QUEUES.CRITICAL_MUTATIONS, {
	maxRetentionTime: 24 * 60, // Retry for 24 hours (in minutes)
	onSync: async ({ queue }) => {
		let entry;
		while ((entry = await queue.shiftRequest())) {
			try {
				await fetch(entry.request.clone());
				console.log('[SW] Background sync successful for:', entry.request.url);
			} catch (error) {
				console.error('[SW] Background sync failed for:', entry.request.url, error);
				// Put the entry back in the queue for retry
				await queue.unshiftRequest(entry);
				throw error; // Re-throw to trigger retry
			}
		}
	}
});

const formSubmissionsPlugin = new BackgroundSyncPlugin(SYNC_QUEUES.FORM_SUBMISSIONS, {
	maxRetentionTime: 48 * 60, // Retry for 48 hours
	onSync: async ({ queue }) => {
		let entry;
		while ((entry = await queue.shiftRequest())) {
			try {
				const response = await fetch(entry.request.clone());
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				console.log('[SW] Form submission synced:', entry.request.url);
			} catch (error) {
				console.error('[SW] Form submission sync failed:', entry.request.url, error);
				await queue.unshiftRequest(entry);
				throw error;
			}
		}
	}
});

const dataUpdatesPlugin = new BackgroundSyncPlugin(SYNC_QUEUES.DATA_UPDATES, {
	maxRetentionTime: 24 * 60,
	onSync: async ({ queue }) => {
		let entry;
		while ((entry = await queue.shiftRequest())) {
			try {
				const response = await fetch(entry.request.clone());
				if (!response.ok && response.status !== 409) {
					// 409 Conflict is acceptable (will be handled by conflict resolution)
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				console.log('[SW] Data update synced:', entry.request.url);
			} catch (error) {
				console.error('[SW] Data update sync failed:', entry.request.url, error);
				await queue.unshiftRequest(entry);
				throw error;
			}
		}
	}
});

const fileUploadsPlugin = new BackgroundSyncPlugin(SYNC_QUEUES.FILE_UPLOADS, {
	maxRetentionTime: 72 * 60, // Retry for 72 hours (longer for files)
	onSync: async ({ queue }) => {
		let entry;
		while ((entry = await queue.shiftRequest())) {
			try {
				const response = await fetch(entry.request.clone());
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				console.log('[SW] File upload synced:', entry.request.url);
			} catch (error) {
				console.error('[SW] File upload sync failed:', entry.request.url, error);
				await queue.unshiftRequest(entry);
				throw error;
			}
		}
	}
});

/**
 * API Routes - NetworkFirst with Background Sync fallback
 */
registerRoute(
	({ url }) => url.pathname.startsWith('/api/'),
	new NetworkFirst({
		cacheName: 'api-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 60 * 60 // 1 hour
			}),
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			criticalMutationsPlugin // Add background sync for failed API calls
		]
	})
);

/**
 * Critical POST/PUT/DELETE requests - Background Sync
 * These are mutations that should be retried when connection is restored
 */
registerRoute(
	({ request, url }) => {
		const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
		const isCritical =
			url.pathname.includes('/api/') &&
			!url.pathname.includes('/auth/logout') && // Don't sync logout requests
			!url.pathname.includes('/auth/refresh'); // Don't sync token refresh
		return isMutation && isCritical;
	},
	new NetworkFirst({
		cacheName: 'critical-mutations',
		plugins: [criticalMutationsPlugin]
	}),
	'POST'
);

registerRoute(
	({ request, url }) => {
		const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
		const isCritical =
			url.pathname.includes('/api/') &&
			!url.pathname.includes('/auth/logout') &&
			!url.pathname.includes('/auth/refresh');
		return isMutation && isCritical;
	},
	new NetworkFirst({
		cacheName: 'critical-mutations',
		plugins: [criticalMutationsPlugin]
	}),
	'PUT'
);

registerRoute(
	({ request, url }) => {
		const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
		const isCritical =
			url.pathname.includes('/api/') &&
			!url.pathname.includes('/auth/logout') &&
			!url.pathname.includes('/auth/refresh');
		return isMutation && isCritical;
	},
	new NetworkFirst({
		cacheName: 'critical-mutations',
		plugins: [criticalMutationsPlugin]
	}),
	'DELETE'
);

registerRoute(
	({ request, url }) => {
		const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
		const isCritical =
			url.pathname.includes('/api/') &&
			!url.pathname.includes('/auth/logout') &&
			!url.pathname.includes('/auth/refresh');
		return isMutation && isCritical;
	},
	new NetworkFirst({
		cacheName: 'critical-mutations',
		plugins: [criticalMutationsPlugin]
	}),
	'PATCH'
);

/**
 * Form submissions - Background Sync with longer retention
 */
registerRoute(
	({ request, url }) => {
		return (
			request.method === 'POST' &&
			(url.pathname.includes('/forms/') || url.pathname.includes('/submit'))
		);
	},
	new NetworkFirst({
		cacheName: 'form-submissions',
		plugins: [formSubmissionsPlugin]
	}),
	'POST'
);

/**
 * Data updates - Background Sync
 */
registerRoute(
	({ request, url }) => {
		const isUpdate = ['PUT', 'PATCH'].includes(request.method);
		const isData = url.pathname.includes('/api/data/');
		return isUpdate && isData;
	},
	new NetworkFirst({
		cacheName: 'data-updates',
		plugins: [dataUpdatesPlugin]
	}),
	'PUT'
);

registerRoute(
	({ request, url }) => {
		const isUpdate = ['PUT', 'PATCH'].includes(request.method);
		const isData = url.pathname.includes('/api/data/');
		return isUpdate && isData;
	},
	new NetworkFirst({
		cacheName: 'data-updates',
		plugins: [dataUpdatesPlugin]
	}),
	'PATCH'
);

/**
 * File uploads - Background Sync with longest retention
 */
registerRoute(
	({ request, url }) => {
		return (
			request.method === 'POST' &&
			(url.pathname.includes('/upload') || url.pathname.includes('/files/'))
		);
	},
	new NetworkFirst({
		cacheName: 'file-uploads',
		plugins: [fileUploadsPlugin]
	}),
	'POST'
);

/**
 * Images - CacheFirst
 */
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'image-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
			})
		]
	})
);

/**
 * Fonts - CacheFirst
 */
registerRoute(
	({ request }) => request.destination === 'font',
	new CacheFirst({
		cacheName: 'font-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 20,
				maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
			})
		]
	})
);

/**
 * CSS & JS - CacheFirst
 */
registerRoute(
	({ request }) => request.destination === 'style' || request.destination === 'script',
	new CacheFirst({
		cacheName: 'static-resources',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
			})
		]
	})
);

/**
 * HTML pages - StaleWhileRevalidate
 */
registerRoute(
	({ request }) => request.mode === 'navigate',
	new StaleWhileRevalidate({
		cacheName: 'html-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 60 * 24 // 1 day
			})
		]
	})
);

/**
 * Google Fonts - CacheFirst
 */
registerRoute(
	({ url }) =>
		url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
	new CacheFirst({
		cacheName: 'google-fonts-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 20,
				maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
			})
		]
	})
);

/**
 * Handle sync events from Background Sync API
 */
self.addEventListener('sync', (event: SyncEvent) => {
	console.log('[SW] Sync event triggered:', event.tag);

	// Handle specific sync tags
	if (event.tag.startsWith('sync-queue-')) {
		const queueName = event.tag.replace('sync-queue-', '');
		console.log(`[SW] Processing sync queue: ${queueName}`);
	}

	// Broadcast sync event to all clients
	event.waitUntil(
		(async () => {
			const clients = await self.clients.matchAll({ type: 'window' });
			for (const client of clients) {
				client.postMessage({
					type: 'SYNC_COMPLETE',
					tag: event.tag,
					timestamp: Date.now()
				});
			}
		})()
	);
});

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}

	if (event.data && event.data.type === 'QUEUE_SYNC_REQUEST') {
		// Manually trigger sync for a specific queue
		const queueName = event.data.queueName;
		console.log(`[SW] Manual sync requested for queue: ${queueName}`);

		// Register background sync
		event.waitUntil(
			self.registration.sync.register(`sync-queue-${queueName}`).then(() => {
				console.log(`[SW] Background sync registered: ${queueName}`);
			})
		);
	}

	if (event.data && event.data.type === 'GET_SYNC_STATUS') {
		// Return sync status
		event.waitUntil(
			(async () => {
				const tags = await self.registration.sync.getTags();
				event.ports[0].postMessage({
					type: 'SYNC_STATUS',
					tags,
					timestamp: Date.now()
				});
			})()
		);
	}
});

/**
 * Activate event - claim clients immediately
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
	console.log('[SW] Service worker activated');
	event.waitUntil(self.clients.claim());
});

/**
 * Install event
 */
self.addEventListener('install', (event: ExtendableEvent) => {
	console.log('[SW] Service worker installed');
	// Skip waiting to activate immediately
	event.waitUntil(self.skipWaiting());
});

console.log('[SW] Service worker loaded with Background Sync support');
