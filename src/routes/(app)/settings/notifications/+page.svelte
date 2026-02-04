<script lang="ts">
	import { t } from '$i18n';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Switch } from '$components/ui/switch';
	import { Label } from '$components/ui/label';
	import { Button } from '$components/ui/button';
	import { appConfigStore } from '$stores/settings';
	import { toast } from 'svelte-sonner';

	let emailNotifications = $appConfigStore.emailNotifications;
	let smsNotifications = $appConfigStore.smsNotifications;
	let appointmentReminders = $appConfigStore.appointmentReminders;
	let systemNotifications = $appConfigStore.systemNotifications;

	function handleSave() {
		appConfigStore.update((config) => ({
			...config,
			emailNotifications,
			smsNotifications,
			appointmentReminders,
			systemNotifications
		}));
		toast.success($t('settings.notifications.updateSuccess'));
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('settings.notifications.title')}</h1>
	<p class="text-muted-foreground">{$t('settings.notifications.description')}</p>

	<form on:submit|preventDefault={handleSave} class="space-y-6">
		<Card>
			<CardHeader><CardTitle>{$t('settings.notifications.contactPreferences')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4">
				<div class="flex items-center justify-between">
					<Label for="email-notifications">{$t('settings.notifications.emailNotifications')}</Label>
					<Switch id="email-notifications" bind:checked={emailNotifications} />
				</div>
				<div class="flex items-center justify-between">
					<Label for="sms-notifications">{$t('settings.notifications.smsNotifications')}</Label>
					<Switch id="sms-notifications" bind:checked={smsNotifications} />
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('settings.notifications.notificationTypes')}</CardTitle></CardHeader>
			<CardContent class="grid gap-4">
				<div class="flex items-center justify-between">
					<Label for="appointment-reminders">{$t('settings.notifications.appointmentReminders')}</Label>
					<Switch id="appointment-reminders" bind:checked={appointmentReminders} />
				</div>
				<div class="flex items-center justify-between">
					<Label for="system-notifications">{$t('settings.notifications.systemNotifications')}</Label>
					<Switch id="system-notifications" bind:checked={systemNotifications} />
				</div>
			</CardContent>
		</Card>

		<div class="flex justify-end">
			<Button type="submit">{$t('common.saveChanges')}</Button>
		</div>
	</form>
</div>
