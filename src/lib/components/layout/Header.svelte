<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser, auth, theme, unreadCount as unreadCountStore } from '$lib/stores';
	import { t, language } from '$lib/i18n';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Bell, Globe, Moon, Sun, LogOut, User, Menu } from 'lucide-svelte';

	interface HeaderProps {
		onMenuClick?: () => void;
	}

	let { onMenuClick }: HeaderProps = $props();

	let showUserMenu = $state(false);

	// Get unread count from the notifications store
	let unreadCountVal = $derived($unreadCountStore);

	function toggleTheme() {
		theme.toggleTheme();
	}

	function toggleLanguage() {
		language.toggle();
	}

	function handleLogout() {
		auth.logout();
		goto('/login');
	}

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function handleNotifications() {
		goto('/notifications');
	}
</script>

<header class="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
	<!-- Mobile Menu Button -->
	<Button variant="ghost" size="icon" class="lg:hidden" onclick={onMenuClick}>
		<Menu class="h-6 w-6" />
	</Button>

	<!-- Search or Page Title (Placeholder for now) -->
	<div class="hidden flex-1 lg:block">
		<!-- This can be a search bar or page title -->
	</div>

	<!-- Right Side Actions -->
	<div class="flex items-center gap-2">
		<!-- Language Toggle -->
		<Button variant="ghost" size="icon" onclick={toggleLanguage}>
			<Globe class="h-5 w-5" />
		</Button>

		<!-- Theme Toggle -->
		<Button variant="ghost" size="icon" onclick={toggleTheme}>
			{#if $theme.effectiveTheme === 'dark'}
				<Sun class="h-5 w-5" />
			{:else}
				<Moon class="h-5 w-5" />
			{/if}
		</Button>

		<!-- Notifications -->
		<Button variant="ghost" size="icon" class="relative" onclick={handleNotifications}>
			<Bell class="h-5 w-5" />
			{#if unreadCountVal > 0}
				<span class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
					{unreadCountVal > 9 ? '9+' : unreadCountVal}
				</span>
			{/if}
		</Button>

		<!-- User Menu -->
		<div class="relative">
			<Button
				variant="ghost"
				class="flex items-center gap-2"
				onclick={toggleUserMenu}
			>
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<User class="h-4 w-4" />
				</div>
				<div class="hidden flex-col items-start text-left lg:flex">
					<span class="text-sm font-medium">{$currentUser?.fullName}</span>
					<span class="text-xs text-muted-foreground">
						{$t(`users.role.${$currentUser?.role}`)}
					</span>
				</div>
			</Button>

			{#if showUserMenu}
				<div class="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg">
					<div class="border-b px-3 py-2">
						<p class="text-sm font-medium">{$currentUser?.fullName}</p>
						<p class="text-xs text-muted-foreground">{$currentUser?.email}</p>
					</div>

					<button
						onclick={() => {
							goto('/settings/profile');
							showUserMenu = false;
						}}
						class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
					>
						<User class="h-4 w-4" />
						<span>{$t('settings.title')}</span>
					</button>

					<button
						onclick={handleLogout}
						class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-accent"
					>
						<LogOut class="h-4 w-4" />
						<span>{$t('auth.logout')}</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>

<svelte:window
	onclick={(e) => {
		if (showUserMenu && !(e.target as HTMLElement).closest('.relative')) {
			showUserMenu = false;
		}
	}}
/>
