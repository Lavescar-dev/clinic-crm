<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import Button from '$components/ui/button/button.svelte';
	import { PlusCircle, Filter, Calendar, Search } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import { format } from 'date-fns';
	import type { LabOrder, OrderStatus, LabPriority } from '$lib/types/lab';
	import { lab, pendingCollectionOrders, inProgressOrders, pendingReviewOrders, completedOrders } from '$stores/lab';
	import { users } from '$stores/users';
	import { patients } from '$stores/patients';
	import Badge from '$components/ui/badge/badge.svelte';
	import Tabs from '$components/ui/tabs/tabs.svelte';
	import TabsList from '$components/ui/tabs/tabs-list.svelte';
	import TabsTrigger from '$components/ui/tabs/tabs-trigger.svelte';
	import TabsContent from '$components/ui/tabs/tabs-content.svelte';
	import Input from '$components/ui/input/input.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';

	let activeTab = $state('pending-collection');
	let searchQuery = $state('');
	let priorityFilter: LabPriority | 'all' = $state('all');
	let dateFilter = $state('all');

	const priorityOptions = [
		{ value: 'all', label: 'All Priorities' },
		{ value: 'routine', label: 'Routine' },
		{ value: 'urgent', label: 'Urgent' },
		{ value: 'stat', label: 'STAT' }
	];

	const dateOptions = [
		{ value: 'all', label: 'All Dates' },
		{ value: 'today', label: 'Today' },
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' }
	];

	function getStatusBadgeVariant(status: OrderStatus) {
		switch (status) {
			case 'pending':
				return 'outline';
			case 'collected':
				return 'info';
			case 'processing':
				return 'warning';
			case 'completed':
				return 'success';
			case 'cancelled':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function getPriorityBadgeVariant(priority: LabPriority) {
		switch (priority) {
			case 'stat':
				return 'destructive';
			case 'urgent':
				return 'warning';
			case 'routine':
				return 'outline';
			default:
				return 'default';
		}
	}

	function filterOrders(orders: LabOrder[]) {
		let filtered = orders;

		// Priority filter
		if (priorityFilter !== 'all') {
			filtered = filtered.filter(o => o.priority === priorityFilter);
		}

		// Date filter
		if (dateFilter !== 'all') {
			const now = new Date();
			filtered = filtered.filter(o => {
				const orderDate = new Date(o.orderedAt);
				switch (dateFilter) {
					case 'today':
						return orderDate.toDateString() === now.toDateString();
					case 'week':
						const weekAgo = new Date(now);
						weekAgo.setDate(weekAgo.getDate() - 7);
						return orderDate >= weekAgo;
					case 'month':
						const monthAgo = new Date(now);
						monthAgo.setMonth(monthAgo.getMonth() - 1);
						return orderDate >= monthAgo;
					default:
						return true;
				}
			});
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(o =>
				o.orderId.toLowerCase().includes(query) ||
				o.patientName?.toLowerCase().includes(query) ||
				o.doctorName?.toLowerCase().includes(query)
			);
		}

		return filtered;
	}

	let pendingFiltered = $derived(filterOrders($pendingCollectionOrders));
	let inProgressFiltered = $derived(filterOrders($inProgressOrders));
	let pendingReviewFiltered = $derived(filterOrders($pendingReviewOrders));
	let completedFiltered = $derived(filterOrders($completedOrders));
	let allFiltered = $derived(filterOrders($lab.orders));

	function getTestNames(order: LabOrder): string {
		// In a real implementation, we'd look up test names from LAB_TEST_CATALOG
		return order.tests.length > 3
			? `${order.tests.slice(0, 3).join(', ')}... (+${order.tests.length - 3} more)`
			: order.tests.join(', ');
	}

	function handleOrderClick(orderId: string) {
		goto(`/lab/orders/${orderId}`);
	}

	function handleOrderKeydown(event: KeyboardEvent, orderId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleOrderClick(orderId);
		}
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Lab Orders</h1>
			<p class="text-muted-foreground mt-1">Manage laboratory test orders and results</p>
		</div>
		<Button onclick={() => goto('/lab/orders/new')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			New Lab Order
		</Button>
	</div>

	<!-- Filters -->
	<Card>
		<CardContent class="pt-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1 relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by order ID, patient, or doctor..."
						bind:value={searchQuery}
						class="pl-10"
					/>
				</div>
				<FilterDropdown bind:value={priorityFilter} options={priorityOptions} label="Priority" />
				<FilterDropdown bind:value={dateFilter} options={dateOptions} label="Date" />
			</div>
		</CardContent>
	</Card>

	<!-- Tabs with order lists -->
	<Tabs value={activeTab} onValueChange={(v) => activeTab = v || 'pending-collection'}>
		<TabsList class="grid w-full grid-cols-5">
			<TabsTrigger value="pending-collection">
				Pending Collection
				{#if pendingFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{pendingFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="in-progress">
				In Progress
				{#if inProgressFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{inProgressFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="pending-review">
				Pending Review
				{#if pendingReviewFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{pendingReviewFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="completed">
				Completed
				{#if completedFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{completedFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="all">All</TabsTrigger>
		</TabsList>

		<!-- Pending Collection -->
		<TabsContent value="pending-collection">
			<Card>
				<CardHeader>
					<CardTitle>Pending Sample Collection</CardTitle>
				</CardHeader>
				<CardContent>
					{#if pendingFiltered.length > 0}
						<div class="space-y-4">
							{#each pendingFiltered as order (order.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handleOrderClick(order.id)}
									onkeydown={(event) => handleOrderKeydown(event, order.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<p class="font-semibold">{order.orderId}</p>
											<Badge variant={getPriorityBadgeVariant(order.priority)}>{order.priority.toUpperCase()}</Badge>
											<Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{order.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{order.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{order.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Tests:</span>
											<span class="ml-1">{getTestNames(order)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Ordered</p>
										<p class="text-sm font-medium">{format(new Date(order.orderedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">{format(new Date(order.orderedAt), 'HH:mm')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No pending collections</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- In Progress -->
		<TabsContent value="in-progress">
			<Card>
				<CardHeader>
					<CardTitle>In Progress Orders</CardTitle>
				</CardHeader>
				<CardContent>
					{#if inProgressFiltered.length > 0}
						<div class="space-y-4">
							{#each inProgressFiltered as order (order.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handleOrderClick(order.id)}
									onkeydown={(event) => handleOrderKeydown(event, order.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<p class="font-semibold">{order.orderId}</p>
											<Badge variant={getPriorityBadgeVariant(order.priority)}>{order.priority.toUpperCase()}</Badge>
											<Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{order.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{order.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{order.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Tests:</span>
											<span class="ml-1">{getTestNames(order)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Ordered</p>
										<p class="text-sm font-medium">{format(new Date(order.orderedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">{format(new Date(order.orderedAt), 'HH:mm')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No orders in progress</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Pending Review -->
		<TabsContent value="pending-review">
			<Card>
				<CardHeader>
					<CardTitle>Pending Doctor Review</CardTitle>
				</CardHeader>
				<CardContent>
					{#if pendingReviewFiltered.length > 0}
						<div class="space-y-4">
							{#each pendingReviewFiltered as order (order.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handleOrderClick(order.id)}
									onkeydown={(event) => handleOrderKeydown(event, order.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<p class="font-semibold">{order.orderId}</p>
											<Badge variant={getPriorityBadgeVariant(order.priority)}>{order.priority.toUpperCase()}</Badge>
											<Badge variant="warning">Needs Review</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{order.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{order.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{order.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Tests:</span>
											<span class="ml-1">{getTestNames(order)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Ordered</p>
										<p class="text-sm font-medium">{format(new Date(order.orderedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">{format(new Date(order.orderedAt), 'HH:mm')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No orders pending review</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Completed -->
		<TabsContent value="completed">
			<Card>
				<CardHeader>
					<CardTitle>Completed Orders</CardTitle>
				</CardHeader>
				<CardContent>
					{#if completedFiltered.length > 0}
						<div class="space-y-4">
							{#each completedFiltered as order (order.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handleOrderClick(order.id)}
									onkeydown={(event) => handleOrderKeydown(event, order.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<p class="font-semibold">{order.orderId}</p>
											<Badge variant={getPriorityBadgeVariant(order.priority)}>{order.priority.toUpperCase()}</Badge>
											<Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{order.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{order.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{order.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Tests:</span>
											<span class="ml-1">{getTestNames(order)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Ordered</p>
										<p class="text-sm font-medium">{format(new Date(order.orderedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">{format(new Date(order.orderedAt), 'HH:mm')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No completed orders</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- All Orders -->
		<TabsContent value="all">
			<Card>
				<CardHeader>
					<CardTitle>All Lab Orders</CardTitle>
				</CardHeader>
				<CardContent>
					{#if allFiltered.length > 0}
						<div class="space-y-4">
							{#each allFiltered as order (order.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handleOrderClick(order.id)}
									onkeydown={(event) => handleOrderKeydown(event, order.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<p class="font-semibold">{order.orderId}</p>
											<Badge variant={getPriorityBadgeVariant(order.priority)}>{order.priority.toUpperCase()}</Badge>
											<Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{order.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{order.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{order.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Tests:</span>
											<span class="ml-1">{getTestNames(order)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Ordered</p>
										<p class="text-sm font-medium">{format(new Date(order.orderedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">{format(new Date(order.orderedAt), 'HH:mm')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No orders found</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div>
