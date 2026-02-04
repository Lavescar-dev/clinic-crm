<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$components/ui/avatar';
	import { Separator } from '$components/ui/separator';
	import { formatRelativeDate } from '$utils/date';

	export interface Activity {
		id: string;
		type: 'appointment' | 'patient' | 'billing' | 'emr' | 'inventory';
		description: string;
		timestamp: Date;
	}

	export let activities: Activity[] = [];
</script>

<div class="space-y-4">
	{#each activities as activity (activity.id)}
		<div class="flex items-center space-x-4">
			<Avatar class="h-9 w-9">
				<!-- Placeholder for activity icon/image based on type -->
				{#if activity.type === 'appointment'}
					<AvatarFallback>RA</AvatarFallback>
				{:else if activity.type === 'patient'}
					<AvatarFallback>NP</AvatarFallback>
				{:else if activity.type === 'billing'}
					<AvatarFallback>PI</AvatarFallback>
				{:else}
					<AvatarFallback>AC</AvatarFallback>
				{/if}
			</Avatar>
			<div class="flex-1 space-y-1">
				<p class="text-sm font-medium leading-none">{activity.description}</p>
				<p class="text-sm text-muted-foreground">{formatRelativeDate(activity.timestamp)}</p>
			</div>
		</div>
		<Separator class="last:hidden" />
	{/each}
	{#if activities.length === 0}
		<p class="text-center text-muted-foreground">Henüz bir aktivite yok.</p>
	{/if}
</div>
