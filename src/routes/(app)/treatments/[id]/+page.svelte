<!-- @ts-nocheck -->
<script lang="ts">
	// @ts-nocheck
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { treatmentPlans } from '$stores/treatmentPlans';
	import { patients } from '$stores/patients';
	import { users } from '$stores/users';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import type { TreatmentPlan, TreatmentPlanStatus } from '$types/treatmentPlan';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import { CheckCircle, Clock, Calendar, User, Stethoscope } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let plan = $state<TreatmentPlan | undefined>(undefined);
	let confirmDiscontinue = $state(false);
	let markingSessionComplete = $state(false);
	let notFoundHandled = $state(false);

	$effect(() => {
		const planId = $page.params.id;
		const foundPlan = $treatmentPlans.plans.find((p) => p.id === planId);

		if (foundPlan) {
			plan = foundPlan;
			notFoundHandled = false;
		} else if ($treatmentPlans.plans.length > 0 && !notFoundHandled) {
			notFoundHandled = true;
			toast.error($t('treatments.planDetails') + ' not found');
			goto('/treatments');
		}
	});

	// Get patient details
	let patient = $derived.by(() => {
		if (!plan) return null;
		return $patients.data.find((p) => p.id === plan!.patientId);
	});

	// Get doctor details
	let doctor = $derived.by(() => {
		if (!plan) return null;
		return $users.data.find((u) => u.id === plan!.doctorId);
	});

	// Get status badge variant
	function getStatusVariant(
		status: TreatmentPlanStatus
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (status) {
			case 'not-started':
				return 'secondary';
			case 'in-progress':
				return 'default';
			case 'completed':
				return 'success';
			case 'discontinued':
				return 'destructive';
			case 'on-hold':
				return 'warning';
			default:
				return 'outline';
		}
	}

	// Calculate progress percentage
	let progressPercentage = $derived.by(() => {
		if (!plan) return 0;
		return Math.round((plan.completedSessions / plan.totalSessions) * 100);
	});

	// Generate session timeline
	let sessionTimeline = $derived.by(() => {
		if (!plan) return [];
		const sessions = [];
		for (let i = 1; i <= plan.totalSessions; i++) {
			const isCompleted = i <= plan.completedSessions;
			const isCurrent = i === plan.completedSessions + 1;
			sessions.push({
				sessionNumber: i,
				isCompleted,
				isCurrent,
				status: isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
			});
		}
		return sessions;
	});

	async function handleMarkSessionComplete() {
		if (!plan) return;

		markingSessionComplete = true;
		const result = await treatmentPlans.markSessionComplete(plan.id, {
			attendedBy: plan.doctorId,
			notes: 'Session completed',
			outcome: 'Session completed successfully'
		});

		markingSessionComplete = false;

		if (result.success) {
			toast.success($t('treatments.messages.sessionCompleted'));
			plan = result.data;
		} else {
			toast.error(result.error || 'Failed to mark session complete');
		}
	}

	async function handleScheduleNextSession() {
		if (!plan) return;

		const result = await treatmentPlans.scheduleNextSession(plan.id);

		if (result.success) {
			toast.success($t('treatments.messages.sessionScheduled'));
		} else {
			toast.error(result.error || 'Failed to schedule session');
		}
	}

	async function handleDiscontinue() {
		if (!plan) return;

		const result = await treatmentPlans.discontinuePlan(plan.id, 'Discontinued by user');

		if (result.success) {
			toast.success($t('treatments.messages.planDiscontinued'));
			plan = result.data;
			confirmDiscontinue = false;
		} else {
			toast.error(result.error || 'Failed to discontinue plan');
		}
	}

	function formatDate(date: Date): string {
		return format(date, 'dd MMM yyyy', { locale: tr });
	}
</script>

{#if plan}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">{$t('treatments.planDetails')}</h1>
				<p class="text-muted-foreground mt-1">{plan.protocol.name}</p>
			</div>
			<div class="flex gap-2">
				<Button variant="outline" onclick={() => goto('/treatments')}>
					{$t('common.back')}
				</Button>
				{#if plan.status === 'in-progress' || plan.status === 'not-started'}
					<Button variant="destructive" onclick={() => (confirmDiscontinue = true)}>
						{$t('treatments.discontinuePlan')}
					</Button>
				{/if}
			</div>
		</div>

		<!-- Plan Overview -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('treatments.overview.title')}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex items-center gap-3">
						<User class="h-5 w-5 text-muted-foreground" />
						<div>
							<p class="text-sm text-muted-foreground">{$t('treatments.fields.patient')}</p>
							<a
								href="/patients/{plan.patientId}"
								class="font-medium text-primary hover:underline"
							>
								{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
							</a>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<Stethoscope class="h-5 w-5 text-muted-foreground" />
						<div>
							<p class="text-sm text-muted-foreground">{$t('treatments.fields.doctor')}</p>
							<p class="font-medium">
								{doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor'}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<Calendar class="h-5 w-5 text-muted-foreground" />
						<div>
							<p class="text-sm text-muted-foreground">{$t('treatments.fields.startDate')}</p>
							<p class="font-medium">{formatDate(plan.startDate)}</p>
						</div>
					</div>

					<div>
						<p class="text-sm text-muted-foreground mb-2">{$t('treatments.fields.status')}</p>
						<Badge variant={getStatusVariant(plan.status)}>
							{$t(`treatments.status.${plan.status}`)}
						</Badge>
					</div>
				</div>

				{#if plan.diagnosisICD10}
					<div>
						<p class="text-sm text-muted-foreground">{$t('treatments.fields.diagnosisICD10')}</p>
						<p class="font-medium mt-1">{plan.diagnosisICD10}</p>
					</div>
				{/if}

				<!-- Progress Bar -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<p class="text-sm font-medium">{$t('treatments.fields.progress')}</p>
						<p class="text-sm text-muted-foreground">
							{plan.completedSessions} / {plan.totalSessions} {$t('treatments.fields.sessions')}
						</p>
					</div>
					<Progress value={progressPercentage} class="h-3" />
					<p class="text-sm text-muted-foreground text-right">{progressPercentage}%</p>
				</div>

				<!-- Action Buttons -->
				{#if plan.status === 'in-progress' && plan.completedSessions < plan.totalSessions}
					<div class="flex gap-2 pt-4">
						<Button
							onclick={handleMarkSessionComplete}
							disabled={markingSessionComplete}
							class="flex-1"
						>
							<CheckCircle class="mr-2 h-4 w-4" />
							{$t('treatments.markComplete')}
						</Button>
						<Button variant="outline" onclick={handleScheduleNextSession} class="flex-1">
							<Clock class="mr-2 h-4 w-4" />
							{$t('treatments.scheduleSession')}
						</Button>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Protocol Details -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('treatments.fields.protocol')}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<p class="text-sm text-muted-foreground">{$t('treatments.fields.frequency')}</p>
						<p class="font-medium mt-1">{plan.protocol.frequency}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">
							{$t('treatments.fields.sessionDuration')}
						</p>
						<p class="font-medium mt-1">{plan.protocol.sessionDuration} min</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">{$t('treatments.fields.totalSessions')}</p>
						<p class="font-medium mt-1">{plan.totalSessions}</p>
					</div>
				</div>

				<div>
					<h4 class="text-sm font-semibold mb-2">{$t('treatments.fields.procedures')}</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
						{#each plan.protocol.procedures as procedure}
							<li>{procedure}</li>
						{/each}
					</ul>
				</div>

				<div>
					<h4 class="text-sm font-semibold mb-2">{$t('treatments.fields.goals')}</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
						{#each plan.protocol.goals as goal}
							<li>{goal}</li>
						{/each}
					</ul>
				</div>

				<div>
					<h4 class="text-sm font-semibold mb-2">{$t('treatments.fields.successCriteria')}</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
						{#each plan.protocol.successCriteria as criteria}
							<li>{criteria}</li>
						{/each}
					</ul>
				</div>
			</CardContent>
		</Card>

		<!-- Session Timeline -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('treatments.overview.sessionTimeline')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
					{#each sessionTimeline as session}
						<div
							class="flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
								{session.isCompleted
								? 'bg-green-50 border-green-500 dark:bg-green-950'
								: session.isCurrent
									? 'bg-primary/10 border-primary'
									: 'bg-muted border-muted-foreground/20'}"
						>
							<p class="text-sm font-semibold">
								{$t('treatments.fields.sessionNumber')} {session.sessionNumber}
							</p>
							{#if session.isCompleted}
								<CheckCircle class="h-5 w-5 text-green-600 mt-2" />
							{:else if session.isCurrent}
								<Clock class="h-5 w-5 text-primary mt-2" />
							{:else}
								<div class="h-5 w-5 rounded-full border-2 border-muted-foreground mt-2"></div>
							{/if}
						</div>
					{/each}
				</div>

				{#if sessionTimeline.length === 0}
					<p class="text-center text-muted-foreground py-8">
						{$t('treatments.overview.noSessions')}
					</p>
				{/if}
			</CardContent>
		</Card>
	</div>

	<ConfirmDialog
		bind:open={confirmDiscontinue}
		title={$t('treatments.discontinuePlan')}
		message={$t('treatments.discontinueConfirm')}
		onConfirm={handleDiscontinue}
		onCancel={() => (confirmDiscontinue = false)}
		variant="destructive"
	/>
{:else}
	<div class="mf-page-shell p-4 md:p-6">
		<div class="rounded-[1.4rem] border border-[color:var(--mf-line-soft)] bg-white/80 px-5 py-6 text-sm text-[color:var(--mf-ink-soft)]">
			{$t('common.loading')}
		</div>
	</div>
{/if}
