<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { treatmentPlans } from '$stores/treatmentPlans';
	import { patients } from '$stores/patients';
	import { users } from '$stores/users';
	import { t } from '$i18n';
	import { Button } from '$components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { DataTable, ExportButton, type ColumnDef } from '$lib/components/DataTable';
	import type { TreatmentPlan, TreatmentPlanStatus } from '$types/treatmentPlan';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import type { Table } from '@tanstack/svelte-table';
	import { Badge } from '$components/ui/badge';

	let table = $state<Table<TreatmentPlan> | null>(null);
	let activeTab = $state<'active' | 'completed' | 'all'>('active');

	// Get patient name by ID
	function getPatientName(patientId: string): string {
		const patient = $patients.data.find((p) => p.id === patientId);
		return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
	}

	// Get doctor name by ID
	function getDoctorName(doctorId: string): string {
		const doctor = $users.data.find((u) => u.id === doctorId);
		return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
	}

	// Get status badge variant
	function getStatusVariant(
		status: TreatmentPlanStatus
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (status) {
			case 'not-started':
				return 'secondary';
			case 'in-progress':
				return 'default';
			case 'completed':
				return 'success';
			case 'discontinued':
				return 'destructive';
			case 'on-hold':
				return 'warning';
			default:
				return 'outline';
		}
	}

	// Calculate next session date (simplified - would use service method in production)
	function calculateNextSessionDate(plan: TreatmentPlan): string {
		if (plan.status === 'completed' || plan.status === 'discontinued') {
			return '-';
		}
		if (plan.completedSessions >= plan.totalSessions) {
			return '-';
		}

		// Simple calculation - would use service method
		const daysFromStart = Math.ceil((plan.completedSessions + 1) * 3.5); // Rough estimate
		const nextDate = new Date(plan.startDate);
		nextDate.setDate(nextDate.getDate() + daysFromStart);
		return format(nextDate, 'dd MMM yyyy', { locale: tr });
	}

	// Filter plans based on active tab
	let filteredPlans = $derived.by(() => {
		const plans = $treatmentPlans.plans;
		switch (activeTab) {
			case 'active':
				return plans.filter((p) => p.status === 'in-progress' || p.status === 'not-started');
			case 'completed':
				return plans.filter((p) => p.status === 'completed');
			case 'all':
			default:
				return plans;
		}
	});

	const columns: ColumnDef<TreatmentPlan>[] = [
		{
			id: 'patient',
			accessorFn: (row) => getPatientName(row.patientId),
			header: $t('treatments.fields.patient'),
			cell: (info) => {
				const plan = info.row.original;
				return {
					render: () => `<a href="/patients/${plan.patientId}" class="text-primary hover:underline font-medium">${info.getValue()}</a>`
				};
			}
		},
		{
			id: 'protocol',
			accessorFn: (row) => row.protocol.name,
			header: $t('treatments.fields.protocol'),
			cell: (info) => info.getValue() as string
		},
		{
			id: 'doctor',
			accessorFn: (row) => getDoctorName(row.doctorId),
			header: $t('treatments.fields.doctor'),
			cell: (info) => info.getValue() as string
		},
		{
			id: 'progress',
			accessorFn: (row) => `${row.completedSessions}/${row.totalSessions}`,
			header: $t('treatments.fields.progress'),
			cell: (info) => {
				const plan = info.row.original;
				const percentage = Math.round((plan.completedSessions / plan.totalSessions) * 100);
				return {
					render: () => `
						<div class="flex flex-col gap-1 min-w-[120px]">
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">${plan.completedSessions}/${plan.totalSessions}</span>
								<span class="font-medium">${percentage}%</span>
							</div>
							<div class="w-full bg-secondary rounded-full h-2">
								<div class="bg-primary h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
							</div>
						</div>
					`
				};
			},
			enableSorting: false
		},
		{
			id: 'nextSession',
			accessorFn: (row) => calculateNextSessionDate(row),
			header: $t('treatments.fields.nextSession'),
			cell: (info) => info.getValue() as string
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: $t('treatments.fields.status'),
			cell: (info) => {
				const status = info.getValue() as TreatmentPlanStatus;
				const variant = getStatusVariant(status);
				return {
					render: () => `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
						${variant === 'default' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : ''}
						${variant === 'success' ? 'border-transparent bg-green-600 text-white hover:bg-green-700' : ''}
						${variant === 'warning' ? 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700' : ''}
						${variant === 'destructive' ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80' : ''}
						${variant === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}
					">${$t(`treatments.status.${status}`)}</span>`
				};
			}
		},
		{
			id: 'actions',
			header: $t('common.actions'),
			cell: (info) => {
				const plan = info.row.original;
				return {
					render: () => `
						<button
							onclick="window.dispatchEvent(new CustomEvent('treatment-view', { detail: '${plan.id}' }))"
							class="p-1.5 hover:bg-muted rounded transition-colors"
							title="${$t('common.view')}"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
						</button>
					`
				};
			},
			enableSorting: false
		}
	];

	function handleTableCreate(tableInstance: Table<TreatmentPlan>) {
		table = tableInstance;
	}

	// Handle action events from buttons in the table
	if (typeof window !== 'undefined') {
		window.addEventListener('treatment-view', ((event: CustomEvent) => {
			goto(`/treatments/${event.detail}`);
		}) as EventListener);
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('treatments.title')}</h1>
		<Button on:click={() => goto('/treatments/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('treatments.newPlan')}
		</Button>
	</div>

	<Tabs bind:value={activeTab} class="w-full">
		<TabsList class="grid w-full md:w-auto grid-cols-3 md:inline-grid">
			<TabsTrigger value="active">{$t('treatments.tabs.active')}</TabsTrigger>
			<TabsTrigger value="completed">{$t('treatments.tabs.completed')}</TabsTrigger>
			<TabsTrigger value="all">{$t('treatments.tabs.all')}</TabsTrigger>
		</TabsList>

		<TabsContent value="active" class="mt-6">
			<DataTable
				data={filteredPlans}
				{columns}
				enableSorting={true}
				enableFiltering={true}
				enablePagination={true}
				pageSize={20}
				onTableCreate={handleTableCreate}
			>
				{#snippet toolbar()}
					{#if table}
						<ExportButton {table} filename="active-treatment-plans" />
					{/if}
				{/snippet}
			</DataTable>
		</TabsContent>

		<TabsContent value="completed" class="mt-6">
			<DataTable
				data={filteredPlans}
				{columns}
				enableSorting={true}
				enableFiltering={true}
				enablePagination={true}
				pageSize={20}
				onTableCreate={handleTableCreate}
			>
				{#snippet toolbar()}
					{#if table}
						<ExportButton {table} filename="completed-treatment-plans" />
					{/if}
				{/snippet}
			</DataTable>
		</TabsContent>

		<TabsContent value="all" class="mt-6">
			<DataTable
				data={filteredPlans}
				{columns}
				enableSorting={true}
				enableFiltering={true}
				enablePagination={true}
				pageSize={20}
				onTableCreate={handleTableCreate}
			>
				{#snippet toolbar()}
					{#if table}
						<ExportButton {table} filename="all-treatment-plans" />
					{/if}
				{/snippet}
			</DataTable>
		</TabsContent>
	</Tabs>
</div>
