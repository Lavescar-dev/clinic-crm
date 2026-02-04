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

<div style="position:fixed;bottom:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;padding:4px 12px;border-radius:4px;font-size:11px;z-index:9999;pointer-events:none;">DEMO | lavescar.com.tr</div>
