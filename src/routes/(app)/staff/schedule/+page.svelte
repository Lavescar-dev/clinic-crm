<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ShiftCalendar from '$components/staff/ShiftCalendar.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import { t } from '$i18n';
	import { shifts as shiftStore } from '$stores/shifts';
	import { staff as staffStore } from '$stores/staff';
	import type { ShiftSchedule, Staff } from '$types';
	import { Calendar, Users, Clock, AlertCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let shifts: ShiftSchedule[] = [];
	let staff: Staff[] = [];
	let loading = true;
	let selectedShift: ShiftSchedule | null = null;

	onMount(async () => {
		// Load shifts and staff data
		await shiftStore.loadShifts();
		await staffStore.loadStaff();

		shifts = $shiftStore.data;
		staff = $staffStore.data;
		loading = false;
	});

	function handleShiftClick(shift: ShiftSchedule) {
		selectedShift = shift;
		// Could open a modal or side panel with shift details
		console.log('Shift clicked:', shift);
	}

	function handleCellClick(staffId: string, date: Date) {
		// Could open a modal to create a new shift
		console.log('Cell clicked:', { staffId, date });
	}

	// Calculate some summary statistics
	$: totalShifts = shifts.length;
	$: upcomingShifts = shifts.filter(
		(s) => s.status === 'Scheduled' && new Date(s.date) >= new Date()
	).length;
	$: activeStaff = staff.filter((s) => s.status === 'Active').length;
	$: shiftsToday = shifts.filter((s) => {
		const today = new Date();
		const shiftDate = new Date(s.date);
		return (
			shiftDate.getDate() === today.getDate() &&
			shiftDate.getMonth() === today.getMonth() &&
			shiftDate.getFullYear() === today.getFullYear()
		);
	}).length;
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Shift Schedule</h1>
			<p class="text-muted-foreground mt-1">Manage staff shifts and availability</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" on:click={() => goto('/staff')}>
				<Users class="mr-2 h-4 w-4" />
				View Staff
			</Button>
			<Button on:click={() => console.log('Create shift')}>
				<Calendar class="mr-2 h-4 w-4" />
				Create Shift
			</Button>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Shifts</CardTitle>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{totalShifts}</div>
				<p class="text-xs text-muted-foreground">All scheduled shifts</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Upcoming Shifts</CardTitle>
				<Clock class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{upcomingShifts}</div>
				<p class="text-xs text-muted-foreground">Scheduled for future</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Active Staff</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{activeStaff}</div>
				<p class="text-xs text-muted-foreground">Available for scheduling</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Today's Shifts</CardTitle>
				<AlertCircle class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{shiftsToday}</div>
				<p class="text-xs text-muted-foreground">Staff on duty today</p>
			</CardContent>
		</Card>
	</div>

	<!-- Shift Legend -->
	<Card>
		<CardHeader>
			<CardTitle class="text-sm">Shift Types</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="flex gap-4 flex-wrap">
				<div class="flex items-center gap-2">
					<Badge class="bg-blue-100 text-blue-800 border-blue-200">Morning</Badge>
					<span class="text-sm text-muted-foreground">08:00 - 16:00</span>
				</div>
				<div class="flex items-center gap-2">
					<Badge class="bg-orange-100 text-orange-800 border-orange-200">Afternoon</Badge>
					<span class="text-sm text-muted-foreground">16:00 - 00:00</span>
				</div>
				<div class="flex items-center gap-2">
					<Badge class="bg-purple-100 text-purple-800 border-purple-200">Night</Badge>
					<span class="text-sm text-muted-foreground">00:00 - 08:00</span>
				</div>
				<div class="flex items-center gap-2">
					<Badge class="bg-green-100 text-green-800 border-green-200">On Call</Badge>
					<span class="text-sm text-muted-foreground">As needed</span>
				</div>
			</div>
		</CardContent>
	</Card>

	{#if loading}
		<div class="flex items-center justify-center p-8">
			<p>{$t('common.loading')}</p>
		</div>
	{:else}
		<!-- Shift Calendar Component -->
		<ShiftCalendar
			{shifts}
			onShiftClick={handleShiftClick}
			onCellClick={handleCellClick}
			class="w-full"
		/>
	{/if}

	<!-- Selected Shift Details (if any) -->
	{#if selectedShift}
		<Card>
			<CardHeader>
				<CardTitle>Shift Details</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<p><strong>Staff ID:</strong> {selectedShift.staffId}</p>
				<p><strong>Date:</strong> {new Date(selectedShift.date).toLocaleDateString()}</p>
				<p><strong>Time:</strong> {selectedShift.startTime} - {selectedShift.endTime}</p>
				<p><strong>Type:</strong> {selectedShift.shiftType}</p>
				<p><strong>Department:</strong> {selectedShift.assignedDepartment}</p>
				<p><strong>Status:</strong> {selectedShift.status}</p>
				{#if selectedShift.notes}
					<p><strong>Notes:</strong> {selectedShift.notes}</p>
				{/if}
				<div class="flex gap-2 mt-4">
					<Button size="sm" variant="outline">Edit Shift</Button>
					<Button size="sm" variant="destructive">Cancel Shift</Button>
					<Button size="sm" variant="ghost" on:click={() => (selectedShift = null)}
						>Close</Button
					>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
