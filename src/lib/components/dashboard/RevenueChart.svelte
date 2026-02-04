<script lang="ts">
	import { Chart } from 'svelte-chartjs';
	import { get } from 'svelte/store';
	import { theme } from '$stores/theme'; // Corrected import
	import { t } from '$i18n';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		type ChartData,
		Filler // Import Filler plugin for area charts
	} from 'chart.js';

	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Filler); // Register Filler

	export let data: ChartData<'bar'>;

	$: isDarkMode = get(theme).isDarkMode; // Reactive dark mode status

	$: options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top' as const,
				labels: {
					color: isDarkMode ? 'white' : 'black'
				}
			},
			title: {
				display: false,
				text: $t('dashboard.charts.revenueTitle'),
				color: isDarkMode ? 'white' : 'black'
			}
		},
		scales: {
			x: {
				ticks: {
					color: isDarkMode ? 'white' : 'black'
				},
				grid: {
					color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
				}
			},
			y: {
				ticks: {
					color: isDarkMode ? 'white' : 'black'
				},
				grid: {
					color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
				}
			}
		}
	};

	// Reactive update for chart data
	$: chartData = {
		labels: data.labels,
		datasets: data.datasets.map((dataset) => ({
			...dataset,
			borderColor: isDarkMode ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 1)',
			backgroundColor: isDarkMode ? 'rgba(153, 102, 255, 0.3)' : 'rgba(153, 102, 255, 0.6)'
		}))
	};
</script>

<div class="h-64">
	<Chart type="bar" data={chartData} {options} />
</div>
