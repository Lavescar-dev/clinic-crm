<script lang="ts">
	import { patients as patientStore } from '$stores/patients';
	import { t } from '$i18n';
	import { Button } from '$components/ui/button';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { Patient, PatientStatus } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';

	let searchTerm = '';
	let statusFilter: PatientStatus | 'all' = 'all';

	const statuses: { value: PatientStatus | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'active', label: $t('patient.status.active') },
		{ value: 'inactive', label: $t('patient.status.inactive') },
		{ value: 'deceased', label: $t('patient.status.deceased') }
	];

	$: filteredPatients = $patientStore.data.filter((patient) => {
		const matchesSearch =
			patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.tcNo.includes(searchTerm);
		const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const columns = [
		{
			key: 'fullName',
			header: $t('patient.form.fullName'),
			cell: (patient: Patient) => patient.fullName
		},
		{
			key: 'tcNo',
			header: $t('patient.form.tcNo'),
			cell: (patient: Patient) => patient.tcNo
		},
		{
			key: 'birthDate',
			header: $t('patient.form.birthDate'),
			cell: (patient: Patient) => (patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy', { locale: tr }) : '-')
		},
		{
			key: 'phone',
			header: $t('patient.form.phone'),
			cell: (patient: Patient) => patient.contact.phone || '-'
		},
		{
			key: 'status',
			header: $t('patient.form.status'),
			cell: (patient: Patient) => ({ component: StatusBadge, props: { status: patient.status } })
		},
		{
			key: 'actions',
			header: $t('common.actions'),
			cell: (patient: Patient) => ({ type: 'actions', id: patient.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/patients/${id}`);
		} else if (action === 'edit') {
			goto(`/patients/${id}/edit`);
		}
	}
</script>

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('patient.management.title')}</h1>
		<Button on:click={() => goto('/patients/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('patient.management.addPatient')}
		</Button>
	</div>

	<div class="flex flex-col md:flex-row items-center gap-4">
		<SearchBar bind:searchTerm />
		<FilterDropdown bind:value={statusFilter} options={statuses} label={$t('common.filterByStatus')} />
	</div>

	<DataTable {columns} data={filteredPatients} on:action={handleAction} />
</div>