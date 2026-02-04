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
	import { patients as patientStore } from '$stores/patients';
	import { calculateAge } from '$utils/date';
	import type { Gender, InsuranceType } from '$types';

	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

	$: isDarkMode = get(theme).isDarkMode; // Reactive dark mode status

	$: patientStatsData = calculatePatientStats($patientStore.data);

	function calculatePatientStats(patients: typeof $patientStore.data) {
		const ageDistribution: Record<string, number> = {};
		const genderDistribution: Record<Gender, number> = { male: 0, female: 0, other: 0 };
		const insuranceTypeDistribution: Record<InsuranceType, number> = { sgk: 0, private: 0, none: 0 };
		const diagnosisCounts: Record<string, number> = {};

		patients.forEach((patient) => {
			// Age Distribution
			if (patient.birthDate) {
				const age = calculateAge(patient.birthDate);
				const ageGroup = `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9}`;
				ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
			}

			// Gender Distribution
			genderDistribution[patient.gender] = (genderDistribution[patient.gender] || 0) + 1;

			// Insurance Type Distribution
			insuranceTypeDistribution[patient.insurance.type] = (insuranceTypeDistribution[patient.insurance.type] || 0) + 1;

			// Most Common Diagnoses - This would typically come from EMR records,
			// For now, we'll leave it as a placeholder or use mock data if available
			// patient.medicalRecords?.forEach(mr => mr.diagnoses.forEach(diag => {
			// 	diagnosisCounts[diag.name] = (diagnosisCounts[diag.name] || 0) + 1;
			// }));
		});

		const ageChartData: ChartData<'bar'> = {
			labels: Object.keys(ageDistribution).sort((a,b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0])),
			datasets: [
				{
					label: $t('reports.patientStats.ageDistribution'),
					data: Object.values(ageDistribution),
					backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.6)' : 'rgba(75, 192, 192, 0.8)'
				}
			]
		};

		const genderChartData: ChartData<'pie'> = {
			labels: Object.keys(genderDistribution).map(gender => $t(`patient.gender.${gender}`)),
			datasets: [
				{
					data: Object.values(genderDistribution),
					backgroundColor: [
						'rgba(255, 99, 132, 0.8)',
						'rgba(54, 162, 235, 0.8)',
						'rgba(255, 206, 86, 0.8)'
					],
					borderColor: isDarkMode ? '#333' : '#fff',
					borderWidth: 1
				}
			]
		};

		const insuranceChartData: ChartData<'pie'> = {
			labels: Object.keys(insuranceTypeDistribution).map(type => $t(`patient.insurance.${type}`)),
			datasets: [
				{
					data: Object.values(insuranceTypeDistribution),
					backgroundColor: [
						'rgba(75, 192, 192, 0.8)',
						'rgba(153, 102, 255, 0.8)',
						'rgba(255, 159, 64, 0.8)'
					],
					borderColor: isDarkMode ? '#333' : '#fff',
					borderWidth: 1
				}
			]
		};

		// Placeholder for most common diagnoses
		const commonDiagnosesChartData: ChartData<'bar'> = {
			labels: ['Soğuk Algınlığı', 'Grip', 'Faranjit'], // Example data
			datasets: [{
				label: $t('reports.patientStats.mostCommonDiagnoses'),
				data: [50, 40, 30], // Example counts
				backgroundColor: isDarkMode ? 'rgba(255, 159, 64, 0.6)' : 'rgba(255, 159, 64, 0.8)'
			}]
		};

		return {
			ageChartData,
			genderChartData,
			insuranceChartData,
			commonDiagnosesChartData
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

	$: pieChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'right' as const,
				labels: {
					color: isDarkMode ? 'white' : 'black'
				}
			},
			title: {
				display: false
			}
		}
	};
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('reports.patientStats.title')}</h1>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader><CardTitle>{$t('reports.patientStats.ageDistribution')}</CardTitle></CardHeader>
			<CardContent class="h-64">
				<Chart type="bar" data={patientStatsData.ageChartData} options={barChartOptions} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('reports.patientStats.genderDistribution')}</CardTitle></CardHeader>
			<CardContent class="h-64">
				<Chart type="pie" data={patientStatsData.genderChartData} options={pieChartOptions} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('reports.patientStats.insuranceTypeDistribution')}</CardTitle></CardHeader>
			<CardContent class="h-64">
				<Chart type="pie" data={patientStatsData.insuranceChartData} options={pieChartOptions} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('reports.patientStats.mostCommonDiagnoses')}</CardTitle></CardHeader>
			<CardContent class="h-64">
				<Chart type="bar" data={patientStatsData.commonDiagnosesChartData} options={barChartOptions} />
			</CardContent>
		</Card>
	</div>
</div>
