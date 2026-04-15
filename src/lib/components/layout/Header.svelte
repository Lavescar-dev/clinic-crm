<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, currentUser, unreadCount as unreadCountStore, staffRole } from '$lib/stores';
	import { appointments as appointmentStore } from '$stores/appointments';
	import Button from '$lib/components/ui/button.svelte';
	import { Bell, ChevronDown, LogOut, Menu, Plus, Search, Settings2, UserPlus } from 'lucide-svelte';

	interface HeaderProps {
		onMenuClick?: () => void;
	}

	let { onMenuClick }: HeaderProps = $props();

	let showUserMenu = $state(false);
	let searchValue = $state('');

	let unreadCountVal = $derived($unreadCountStore);
	let userName = $derived($currentUser?.fullName ?? 'Aylin Aydin');
	let userEmail = $derived($currentUser?.email ?? 'aylin171@yandex.com');
	let userInitials = $derived.by(() =>
		userName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('') || 'AA'
	);
	let todayAppointments = $derived.by(() => {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		return $appointmentStore.data.filter((appointment) => {
			const appointmentDate = new Date(appointment.date).getTime();
			return appointmentDate >= start.getTime() && appointmentDate < end.getTime();
		}).length;
	});
	let todayLabel = $derived.by(() => {
		const parts = new Intl.DateTimeFormat('tr-TR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			weekday: 'long'
		}).formatToParts(new Date());

		const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
		const weekday = values.weekday
			? values.weekday.charAt(0).toUpperCase() + values.weekday.slice(1)
			: '';

		return `${values.day} ${values.month} ${values.year} • ${weekday}`;
	});

	function roleLabel(role: string | null | undefined) {
		const labels: Record<string, string> = {
			Admin: 'Yönetici',
			Doctor: 'Doktor',
			Nurse: 'Hemşire',
			Receptionist: 'Resepsiyon',
			LabTechnician: 'Laboratuvar',
			Pharmacist: 'Eczane'
		};

		return role ? (labels[role] ?? role) : 'Yönetici';
	}

	function handleLogout() {
		auth.logout();
		goto('/login');
	}
</script>

<header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.24)] backdrop-blur-xl">
	<div class="flex items-center gap-3 px-4 py-3 lg:px-6 xl:px-8">
		<Button
			variant="ghost"
			size="icon"
			class="shrink-0 rounded-xl text-slate-600 lg:hidden"
			onclick={onMenuClick}
		>
			<Menu class="h-5 w-5" />
		</Button>

		<div class="hidden shrink-0 text-sm font-medium text-slate-600 md:block">
			{todayLabel}
		</div>

		<div class="hidden min-w-0 flex-1 justify-center md:flex">
			<label class="relative w-full max-w-[18rem] lg:max-w-[20rem] xl:max-w-[18.5rem]">
				<Search class="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
				<input
					bind:value={searchValue}
					type="text"
					placeholder="Hasta adı, TC No veya randevu"
					class="h-11 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 focus:border-blue-700 focus:shadow-[0_0_0_3px_rgba(30,64,175,0.12)]"
				/>
			</label>
		</div>

		<div class="ml-auto flex items-center gap-2.5 lg:gap-4">
			<div class="hidden items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-slate-700 lg:flex">
				<div class="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
				<span>
					Stabil • Bugün <span class="font-semibold text-emerald-700">{todayAppointments}</span> randevu
				</span>
			</div>

			<button
				type="button"
				class="relative rounded-xl p-2 text-slate-600 transition-transform duration-200 hover:scale-105 hover:text-slate-800"
				onclick={() => goto('/notifications')}
				aria-label="Bildirimler"
			>
				<Bell class="h-5.5 w-5.5" />
				{#if unreadCountVal > 0}
					<span class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
						{unreadCountVal > 99 ? '99+' : unreadCountVal}
					</span>
				{/if}
			</button>

			<button
				type="button"
				class="inline-flex h-10 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-medium text-white shadow-[0_14px_28px_-18px_rgba(37,99,235,0.65)] transition-all duration-200 hover:bg-blue-700"
				onclick={() => goto('/appointments/new')}
			>
				<Plus class="h-4 w-4" />
				<span class="hidden sm:inline">Yeni Randevu</span>
			</button>

			<button
				type="button"
				class="hidden h-10 items-center gap-2 rounded-2xl bg-slate-700 px-4 text-sm font-medium text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.4)] transition-all duration-200 hover:bg-slate-800 md:inline-flex"
				onclick={() => goto('/patients/new')}
			>
				<UserPlus class="h-4 w-4" />
				<span>Yeni Hasta</span>
			</button>

			<div class="relative border-l border-slate-200 pl-2.5 sm:pl-4" data-user-menu>
				<button
					type="button"
					class="flex items-center gap-3 rounded-2xl px-1 py-1 text-left transition-colors duration-200 hover:bg-slate-50"
					onclick={() => (showUserMenu = !showUserMenu)}
				>
					<div class="hidden text-right sm:block">
						<p class="text-sm font-semibold text-slate-800">{userName}</p>
						<p class="text-xs text-slate-500">{roleLabel($staffRole)}</p>
					</div>
					<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_100%)] text-sm font-bold text-white shadow-[0_16px_28px_-20px_rgba(37,99,235,0.62)]">
						{userInitials}
					</div>
					<ChevronDown class="hidden h-4 w-4 text-slate-400 sm:block" />
				</button>

				{#if showUserMenu}
					<div class="absolute right-0 top-full z-50 mt-3 w-64 rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.34)]">
						<div class="rounded-[1rem] bg-slate-50 px-4 py-3">
							<p class="text-sm font-semibold text-slate-800">{userName}</p>
							<p class="mt-1 text-xs text-slate-500">{userEmail}</p>
							<p class="mt-2 text-xs font-medium text-slate-600">{roleLabel($staffRole)}</p>
						</div>

						<button
							type="button"
							class="mt-2 flex w-full items-center gap-2 rounded-[0.95rem] px-3 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
							onclick={() => {
								goto('/settings');
								showUserMenu = false;
							}}
						>
							<Settings2 class="h-4 w-4" />
							<span>Ayarlar</span>
						</button>

						<button
							type="button"
							class="mt-1 flex w-full items-center gap-2 rounded-[0.95rem] px-3 py-3 text-sm font-medium text-rose-700 transition-colors duration-200 hover:bg-rose-50"
							onclick={handleLogout}
						>
							<LogOut class="h-4 w-4" />
							<span>Çıkış Yap</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

<svelte:window
	onclick={(event) => {
		if (showUserMenu && !(event.target as HTMLElement).closest('[data-user-menu]')) {
			showUserMenu = false;
		}
	}}
/>
