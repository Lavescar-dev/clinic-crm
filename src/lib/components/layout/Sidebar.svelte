<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import { cn } from '$lib/utils/cn';
	import {
		LayoutDashboard,
		Users,
		Calendar,
		FileText,
		CreditCard,
		Package,
		BarChart3,
		UserCog,
		Settings
	} from 'lucide-svelte';

	interface NavItem {
		label: string;
		href: string;
		icon: any;
	}

	const navItems: NavItem[] = [
		{ label: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'nav.patients', href: '/patients', icon: Users },
		{ label: 'nav.appointments', href: '/appointments', icon: Calendar },
		{ label: 'nav.emr', href: '/emr', icon: FileText },
		{ label: 'nav.billing', href: '/billing', icon: CreditCard },
		{ label: 'nav.inventory', href: '/inventory', icon: Package },
		{ label: 'nav.reports', href: '/reports', icon: BarChart3 },
		{ label: 'nav.users', href: '/users', icon: UserCog },
		{ label: 'nav.settings', href: '/settings', icon: Settings }
	];

	let currentPath = $derived($page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return currentPath === '/dashboard';
		}
		return currentPath.startsWith(href);
	}
</script>

<aside class="hidden h-full w-64 flex-col border-r bg-card lg:flex">
	<!-- Logo -->
	<div class="flex h-16 items-center border-b px-6">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
					/>
				</svg>
			</div>
			<div>
				<h1 class="text-lg font-semibold">Clinic CRM</h1>
			</div>
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-1 overflow-y-auto p-4">
		{#each navItems as item}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
					isActive(item.href)
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				)}
			>
				<Icon class="h-5 w-5" />
				<span>{$t(item.label)}</span>
			</a>
		{/each}
	</nav>
</aside>
