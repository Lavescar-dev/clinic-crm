<script lang="ts">
	import { t } from '$lib/i18n';
	import { animate } from 'motion';
	import { onMount } from 'svelte';
	import { getServiceWorkerState, promptUserForReload, onUpdateAvailable } from '$lib/utils/sw';

	let notificationElement = $state<HTMLDivElement | null>(null);
	let showNotification = $state(false);
	let isReloading = $state(false);

	onMount(() => {
		// Subscribe to update events
		const unsubscribe = onUpdateAvailable(() => {
			console.log('[UpdateNotification] Update available, showing notification');
			showNotification = true;
		});

		// Also check current state in case update was already detected
		const swState = getServiceWorkerState();
		if (swState.updateAvailable && swState.waiting) {
			showNotification = true;
		}

		return unsubscribe;
	});

	// Animate notification when it appears
	$effect(() => {
		if (showNotification && notificationElement) {
			animate(
				notificationElement,
				({
					opacity: [0, 1],
					y: [-20, 0]
				} as any),
				({
					duration: 0.4,
					easing: [0.4, 0, 0.2, 1]
				} as any)
			);
		}
	});

	async function handleReload() {
		isReloading = true;

		// Trigger the reload which will skip waiting and reload the page
		promptUserForReload();

		// The page will reload, but if it doesn't for some reason, reset the state after 5 seconds
		setTimeout(() => {
			isReloading = false;
		}, 5000);
	}

	function handleDismiss() {
		// Animate out before hiding
		if (notificationElement) {
			animate(
				notificationElement,
				({
					opacity: [1, 0],
					y: [0, -20]
				} as any),
				({
					duration: 0.3,
					easing: [0.4, 0, 0.2, 1]
				} as any)
			).finished.then(() => {
				showNotification = false;
			});
		} else {
			showNotification = false;
		}
	}
</script>

{#if showNotification}
	<div
		bind:this={notificationElement}
		class="update-notification"
		role="alert"
		aria-live="polite"
		aria-labelledby="update-title"
	>
		<div class="notification-content">
			<div class="notification-icon">
				<!-- Sparkles/Update Icon -->
				<svg
					class="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
					></path>
				</svg>
			</div>

			<div class="notification-body">
				<h3 id="update-title" class="title">
					{$t('pwa.update.title') || 'New version available'}
				</h3>
				<p class="description">
					{$t('pwa.update.description') || 'A new version of the app is ready to install.'}
				</p>
			</div>

			<div class="notification-actions">
				<button
					onclick={handleReload}
					disabled={isReloading}
					class="reload-button"
					aria-label={$t('pwa.update.reload') || 'Reload to update'}
				>
					{#if isReloading}
						<!-- Loading Spinner -->
						<svg
							class="animate-spin w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<span>{$t('pwa.update.reloading') || 'Reloading...'}</span>
					{:else}
						<!-- Refresh Icon -->
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							></path>
						</svg>
						<span>{$t('pwa.update.reload') || 'Reload'}</span>
					{/if}
				</button>

				<button
					onclick={handleDismiss}
					class="dismiss-button"
					aria-label={$t('pwa.update.later') || 'Not now'}
				>
					{$t('pwa.update.later') || 'Not now'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.update-notification {
		position: fixed;
		top: 1rem;
		right: 1rem;
		left: 1rem;
		max-width: 500px;
		margin: 0 auto;
		z-index: 9997; /* Below OfflineBanner (9999) but above most content */
		background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
		border: 1px solid rgba(34, 197, 94, 0.3); /* Green border for positive update */
		border-radius: 0.75rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		backdrop-filter: blur(10px);
	}

	@media (min-width: 640px) {
		.update-notification {
			left: auto;
			right: 1.5rem;
			top: 1.5rem;
		}
	}

	.notification-content {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.notification-icon {
		color: #22c55e; /* Green for positive update */
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: flex-start;
	}

	.notification-body {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
		margin: 0;
	}

	.description {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		color: #aaa;
		margin: 0;
		line-height: 1.5;
	}

	.notification-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.25rem;
	}

	.reload-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		border: none;
		border-radius: 0.5rem;
		color: white;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);
		flex: 1;
	}

	.reload-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 8px -1px rgba(34, 197, 94, 0.4);
	}

	.reload-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.reload-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.dismiss-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem 1rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		color: #aaa;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dismiss-button:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.2);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.update-notification {
			top: 0.75rem;
			left: 0.75rem;
			right: 0.75rem;
		}

		.notification-content {
			padding: 1rem;
		}

		.title {
			font-size: 0.938rem;
		}

		.description {
			font-size: 0.813rem;
		}
	}
</style>
