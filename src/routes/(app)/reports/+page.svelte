<script lang="ts">
	// @ts-nocheck
	import { t, language } from '$i18n';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { LineChart, Users, CalendarCheck } from 'lucide-svelte';
	import { get } from 'svelte/store';

	interface ReportCard {
		title: string;
		description: string;
		icon: any; // Lucide icon component
		href: string;
	}

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	const reportCards: ReportCard[] = [
		{
			title: translate('reports.financial.title', 'Finansal Raporlar', 'Financial reports'),
			description: translate(
				'reports.financial.description',
				'Tahsilat, vade ve gelir hareketlerini finans bakışıyla inceleyin.',
				'Review collections, due dates, and revenue flow with finance context.'
			),
			icon: LineChart,
			href: '/reports/financial'
		},
		{
			title: translate('reports.patientStats.title', 'Hasta İstatistikleri', 'Patient statistics'),
			description: translate(
				'reports.patientStats.description',
				'Hasta tabanını, demografiyi ve bakım yoğunluğunu daha net okuyun.',
				'Read the patient base, demographics, and care density more clearly.'
			),
			icon: Users,
			href: '/reports/patient-statistics'
		},
		{
			title: translate('reports.appointmentAnalysis.title', 'Randevu Analizi', 'Appointment analysis'),
			description: translate(
				'reports.appointmentAnalysis.description',
				'Randevu hacmini, doluluk oranını ve iptal eğilimlerini izleyin.',
				'Track appointment volume, occupancy, and cancellation trends.'
			),
			icon: CalendarCheck,
			href: '/reports/appointments'
		}
	];
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="mf-page-header space-y-2">
			<p class="mf-kicker text-[0.72rem] font-semibold">İçgörüler</p>
		<h1 class="mf-page-title">{translate('reports.title', 'Raporlar', 'Reports')}</h1>
		<p class="mf-page-description">
			{translate(
				'reports.description',
				'Finans, hasta yoğunluğu ve randevu performansını yönetim bakışıyla okuyun.',
				'Read finance, patient load, and appointment performance with leadership context.'
			)}
		</p>
	</div>

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
						{translate('reports.viewReport', 'Raporu Görüntüle', 'View report')}
					</Button>
				</CardFooter>
			</Card>
		{/each}
	</div>
</div>
