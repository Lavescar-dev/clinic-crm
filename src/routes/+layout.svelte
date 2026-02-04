<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Initialize theme on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			const root = document.documentElement;
			root.classList.remove('light', 'dark');
			root.classList.add($theme.effectiveTheme);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MedFlow</title>
</svelte:head>

{@render children()}
