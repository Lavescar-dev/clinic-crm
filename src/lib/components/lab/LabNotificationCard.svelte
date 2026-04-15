<script lang="ts">
	import { Badge } from '$components/ui/badge';
	import { Button } from '$components/ui/button';
	import { Card, CardContent } from '$components/ui/card';
	import { AlertTriangle, FlaskConical, FileText, Mail, MailOpen } from 'lucide-svelte';
	import { formatDateDistance } from '$utils/date';
	import { cn } from '$utils/cn';
	import type { Notification } from '$lib/types/notification';

	interface Props {
		notification: Notification;
		onMarkAsRead?: (id: string) => void;
		onView?: (id: string) => void;
	}

	let { notification, onMarkAsRead, onView }: Props = $props();

	// Extract lab-specific data from notification
	const labData = $derived(notification.data || {});
	const hasCriticalResults = $derived(labData.hasCriticalResults || false);
	const hasAbnormalResults = $derived(labData.hasAbnormalResults || false);
	const testCount = $derived(labData.testCount || 0);
	const patientName = $derived(labData.patientName || 'Patient');
	const orderNumber = $derived(labData.orderNumber || '');

	// Determine priority badge color
	const priorityColor = $derived(
		notification.priority === 'urgent'
			? 'destructive'
			: notification.priority === 'high'
				? 'default'
				: 'secondary'
	);

	function handleMarkAsRead() {
		if (onMarkAsRead) {
			onMarkAsRead(notification.id);
		}
	}

	function handleView() {
		if (onView) {
			onView(notification.id);
		} else if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
	}
</script>

<Card
	class={cn('transition-colors hover:bg-accent/5', {
		'border-l-4 border-l-red-500': hasCriticalResults,
		'border-l-4 border-l-amber-500': hasAbnormalResults && !hasCriticalResults,
		'bg-accent/10': !notification.read
	})}
>
	<CardContent class="p-4">
		<div class="flex items-start gap-4">
			<!-- Icon Section -->
			<div
				class={cn('rounded-full p-2', {
					'bg-red-100 text-red-600': hasCriticalResults,
					'bg-amber-100 text-amber-600': hasAbnormalResults && !hasCriticalResults,
					'bg-blue-100 text-blue-600': !hasAbnormalResults
				})}
			>
				{#if hasCriticalResults}
					<AlertTriangle class="h-5 w-5" />
				{:else}
					<FlaskConical class="h-5 w-5" />
				{/if}
			</div>

			<!-- Content Section -->
			<div class="flex-1 space-y-2">
				<!-- Header -->
				<div class="flex items-start justify-between gap-2">
					<div class="space-y-1">
						<div class="flex items-center gap-2 flex-wrap">
							<h4 class="font-semibold text-sm">{notification.title}</h4>
							{#if hasCriticalResults}
								<Badge variant="destructive" class="text-xs">Critical</Badge>
							{:else if hasAbnormalResults}
								<Badge variant="default" class="text-xs bg-amber-500">Abnormal</Badge>
							{/if}
							<Badge variant={priorityColor} class="text-xs capitalize">
								{notification.priority}
							</Badge>
						</div>
						{#if orderNumber}
							<p class="text-xs text-muted-foreground font-mono">{orderNumber}</p>
						{/if}
					</div>

					<!-- Read/Unread Indicator -->
					{#if !notification.read}
						<button
							onclick={handleMarkAsRead}
							class="text-muted-foreground hover:text-foreground transition-colors"
							title="Mark as read"
						>
							<Mail class="h-4 w-4" />
						</button>
					{:else}
						<MailOpen class="h-4 w-4 text-muted-foreground" />
					{/if}
				</div>

				<!-- Message -->
				<p class="text-sm text-muted-foreground">{notification.message}</p>

				<!-- Lab Details -->
				{#if testCount > 0}
					<div class="flex items-center gap-4 text-xs text-muted-foreground">
						<span class="flex items-center gap-1">
							<FileText class="h-3 w-3" />
							{testCount} {testCount === 1 ? 'test' : 'tests'}
						</span>
						{#if patientName}
							<span>Patient: {patientName}</span>
						{/if}
					</div>
				{/if}

				<!-- Footer -->
				<div class="flex items-center justify-between pt-2">
					<span class="text-xs text-muted-foreground">
						{formatDateDistance(notification.createdAt, new Date())} ago
					</span>

					{#if notification.actionUrl}
						<Button variant="link" size="sm" onclick={handleView} class="h-auto p-0 text-xs">
							View Results →
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</CardContent>
</Card>
