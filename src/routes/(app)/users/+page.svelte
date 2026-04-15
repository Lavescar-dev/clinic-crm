<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t, language } from '$i18n';
	import { Button } from '$components/ui/button';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { User, UserRole } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { users as userStore } from '$stores/users';
	import { get } from 'svelte/store';

	let searchTerm = '';
	let roleFilter: UserRole | 'all' = 'all';

	function translate(key: string, fallbackTr: string, fallbackEn = fallbackTr) {
		const value = get(t)(key);
		if (value === key) {
			return get(language) === 'tr' ? fallbackTr : fallbackEn;
		}

		return value;
	}

const userRoles: { value: UserRole | 'all'; label: string }[] = [
		{ value: 'all', label: translate('common.all', 'Tümü', 'All') },
		{ value: 'admin', label: translate('user.role.admin', 'Yönetici', 'Administrator') },
		{ value: 'doctor', label: translate('user.role.doctor', 'Doktor', 'Doctor') },
		{ value: 'nurse', label: translate('user.role.nurse', 'Hemşire', 'Nurse') },
		{ value: 'receptionist', label: translate('user.role.receptionist', 'Resepsiyonist', 'Receptionist') },
		{ value: 'pharmacist', label: translate('user.role.pharmacist', 'Eczacı', 'Pharmacist') }
	];

	$: filteredUsers = $userStore.data.filter((user) => {
		const matchesSearch =
			user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === 'all' || user.role === roleFilter;
		return matchesSearch && matchesRole;
	});

	const columns = [
		{
			key: 'fullName',
			header: translate('user.form.fullName', 'Ad Soyad', 'Full name'),
			cell: (user: User) => user.fullName
		},
		{
			key: 'email',
			header: translate('user.form.email', 'E-posta', 'Email'),
			cell: (user: User) => user.email
		},
		{
			key: 'role',
			header: translate('user.form.role', 'Rol', 'Role'),
			cell: (user: User) => translate(`user.role.${user.role}`, user.role, user.role)
		},
		{
			key: 'status',
			header: translate('user.form.status', 'Durum', 'Status'),
			cell: (user: User) => ({ component: StatusBadge, props: { status: user.status } })
		},
		{
			key: 'actions',
			header: translate('common.actions', 'İşlemler', 'Actions'),
			cell: (user: User) => ({ type: 'actions', id: user.id })
		}
	];

	function handleAction(event: CustomEvent) {
		const { action, id } = event.detail;
		if (action === 'view') {
			goto(`/users/${id}`);
		} else if (action === 'edit') {
			goto(`/users/${id}/edit`);
		}
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="mf-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-2">
			<p class="mf-kicker text-[0.72rem] font-semibold">Erişim Kontrolü</p>
			<h1 class="mf-page-title">{translate('user.management.title', 'Kullanıcı Yönetimi', 'User management')}</h1>
			<p class="mf-page-description">
				{translate(
					'user.management.description',
					'Yetkileri, rolleri ve oturum erişimini tek listeden yönetin.',
					'Manage permissions, roles, and account access from one workspace.'
				)}
			</p>
		</div>
		<Button on:click={() => goto('/users/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{translate('user.management.addUser', 'Yeni Kullanıcı', 'Add user')}
		</Button>
	</div>

	<div class="mf-toolbar flex flex-col gap-4 md:flex-row md:items-center">
		<SearchBar bind:searchTerm />
		<FilterDropdown bind:value={roleFilter} options={userRoles} label={translate('user.management.filterByRole', 'Role göre filtrele', 'Filter by role')} />
	</div>

	<DataTable {columns} data={filteredUsers} on:action={handleAction} />
</div>
