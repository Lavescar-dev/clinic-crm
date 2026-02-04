<script lang="ts">
	import { t } from '$i18n';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Chart } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		ArcElement,
		type ChartData
	} from 'chart.js';
	import { get } from 'svelte/store';
	import { theme } from '$stores/theme'; // Corrected import
	import { appointments as appointmentStore } from '$stores/appointments';
	import { users as userStore } from '$stores/users';
	import type { AppointmentStatus } from '$types';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';

	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

	$: isDarkMode = get(theme).isDarkMode; // Reactive dark mode status

	$: appointmentAnalysisData = calculateAppointmentAnalysis($appointmentStore.data);

	function calculateAppointmentAnalysis(appointments: typeof $appointmentStore.data) {
		let appointmentCountsByMonth: Record<string, number> = {};
		let noShowCountsByMonth: Record<string, number> = {};
		let doctorPerformance: Record<string, { total: number; completed: number; cancelled: number; noShow: number }> = {};
		
		const doctors = $userStore.data.filter(u => u.role === 'doctor');

		appointments.forEach((appointment) => {
			const appointmentDate = new Date(appointment.date);
			const monthKey = format(appointmentDate, 'MMM yyyy', { locale: tr });

			appointmentCountsByMonth[monthKey] = (appointmentCountsByMonth[monthKey] || 0) + 1;

			if (appointment.status === 'no-show') {
				noShowCountsByMonth[monthKey] = (noShowCountsByMonth[monthKey] || 0) + 1;
			}

			if (!doctorPerformance[appointment.doctorId]) {
				const doctor = doctors.find(d => d.id === appointment.doctorId);
				doctorPerformance[appointment.doctorId] = {
					total: 0,
					completed: 0,
					cancelled: 0,
					noShow: 0,
					name: doctor ? doctor.fullName : 'Bilinmeyen Doktor'
				};
			}
			doctorPerformance[appointment.doctorId].total++;
			if (appointment.status === 'completed') doctorPerformance[appointment.doctorId].completed++;
			if (appointment.status === 'cancelled') doctorPerformance[appointment.doctorId].cancelled++;
			if (appointment.status === 'no-show') doctorPerformance[appointment.doctorId].noShow++;
		});

		const monthlyLabels = Object.keys(appointmentCountsByMonth).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

		const appointmentCountsChartData: ChartData<'bar'> = {
			labels: monthlyLabels,
			datasets: [
				{
					label: $t('reports.appointmentAnalysis.totalAppointments'),
					data: monthlyLabels.map(label => appointmentCountsByMonth[label] || 0),
					backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.6)' : 'rgba(75, 192, 192, 0.8)'
				}
			]
		};

		const noShowRatesChartData: ChartData<'line'> = {
			labels: monthlyLabels,
			datasets: [
				{
					label: $t('reports.appointmentAnalysis.noShowRate'),
					data: monthlyLabels.map(label => {
						const total = appointmentCountsByMonth[label] || 0;
						const noShow = noShowCountsByMonth[label] || 0;
						return total > 0 ? (noShow / total) * 100 : 0;
					}),
					borderColor: isDarkMode ? 'rgba(255, 99, 132, 0.8)' : 'rgba(255, 99, 132, 1)',
					backgroundColor: isDarkMode ? 'rgba(255, 99, 132, 0.3)' : 'rgba(255, 99, 132, 0.6)',
					tension: 0.4,
					fill: true
				}
			]
		};

		const doctorPerformanceLabels = Object.values(doctorPerformance).map(d => d.name);
		const doctorPerformanceTotalData = Object.values(doctorPerformance).map(d => d.total);
		const doctorPerformanceCompletedData = Object.values(doctorPerformance).map(d => d.completed);
		const doctorPerformanceCancelledData = Object.values(doctorPerformance).map(d => d.cancelled);
		const doctorPerformanceNoShowData = Object.values(doctorPerformance).map(d => d.noShow);

		const doctorPerformanceChartData: ChartData<'bar'> = {
			labels: doctorPerformanceLabels,
			datasets: [
				{
					label: $t('reports.appointmentAnalysis.total'),
					data: doctorPerformanceTotalData,
					backgroundColor: isDarkMode ? 'rgba(54, 162, 235, 0.6)' : 'rgba(54, 162, 235, 0.8)'
				},
				{
					label: $t('reports.appointmentAnalysis.completed'),
					data: doctorPerformanceCompletedData,
					backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.6)' : 'rgba(75, 192, 192, 0.8)'
				},
				{
					label: $t('reports.appointmentAnalysis.cancelled'),
					data: doctorPerformanceCancelledData,
					backgroundColor: isDarkMode ? 'rgba(255, 99, 132, 0.6)' : 'rgba(255, 99, 132, 0.8)'
				},
				{
					label: $t('reports.appointmentAnalysis.noShow'),
					data: doctorPerformanceNoShowData,
					backgroundColor: isDarkMode ? 'rgba(255, 159, 64, 0.6)' : 'rgba(255, 159, 64, 0.8)'
				}
			]
		};


		return {
			appointmentCountsChartData,
			noShowRatesChartData,
			doctorPerformanceChartData
		};
	}

	$: barChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				labels: {
					color: isDarkMode ? 'white' : 'black'
				}
			},
			title: {
				display: false
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

	$: lineChartOptions = {
		...barChartOptions,
		scales: {
			...barChartOptions.scales,
			y: {
				...barChartOptions.scales.y,
				beginAtZero: true,
				max: 100, // For percentage
				title: {
					display: true,
					text: $t('reports.appointmentAnalysis.noShowRate') + ' (%)',
					color: isDarkMode ? 'white' : 'black'
				}
			}
		}
	};
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('reports.appointmentAnalysis.title')}</h1>

	<Card>
		<CardHeader><CardTitle>{$t('reports.appointmentAnalysis.monthlyAppointments')}</CardTitle></CardHeader>
		<CardContent class="h-64">
			<Chart type="bar" data={appointmentAnalysisData.appointmentCountsChartData} options={barChartOptions} />
		</CardContent>
	</Card>

	<Card>
		<CardHeader><CardTitle>{$t('reports.appointmentAnalysis.noShowRates')}</CardTitle></CardHeader>
		<CardContent class="h-64">
			<Chart type="line" data={appointmentAnalysisData.noShowRatesChartData} options={lineChartOptions} />
		</CardContent>
	</Card>

	<Card>
		<CardHeader><CardTitle>{$t('reports.appointmentAnalysis.doctorPerformance')}</CardTitle></CardHeader>
		<CardContent class="h-64">
			<Chart type="bar" data={appointmentAnalysisData.doctorPerformanceChartData} options={barChartOptions} />
		</CardContent>
	</Card>
</div>
