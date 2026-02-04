<script lang="ts">
	import { t } from '$i18n';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { LineChart, PieChart, Users, CalendarCheck, FileText, Download } from 'lucide-svelte';

	interface ReportCard {
		title: string;
		description: string;
		icon: any; // Lucide icon component
		href: string;
	}

	const reportCards: ReportCard[] = [
		{
			title: $t('reports.financial.title'),
			description: $t('reports.financial.description'),
			icon: LineChart,
			href: '/reports/financial'
		},
		{
			title: $t('reports.patientStats.title'),
			description: $t('reports.patientStats.description'),
			icon: Users,
			href: '/reports/patient-statistics'
		},
		{
			title: $t('reports.appointmentAnalysis.title'),
			description: $t('reports.appointmentAnalysis.description'),
			icon: CalendarCheck,
			href: '/reports/appointments'
		}
	];
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('reports.title')}</h1>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each reportCards as card}
			<Card class="flex flex-col">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-lg font-medium">{card.title}</CardTitle>
					<svelte:component this={card.icon} class="h-5 w-5 text-muted-foreground" />
				</CardHeader>
				<CardContent class="flex-grow">
					<p class="text-sm text-muted-foreground">{card.description}</p>
				</CardContent>
				<CardFooter>
					<Button variant="outline" class="w-full" on:click={() => goto(card.href)}>
						{$t('reports.viewReport')}
					</Button>
				</CardFooter>
			</Card>
		{/each}
	</div>
</div>