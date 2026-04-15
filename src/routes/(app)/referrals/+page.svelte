<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { referrals } from '$stores/referrals';
	import { patients } from '$stores/patients';
	import { users } from '$stores/users';
	import { t } from '$i18n';
	import { currentUser } from '$lib/stores';
	import { Button } from '$components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$components/ui/tabs';
	import { PlusCircle, ArrowRight } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { DataTable, ExportButton, type ColumnDef } from '$lib/components/DataTable';
	import type { Referral, ReferralStatus, UrgencyLevel } from '$types/referral';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import type { Table } from '@tanstack/svelte-table';
	import { Badge } from '$components/ui/badge';
	import { isInternalReferral, isExternalReferral } from '$types/referral';

	let table = $state<Table<Referral> | null>(null);
	let activeTab = $state<'incoming' | 'outgoing' | 'all'>('incoming');

	let currentDoctorId = $derived.by(
		() => ($currentUser?.role === 'doctor' ? $currentUser.id : $users.data.find((user) => user.role === 'doctor')?.id) || ''
	);

	// Get patient name by ID
	function getPatientName(patientId: string): string {
		const patient = $patients.data.find((p) => p.id === patientId);
		return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
	}

	// Get doctor name by ID
	function getDoctorName(doctorId: string | undefined): string {
		if (!doctorId) return '-';
		const doctor = $users.data.find((u) => u.id === doctorId);
		return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
	}

	// Get status badge variant
	function getStatusVariant(
		status: ReferralStatus
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (status) {
			case 'pending':
				return 'warning';
			case 'accepted':
				return 'success';
			case 'rejected':
				return 'destructive';
			case 'completed':
				return 'secondary';
			case 'expired':
				return 'outline';
			default:
				return 'default';
		}
	}

	// Get urgency badge variant
	function getUrgencyVariant(
		urgency: UrgencyLevel
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (urgency) {
			case 'routine':
				return 'secondary';
			case 'urgent':
				return 'warning';
			case 'stat':
				return 'destructive';
			default:
				return 'default';
		}
	}

	// Filter referrals based on active tab
	let filteredReferrals = $derived.by(() => {
		const allReferrals = $referrals.referrals;
		switch (activeTab) {
			case 'incoming':
				if (!currentDoctorId) return allReferrals;
				return allReferrals.filter((r) => r.toDoctorId === currentDoctorId);
			case 'outgoing':
				if (!currentDoctorId) return allReferrals;
				return allReferrals.filter((r) => r.fromDoctorId === currentDoctorId);
			case 'all':
			default:
				return allReferrals;
		}
	});

	$effect(() => {
		if (activeTab === 'incoming' && currentDoctorId && filteredReferrals.length === 0 && $referrals.referrals.length > 0) {
			activeTab = 'all';
		}
	});

	const columns: ColumnDef<Referral>[] = [
		{
			id: 'patient',
			accessorFn: (row) => getPatientName(row.patientId),
			header: $t('referrals.fields.patient'),
			cell: (info) => {
				const referral = info.row.original;
				return {
					render: () => `<a href="/patients/${referral.patientId}" class="text-primary hover:underline font-medium">${info.getValue()}</a>`
				};
			}
		},
		{
			id: 'from',
			accessorFn: (row) => {
				const doctor = getDoctorName(row.fromDoctorId);
				const dept = row.fromDepartment || '-';
				return `${doctor} (${dept})`;
			},
			header: $t('referrals.fields.from'),
			cell: (info) => info.getValue() as string
		},
		{
			id: 'to',
			accessorFn: (row) => {
				if (isExternalReferral(row)) {
					return row.externalFacility?.name || 'External Facility';
				}
				const doctor = getDoctorName(row.toDoctorId);
				const dept = row.toDepartment || '-';
				return `${doctor} (${dept})`;
			},
			header: $t('referrals.fields.to'),
			cell: (info) => {
				const referral = info.row.original;
				const isExternal = isExternalReferral(referral);
				return {
					render: () => `
						<div class="flex items-center gap-1">
							${isExternal ? '<span class="text-xs text-muted-foreground">[Ext]</span>' : ''}
							<span>${info.getValue()}</span>
						</div>
					`
				};
			}
		},
		{
			id: 'reason',
			accessorKey: 'reason',
			header: $t('referrals.fields.reason'),
			cell: (info) => {
				const reason = info.getValue() as string;
				return {
					render: () => `<span class="max-w-xs truncate block" title="${reason}">${reason}</span>`
				};
			}
		},
		{
			id: 'urgency',
			accessorKey: 'urgency',
			header: $t('referrals.fields.urgency'),
			cell: (info) => {
				const urgency = info.getValue() as UrgencyLevel;
				const variant = getUrgencyVariant(urgency);
				return {
					render: () => `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
						${variant === 'default' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : ''}
						${variant === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}
						${variant === 'warning' ? 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700' : ''}
						${variant === 'destructive' ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80' : ''}
					">${$t(`referrals.urgency.${urgency}`)}</span>`
				};
			}
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: $t('referrals.fields.status'),
			cell: (info) => {
				const status = info.getValue() as ReferralStatus;
				const variant = getStatusVariant(status);
				return {
					render: () => `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
						${variant === 'default' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : ''}
						${variant === 'success' ? 'border-transparent bg-green-600 text-white hover:bg-green-700' : ''}
						${variant === 'warning' ? 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700' : ''}
						${variant === 'destructive' ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80' : ''}
						${variant === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}
					">${$t(`referrals.status.${status}`)}</span>`
				};
			}
		},
		{
			id: 'date',
			accessorFn: (row) => format(new Date(row.createdAt), 'dd MMM yyyy', { locale: tr }),
			header: $t('referrals.fields.date'),
			cell: (info) => info.getValue() as string
		},
		{
			id: 'actions',
			header: $t('common.actions'),
			cell: (info) => {
				const referral = info.row.original;
				return {
					render: () => `
						<button
							onclick="window.dispatchEvent(new CustomEvent('referral-view', { detail: '${referral.id}' }))"
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

	function handleTableCreate(tableInstance: Table<Referral>) {
		table = tableInstance;
	}

	// Handle action events from buttons in the table
	if (typeof window !== 'undefined') {
		window.addEventListener('referral-view', ((event: CustomEvent) => {
			goto(`/referrals/${event.detail}`);
		}) as EventListener);
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('referrals.title')}</h1>
		<Button on:click={() => goto('/referrals/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('referrals.newReferral')}
		</Button>
	</div>

	<Tabs bind:value={activeTab} class="w-full">
		<TabsList class="grid w-full md:w-auto grid-cols-3 md:inline-grid">
			<TabsTrigger value="incoming">{$t('referrals.tabs.incoming')}</TabsTrigger>
			<TabsTrigger value="outgoing">{$t('referrals.tabs.outgoing')}</TabsTrigger>
			<TabsTrigger value="all">{$t('referrals.tabs.all')}</TabsTrigger>
		</TabsList>

		<TabsContent value="incoming" class="mt-6">
			<DataTable
				data={filteredReferrals}
				{columns}
				enableSorting={true}
				enableFiltering={true}
				enablePagination={true}
				pageSize={20}
				onTableCreate={handleTableCreate}
			>
				{#snippet toolbar()}
					{#if table}
						<ExportButton {table} filename="incoming-referrals" />
					{/if}
				{/snippet}
			</DataTable>
		</TabsContent>

		<TabsContent value="outgoing" class="mt-6">
			<DataTable
				data={filteredReferrals}
				{columns}
				enableSorting={true}
				enableFiltering={true}
				enablePagination={true}
				pageSize={20}
				onTableCreate={handleTableCreate}
			>
				{#snippet toolbar()}
					{#if table}
						<ExportButton {table} filename="outgoing-referrals" />
					{/if}
				{/snippet}
			</DataTable>
		</TabsContent>

		<TabsContent value="all" class="mt-6">
			<DataTable
				data={filteredReferrals}
				{columns}
				enableSorting={true}
				enableFiltering={true}
				enablePagination={true}
				pageSize={20}
				onTableCreate={handleTableCreate}
			>
				{#snippet toolbar()}
					{#if table}
						<ExportButton {table} filename="all-referrals" />
					{/if}
				{/snippet}
			</DataTable>
		</TabsContent>
	</Tabs>
</div>
