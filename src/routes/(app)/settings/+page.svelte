<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/settings/clinic', { replaceState: true });
	});
</script>

<div class="flex items-center justify-center p-8">
	<p>Loading settings...</p>
</div>