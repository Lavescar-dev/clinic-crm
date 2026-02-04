<script lang="ts">
	import { t } from '$i18n';
	import { Button } from '$components/ui/button';
	import { PlusCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import SearchBar from '$components/shared/SearchBar.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';
	import DataTable from '$components/shared/DataTable.svelte';
	import type { User, UserRole } from '$types';
	import StatusBadge from '$components/shared/StatusBadge.svelte';
	import { users as userStore } from '$stores/users';

	let searchTerm = '';
	let roleFilter: UserRole | 'all' = 'all';

	const userRoles: { value: UserRole | 'all'; label: string }[] = [
		{ value: 'all', label: $t('common.all') },
		{ value: 'admin', label: $t('user.role.admin') },
		{ value: 'doctor', label: $t('user.role.doctor') },
		{ value: 'nurse', label: $t('user.role.nurse') },
		{ value: 'receptionist', label: $t('user.role.receptionist') },
		{ value: 'pharmacist', label: $t('user.role.pharmacist') }
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
			header: $t('user.form.fullName'),
			cell: (user: User) => user.fullName
		},
		{
			key: 'email',
			header: $t('user.form.email'),
			cell: (user: User) => user.email
		},
		{
			key: 'role',
			header: $t('user.form.role'),
			cell: (user: User) => $t(`user.role.${user.role}`)
		},
		{
			key: 'status',
			header: $t('user.form.status'),
			cell: (user: User) => ({ component: StatusBadge, props: { status: user.status } })
		},
		{
			key: 'actions',
			header: $t('common.actions'),
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

<div class="space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$t('user.management.title')}</h1>
		<Button on:click={() => goto('/users/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			{$t('user.management.addUser')}
		</Button>
	</div>

	<div class="flex flex-col md:flex-row items-center gap-4">
		<SearchBar bind:searchTerm />
		<FilterDropdown bind:value={roleFilter} options={userRoles} label={$t('user.management.filterByRole')} />
	</div>

	<DataTable {columns} data={filteredUsers} on:action={handleAction} />
</div>