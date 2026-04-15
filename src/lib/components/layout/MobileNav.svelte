<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import { cn } from '$lib/utils/cn';
	import {
		activeTreatmentPlans,
		appointmentStats,
		billingStats,
		currentUser,
		inventoryStats,
		patientStats,
		pendingReferrals,
		staffOnLeave,
		staffRole,
		unreadCount as unreadCountStore,
		userPermissions
	} from '$lib/stores';
	import { createNavInsights, filterNavSections, roleLabel } from './nav-config';
	import { X } from 'lucide-svelte';

	interface MobileNavProps {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = false, onClose }: MobileNavProps = $props();

	let currentPath = $derived($page.url.pathname);
	let visibleSections = $derived.by(() => filterNavSections($userPermissions));
	let navInsights = $derived.by(() =>
		createNavInsights({
			patientStats: $patientStats,
			appointmentStats: $appointmentStats,
			billingStats: $billingStats,
			inventoryStats: $inventoryStats,
			unreadCount: $unreadCountStore,
			activeTreatmentCount: $activeTreatmentPlans.length,
			pendingReferralCount: $pendingReferrals.length,
			staffOnLeaveCount: $staffOnLeave.length
		})
	);

	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return currentPath === '/dashboard';
		}

		return currentPath.startsWith(href);
	}

	function handleLinkClick() {
		onClose?.();
	}

	function initials(name: string | null | undefined) {
		if (!name) return 'MF';
		return name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}

	function badgeClasses(tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | undefined) {
		switch (tone) {
			case 'danger':
				return 'bg-rose-500 text-white';
			case 'warning':
				return 'bg-violet-500 text-white';
			case 'success':
				return 'bg-teal-500 text-white';
			case 'info':
				return 'bg-blue-500 text-white';
			default:
				return 'bg-slate-600 text-white';
		}
	}
</script>

{#if isOpen}
	<button
		class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
		onclick={onClose}
		aria-label="Close menu"
		type="button"
	></button>
{/if}

<aside
	class={cn(
		'medflow-mobile-nav fixed inset-y-0 left-0 z-50 flex w-[18rem] transform flex-col overflow-hidden border-r border-slate-700 bg-[#0f172a] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
		isOpen ? 'translate-x-0' : '-translate-x-full'
	)}
>
	<div class="border-b border-slate-700 px-6 pt-6 pb-4">
		<div class="flex items-start justify-between gap-3">
			<div class="flex items-center gap-3">
				<svg width="42" height="38" viewBox="0 0 460 155" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
					<path
						d="M25 99 L43 99 L50 68 L59 99 L72 99 L81 33 L91 99 L107 99 L115 74 L135 99 L185 99"
						stroke="#00c4b4"
						stroke-width="11"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<div>
					<div class="flex items-baseline gap-0.5">
						<span class="text-3xl font-black tracking-[-0.08em] text-white">Med</span>
						<span class="text-3xl font-black tracking-[-0.08em] text-teal-400">Flow</span>
					</div>
					<div class="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-teal-400">Clinic CRM</div>
				</div>
			</div>

			<button
				type="button"
				onclick={onClose}
				class="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
				aria-label="Menüyü kapat"
			>
				<X class="h-4 w-4" />
			</button>
		</div>

		<div class="mt-4 flex items-center justify-between text-xs">
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.12)]"></div>
				<span class="font-medium text-slate-200">Yerel Sandbox Aktif</span>
			</div>
			<span class="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
				Stabil
			</span>
		</div>
	</div>

	<nav class="flex-1 overflow-hidden px-3 py-4">
		{#each visibleSections as section}
			<div class="mb-5">
				<div class="mb-2 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
					{section.title}
				</div>

				<div class="space-y-1">
					{#each section.items as item}
						{@const Icon = item.icon}
						{@const insight = navInsights[item.id]}
						<a
							href={item.href}
							onclick={handleLinkClick}
							class={cn(
								'sidebar-link relative mx-1 flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-200',
								isActive(item.href)
									? 'active border-l-4 border-teal-400 bg-[#172033] text-white'
									: 'border-l-4 border-transparent text-slate-300 hover:bg-[#1e2937]'
							)}
						>
							<div class="flex items-center gap-3">
								<Icon class="h-[18px] w-[18px] shrink-0" />
								<span class="truncate text-[13px] font-medium">{$t(item.label)}</span>
							</div>

							{#if insight?.badge}
								<span class={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badgeClasses(insight.tone))}>
									{insight.badge}
								</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</nav>

	<div class="border-t border-slate-700 bg-[#0a1321] p-4">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 text-base font-bold text-white shadow-inner">
				{initials($currentUser?.fullName)}
			</div>
			<div class="flex-1">
				<div class="text-sm font-semibold text-white">{$currentUser?.fullName ?? 'Demo Kullanıcısı'}</div>
				<div class="text-xs text-teal-400">{roleLabel($staffRole)}</div>
			</div>
		</div>

		<div class="mt-4 rounded-2xl bg-slate-800/80 px-4 py-2.5 text-center text-[9px] font-medium leading-tight text-amber-300">
			Güvenli Demo Modu<br />
			<span class="font-medium text-slate-400">Örnek verilerle çalışıyorsunuz. Klinik kayıtlar etkilenmez.</span>
		</div>
	</div>
</aside>

<style>
	:global(.medflow-mobile-nav a) {
		color: inherit;
		text-decoration: none;
	}

	:global(.medflow-mobile-nav .sidebar-link:hover) {
		transform: translateX(6px);
	}

	:global(.medflow-mobile-nav .sidebar-link.active:hover) {
		transform: none;
	}
</style>
