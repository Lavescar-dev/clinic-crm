<script lang="ts">
	import { onMount } from 'svelte';
	import { isAuthenticated, isAuthLoading } from '$lib/stores';
	import { get } from 'svelte/store';

	onMount(() => {
		const target = get(isAuthenticated) ? '/dashboard' : '/login';
		window.location.replace(target);
	});
</script>

{#if $isAuthLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-lg">Loading...</div>
	</div>
{:else}
	<div class="flex h-screen items-center justify-center">
		<div class="text-lg">Redirecting...</div>
	</div>
{/if}
