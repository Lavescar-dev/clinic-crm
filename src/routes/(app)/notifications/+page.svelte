<script lang="ts">
	import { t } from '$i18n';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { notifications as notificationStore } from '$stores/notifications';
	import { Button } from '$components/ui/button';
	import { BellRing, MailOpen, Mail } from 'lucide-svelte';
	import { formatDateDistance } from '$utils/date';
	import { cn } from '$utils/cn';
	import type { Notification } from '$types';

	let activeTab: 'all' | 'unread' = 'all';

	$: filteredNotifications = $notificationStore.data.filter((n) => {
		if (activeTab === 'unread') {
			return !n.read;
		}
		return true;
	});

	function markAsRead(notificationId: string) {
		notificationStore.markAsRead(notificationId);
		// To trigger reactivity in filteredNotifications, we might need a small delay or explicit store update
		// In a real scenario, the store's update function would handle this reactivity.
	}

	function markAllAsRead() {
		notificationStore.markAllAsRead();
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('notifications.title')}</h1>
		<Button variant="outline" on:click={markAllAsRead}>{$t('notifications.markAllAsRead')}</Button>
	</div>

	<Tabs bind:value={activeTab} class="space-y-4">
		<TabsList>
			<TabsTrigger value="all">{$t('notifications.all')}</TabsTrigger>
			<TabsTrigger value="unread">{$t('notifications.unread')} ({$notificationStore.unreadCount})</TabsTrigger>
		</TabsList>

		<TabsContent value="all">
			<Card>
				<CardHeader><CardTitle>{$t('notifications.allNotifications')}</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					{#if filteredNotifications.length > 0}
						{#each filteredNotifications as notification (notification.id)}
							<div
								class={cn(
									'flex items-center p-4 border rounded-md relative',
									{ 'bg-accent/20': !notification.read }
								)}
							>
								<div class="flex-1">
									<p class="font-medium">{notification.title}</p>
									<p class="text-sm text-muted-foreground">{notification.message}</p>
									<p class="text-xs text-muted-foreground mt-1">
										{formatDateDistance(notification.createdAt, new Date())} {$t('notifications.ago')}
									</p>
								</div>
								{#if !notification.read}
									<Button variant="ghost" size="sm" on:click={() => markAsRead(notification.id)}>
										<MailOpen class="h-4 w-4 mr-2" /> {$t('notifications.markAsRead')}
									</Button>
								{:else}
									<Mail class="h-4 w-4 text-muted-foreground" />
								{/if}
							</div>
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('notifications.noNotifications')}</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="unread">
			<Card>
				<CardHeader><CardTitle>{$t('notifications.unreadNotifications')}</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					{#if filteredNotifications.length > 0}
						{#each filteredNotifications as notification (notification.id)}
							<div
								class={cn(
									'flex items-center p-4 border rounded-md relative',
									{ 'bg-accent/20': !notification.read }
								)}
							>
								<div class="flex-1">
									<p class="font-medium">{notification.title}</p>
									<p class="text-sm text-muted-foreground">{notification.message}</p>
									<p class="text-xs text-muted-foreground mt-1">
										{formatDateDistance(notification.createdAt, new Date())} {$t('notifications.ago')}
									</p>
								</div>
								{#if !notification.read}
									<Button variant="ghost" size="sm" on:click={() => markAsRead(notification.id)}>
										<MailOpen class="h-4 w-4 mr-2" /> {$t('notifications.markAsRead')}
									</Button>
								{/if}
							</div>
						{/each}
					{:else}
						<p class="text-center text-muted-foreground">{$t('notifications.noUnreadNotifications')}</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div>