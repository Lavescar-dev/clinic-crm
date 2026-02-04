<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import StatsCard from '$components/dashboard/StatsCard.svelte';
	import AppointmentChart from '$components/dashboard/AppointmentChart.svelte';
	import RevenueChart from '$components/dashboard/RevenueChart.svelte';
	import QuickActions from '$components/dashboard/QuickActions.svelte';
	import RecentActivities from '$components/dashboard/RecentActivities.svelte';

	import { patients, patientStats } from '$stores/patients';
	import { appointments, appointmentStats } from '$stores/appointments';
	import { billing, billingStats } from '$stores/billing';
	import { inventory, inventoryStats } from '$stores/inventory';
	import { emr } from '$stores/emr';
	import { recentNotifications } from '$stores/notifications'; // For recent activities
	import { formatCurrency } from '$utils/currency';
	import { get } from 'svelte/store';
	import { DEFAULT_LANGUAGE } from '$lib/config/app';
	import { tr } from 'date-fns/locale';

	// Reactive data from stores
	$: totalPatients = $patientStats.total;
	$: totalAppointments = $appointmentStats.total;
	$: totalRevenue = $billingStats.totalRevenue;
	$: lowStockItems = $inventoryStats.lowStockItems;


	// Example chart data - replace with actual store data later
	$: appointmentData = {
		labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'], // Placeholder, ideally from $appointmentStats
		datasets: [
			{
				label: $t('dashboard.charts.appointments'),
				data: [65, 59, 80, 81, 56, 55], // Placeholder, ideally from $appointmentStats
				backgroundColor: 'rgba(75, 192, 192, 0.6)',
				borderColor: 'rgba(75, 192, 192, 1)',
				tension: 0.3
			}
		]
	};

	$: revenueData = {
		labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'], // Placeholder, ideally from $billingStats
		datasets: [
			{
				label: $t('dashboard.charts.revenue') + ` (${formatCurrency(0, 'TRY', DEFAULT_LANGUAGE)})`, // Placeholder
				data: [30000, 45000, 35000, 50000, 40000, 60000], // Placeholder, ideally from $billingStats
				backgroundColor: 'rgba(153, 102, 255, 0.6)',
				borderColor: 'rgba(153, 102, 255, 1)',
				tension: 0.3
			}
		]
	};

	const quickActions = [
		{ label: $t('dashboard.quickActions.newAppointment'), icon: 'CalendarPlus', href: '/appointments/new' },
		{ label: $t('dashboard.quickActions.newPatient'), icon: 'UserPlus', href: '/patients/new' },
		{ label: $t('dashboard.quickActions.newInvoice'), icon: 'FileText', href: '/billing/invoices/new' },
		{ label: $t('dashboard.quickActions.viewReports'), icon: 'BarChart', href: '/reports' }
	];

	$: recentActivities = $recentNotifications.map(notification => ({
		id: notification.id,
		type: notification.type.split('-')[0], // e.g., 'appointment', 'payment'
		description: notification.message,
		timestamp: notification.createdAt
	}));
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('dashboard.title')}</h1>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<StatsCard
			title={$t('dashboard.stats.totalPatients')}
			value={totalPatients}
			icon="Users"
			description={$t('dashboard.stats.totalPatientsDescription')}
		/>
		<StatsCard
			title={$t('dashboard.stats.totalAppointments')}
			value={totalAppointments}
			icon="CalendarCheck"
			description={$t('dashboard.stats.totalAppointmentsDescription')}
		/>
		<StatsCard
			title={$t('dashboard.stats.totalRevenue')}
			value={totalRevenue}
			icon="DollarSign"
			description={$t('dashboard.stats.totalRevenueDescription')}
			format="currency"
		/>
		<StatsCard
			title={$t('dashboard.stats.lowStockItems')}
			value={lowStockItems}
			icon="PackageWarning"
			description={$t('dashboard.stats.lowStockItemsDescription')}
		/>
	</div>

	<!-- Charts and Quick Actions -->
	<div class="grid gap-6 lg:grid-cols-3">
		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle>{$t('dashboard.charts.appointmentsTitle')}</CardTitle>
			</CardHeader>
			<CardContent>
				<AppointmentChart data={appointmentData} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{$t('dashboard.quickActions.title')}</CardTitle>
			</CardHeader>
			<CardContent>
				<QuickActions {quickActions} />
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle>{$t('dashboard.charts.revenueTitle')}</CardTitle>
			</CardHeader>
			<CardContent>
				<RevenueChart data={revenueData} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{$t('dashboard.recentActivities.title')}</CardTitle>
			</CardHeader>
			<CardContent>
				<RecentActivities activities={recentActivities} />
			</CardContent>
		</Card>
	</div>
</div>