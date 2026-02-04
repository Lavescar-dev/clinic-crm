<script lang="ts">
	import { t } from '$i18n';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$components/ui/select';
	import FormField from '$components/shared/FormField.svelte';
	import { users as userStore } from '$stores/users';
	import { createUserDtoSchema, userRoleSchema } from '$types';
	import { nanoid } from 'nanoid';
	import { goto } from '$app/navigation';
	import type { UserRole } from '$types';
	import { toast } from 'svelte-sonner';

	let user: Partial<createUserDtoSchema> = {
		id: nanoid(),
		email: '',
		password: '', // Should be hashed in a real app
		firstName: '',
		lastName: '',
		role: undefined,
		contact: {
			email: '',
			phone: ''
		},
		createdAt: new Date(),
		updatedAt: new Date()
	};

	let errors: Record<string, string> = {};

	const userRoles: { value: UserRole; label: string }[] = [
		{ value: 'admin', label: $t('user.role.admin') },
		{ value: 'doctor', label: $t('user.role.doctor') },
		{ value: 'nurse', label: $t('user.role.nurse') },
		{ value: 'receptionist', label: $t('user.role.receptionist') },
		{ value: 'pharmacist', label: $t('user.role.pharmacist') }
	];

	async function handleSubmit() {
		// client-side validation
		const result = createUserDtoSchema.safeParse(user);
		if (!result.success) {
			errors = result.error.formErrors.fieldErrors;
			toast.error($t('common.formErrors'));
			return;
		}
		
		await userStore.createUser(user as createUserDtoSchema);
		toast.success($t('user.form.addSuccess', { name: `${user.firstName} ${user.lastName}` }));
		goto('/users');
	}

	$: user.firstName, (errors.firstName = '');
	$: user.lastName, (errors.lastName = '');
	$: user.email, (errors.email = '');
	$: user.role, (errors.role = '');
	$: user.password, (errors.password = '');
</script>

<div class="space-y-6 p-4 md:p-6">
	<h1 class="text-3xl font-bold">{$t('user.form.addUserTitle')}</h1>

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
				<FormField label={$t('user.form.password')} error={errors.password}>
					<Input bind:value={user.password} type="password" placeholder={$t('user.form.passwordPlaceholder')} />
				</FormField>
				<FormField label={$t('user.form.phone')} error={errors['contact.phone']}>
					<Input bind:value={user.contact.phone} type="tel" placeholder={$t('user.form.phonePlaceholder')} />
				</FormField>
			</CardContent>
		</Card>

		<div class="flex justify-end gap-2">
			<Button variant="outline" on:click={() => goto('/users')}>{$t('common.cancel')}</Button>
			<Button type="submit">{$t('user.form.addUser')}</Button>
		</div>
	</form>
</div>
