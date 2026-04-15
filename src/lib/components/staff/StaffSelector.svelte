<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$components/ui/select';
	import { staff as staffStore, activeStaff } from '$stores/staff';
	import { users as userStore } from '$stores/users';
	import type { Role, Department, Staff } from '$types';

	interface Props {
		value?: string;
		placeholder?: string;
		filterByRole?: Role;
		filterByDepartment?: Department;
		onlyActive?: boolean;
		disabled?: boolean;
		class?: string;
		onChange?: (staffId: string) => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Select Staff',
		filterByRole,
		filterByDepartment,
		onlyActive = true,
		disabled = false,
		class: className = '',
		onChange
	}: Props = $props();

	// Derived filtered staff list
	let filteredStaffList = $derived.by(() => {
		let staffList = onlyActive ? $activeStaff : $staffStore.data;

		// Filter by role if specified
		if (filterByRole) {
			staffList = staffList.filter((s) => s.role === filterByRole);
		}

		// Filter by department if specified
		if (filterByDepartment) {
			staffList = staffList.filter((s) => s.department === filterByDepartment);
		}

		return staffList;
	});

	// Helper to get staff member's display name
	function getStaffDisplayName(staffMember: Staff): string {
		const user = $userStore.data.find((u) => u.id === staffMember.userId);
		if (user) {
			return `${user.firstName} ${user.lastName} (${staffMember.role})`;
		}
		return `${staffMember.role} - ${staffMember.department}`;
	}

	function handleValueChange(newValue: string | undefined) {
		if (newValue) {
			value = newValue;
			onChange?.(newValue);
		}
	}

	onMount(() => {
		// Ensure staff data is loaded
		if ($staffStore.data.length === 0) {
			staffStore.loadStaff();
		}
		if ($userStore.data.length === 0) {
			userStore.loadUsers();
		}
	});
</script>

<Select bind:value onValueChange={handleValueChange} {disabled}>
	<SelectTrigger class={`w-full ${className}`}>
		<SelectValue {placeholder} />
	</SelectTrigger>
	<SelectContent>
		{#if filteredStaffList.length === 0}
			<div class="px-2 py-6 text-center text-sm text-muted-foreground">No staff members found</div>
		{:else}
			{#each filteredStaffList as staffMember (staffMember.id)}
				<SelectItem value={staffMember.id}>
					{getStaffDisplayName(staffMember)}
				</SelectItem>
			{/each}
		{/if}
	</SelectContent>
</Select>
