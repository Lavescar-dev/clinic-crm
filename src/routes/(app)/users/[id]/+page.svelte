<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$components/ui/avatar';
	import { Badge } from '$components/ui/badge';
	import { users as userStore } from '$stores/users';
	import { goto } from '$app/navigation';
	import type { User, UserRole } from '$types';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { formatDate } from '$utils/date';
	import { formatPhoneNumber } from '$utils/formatting';

	let user: User | undefined;
	let loading = true;
	let confirmDelete = false;

	onMount(async () => {
		const userId = $page.params.id as string;
		user = await userStore.getUserById(userId);
		loading = false;
		if (!user) {
			toast.error($t('user.profile.userNotFound'));
			goto('/users');
		}
	});

	async function handleDelete() {
		if (user) {
			await userStore.deleteUser(user.id);
			toast.success($t('user.profile.deleteSuccess', { name: user.fullName }));
			goto('/users');
		}
	}

	function getRoleVariant(role: UserRole) {
		switch (role) {
			case 'admin':
				return 'destructive';
			case 'doctor':
				return 'info';
			case 'nurse':
				return 'warning';
			case 'receptionist':
				return 'secondary';
			case 'pharmacist':
				return 'success';
			default:
				return 'default';
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if user}
	<div class="space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">{$t('user.profile.title', { name: user.fullName })}</h1>
			<div class="flex gap-2">
				<Button variant="outline" on:click={() => goto(`/users/${user?.id}/edit`)}>
					{$t('common.edit')}
				</Button>
				<Button variant="destructive" on:click={() => (confirmDelete = true)}>
					{$t('common.delete')}
				</Button>
			</div>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>{$t('user.profile.overview')}</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="flex flex-col items-center gap-4 md:col-span-1">
					<Avatar class="h-24 w-24">
						{#if user.avatar}
							<AvatarImage src={user.avatar} alt={user.fullName} />
						{:else}
							<AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
						{/if}
					</Avatar>
					<div class="text-center">
						<h2 class="text-xl font-semibold">{user.fullName}</h2>
						<Badge variant={getRoleVariant(user.role)}>{$t(`user.role.${user.role}`)}</Badge>
					</div>
				</div>

				<div class="grid gap-2 md:col-span-2">
					<p><strong>{$t('user.form.email')}:</strong> {user.email}</p>
					<p><strong>{$t('user.form.status')}:</strong> {$t(`user.status.${user.status}`)}</p>
					<p><strong>{$t('user.form.phone')}:</strong> {user.contact?.phone ? formatPhoneNumber(user.contact.phone) : '-'}</p>
					<p><strong>{$t('user.profile.lastLogin')}:</strong> {user.lastLogin ? formatDate(user.lastLogin) : '-'}</p>
					<p><strong>{$t('user.profile.createdAt')}:</strong> {formatDate(user.createdAt)}</p>
				</div>
			</CardContent>
		</Card>

		<ConfirmDialog
			bind:open={confirmDelete}
			title={$t('user.profile.confirmDeleteTitle')}
			description={$t('user.profile.confirmDeleteDescription', { name: user.fullName })}
			on:confirm={handleDelete}
			on:cancel={() => (confirmDelete = false)}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('user.profile.userNotFound')}</p>
	</div>
{/if}
