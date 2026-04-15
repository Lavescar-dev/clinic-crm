<script lang="ts">
	import { goto } from '$app/navigation';
	import { Badge } from '$components/ui/badge';
	import { formatRelativeDate } from '$utils/date';
	import {
		BellRing,
		CalendarClock,
		CreditCard,
		FileText,
		Package2
	} from 'lucide-svelte';

	interface Activity {
		id: string;
		type: 'appointment' | 'patient' | 'billing' | 'emr' | 'inventory';
		description: string;
		timestamp: Date;
	}

	export let activities: Activity[] = [];

	const activityMeta = {
		appointment: {
			label: 'Randevu',
			icon: CalendarClock,
			iconClass: 'bg-cyan-100 text-cyan-700'
		},
		patient: {
			label: 'Hasta',
			icon: BellRing,
			iconClass: 'bg-emerald-100 text-emerald-700'
		},
		billing: {
			label: 'Finans',
			icon: CreditCard,
			iconClass: 'bg-amber-100 text-amber-700'
		},
		emr: {
			label: 'Kayit',
			icon: FileText,
			iconClass: 'bg-violet-100 text-violet-700'
		},
		inventory: {
			label: 'Stok',
			icon: Package2,
			iconClass: 'bg-rose-100 text-rose-700'
		}
	} as const;

	function activityHref(type: Activity['type']) {
		switch (type) {
			case 'appointment':
				return '/appointments';
			case 'billing':
				return '/billing';
			case 'inventory':
				return '/inventory';
			case 'emr':
				return '/emr';
			default:
				return '/patients';
		}
	}
</script>

<div class="space-y-3">
	{#if activities.length === 0}
		<div class="mf-soft-card rounded-[1.4rem] border-dashed p-6 text-center text-sm text-[color:var(--mf-ink-soft)]">
			Henuz izlenecek yeni aktivite yok.
		</div>
	{:else}
		{#each activities as activity (activity.id)}
			{@const meta = activityMeta[activity.type] ?? activityMeta.patient}
			{@const ActivityIcon = meta.icon}

			<button
				type="button"
				class="mf-soft-card mf-interactive-row w-full rounded-[1.4rem] p-4 text-left"
				onclick={() => goto(activityHref(activity.type))}
			>
				<div class="flex items-start gap-4">
					<div class={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.iconClass}`}>
						<svelte:component this={ActivityIcon} class="h-5 w-5" />
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<Badge variant="secondary">{meta.label}</Badge>
							<span class="mf-kicker text-xs font-medium">
								{formatRelativeDate(activity.timestamp)}
							</span>
						</div>
						<p class="mt-3 text-sm leading-6 text-[color:var(--mf-ink)]">{activity.description}</p>
					</div>
				</div>
			</button>
		{/each}
	{/if}
</div>
