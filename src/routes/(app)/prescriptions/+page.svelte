<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import Button from '$components/ui/button/button.svelte';
	import { PlusCircle, Filter, Calendar, Search, Pill, AlertTriangle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import { format } from 'date-fns';
	import type { PrescriptionTracking, PrescriptionStatus } from '$lib/types/prescription';
	import {
		prescriptions,
		activePrescriptions,
		filledPrescriptions,
		expiredPrescriptions,
		prescriptionsWithInteractions
	} from '$stores/prescriptions';
	import Badge from '$components/ui/badge/badge.svelte';
	import Tabs from '$components/ui/tabs/tabs.svelte';
	import TabsList from '$components/ui/tabs/tabs-list.svelte';
	import TabsTrigger from '$components/ui/tabs/tabs-trigger.svelte';
	import TabsContent from '$components/ui/tabs/tabs-content.svelte';
	import Input from '$components/ui/input/input.svelte';
	import FilterDropdown from '$components/shared/FilterDropdown.svelte';

	let activeTab = $state('active');
	let searchQuery = $state('');
	let statusFilter: PrescriptionStatus | 'all' = $state('all');
	let dateFilter = $state('all');

	const statusOptions = [
		{ value: 'all', label: 'All Status' },
		{ value: 'active', label: 'Active' },
		{ value: 'filled', label: 'Filled' },
		{ value: 'expired', label: 'Expired' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	const dateOptions = [
		{ value: 'all', label: 'All Dates' },
		{ value: 'today', label: 'Today' },
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' }
	];

	function getStatusBadgeVariant(status: PrescriptionStatus) {
		switch (status) {
			case 'active':
				return 'success';
			case 'filled':
				return 'info';
			case 'expired':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function filterPrescriptions(rxList: PrescriptionTracking[]) {
		let filtered = rxList;

		// Status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(rx => rx.status === statusFilter);
		}

		// Date filter
		if (dateFilter !== 'all') {
			const now = new Date();
			filtered = filtered.filter(rx => {
				const issuedDate = new Date(rx.issuedAt);
				switch (dateFilter) {
					case 'today':
						return issuedDate.toDateString() === now.toDateString();
					case 'week':
						const weekAgo = new Date(now);
						weekAgo.setDate(weekAgo.getDate() - 7);
						return issuedDate >= weekAgo;
					case 'month':
						const monthAgo = new Date(now);
						monthAgo.setMonth(monthAgo.getMonth() - 1);
						return issuedDate >= monthAgo;
					default:
						return true;
				}
			});
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(rx =>
				rx.prescriptionNumber.toLowerCase().includes(query) ||
				rx.patientName?.toLowerCase().includes(query) ||
				rx.doctorName?.toLowerCase().includes(query) ||
				rx.medications.some(m =>
					m.drugName.toLowerCase().includes(query) ||
					m.genericName?.toLowerCase().includes(query)
				)
			);
		}

		return filtered;
	}

	let activeFiltered = $derived(filterPrescriptions($activePrescriptions));
	let filledFiltered = $derived(filterPrescriptions($filledPrescriptions));
	let expiredFiltered = $derived(filterPrescriptions($expiredPrescriptions));
	let allFiltered = $derived(filterPrescriptions($prescriptions.prescriptions));

	function getMedicationSummary(prescription: PrescriptionTracking): string {
		return prescription.medications.length > 2
			? `${prescription.medications.slice(0, 2).map(m => m.drugName).join(', ')}... (+${prescription.medications.length - 2} more)`
			: prescription.medications.map(m => m.drugName).join(', ');
	}

	function handlePrescriptionClick(prescriptionId: string) {
		goto(`/prescriptions/${prescriptionId}`);
	}

	function handlePrescriptionKeydown(event: KeyboardEvent, prescriptionId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handlePrescriptionClick(prescriptionId);
		}
	}

	// Check if prescription has interactions
	function hasInteractions(prescriptionId: string): boolean {
		return $prescriptionsWithInteractions.some(item => item.prescription.id === prescriptionId);
	}

	// Get interaction severity for a prescription
	function getInteractionSeverity(prescriptionId: string): 'major' | 'moderate' | 'minor' | null {
		const item = $prescriptionsWithInteractions.find(item => item.prescription.id === prescriptionId);
		if (!item) return null;

		const hasMajor = item.interactions.some(i => i.severity === 'major' || i.severity === 'contraindicated');
		if (hasMajor) return 'major';

		const hasModerate = item.interactions.some(i => i.severity === 'moderate');
		if (hasModerate) return 'moderate';

		return 'minor';
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Prescriptions</h1>
			<p class="text-muted-foreground mt-1">Manage patient prescriptions and medication orders</p>
		</div>
		<Button onclick={() => goto('/emr')}>
			<PlusCircle class="mr-2 h-4 w-4" />
			New Prescription
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
						placeholder="Search by prescription #, patient, doctor, or medication..."
						bind:value={searchQuery}
						class="pl-10"
					/>
				</div>
				<FilterDropdown bind:value={statusFilter} options={statusOptions} label="Status" />
				<FilterDropdown bind:value={dateFilter} options={dateOptions} label="Date" />
			</div>
		</CardContent>
	</Card>

	<!-- Tabs with prescription lists -->
	<Tabs value={activeTab} onValueChange={(v) => activeTab = v || 'active'}>
		<TabsList class="grid w-full grid-cols-4">
			<TabsTrigger value="active">
				Active
				{#if activeFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{activeFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="filled">
				Filled
				{#if filledFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{filledFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="expired">
				Expired
				{#if expiredFiltered.length > 0}
					<Badge variant="secondary" class="ml-2">{expiredFiltered.length}</Badge>
				{/if}
			</TabsTrigger>
			<TabsTrigger value="all">All</TabsTrigger>
		</TabsList>

		<!-- Active Prescriptions -->
		<TabsContent value="active">
			<Card>
				<CardHeader>
					<CardTitle>Active Prescriptions</CardTitle>
				</CardHeader>
				<CardContent>
					{#if activeFiltered.length > 0}
						<div class="space-y-4">
							{#each activeFiltered as prescription (prescription.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handlePrescriptionClick(prescription.id)}
									onkeydown={(event) => handlePrescriptionKeydown(event, prescription.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<Pill class="h-4 w-4 text-muted-foreground" />
											<p class="font-semibold">{prescription.prescriptionNumber}</p>
											<Badge variant={getStatusBadgeVariant(prescription.status)}>{prescription.status}</Badge>
											{#if hasInteractions(prescription.id)}
												{@const severity = getInteractionSeverity(prescription.id)}
												<Badge variant={severity === 'major' ? 'destructive' : severity === 'moderate' ? 'warning' : 'outline'}>
													<AlertTriangle class="h-3 w-3 mr-1" />
													Interaction
												</Badge>
											{/if}
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{prescription.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{prescription.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{prescription.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Medications:</span>
											<span class="ml-1">{getMedicationSummary(prescription)}</span>
										</p>
										{#if prescription.diagnosisName}
											<p class="text-sm">
												<span class="text-muted-foreground">Diagnosis:</span>
												<span class="ml-1">{prescription.diagnosisName}</span>
											</p>
										{/if}
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Issued</p>
										<p class="text-sm font-medium">{format(new Date(prescription.issuedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">Valid until</p>
										<p class="text-xs font-medium">{format(new Date(prescription.validUntil), 'MMM dd, yyyy')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No active prescriptions</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Filled Prescriptions -->
		<TabsContent value="filled">
			<Card>
				<CardHeader>
					<CardTitle>Filled Prescriptions</CardTitle>
				</CardHeader>
				<CardContent>
					{#if filledFiltered.length > 0}
						<div class="space-y-4">
							{#each filledFiltered as prescription (prescription.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => handlePrescriptionClick(prescription.id)}
									onkeydown={(event) => handlePrescriptionKeydown(event, prescription.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<Pill class="h-4 w-4 text-muted-foreground" />
											<p class="font-semibold">{prescription.prescriptionNumber}</p>
											<Badge variant={getStatusBadgeVariant(prescription.status)}>{prescription.status}</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{prescription.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{prescription.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{prescription.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Medications:</span>
											<span class="ml-1">{getMedicationSummary(prescription)}</span>
										</p>
										{#if prescription.pharmacyFilled}
											<p class="text-sm">
												<span class="text-muted-foreground">Pharmacy:</span>
												<span class="ml-1">{prescription.pharmacyFilled.pharmacyName}</span>
											</p>
										{/if}
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Issued</p>
										<p class="text-sm font-medium">{format(new Date(prescription.issuedAt), 'MMM dd, yyyy')}</p>
										{#if prescription.pharmacyFilled}
											<p class="text-xs text-muted-foreground">Filled</p>
											<p class="text-xs font-medium">{format(new Date(prescription.pharmacyFilled.filledAt), 'MMM dd, yyyy')}</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No filled prescriptions</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Expired Prescriptions -->
		<TabsContent value="expired">
			<Card>
				<CardHeader>
					<CardTitle>Expired Prescriptions</CardTitle>
				</CardHeader>
				<CardContent>
					{#if expiredFiltered.length > 0}
						<div class="space-y-4">
							{#each expiredFiltered as prescription (prescription.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors opacity-75"
									onclick={() => handlePrescriptionClick(prescription.id)}
									onkeydown={(event) => handlePrescriptionKeydown(event, prescription.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<Pill class="h-4 w-4 text-muted-foreground" />
											<p class="font-semibold">{prescription.prescriptionNumber}</p>
											<Badge variant={getStatusBadgeVariant(prescription.status)}>{prescription.status}</Badge>
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{prescription.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{prescription.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{prescription.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Medications:</span>
											<span class="ml-1">{getMedicationSummary(prescription)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Expired</p>
										<p class="text-sm font-medium">{format(new Date(prescription.validUntil), 'MMM dd, yyyy')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No expired prescriptions</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<!-- All Prescriptions -->
		<TabsContent value="all">
			<Card>
				<CardHeader>
					<CardTitle>All Prescriptions</CardTitle>
				</CardHeader>
				<CardContent>
					{#if allFiltered.length > 0}
						<div class="space-y-4">
							{#each allFiltered as prescription (prescription.id)}
								<div
									class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
									class:opacity-75={prescription.status === 'expired' || prescription.status === 'cancelled'}
									onclick={() => handlePrescriptionClick(prescription.id)}
									onkeydown={(event) => handlePrescriptionKeydown(event, prescription.id)}
									role="button"
									tabindex="0"
								>
									<div class="flex-1 space-y-1">
										<div class="flex items-center gap-2">
											<Pill class="h-4 w-4 text-muted-foreground" />
											<p class="font-semibold">{prescription.prescriptionNumber}</p>
											<Badge variant={getStatusBadgeVariant(prescription.status)}>{prescription.status}</Badge>
											{#if hasInteractions(prescription.id) && prescription.status === 'active'}
												{@const severity = getInteractionSeverity(prescription.id)}
												<Badge variant={severity === 'major' ? 'destructive' : severity === 'moderate' ? 'warning' : 'outline'}>
													<AlertTriangle class="h-3 w-3 mr-1" />
													Interaction
												</Badge>
											{/if}
										</div>
										<p class="text-sm">
											<span class="text-muted-foreground">Patient:</span>
											<a href="/patients/{prescription.patientId}" class="text-primary hover:underline ml-1" onclick={(e) => e.stopPropagation()}>
												{prescription.patientName || 'Unknown'}
											</a>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Doctor:</span>
											<span class="ml-1">{prescription.doctorName || 'Unknown'}</span>
										</p>
										<p class="text-sm">
											<span class="text-muted-foreground">Medications:</span>
											<span class="ml-1">{getMedicationSummary(prescription)}</span>
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Issued</p>
										<p class="text-sm font-medium">{format(new Date(prescription.issuedAt), 'MMM dd, yyyy')}</p>
										<p class="text-xs text-muted-foreground">
											{prescription.status === 'expired' ? 'Expired' : 'Valid until'}
										</p>
										<p class="text-xs font-medium">{format(new Date(prescription.validUntil), 'MMM dd, yyyy')}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">No prescriptions found</p>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div>
