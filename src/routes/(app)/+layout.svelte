<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<!-- Desktop Sidebar -->
	<Sidebar />

	<!-- Mobile Navigation -->
	<MobileNav isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<Header onMenuClick={toggleMobileMenu} />

		<!-- Main Content -->
		<main class="flex-1 overflow-y-auto p-4 lg:p-6">
			{@render children()}
		</main>
	</div>
</div>
