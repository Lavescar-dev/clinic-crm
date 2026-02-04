<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, isAuthLoading } from '$lib/stores';

	onMount(() => {
		// Redirect based on authentication status
		if ($isAuthenticated) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
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
