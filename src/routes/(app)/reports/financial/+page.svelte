<script lang="ts">
	import { t, language } from '$i18n'; // Import language store
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
	import { theme } from '$stores/theme'; // Import theme store for dark mode detection
	import { billing as billingStore } from '$stores/billing';
	import { formatCurrency } from '$utils/currency';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$components/ui/select';

	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

	let periodFilter: 'daily' | 'monthly' | 'yearly' = 'monthly';

	$: currentLocale = get(language).locale; // Reactive current locale
	$: isDarkMode = get(theme).isDarkMode; // Reactive dark mode status

	$: financialData = calculateFinancialData($billingStore.data, periodFilter);

	function calculateFinancialData(invoices: typeof $billingStore.data, period: typeof periodFilter) {
		let totalIncome = 0;
		let incomeByPeriod: Record<string, number> = {};
		let paymentMethodDistribution: Record<string, number> = {};
		let serviceIncome: Record<string, number> = {};

		invoices.forEach((invoice) => {
			if (invoice.status === 'paid') {
				totalIncome += invoice.total;

				const invoiceDate = new Date(invoice.issueDate);
				let periodKey = '';
				if (period === 'daily') {
					periodKey = format(invoiceDate, 'dd MMM yyyy', { locale: tr });
				} else if (period === 'monthly') {
					periodKey = format(invoiceDate, 'MMM yyyy', { locale: tr });
				} else {
					periodKey = format(invoiceDate, 'yyyy');
				}
				incomeByPeriod[periodKey] = (incomeByPeriod[periodKey] || 0) + invoice.total;

				invoice.items.forEach((item) => {
					serviceIncome[item.description] = (serviceIncome[item.description] || 0) + item.total;
				});

				// Assuming payments are linked to invoices and have a method
				$billingStore.payments.filter(p => p.invoiceId === invoice.id).forEach(payment => {
					paymentMethodDistribution[payment.method] = (paymentMethodDistribution[payment.method] || 0) + payment.amount;
				});
			}
		});

		const incomeChartData: ChartData<'bar'> = {
			labels: Object.keys(incomeByPeriod),
			datasets: [
				{
					label: $t('reports.financial.income'),
					data: Object.values(incomeByPeriod),
					backgroundColor: isDarkMode ? 'rgba(153, 102, 255, 0.6)' : 'rgba(153, 102, 255, 0.8)'
				}
			]
		};

		const paymentMethodChartData: ChartData<'pie'> = {
			labels: Object.keys(paymentMethodDistribution).map(method => $t(`billing.payment.method.${method}`)),
			datasets: [
				{
					data: Object.values(paymentMethodDistribution),
					backgroundColor: [
						'rgba(255, 99, 132, 0.8)',
						'rgba(54, 162, 235, 0.8)',
						'rgba(255, 206, 86, 0.8)',
						'rgba(75, 192, 192, 0.8)',
						'rgba(153, 102, 255, 0.8)'
					],
					borderColor: isDarkMode ? '#333' : '#fff',
					borderWidth: 1
				}
			]
		};

		const serviceIncomeChartData: ChartData<'bar'> = {
			labels: Object.keys(serviceIncome),
			datasets: [
				{
					label: $t('reports.financial.serviceIncome'),
					data: Object.values(serviceIncome),
					backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.6)' : 'rgba(75, 192, 192, 0.8)'
				}
			]
		};


		return {
			totalIncome,
			incomeChartData,
			paymentMethodChartData,
			serviceIncomeChartData
		};
	}

	$: incomeChartOptions = {
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
	<h1 class="text-3xl font-bold">{$t('reports.financial.title')}</h1>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle>{$t('reports.financial.overview')}</CardTitle>
			<Select bind:value={periodFilter}>
				<SelectTrigger class="w-[180px]">
					<SelectValue placeholder="Dönem Seç" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="daily">{$t('reports.period.daily')}</SelectItem>
					<SelectItem value="monthly">{$t('reports.period.monthly')}</SelectItem>
					<SelectItem value="yearly">{$t('reports.period.yearly')}</SelectItem>
				</SelectContent>
			</Select>
		</CardHeader>
		<CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<Card>
				<CardHeader><CardTitle class="text-sm font-medium">{$t('reports.financial.totalIncome')}</CardTitle></CardHeader>
				<CardContent><div class="text-2xl font-bold">{formatCurrency(financialData.totalIncome, undefined, currentLocale)}</div></CardContent>
			</Card>
			<!-- Add more summary cards here if needed -->
		</CardContent>
	</Card>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader><CardTitle>{$t('reports.financial.incomeByPeriod')}</CardTitle></CardHeader>
			<CardContent class="h-64">
				<Chart type="bar" data={financialData.incomeChartData} options={incomeChartOptions} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>{$t('reports.financial.paymentMethodDistribution')}</CardTitle></CardHeader>
			<CardContent class="h-64">
				<Chart type="pie" data={financialData.paymentMethodChartData} options={pieChartOptions} />
			</CardContent>
		</Card>
	</div>

	<Card>
		<CardHeader><CardTitle>{$t('reports.financial.serviceBasedIncome')}</CardTitle></CardHeader>
		<CardContent class="h-64">
			<Chart type="bar" data={financialData.serviceIncomeChartData} options={incomeChartOptions} />
		</CardContent>
	</Card>
</div>
