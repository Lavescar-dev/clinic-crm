<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { page } from '$app/stores';
	import { lab } from '$stores/lab';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import CardDescription from '$components/ui/card/card-description.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import { format } from 'date-fns';
	import type { LabOrder, OrderStatus, LabPriority, LabResult, LabSample } from '$lib/types/lab';
	import { LAB_TEST_CATALOG } from '$lib/types/lab';
	import { ArrowLeft, User, Stethoscope, Calendar, FileText, FlaskConical, CheckCircle, AlertCircle } from 'lucide-svelte';

	let order = $state<LabOrder | undefined>(undefined);
	let orderResults = $state<LabResult[]>([]);
	let orderSample = $state<LabSample | undefined>(undefined);
	let loading = $state(true);

	onMount(() => {
		const orderId = $page.params.id;
		const foundOrder = $lab.orders.find(o => o.id === orderId);

		if (foundOrder) {
			order = foundOrder;
			orderResults = $lab.results.filter(r => r.orderId === orderId);
			orderSample = $lab.samples.find(s => s.orderId === orderId);
		}

		loading = false;
	});

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

	function getResultFlagVariant(flag: string) {
		switch (flag) {
			case 'normal':
				return 'success';
			case 'low':
			case 'high':
				return 'warning';
			case 'critical':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function getTestName(testId: string): string {
		const test = LAB_TEST_CATALOG[testId];
		return test ? test.name : testId;
	}

	async function handleMarkCollected() {
		if (!order) return;

		// Simulate sample collection
		const barcode = `BC-${Date.now()}`;
		const result = await lab.assignSample(order.id, 'current-user-id', 'blood-whole', barcode);

		if (result.success) {
			// Reload order data
			const updatedOrder = $lab.orders.find(o => o.id === order!.id);
			if (updatedOrder) order = updatedOrder;
			orderSample = result.data;
		}
	}

	async function handleMarkProcessing() {
		if (!order || !orderSample) return;

		const result = await lab.processSample(orderSample.id, order.id);

		if (result.success) {
			const updatedOrder = $lab.orders.find(o => o.id === order!.id);
			if (updatedOrder) order = updatedOrder;
		}
	}

	function getStatusTimeline() {
		if (!order) return [];

		const timeline = [
			{
				status: 'pending',
				label: 'Order Placed',
				time: order.orderedAt,
				completed: true
			},
			{
				status: 'collected',
				label: 'Sample Collected',
				time: orderSample?.collectedAt,
				completed: order.status !== 'pending'
			},
			{
				status: 'processing',
				label: 'Processing',
				time: null,
				completed: order.status === 'processing' || order.status === 'completed'
			},
			{
				status: 'completed',
				label: 'Completed',
				time: null,
				completed: order.status === 'completed'
			}
		];

		return timeline;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>Loading...</p>
	</div>
{:else if order}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" onclick={() => goto('/lab/orders')}>
					<ArrowLeft class="h-4 w-4" />
				</Button>
				<div>
					<h1 class="text-3xl font-bold">{order.orderId}</h1>
					<p class="text-muted-foreground">Lab Order Details</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Badge variant={getPriorityBadgeVariant(order.priority)}>{order.priority.toUpperCase()}</Badge>
				<Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column: Order Info & Tests -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Patient & Doctor Info -->
				<Card>
					<CardHeader>
						<CardTitle>Order Information</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="flex items-start gap-3">
								<User class="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p class="text-sm font-medium">Patient</p>
									<a href="/patients/{order.patientId}" class="text-primary hover:underline">
										{order.patientName || 'Unknown'}
									</a>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Stethoscope class="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p class="text-sm font-medium">Ordering Doctor</p>
									<p class="text-sm text-muted-foreground">{order.doctorName || 'Unknown'}</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p class="text-sm font-medium">Ordered Date</p>
									<p class="text-sm text-muted-foreground">
										{format(new Date(order.orderedAt), 'MMM dd, yyyy HH:mm')}
									</p>
								</div>
							</div>
							{#if order.notes}
								<div class="flex items-start gap-3 md:col-span-2">
									<FileText class="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p class="text-sm font-medium">Notes</p>
										<p class="text-sm text-muted-foreground">{order.notes}</p>
									</div>
								</div>
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Tests Ordered -->
				<Card>
					<CardHeader>
						<CardTitle>Tests Ordered</CardTitle>
						<CardDescription>{order.tests.length} test(s) requested</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							{#each order.tests as testId (testId)}
								{@const test = LAB_TEST_CATALOG[testId]}
								{@const result = orderResults.find(r => r.testId === testId)}
								<div class="flex items-center justify-between p-3 border rounded-lg">
									<div class="flex items-center gap-3">
										<FlaskConical class="h-4 w-4 text-muted-foreground" />
										<div>
											<p class="font-medium">{test?.name || testId}</p>
											<p class="text-sm text-muted-foreground">{test?.code || testId}</p>
										</div>
									</div>
									{#if result}
										<Badge variant={getResultFlagVariant(result.flag)}>
											{result.flag}
										</Badge>
									{:else}
										<Badge variant="outline">Pending</Badge>
									{/if}
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Sample Collection Info -->
				{#if orderSample}
					<Card>
						<CardHeader>
							<CardTitle>Sample Collection</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<p class="text-sm font-medium">Barcode</p>
									<p class="text-sm text-muted-foreground font-mono">{orderSample.barcode}</p>
								</div>
								<div>
									<p class="text-sm font-medium">Sample Type</p>
									<p class="text-sm text-muted-foreground">{orderSample.sampleType}</p>
								</div>
								<div>
									<p class="text-sm font-medium">Collected By</p>
									<p class="text-sm text-muted-foreground">{orderSample.collectedByName || 'Unknown'}</p>
								</div>
								<div>
									<p class="text-sm font-medium">Collection Time</p>
									<p class="text-sm text-muted-foreground">
										{format(new Date(orderSample.collectedAt), 'MMM dd, yyyy HH:mm')}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Results -->
				{#if orderResults.length > 0}
					<Card>
						<CardHeader>
							<CardTitle>Lab Results</CardTitle>
							<CardDescription>
								{orderResults.filter(r => r.status === 'verified').length} of {orderResults.length} results verified
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="overflow-x-auto">
								<table class="w-full">
									<thead class="border-b">
										<tr>
											<th class="text-left py-2 px-3">Test</th>
											<th class="text-left py-2 px-3">Result</th>
											<th class="text-left py-2 px-3">Reference Range</th>
											<th class="text-left py-2 px-3">Flag</th>
											<th class="text-left py-2 px-3">Status</th>
										</tr>
									</thead>
									<tbody class="divide-y">
										{#each orderResults as result (result.id)}
											<tr class="hover:bg-muted/50">
												<td class="py-3 px-3">
													<p class="font-medium text-sm">{result.testName || getTestName(result.testId)}</p>
												</td>
												<td class="py-3 px-3">
													<p class="text-sm font-semibold">{result.value} {result.unit}</p>
												</td>
												<td class="py-3 px-3">
													<p class="text-sm text-muted-foreground">{result.referenceRange}</p>
												</td>
												<td class="py-3 px-3">
													<Badge variant={getResultFlagVariant(result.flag)} class="text-xs">
														{result.flag}
													</Badge>
												</td>
												<td class="py-3 px-3">
													{#if result.status === 'verified'}
														<div class="flex items-center gap-1 text-green-600">
															<CheckCircle class="h-4 w-4" />
															<span class="text-xs">Verified</span>
														</div>
													{:else}
														<div class="flex items-center gap-1 text-amber-600">
															<AlertCircle class="h-4 w-4" />
															<span class="text-xs">Pending Review</span>
														</div>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>

			<!-- Right Column: Timeline & Actions -->
			<div class="space-y-6">
				<!-- Status Timeline -->
				<Card>
					<CardHeader>
						<CardTitle>Order Timeline</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each getStatusTimeline() as step, index}
								<div class="flex items-start gap-3">
									<div class="flex flex-col items-center">
										{#if step.completed}
											<div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
												<CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
											</div>
										{:else}
											<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
												<div class="w-3 h-3 rounded-full bg-muted-foreground"></div>
											</div>
										{/if}
										{#if index < getStatusTimeline().length - 1}
											<div class="w-0.5 h-12 {step.completed ? 'bg-green-600' : 'bg-muted'} mt-1"></div>
										{/if}
									</div>
									<div class="flex-1 pt-1">
										<p class="font-medium text-sm">{step.label}</p>
										{#if step.time}
											<p class="text-xs text-muted-foreground">
												{format(new Date(step.time), 'MMM dd, HH:mm')}
											</p>
										{:else if !step.completed}
											<p class="text-xs text-muted-foreground">Pending</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Quick Actions -->
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2">
						{#if order.status === 'pending'}
							<Button class="w-full" onclick={handleMarkCollected}>
								Mark as Collected
							</Button>
						{:else if order.status === 'collected'}
							<Button class="w-full" onclick={handleMarkProcessing}>
								Start Processing
							</Button>
						{/if}

						<Button variant="outline" class="w-full" onclick={() => goto(`/patients/${order.patientId}`)}>
							View Patient Profile
						</Button>

						{#if orderResults.length > 0}
							<Button variant="outline" class="w-full">
								Send to Patient
							</Button>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center p-8 space-y-4">
		<p class="text-lg text-muted-foreground">Lab order not found</p>
		<Button onclick={() => goto('/lab/orders')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Lab Orders
		</Button>
	</div>
{/if}
