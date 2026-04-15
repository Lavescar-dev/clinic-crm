<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Badge } from '$components/ui/badge';
	import * as Lucide from 'lucide-svelte';
	import type { ShiftSchedule, ShiftType } from '$types';

	// Props
	interface Props {
		shifts: ShiftSchedule[];
		view?: 'week' | 'month';
		onShiftClick?: (shift: ShiftSchedule) => void;
		onCellClick?: (staffId: string, date: Date) => void;
		class?: string;
	}

	let {
		shifts = [],
		view = $bindable('week'),
		onShiftClick,
		onCellClick,
		class: className = ''
	}: Props = $props();

	// State
	let currentDate = $state(new Date());

	// Shift type colors
	const shiftTypeColors: Record<ShiftType, string> = {
		Morning: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
		Afternoon: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
		Night: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
		OnCall: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
	};

	// Get start of week (Monday)
	function getStartOfWeek(date: Date): Date {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		d.setDate(diff);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	// Get week days
	function getWeekDays(startDate: Date): Date[] {
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(startDate);
			day.setDate(startDate.getDate() + i);
			days.push(day);
		}
		return days;
	}

	// Get month days
	function getMonthDays(date: Date): Date[] {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const days: Date[] = [];

		// Add days from previous month to fill the first week
		const firstDayOfWeek = firstDay.getDay();
		const startDay = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;

		for (let i = startDay; i <= lastDay.getDate(); i++) {
			const day = new Date(year, month, i);
			days.push(day);
		}

		// Add days from next month to complete the last week
		const remainingDays = 7 - (days.length % 7);
		if (remainingDays < 7) {
			for (let i = 1; i <= remainingDays; i++) {
				const day = new Date(year, month + 1, i);
				days.push(day);
			}
		}

		return days;
	}

	// Get unique staff IDs from shifts
	const uniqueStaffIds = $derived(() => {
		const staffIds = new Set(shifts.map(s => s.staffId));
		return Array.from(staffIds);
	});

	// Get shifts for a specific date and staff
	function getShiftsForDateAndStaff(date: Date, staffId: string): ShiftSchedule[] {
		return shifts.filter(shift => {
			const shiftDate = new Date(shift.date);
			return (
				shiftDate.toDateString() === date.toDateString() &&
				shift.staffId === staffId
			);
		});
	}

	// Get all shifts for a specific date
	function getShiftsForDate(date: Date): ShiftSchedule[] {
		return shifts.filter(shift => {
			const shiftDate = new Date(shift.date);
			return shiftDate.toDateString() === date.toDateString();
		});
	}

	// Navigate to previous period
	function navigatePrevious() {
		const newDate = new Date(currentDate);
		if (view === 'week') {
			newDate.setDate(newDate.getDate() - 7);
		} else {
			newDate.setMonth(newDate.getMonth() - 1);
		}
		currentDate = newDate;
	}

	// Navigate to next period
	function navigateNext() {
		const newDate = new Date(currentDate);
		if (view === 'week') {
			newDate.setDate(newDate.getDate() + 7);
		} else {
			newDate.setMonth(newDate.getMonth() + 1);
		}
		currentDate = newDate;
	}

	// Navigate to today
	function navigateToday() {
		currentDate = new Date();
	}

	// Format date for display
	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	// Format month/year for header
	function formatPeriod(): string {
		if (view === 'week') {
			const start = getStartOfWeek(currentDate);
			const end = new Date(start);
			end.setDate(end.getDate() + 6);
			return `${formatDate(start)} - ${formatDate(end)}, ${currentDate.getFullYear()}`;
		} else {
			return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		}
	}

	// Check if date is today
	function isToday(date: Date): boolean {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}

	// Check if date is in current month (for month view)
	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentDate.getMonth();
	}

	// Handle shift click
	function handleShiftClick(shift: ShiftSchedule) {
		if (onShiftClick) {
			onShiftClick(shift);
		}
	}

	// Handle cell click
	function handleCellClick(staffId: string, date: Date) {
		if (onCellClick) {
			onCellClick(staffId, date);
		}
	}

	// Get days to display based on view
	const daysToDisplay = $derived(
		view === 'week'
			? getWeekDays(getStartOfWeek(currentDate))
			: getMonthDays(currentDate)
	);

	const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
</script>

<Card class={className}>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle>Shift Calendar</CardTitle>

			<div class="flex items-center gap-2">
				<!-- View Toggle -->
				<div class="flex gap-1 border rounded-md p-1">
					<Button
						variant={view === 'week' ? 'default' : 'ghost'}
						size="sm"
						onclick={() => view = 'week'}
					>
						Week
					</Button>
					<Button
						variant={view === 'month' ? 'default' : 'ghost'}
						size="sm"
						onclick={() => view = 'month'}
					>
						Month
					</Button>
				</div>

				<!-- Navigation -->
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={navigatePrevious}>
						<Lucide.ChevronLeft class="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm" onclick={navigateToday}>
						Today
					</Button>
					<Button variant="outline" size="sm" onclick={navigateNext}>
						<Lucide.ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>

		<div class="text-sm text-muted-foreground">
			{formatPeriod()}
		</div>
	</CardHeader>

	<CardContent>
		{#if view === 'week'}
			<!-- Weekly View - Roster Grid -->
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr>
							<th class="border p-2 text-left text-sm font-medium bg-muted/50 w-32">
								Staff
							</th>
							{#each daysToDisplay as day}
								<th class="border p-2 text-center text-sm font-medium bg-muted/50 min-w-[120px]">
									<div class="font-semibold">{dayNames[day.getDay() === 0 ? 6 : day.getDay() - 1]}</div>
									<div class="text-xs text-muted-foreground font-normal">
										{formatDate(day)}
									</div>
									{#if isToday(day)}
										<div class="text-xs text-primary font-semibold">Today</div>
									{/if}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each uniqueStaffIds() as staffId}
							<tr>
								<td class="border p-2 text-sm font-medium bg-muted/30">
									Staff {staffId.slice(-6)}
								</td>
								{#each daysToDisplay as day}
									<td
										class="border p-1 align-top cursor-pointer hover:bg-muted/50 transition-colors"
										onclick={() => handleCellClick(staffId, day)}
									>
										<div class="flex flex-col gap-1">
											{#each getShiftsForDateAndStaff(day, staffId) as shift}
												<button
													class={`text-xs px-2 py-1 rounded border ${shiftTypeColors[shift.shiftType]} transition-colors w-full text-left`}
													onclick={(e) => {
														e.stopPropagation();
														handleShiftClick(shift);
													}}
												>
													<div class="font-semibold">{shift.shiftType}</div>
													<div class="text-xs opacity-75">
														{shift.startTime} - {shift.endTime}
													</div>
													{#if shift.status === 'Cancelled'}
														<div class="text-xs text-red-600 font-semibold">Cancelled</div>
													{/if}
												</button>
											{/each}
										</div>
									</td>
								{/each}
							</tr>
						{/each}

						{#if uniqueStaffIds().length === 0}
							<tr>
								<td colspan="8" class="border p-8 text-center text-muted-foreground">
									No staff shifts to display
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Legend -->
			<div class="mt-4 flex flex-wrap gap-3">
				<div class="text-sm font-medium">Shift Types:</div>
				{#each Object.entries(shiftTypeColors) as [type, colorClass]}
					<Badge variant="outline" class={colorClass}>
						{type}
					</Badge>
				{/each}
			</div>
		{:else}
			<!-- Monthly View - Calendar Grid -->
			<div class="grid grid-cols-7 gap-2">
				<!-- Day headers -->
				{#each dayNames as dayName}
					<div class="text-center text-sm font-medium p-2 bg-muted/50 rounded">
						{dayName}
					</div>
				{/each}

				<!-- Calendar days -->
				{#each daysToDisplay as day}
					<div
						class={`border rounded p-2 min-h-[100px] ${isToday(day) ? 'border-primary border-2 bg-primary/5' : ''} ${!isCurrentMonth(day) ? 'bg-muted/20 text-muted-foreground' : 'hover:bg-muted/50 cursor-pointer'} transition-colors`}
					>
						<div class="text-sm font-semibold mb-1">
							{day.getDate()}
						</div>

						<div class="flex flex-col gap-1">
							{#each getShiftsForDate(day).slice(0, 3) as shift}
								<button
									class={`text-xs px-1 py-0.5 rounded ${shiftTypeColors[shift.shiftType]} transition-colors text-left truncate`}
									onclick={() => handleShiftClick(shift)}
									title={`${shift.shiftType}: ${shift.startTime} - ${shift.endTime}`}
								>
									{shift.shiftType}
								</button>
							{/each}

							{#if getShiftsForDate(day).length > 3}
								<div class="text-xs text-muted-foreground">
									+{getShiftsForDate(day).length - 3} more
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Legend -->
			<div class="mt-4 flex flex-wrap gap-3">
				<div class="text-sm font-medium">Shift Types:</div>
				{#each Object.entries(shiftTypeColors) as [type, colorClass]}
					<Badge variant="outline" class={colorClass}>
						{type}
					</Badge>
				{/each}
			</div>
		{/if}

		<!-- Shift Coverage Summary -->
		<div class="mt-6 p-4 bg-muted/30 rounded-lg">
			<div class="text-sm font-medium mb-2">Coverage Summary</div>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div>
					<div class="text-xs text-muted-foreground">Total Shifts</div>
					<div class="text-lg font-semibold">
						{view === 'week'
							? shifts.filter(s => {
									const shiftDate = new Date(s.date);
									return daysToDisplay.some(d => d.toDateString() === shiftDate.toDateString());
								}).length
							: shifts.filter(s => {
									const shiftDate = new Date(s.date);
									return shiftDate.getMonth() === currentDate.getMonth() &&
										   shiftDate.getFullYear() === currentDate.getFullYear();
								}).length
						}
					</div>
				</div>
				<div>
					<div class="text-xs text-muted-foreground">Staff Members</div>
					<div class="text-lg font-semibold">{uniqueStaffIds().length}</div>
				</div>
				<div>
					<div class="text-xs text-muted-foreground">Morning Shifts</div>
					<div class="text-lg font-semibold text-blue-600">
						{shifts.filter(s => s.shiftType === 'Morning').length}
					</div>
				</div>
				<div>
					<div class="text-xs text-muted-foreground">Night Shifts</div>
					<div class="text-lg font-semibold text-purple-600">
						{shifts.filter(s => s.shiftType === 'Night').length}
					</div>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
