<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import FormField from '$components/shared/FormField.svelte';
	import { users as userStore } from '$stores/users';
	import { userSchema, userRoleSchema, userStatusSchema } from '$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { User, UserRole, UserStatus } from '$types';
	import { toast } from 'svelte-sonner';

	let user: User | undefined;
	let loading = true;
	let errors: Record<string, string> = {};

	onMount(async () => {
		const userId = $page.params.id as string;
		const fetchedUser = await userStore.getUserById(userId);
		if (fetchedUser) {
			user = fetchedUser;
		} else {
			toast.error($t('user.profile.userNotFound'));
			goto('/users');
		}
		loading = false;
	});

	const userRoles: { value: UserRole; label: string }[] = [
		{ value: 'admin', label: $t('user.role.admin') },
		{ value: 'doctor', label: $t('user.role.doctor') },
		{ value: 'nurse', label: $t('user.role.nurse') },
		{ value: 'receptionist', label: $t('user.role.receptionist') },
		{ value: 'pharmacist', label: $t('user.role.pharmacist') }
	];

	const userStatuses: { value: UserStatus; label: string }[] = [
		{ value: 'active', label: $t('user.status.active') },
		{ value: 'inactive', label: $t('user.status.inactive') },
		{ value: 'suspended', label: $t('user.status.suspended') }
	];

	async function handleSubmit() {
		if (!user) return;

		// client-side validation
		const result = userSchema.safeParse(user);
		if (!result.success) {
			errors = result.error.formErrors.fieldErrors;
			toast.error($t('common.formErrors'));
			return;
		}
		
		await userStore.updateUser(user.id, user);
		toast.success($t('user.form.updateSuccess', { name: user.fullName }));
		goto(`/users/${user.id}`);
	}

	$: user?.firstName, (errors.firstName = '');
	$: user?.lastName, (errors.lastName = '');
	$: user?.email, (errors.email = '');
	$: user?.role, (errors.role = '');
	$: user?.status, (errors.status = '');
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if user}
	<div class="space-y-6 p-4 md:p-6">
		<h1 class="text-3xl font-bold">{$t('user.form.editUserTitle', { name: user.fullName })}</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<Card>
				<CardHeader><CardTitle>{$t('user.form.personalInfo')}</CardTitle></CardHeader>
				<CardContent class="grid gap-4 md:grid-cols-2">
					<FormField label={$t('user.form.firstName')} error={errors.firstName}>
						<Input bind:value={user.firstName} placeholder={$t('user.form.firstNamePlaceholder')} />
					</FormField>
					<FormField label={$t('user.form.lastName')} error={errors.lastName}>
						<Input bind:value={user.lastName} placeholder={$t('user.form.lastNamePlaceholder')} />
					</FormField>
					<FormField label={$t('user.form.email')} error={errors.email}>
						<Input bind:value={user.email} type="email" placeholder={$t('user.form.emailPlaceholder')} />
					</FormField>
					<FormField label={$t('user.form.role')} error={errors.role}>
						<Select bind:value={user.role}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder={$t('user.form.selectRole')} />
							</SelectTrigger>
							<SelectContent>
								{#each userRoles as role}
									<SelectItem value={role.value}>{role.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</FormField>
					<FormField label={$t('user.form.status')} error={errors.status}>
						<Select bind:value={user.status}>
							<SelectTrigger class="w-full">
								<SelectValue placeholder={$t('user.form.selectStatus')} />
							</SelectTrigger>
							<SelectContent>
								{#each userStatuses as status}
									<SelectItem value={status.value}>{status.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</FormField>
					<FormField label={$t('user.form.phone')} error={errors['contact.phone']}>
						<Input bind:value={user.contact.phone} type="tel" placeholder={$t('user.form.phonePlaceholder')} />
					</FormField>
				</CardContent>
			</Card>

			<div class="flex justify-end gap-2">
				<Button variant="outline" on:click={() => goto(`/users/${user.id}`)}>{$t('common.cancel')}</Button>
				<Button type="submit">{$t('user.form.updateUser')}</Button>
			</div>
		</form>
	</div>
{:else}
	<div class="flex items-center justify-center p-8">
		<p>{$t('user.profile.userNotFound')}</p>
	</div>
{/if}
