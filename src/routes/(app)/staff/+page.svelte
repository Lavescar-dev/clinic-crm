<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { staff as staffStore } from '$stores/staff';
	import { t, language } from '$i18n';
	import { Button } from '$components/ui/button';
	import { PlusCircle, Calendar } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { Staff, Role, Department, StaffStatus } from '$types';
	import { Badge } from '$components/ui/badge';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let roleFilter: Role | 'all' = 'all';
	let departmentFilter: Department | 'all' = 'all';
	let statusFilter: StaffStatus | 'all' = 'all';

	onMount(async () => {
		await staffStore.loadStaff();
	});

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

	function roleLabel(role: Role): string {
		const labels: Record<Role, { tr: string; en: string }> = {
			Doctor: { tr: 'Doktor', en: 'Doctor' },
			Nurse: { tr: 'Hemşire', en: 'Nurse' },
			Receptionist: { tr: 'Resepsiyonist', en: 'Receptionist' },
			LabTechnician: { tr: 'Laboratuvar Teknisyeni', en: 'Lab Technician' },
			Pharmacist: { tr: 'Eczacı', en: 'Pharmacist' },
			Admin: { tr: 'Yönetici', en: 'Administrator' }
		};

		const currentLanguage = get(language);
		return labels[role]?.[currentLanguage] ?? role;
	}

	function departmentLabel(department: Department): string {
		const labels: Record<Department, { tr: string; en: string }> = {
			Emergency: { tr: 'Acil', en: 'Emergency' },
			Cardiology: { tr: 'Kardiyoloji', en: 'Cardiology' },
			Pediatrics: { tr: 'Pediatri', en: 'Pediatrics' },
			Surgery: { tr: 'Cerrahi', en: 'Surgery' },
			Radiology: { tr: 'Radyoloji', en: 'Radiology' },
			Laboratory: { tr: 'Laboratuvar', en: 'Laboratory' },
			Pharmacy: { tr: 'Eczane', en: 'Pharmacy' },
			Administration: { tr: 'Yönetim', en: 'Administration' }
		};

		const currentLanguage = get(language);
		return labels[department]?.[currentLanguage] ?? department;
	}

	function staffStatusLabel(status: StaffStatus): string {
		const labels: Record<StaffStatus, { tr: string; en: string }> = {
			Active: { tr: 'Aktif', en: 'Active' },
			OnLeave: { tr: 'İzinde', en: 'On Leave' },
			Inactive: { tr: 'Pasif', en: 'Inactive' }
		};

		const currentLanguage = get(language);
		return labels[status]?.[currentLanguage] ?? status;
	}

	const roles: { value: Role | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'Doctor', label: roleLabel('Doctor') },
		{ value: 'Nurse', label: roleLabel('Nurse') },
		{ value: 'Receptionist', label: roleLabel('Receptionist') },
		{ value: 'LabTechnician', label: roleLabel('LabTechnician') },
		{ value: 'Pharmacist', label: roleLabel('Pharmacist') },
		{ value: 'Admin', label: roleLabel('Admin') }
	];

	const departments: { value: Department | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'Emergency', label: departmentLabel('Emergency') },
		{ value: 'Cardiology', label: departmentLabel('Cardiology') },
		{ value: 'Pediatrics', label: departmentLabel('Pediatrics') },
		{ value: 'Surgery', label: departmentLabel('Surgery') },
		{ value: 'Radiology', label: departmentLabel('Radiology') },
		{ value: 'Laboratory', label: departmentLabel('Laboratory') },
		{ value: 'Pharmacy', label: departmentLabel('Pharmacy') },
		{ value: 'Administration', label: departmentLabel('Administration') }
	];

	const statuses: { value: StaffStatus | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'Active', label: staffStatusLabel('Active') },
		{ value: 'OnLeave', label: staffStatusLabel('OnLeave') },
		{ value: 'Inactive', label: staffStatusLabel('Inactive') }
	];

	$: filteredStaff = $staffStore.data.filter((staff) => {
		const matchesSearch =
			staff.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(staff.licenseNumber && staff.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
			staff.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
		const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
		const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
		return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
	});

	function getStatusVariant(status: StaffStatus): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'Active':
				return 'default';
			case 'OnLeave':
				return 'secondary';
			case 'Inactive':
				return 'destructive';
		}
	}

	function getRoleBadgeColor(role: Role): string {
		const colors: Record<Role, string> = {
			Doctor: 'bg-blue-100 text-blue-800',
			Nurse: 'bg-green-100 text-green-800',
			Receptionist: 'bg-purple-100 text-purple-800',
			LabTechnician: 'bg-yellow-100 text-yellow-800',
			Pharmacist: 'bg-pink-100 text-pink-800',
			Admin: 'bg-gray-100 text-gray-800'
		};
		return colors[role] || 'bg-gray-100 text-gray-800';
	}

	const columns = [
		{
			key: 'userId',
			header: translate('staff.fields.userId', 'Personel ID', 'Staff ID'),
			cell: (staff: Staff) => staff.userId
		},
		{
			key: 'role',
			header: translate('staff.fields.role', 'Rol', 'Role'),
			cell: (staff: Staff) => ({
				component: Badge,
				props: { class: getRoleBadgeColor(staff.role) },
				content: roleLabel(staff.role)
			})
		},
		{
			key: 'department',
			header: translate('staff.fields.department', 'Departman', 'Department'),
			cell: (staff: Staff) => departmentLabel(staff.department)
		},
		{
			key: 'specialization',
			header: translate('staff.fields.specialization', 'Uzmanlık', 'Specialization'),
			cell: (staff: Staff) => staff.specialization || '-'
		},
		{
			key: 'licenseNumber',
			header: translate('staff.fields.licenseNumber', 'Lisans No', 'License'),
			cell: (staff: Staff) => staff.licenseNumber || '-'
		},
		{
			key: 'status',
			header: translate('staff.fields.status', 'Durum', 'Status'),
			cell: (staff: Staff) => ({
				component: Badge,
				props: { variant: getStatusVariant(staff.status) },
				content: staffStatusLabel(staff.status)
			})
		},
		{
			key: 'actions',
			header: translate('common.actions', 'İşlemler', 'Actions'),
			cell: (staff: Staff) => ({ type: 'actions', id: staff.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/staff/${id}`);
		} else if (action === 'edit') {
			goto(`/staff/${id}/edit`);
		}
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="mf-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-2">
			<p class="mf-kicker text-[0.72rem] font-semibold">Personel</p>
			<h1 class="mf-page-title">{translate('staff.title', 'Personel Yönetimi', 'Staff management')}</h1>
			<p class="mf-page-description">
				{translate(
					'staff.description',
					'Rol, departman ve görev durumunu tek listede izleyin.',
					'Track role, department, and duty status from one organized list.'
				)}
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" on:click={() => goto('/staff/schedule')}>
				<Calendar class="mr-2 h-4 w-4" />
				{translate('staff.schedule', 'Vardiya Planı', 'Schedule')}
			</Button>
			<Button on:click={() => goto('/staff/new')}>
				<PlusCircle class="mr-2 h-4 w-4" />
				{translate('staff.add', 'Personel Ekle', 'Add staff')}
			</Button>
		</div>
	</div>

	<div class="mf-toolbar flex flex-col gap-4 md:flex-row md:items-center">
		<SearchBar bind:searchTerm placeholder={translate('staff.searchPlaceholder', 'Personel ID veya lisans numarası ara', 'Search by staff ID or license number')} />
		<FilterDropdown bind:value={roleFilter} options={roles} label={translate('staff.filterByRole', 'Role göre filtrele', 'Filter by role')} />
		<FilterDropdown
			bind:value={departmentFilter}
			options={departments}
			label={translate('staff.filterByDepartment', 'Departmana göre filtrele', 'Filter by department')}
		/>
		<FilterDropdown bind:value={statusFilter} options={statuses} label={translate('staff.filterByStatus', 'Duruma göre filtrele', 'Filter by status')} />
	</div>

	{#if $staffStore.isLoading}
		<div class="flex items-center justify-center p-8">
			<p>{$t('common.loading')}</p>
		</div>
	{:else if $staffStore.error}
		<div class="flex items-center justify-center p-8 text-destructive">
			<p>{$staffStore.error}</p>
		</div>
	{:else}
		<DataTable {columns} data={filteredStaff} on:action={handleAction} />
	{/if}
</div>
