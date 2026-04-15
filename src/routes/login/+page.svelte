<script lang="ts">
	import { goto } from '$app/navigation';
	import { language } from '$lib/i18n';
	import { DEMO_CREDENTIALS } from '$lib/data/users';
	import { auth, isAuthLoading, theme } from '$lib/stores';
	import { CheckCircle2, Globe, LogIn, Moon, ShieldCheck, Stethoscope, Sun, UserRoundCog } from 'lucide-svelte';

	type DemoProfileKey = 'admin' | 'doctor' | 'nurse';

	type LoginCopy = {
		pageTitle: string;
		title: string;
		subtitle: string;
		roleLabel: string;
		email: string;
		password: string;
		submit: string;
		loading: string;
		helper: string;
		footer: string;
		demoNote: string;
		selectedRole: string;
		roleDescriptions: Record<DemoProfileKey, string>;
	};

	const copy: Record<'tr' | 'en', LoginCopy> = {
		tr: {
			pageTitle: 'MedFlow • Demo Girişi',
			title: 'Demo Girişi',
			subtitle: 'Klinik operasyon çalışma alanı',
			roleLabel: 'Rolünüzü seçin',
			email: 'E-POSTA',
			password: 'ŞİFRE',
			submit: 'GİRİŞ YAP',
			loading: 'Giriş yapılıyor',
			helper: 'Bu alan tamamen yerel bir demo ortamıdır. Hiçbir gerçek klinik verisi kullanılmamaktadır.',
			footer: '2026 MedFlow Klinik Operasyon Demosu',
			demoNote: 'Güvenli • Yerel • Risksiz Test',
			selectedRole: 'rolü seçildi',
			roleDescriptions: {
				admin: 'Tüm modüller, raporlar ve denetim',
				doctor: 'Hasta akışı ve klinik kayıtlar',
				nurse: 'Vardiya ve bakım takibi'
			}
		},
		en: {
			pageTitle: 'MedFlow • Demo Sign In',
			title: 'Demo Access',
			subtitle: 'Clinical operations workspace',
			roleLabel: 'Choose your role',
			email: 'EMAIL',
			password: 'PASSWORD',
			submit: 'SIGN IN',
			loading: 'Signing in',
			helper: 'This is a fully local demo workspace. No real clinical data is used here.',
			footer: '2026 MedFlow Clinical Operations Demo',
			demoNote: 'Safe • Local • Risk-Free Testing',
			selectedRole: 'role selected',
			roleDescriptions: {
				admin: 'All modules, reports, and oversight',
				doctor: 'Patient flow and clinical records',
				nurse: 'Shift operations and care tracking'
			}
		}
	};

	function credentialsFor(profile: DemoProfileKey) {
		switch (profile) {
			case 'admin':
				return DEMO_CREDENTIALS.admin;
			case 'doctor':
				return DEMO_CREDENTIALS.doctor;
			case 'nurse':
				return DEMO_CREDENTIALS.nurse;
		}
	}

	type DemoProfile = {
		key: DemoProfileKey;
		label: string;
		emoji: string;
		icon: typeof ShieldCheck;
		description: string;
		email: string;
		password: string;
	};

	function buildProfiles(currentLanguage: 'tr' | 'en'): DemoProfile[] {
		return [
			{
				key: 'admin',
				label: currentLanguage === 'tr' ? 'Yönetici' : 'Administrator',
				emoji: '👔',
				icon: UserRoundCog,
				description: copy[currentLanguage].roleDescriptions.admin,
				...credentialsFor('admin')
			},
			{
				key: 'doctor',
				label: currentLanguage === 'tr' ? 'Doktor' : 'Doctor',
				emoji: '🩺',
				icon: Stethoscope,
				description: copy[currentLanguage].roleDescriptions.doctor,
				...credentialsFor('doctor')
			},
			{
				key: 'nurse',
				label: currentLanguage === 'tr' ? 'Hemşire' : 'Nurse',
				emoji: '👩‍⚕️',
				icon: ShieldCheck,
				description: copy[currentLanguage].roleDescriptions.nurse,
				...credentialsFor('nurse')
			}
		];
	}

	let currentLanguage = $derived($language);
	let text = $derived(copy[currentLanguage]);
	let demoProfiles = $derived(buildProfiles(currentLanguage));
	let email = $state(DEMO_CREDENTIALS.admin.email);
	let password = $state(DEMO_CREDENTIALS.admin.password);
	let error = $state('');
	let loading = $state(false);
	let selectedProfile = $state<DemoProfileKey>('admin');
	let selectedRoleNotice = $state('');

	let isBusy = $derived(loading || $isAuthLoading);

	async function loginWith(nextEmail: string, nextPassword: string) {
		error = '';
		loading = true;

		const result = await auth.login(nextEmail, nextPassword);

		if (result.success) {
			goto('/dashboard');
			return;
		}

		error = result.error || 'Login failed';
		loading = false;
	}

	async function handleLogin(event: Event) {
		event.preventDefault();
		await loginWith(email, password);
	}

	function selectRole(profile: DemoProfile) {
		selectedProfile = profile.key;
		email = profile.email;
		password = profile.password;
		error = '';
		selectedRoleNotice = `${profile.label} ${text.selectedRole}`;

		window.setTimeout(() => {
			if (selectedRoleNotice === `${profile.label} ${text.selectedRole}`) {
				selectedRoleNotice = '';
			}
		}, 2400);
	}

	function toggleTheme() {
		theme.toggleTheme();
	}

	function toggleLanguage() {
		language.toggle();
	}
</script>

<svelte:head>
	<title>{text.pageTitle}</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-900 md:px-6">
	<div class="mx-auto flex max-w-6xl justify-end gap-3 pb-4">
		<button
			type="button"
			class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90 transition hover:border-white/20 hover:bg-white/10"
			onclick={toggleLanguage}
			aria-label="Toggle language"
		>
			<Globe class="h-5 w-5" />
		</button>
		<button
			type="button"
			class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90 transition hover:border-white/20 hover:bg-white/10"
			onclick={toggleTheme}
			aria-label="Toggle theme"
		>
			{#if $theme.effectiveTheme === 'dark'}
				<Sun class="h-5 w-5" />
			{:else}
				<Moon class="h-5 w-5" />
			{/if}
		</button>
	</div>

	<div class="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_120px_-28px_rgba(0,0,0,0.65)] lg:grid-cols-12">
		<section class="login-bg relative flex flex-col p-8 text-white md:p-12 lg:col-span-5">
			<div class="mb-14 flex items-center gap-x-4">
				<img
					src="/brand/medflow-lockup.svg"
					alt="MedFlow"
					class="h-16 w-auto"
					loading="eager"
					decoding="async"
				/>
			</div>

			<div class="flex-1">
				<h1 class="text-4xl font-semibold leading-none tracking-[-0.06em] md:text-5xl">{text.title}</h1>
				<p class="mt-3 text-xl text-teal-100 md:text-2xl">{text.subtitle}</p>

				<div class="mt-12">
					<p class="mb-6 text-sm font-medium uppercase tracking-[0.32em] text-teal-200">{text.roleLabel}</p>

					<div class="space-y-4">
						{#each demoProfiles as profile}
							{@const ProfileIcon = profile.icon}
							<button
								type="button"
								class:selected={selectedProfile === profile.key}
								class="role-card group flex w-full cursor-pointer items-center gap-5 rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl transition hover:bg-white/20"
								onclick={() => selectRole(profile)}
							>
								<div class="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/10 text-4xl shadow-inner shadow-black/10">
									<span aria-hidden="true">{profile.emoji}</span>
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-3">
										<div class="text-2xl font-semibold tracking-[-0.03em]">{profile.label}</div>
										{#if selectedProfile === profile.key}
											<span class="inline-flex items-center justify-center rounded-full bg-white/18 p-1 text-teal-100">
												<CheckCircle2 class="h-4 w-4" />
											</span>
										{/if}
									</div>
									<div class="mt-1 text-sm text-teal-100">{profile.description}</div>
									<div class="mt-3 font-mono text-xs text-teal-200">{profile.email}</div>
								</div>
								<div class="hidden rounded-2xl bg-white/10 p-3 text-white/90 md:flex">
									<ProfileIcon class="h-5 w-5" />
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-10 text-xs text-teal-200/80">
				{text.footer}<br />
				<span class="font-medium">{text.demoNote}</span>
			</div>
		</section>

		<section class="flex items-center p-8 md:p-12 lg:col-span-7">
			<div class="mx-auto w-full max-w-md">
				<div class="mb-10 text-center">
					<h2 class="text-4xl font-semibold tracking-[-0.05em] text-zinc-900">Giriş Yap</h2>
					<p class="mt-3 text-zinc-500">Seçtiğiniz rolle demo ortamına erişin</p>
				</div>

				{#if error}
					<div class="mb-6 rounded-[1.6rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
						{error}
					</div>
				{/if}

				<form onsubmit={handleLogin} class="space-y-8">
					<div>
						<label for="email" class="mb-2 block text-xs font-medium tracking-[0.32em] text-zinc-500">{text.email}</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							disabled={isBusy}
							class="form-input w-full rounded-[1.8rem] border border-zinc-200 bg-white px-7 py-6 text-lg text-zinc-900 outline-none"
						/>
					</div>

					<div>
						<label for="password" class="mb-2 block text-xs font-medium tracking-[0.32em] text-zinc-500">{text.password}</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							disabled={isBusy}
							class="form-input w-full rounded-[1.8rem] border border-zinc-200 bg-white px-7 py-6 text-lg text-zinc-900 outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={isBusy}
						class="inline-flex w-full items-center justify-center gap-x-3 rounded-[1.8rem] bg-teal-700 px-7 py-6 text-xl font-semibold text-white shadow-xl shadow-teal-900/30 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-75"
					>
						{#if isBusy}
							<span class="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
							{text.loading}
						{:else}
							<LogIn class="h-6 w-6" />
							{text.submit}
						{/if}
					</button>
				</form>

				<div class="mt-12 text-center text-xs leading-6 text-zinc-400">
					{text.helper}
				</div>
			</div>
		</section>
	</div>

	{#if selectedRoleNotice}
		<div class="fixed bottom-8 right-8 z-50 flex items-center gap-x-3 rounded-[1.6rem] bg-teal-700 px-6 py-4 text-sm font-medium text-white shadow-2xl shadow-teal-900/35">
			<CheckCircle2 class="h-5 w-5" />
			<span>{selectedRoleNotice}</span>
		</div>
	{/if}
</div>

<style>
	.login-bg {
		background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%);
	}

	.role-card {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.role-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 25px -5px rgb(15 118 110 / 0.2);
	}

	.role-card.selected {
		background: rgba(255, 255, 255, 0.18);
		border-color: rgba(255, 255, 255, 0.24);
		box-shadow: 0 24px 40px -18px rgba(8, 47, 73, 0.42);
	}

	.form-input {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-input:focus {
		border-color: #0f766e;
		box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.15);
	}
</style>
