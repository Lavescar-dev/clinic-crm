<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, isAuthLoading } from '$lib/stores';
	import { t, language } from '$lib/i18n';
	import { theme } from '$lib/stores';
	import Button from '$lib/components/ui/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { Globe, Moon, Sun } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const result = await auth.login(email, password);

		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || $t('auth.loginError');
			loading = false;
		}
	}

	function toggleTheme() {
		theme.toggleTheme();
	}

	function toggleLanguage() {
		language.toggle();
	}
</script>

<svelte:head>
	<title>{$t('auth.login')} - Clinic CRM</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
	<!-- Theme and Language toggles -->
	<div class="absolute right-4 top-4 flex items-center gap-2">
		<Button variant="ghost" size="icon" onclick={toggleLanguage}>
			<Globe class="h-5 w-5" />
		</Button>
		<Button variant="ghost" size="icon" onclick={toggleTheme}>
			{#if $theme.effectiveTheme === 'dark'}
				<Sun class="h-5 w-5" />
			{:else}
				<Moon class="h-5 w-5" />
			{/if}
		</Button>
	</div>

	<div class="w-full max-w-md">
		<!-- Logo and Title -->
		<div class="mb-8 text-center">
			<div class="mb-4 flex items-center justify-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-10 w-10"
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
			</div>
			<h1 class="text-3xl font-bold">Clinic CRM</h1>
			<p class="mt-2 text-muted-foreground">{$t('auth.loginToContinue')}</p>
		</div>

		<!-- Login Card -->
		<Card class="p-8">
			<div class="mb-6">
				<h2 class="text-2xl font-semibold">{$t('auth.welcomeBack')}</h2>
			</div>

			<form onsubmit={handleLogin} class="space-y-4">
				<!-- Email Field -->
				<div class="space-y-2">
					<Label for="email">{$t('auth.email')}</Label>
					<Input
						id="email"
						type="email"
						placeholder="ornek@email.com"
						bind:value={email}
						required
						disabled={loading}
					/>
				</div>

				<!-- Password Field -->
				<div class="space-y-2">
					<Label for="password">{$t('auth.password')}</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						required
						disabled={loading}
					/>
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}

				<!-- Submit Button -->
				<Button type="submit" class="w-full" disabled={loading || $isAuthLoading}>
					{#if loading || $isAuthLoading}
						<span class="flex items-center gap-2">
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							{$t('common.loading')}
						</span>
					{:else}
						{$t('auth.login')}
					{/if}
				</Button>
			</form>

			<!-- Demo Credentials -->
			<div class="mt-6 rounded-md border border-dashed border-muted-foreground/30 bg-muted/50 p-4">
				<p class="mb-2 text-xs font-semibold text-muted-foreground">Demo Credentials:</p>
				<div class="space-y-1 text-xs text-muted-foreground">
					<p>Admin: admin@clinic.com / admin123</p>
					<p>Doctor: dr.ayse.yilmaz@clinic.com / doctor123</p>
					<p>Nurse: nurse.mehmet@clinic.com / nurse123</p>
				</div>
			</div>
		</Card>

		<!-- Footer -->
		<div class="mt-8 text-center text-sm text-muted-foreground">
			<p>&copy; 2026 Clinic CRM. All rights reserved.</p>
		</div>
	</div>
</div>
