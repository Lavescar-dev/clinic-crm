<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import { initializeClinicDemoData } from '$lib/data/bootstrap';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	initializeClinicDemoData();

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="flex h-screen overflow-hidden bg-background text-foreground">
	<!-- Desktop Sidebar -->
	<Sidebar />

	<!-- Mobile Navigation -->
	<MobileNav isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

	<!-- Main Content Area -->
	<div class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
		<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,140,149,0.12),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(37,99,235,0.08),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.06),transparent_28%)]"></div>
		<div class="pointer-events-none absolute inset-x-6 top-5 z-0 h-40 rounded-full bg-cyan-200/12 blur-3xl"></div>

		<!-- Header -->
		<Header onMenuClick={toggleMobileMenu} />

		<div class="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden px-4 pb-4 sm:px-6 lg:px-8">
			<!-- Main Content -->
			<main class="app-route-content mx-auto flex-1 w-full max-w-[1760px] overflow-x-hidden overflow-y-auto py-5 lg:py-7">
				{@render children()}
			</main>
		</div>
	</div>
</div>
