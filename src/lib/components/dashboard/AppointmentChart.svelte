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
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		type ChartData,
		Filler // Import Filler plugin for area charts
	} from 'chart.js';

	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler); // Register Filler

	export let data: ChartData<'line'>;

	$: isDarkMode = get(theme).isDarkMode; // Reactive dark mode status

	$: options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top' as const,
				labels: {
					color: isDarkMode ? 'white' : 'black' // Dynamic text color
				}
			},
			title: {
				display: false,
				text: $t('dashboard.charts.appointmentsTitle'),
				color: isDarkMode ? 'white' : 'black'
			}
		},
		scales: {
			x: {
				ticks: {
					color: isDarkMode ? 'white' : 'black' // Dynamic axis label color
				},
				grid: {
					color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' // Dynamic grid line color
				}
			},
			y: {
				ticks: {
					color: isDarkMode ? 'white' : 'black' // Dynamic axis label color
				},
				grid: {
					color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' // Dynamic grid line color
				}
			}
		}
	};

	// Reactive update for chart data
	$: chartData = {
		labels: data.labels,
		datasets: data.datasets.map((dataset) => ({
			...dataset,
			borderColor: isDarkMode ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 1)',
			backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.3)' : 'rgba(75, 192, 192, 0.6)',
			fill: true // Enable filling for area chart effect
		}))
	};
</script>

<div class="h-64">
	<Chart type="line" data={chartData} {options} />
</div>
