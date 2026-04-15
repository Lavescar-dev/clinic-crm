<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores';
	import { language } from '$lib/i18n';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initServiceWorker } from '$lib/utils/sw';
	import UpdateNotification from '$lib/components/UpdateNotification.svelte';

	let { children } = $props();

	// Initialize service worker for PWA updates
	onMount(() => {
		initServiceWorker();
	});

	// Initialize theme on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			const root = document.documentElement;
			root.classList.remove('light', 'dark');
			root.classList.add($theme.effectiveTheme);
			root.lang = $language;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MedFlow</title>
</svelte:head>

<!-- PWA Update Notification -->
<UpdateNotification />

{@render children()}
