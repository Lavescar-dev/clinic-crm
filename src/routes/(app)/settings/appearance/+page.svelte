<script lang="ts">
	import { t } from '$i18n';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import FormField from '$components/shared/FormField.svelte';
	import { toast } from 'svelte-sonner';
	import { appConfigStore } from '$stores/settings';
	import { theme } from '$stores/theme';
	import { DEFAULT_THEME, THEMES } from '$lib/config/app';
	import { get } from 'svelte/store';

	let currentTheme = get(theme); // Get initial theme from theme
	let primaryColor = get(appConfigStore).primaryColor;
	let accentColor = get(appConfigStore).accentColor;

	const availableThemes = THEMES.map((th) => ({ value: th, label: $t(`settings.appearance.theme.${th}`) }));

	function handleSave() {
		appConfigStore.update((config) => ({
			...config,
			theme: currentTheme,
			primaryColor: primaryColor,
			accentColor: accentColor
		}));
		theme.set(currentTheme); // Update the theme to apply theme immediately
		toast.success($t('settings.appearance.updateSuccess'));
	}

	// Dynamic CSS variable updates for colors (example)
	// In a real app, you might apply these more directly via Tailwind config or a dedicated theme service
	$: if (primaryColor) {
		document.documentElement.style.setProperty('--color-primary', primaryColor);
	}
	$: if (accentColor) {
		document.documentElement.style.setProperty('--color-accent', accentColor);
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('settings.appearance.title')}</h1>
	<p class="text-muted-foreground">{$t('settings.appearance.description')}</p>

	<form on:submit|preventDefault={handleSave} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{$t('settings.appearance.themeSettings')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4 md:grid-cols-2">
				<FormField label={$t('settings.appearance.theme')}>
					<Select bind:value={currentTheme}>
						<SelectTrigger class="w-full">
							<SelectValue placeholder={$t('settings.appearance.selectTheme')} />
						</SelectTrigger>
						<SelectContent>
							{#each availableThemes as themeOption}
								<SelectItem value={themeOption.value}>{themeOption.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</FormField>
				<!--
				<FormField label={$t('settings.appearance.primaryColor')}>
					<Input type="color" bind:value={primaryColor} />
				</FormField>
				<FormField label={$t('settings.appearance.accentColor')}>
					<Input type="color" bind:value={accentColor} />
				</FormField>
				-->
			</CardContent>
		</Card>

		<div class="flex justify-end">
			<Button type="submit">{$t('common.saveChanges')}</Button>
		</div>
	</form>
</div>
