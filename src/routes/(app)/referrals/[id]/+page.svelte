<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { referrals } from '$stores/referrals';
	import { patients } from '$stores/patients';
	import { users } from '$stores/users';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import PageHero from '$lib/components/shared/PageHero.svelte';
	import ConfirmDialog from '$components/shared/ConfirmDialog.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import type { Referral, ReferralStatus, UrgencyLevel } from '$types/referral';
	import { isInternalReferral, isExternalReferral } from '$types/referral';
	import { format } from 'date-fns';
	import { tr } from 'date-fns/locale';
	import {
		CheckCircle,
		ArrowLeft,
		AlertTriangle,
		ArrowRight,
		Building2,
		Calendar,
		Clock,
		FileText,
		Mail,
		Phone,
		User,
		XCircle
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let referral = $state<Referral | undefined>(undefined);
	let loading = $state(true);

	// Mock current user ID (in production, get from auth context)
	const currentUserId = 'user-1'; // Dr. Ahmet Yılmaz

	// Dialog states
	let showAcceptDialog = $state(false);
	let showRejectDialog = $state(false);
	let acceptResponse = $state('');
	let rejectReason = $state('');
	let isSubmitting = $state(false);

	onMount(async () => {
		const referralId = $page.params.id;
		if (!referralId) {
			loading = false;
			toast.error('Sevk kaydı bulunamadı.');
			goto('/referrals');
			return;
		}

		const foundReferral = $referrals.referrals.find((r) => r.id === referralId);

		if (foundReferral) {
			referral = foundReferral;
		} else {
			toast.error('Sevk kaydı bulunamadı.');
			goto('/referrals');
		}

		loading = false;
	});

	// Get patient details
	let patient = $derived.by(() => {
		if (!referral) return null;
		return $patients.data.find((p) => p.id === referral!.patientId);
	});

	// Get from doctor details
	let fromDoctor = $derived.by(() => {
		if (!referral) return null;
		return $users.data.find((u) => u.id === referral!.fromDoctorId);
	});

	// Get to doctor details
	let toDoctor = $derived.by(() => {
		if (!referral || !referral.toDoctorId) return null;
		return $users.data.find((u) => u.id === referral!.toDoctorId);
	});

	// Check if current user can accept/reject
	let canAcceptReject = $derived.by(() => {
		if (!referral) return false;
		return (
			referral.status === 'pending' &&
			referral.toDoctorId === currentUserId &&
			isInternalReferral(referral)
		);
	});

	// Check if can schedule appointment
	let canSchedule = $derived.by(() => {
		if (!referral) return false;
		return (
			referral.status === 'accepted' &&
			!referral.appointmentScheduled &&
			referral.toDoctorId === currentUserId
		);
	});

	// Get status badge variant
	function getStatusVariant(
		status: ReferralStatus
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (status) {
			case 'pending':
				return 'warning';
			case 'accepted':
				return 'success';
			case 'rejected':
				return 'destructive';
			case 'completed':
				return 'secondary';
			case 'expired':
				return 'outline';
			default:
				return 'default';
		}
	}

	// Get urgency badge variant
	function getUrgencyVariant(
		urgency: UrgencyLevel
	): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' {
		switch (urgency) {
			case 'routine':
				return 'secondary';
			case 'urgent':
				return 'warning';
			case 'stat':
				return 'destructive';
			default:
				return 'default';
		}
	}

	async function handleAccept() {
		if (!referral) return;

		isSubmitting = true;
		const result = await referrals.acceptReferral(referral.id, {
			respondedBy: currentUserId,
			response: acceptResponse || undefined
		});

		isSubmitting = false;

		if (result.success) {
			toast.success($t('referrals.messages.referralAccepted'));
			referral = result.data;
			showAcceptDialog = false;
			acceptResponse = '';
		} else {
			toast.error(result.error || 'Sevk kabul edilirken bir sorun oluştu.');
		}
	}

	async function handleReject() {
		if (!referral || !rejectReason.trim()) {
			toast.error('Lütfen reddetme gerekçesi yazın.');
			return;
		}

		isSubmitting = true;
		const result = await referrals.rejectReferral(referral.id, {
			respondedBy: currentUserId,
			response: rejectReason
		});

		isSubmitting = false;

		if (result.success) {
			toast.success($t('referrals.messages.referralRejected'));
			referral = result.data;
			showRejectDialog = false;
			rejectReason = '';
		} else {
			toast.error(result.error || 'Sevk reddedilirken bir sorun oluştu.');
		}
	}

	async function handleScheduleAppointment() {
		if (!referral) return;

		// In production, this would open an appointment scheduler
		// For now, we'll just mark as scheduled with mock data
		const appointmentDate = new Date();
		appointmentDate.setDate(appointmentDate.getDate() + 7);

		const result = await referrals.scheduleReferralAppointment(
			referral.id,
			'appt-mock-' + Date.now(),
			appointmentDate
		);

		if (result.success) {
			toast.success($t('referrals.messages.appointmentScheduled'));
			referral = result.data;
		} else {
			toast.error(result.error || 'Randevu planlanırken bir sorun oluştu.');
		}
	}

	function formatDate(date: Date): string {
		return format(date, 'dd MMM yyyy', { locale: tr });
	}

	function formatDateTime(date: Date): string {
		return format(date, 'dd MMM yyyy HH:mm', { locale: tr });
	}

	function formatPatientAge(date: Date): string {
		const age = new Date().getFullYear() - new Date(date).getFullYear();
		return `${age} yaş`;
	}

	function formatGender(gender: string): string {
		switch (gender) {
			case 'female':
				return 'Kadın';
			case 'male':
				return 'Erkek';
			default:
				return 'Diğer';
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<p>{$t('common.loading')}</p>
	</div>
{:else if !referral}
	<div class="flex items-center justify-center p-8">
		<p>Sevk kaydı bulunamadı.</p>
	</div>
{:else}
	<div class="mf-page-shell space-y-6 p-4 md:p-6">
		<PageHero
			eyebrow="Sevk Dosyası"
			title={$t('referrals.referralDetails')}
			description={`${$t('referrals.referralId')}: ${referral.id}${patient ? ` · ${patient.firstName} ${patient.lastName}` : ''}`}
		>
			<Button variant="outline" onclick={() => goto('/referrals')}>
				<ArrowLeft class="h-4 w-4" />
				Sevklere dön
			</Button>
			<Badge variant={getStatusVariant(referral.status)}>
				{$t(`referrals.status.${referral.status}`)}
			</Badge>
			<Badge variant={getUrgencyVariant(referral.urgency)}>
				{$t(`referrals.urgency.${referral.urgency}`)}
			</Badge>
		</PageHero>

		<div class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
			<!-- Patient Information -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<User class="h-5 w-5" />
						{$t('referrals.patientInformation')}
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if patient}
						<div>
							<p class="text-sm text-muted-foreground">{$t('common.name')}</p>
							<p class="font-medium">
								<a href="/patients/{patient.id}" class="text-primary hover:underline">
									{patient.firstName}
									{patient.lastName}
								</a>
							</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">{$t('common.age')}</p>
							<p class="font-medium">
								{formatPatientAge(patient.birthDate)}
							</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">{$t('common.gender')}</p>
							<p class="font-medium">{formatGender(patient.gender)}</p>
						</div>
					{:else}
						<p class="text-muted-foreground">{$t('referrals.patientNotFound')}</p>
					{/if}
				</CardContent>
			</Card>

			<!-- Referral Flow -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ArrowRight class="h-5 w-5" />
						{$t('referrals.referralFlow')}
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- From -->
					<div>
						<p class="text-sm text-muted-foreground mb-2">{$t('referrals.fields.from')}</p>
						<div class="flex items-center gap-2">
							<User class="h-4 w-4 text-muted-foreground" />
							<div>
								<p class="font-medium">
									{fromDoctor ? `${fromDoctor.firstName} ${fromDoctor.lastName}` : 'Bilinmeyen hekim'}
								</p>
								{#if referral.fromDepartment}
									<p class="text-sm text-muted-foreground">{referral.fromDepartment}</p>
								{/if}
							</div>
						</div>
					</div>

					<div class="flex justify-center">
						<ArrowRight class="h-6 w-6 text-primary" />
					</div>

					<!-- To -->
					<div>
						<p class="text-sm text-muted-foreground mb-2">{$t('referrals.fields.to')}</p>
						{#if isInternalReferral(referral)}
							<div class="flex items-center gap-2">
								<User class="h-4 w-4 text-muted-foreground" />
								<div>
									<p class="font-medium">
										{toDoctor ? `${toDoctor.firstName} ${toDoctor.lastName}` : 'Bilinmeyen hekim'}
									</p>
									{#if referral.toDepartment}
										<p class="text-sm text-muted-foreground">{referral.toDepartment}</p>
									{/if}
								</div>
							</div>
						{:else if isExternalReferral(referral) && referral.externalFacility}
							<div class="flex items-start gap-2">
								<Building2 class="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<p class="font-medium">{referral.externalFacility.name}</p>
									<p class="text-sm text-muted-foreground">{referral.externalFacility.specialty}</p>
									<p class="text-sm text-muted-foreground mt-1">
										{referral.externalFacility.address}
									</p>
									<div class="flex flex-col gap-1 mt-2">
										<div class="flex items-center gap-1 text-sm">
											<Phone class="h-3 w-3" />
											<span>{referral.externalFacility.contact.phone}</span>
										</div>
										{#if referral.externalFacility.contact.email}
											<div class="flex items-center gap-1 text-sm">
												<Mail class="h-3 w-3" />
												<span>{referral.externalFacility.contact.email}</span>
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Referral Details -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<FileText class="h-5 w-5" />
					{$t('referrals.referralReason')}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<p class="text-sm text-muted-foreground mb-1">{$t('referrals.fields.reason')}</p>
					<p class="whitespace-pre-wrap">{referral.reason}</p>
				</div>

				{#if referral.clinicalSummary}
					<div>
						<Separator class="my-4" />
						<p class="text-sm text-muted-foreground mb-1">{$t('referrals.clinicalSummary')}</p>
						<p class="whitespace-pre-wrap">{referral.clinicalSummary}</p>
					</div>
				{/if}

				{#if referral.diagnosisCodes && referral.diagnosisCodes.length > 0}
					<div>
						<p class="text-sm text-muted-foreground mb-2">{$t('referrals.diagnosisCodes')}</p>
						<div class="flex flex-wrap gap-2">
							{#each referral.diagnosisCodes as code}
								<Badge variant="outline">{code}</Badge>
							{/each}
						</div>
					</div>
				{/if}

				{#if referral.relevantTests && referral.relevantTests.length > 0}
					<div>
						<p class="text-sm text-muted-foreground mb-2">{$t('referrals.relevantTests')}</p>
						<ul class="list-disc list-inside space-y-1">
							{#each referral.relevantTests as test}
								<li class="text-sm">{test}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if referral.medications && referral.medications.length > 0}
					<div>
						<p class="text-sm text-muted-foreground mb-2">{$t('referrals.currentMedications')}</p>
						<ul class="list-disc list-inside space-y-1">
							{#each referral.medications as medication}
								<li class="text-sm">{medication}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if referral.notes}
					<div>
						<Separator class="my-4" />
						<p class="text-sm text-muted-foreground mb-1">{$t('common.notes')}</p>
						<p class="whitespace-pre-wrap text-sm">{referral.notes}</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Response Section -->
		{#if referral.response || referral.status === 'accepted' || referral.status === 'rejected'}
			<Card>
				<CardHeader>
					<CardTitle>{$t('referrals.response')}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					{#if referral.response}
						<div>
							<p class="text-sm text-muted-foreground mb-1">{$t('referrals.responseMessage')}</p>
							<p class="whitespace-pre-wrap">{referral.response}</p>
						</div>
					{/if}
					{#if referral.responseDate}
						<div>
							<p class="text-sm text-muted-foreground">{$t('referrals.responseDate')}</p>
							<p class="font-medium">{formatDateTime(referral.responseDate)}</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}

		<!-- Appointment Information -->
		{#if referral.appointmentScheduled && referral.appointmentDate}
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Calendar class="h-5 w-5" />
						{$t('referrals.appointmentInformation')}
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div>
						<p class="text-sm text-muted-foreground">{$t('referrals.appointmentDate')}</p>
						<p class="font-medium">{formatDateTime(referral.appointmentDate)}</p>
					</div>
					{#if referral?.appointmentId}
						<Button variant="outline" onclick={() => goto(`/appointments/${referral?.appointmentId}`)}>
							{$t('referrals.viewAppointment')}
						</Button>
					{/if}
				</CardContent>
			</Card>
		{/if}

		<!-- Expiration Warning -->
		{#if referral.expiresAt && referral.status === 'pending'}
			<Card class="border-yellow-500">
				<CardContent class="pt-6">
					<div class="flex items-start gap-3">
						<AlertTriangle class="h-5 w-5 text-yellow-600 mt-0.5" />
						<div>
							<p class="font-medium text-yellow-900">
								{$t('referrals.expirationWarning')}
							</p>
							<p class="text-sm text-yellow-800 mt-1">
								{$t('referrals.expiresOn')}: {formatDateTime(referral.expiresAt)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Action Buttons -->
		{#if canAcceptReject || canSchedule}
			<Card>
				<CardHeader>
					<CardTitle>{$t('common.actions')}</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="flex flex-wrap gap-3">
						{#if canAcceptReject}
							<Button onclick={() => (showAcceptDialog = true)} class="gap-2">
								<CheckCircle class="h-4 w-4" />
								{$t('referrals.actions.accept')}
							</Button>
							<Button
								variant="destructive"
								onclick={() => (showRejectDialog = true)}
								class="gap-2"
							>
								<XCircle class="h-4 w-4" />
								{$t('referrals.actions.reject')}
							</Button>
						{/if}
						{#if canSchedule}
							<Button onclick={handleScheduleAppointment} variant="outline" class="gap-2">
								<Calendar class="h-4 w-4" />
								{$t('referrals.actions.scheduleAppointment')}
							</Button>
						{/if}
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Metadata -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Clock class="h-5 w-5" />
					{$t('referrals.metadata')}
				</CardTitle>
			</CardHeader>
			<CardContent class="grid gap-3 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">{$t('referrals.createdAt')}</p>
					<p class="font-medium">{formatDateTime(referral.createdAt)}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">{$t('referrals.updatedAt')}</p>
					<p class="font-medium">{formatDateTime(referral.updatedAt)}</p>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}

<!-- Accept Dialog -->
<ConfirmDialog
	open={showAcceptDialog}
	title={$t('referrals.acceptDialog.title')}
	onConfirm={handleAccept}
	onCancel={() => {
		showAcceptDialog = false;
		acceptResponse = '';
	}}
	confirmText={$t('referrals.actions.accept')}
	cancelText={$t('common.cancel')}
	disabled={isSubmitting}
>
	<div class="space-y-4">
		<p>{$t('referrals.acceptDialog.message')}</p>
		<div class="space-y-2">
			<Label for="accept-response">{$t('referrals.acceptDialog.responseOptional')}</Label>
			<Textarea
				id="accept-response"
				bind:value={acceptResponse}
				placeholder={$t('referrals.acceptDialog.responsePlaceholder')}
				rows={3}
			/>
		</div>
	</div>
</ConfirmDialog>

<!-- Reject Dialog -->
<ConfirmDialog
	open={showRejectDialog}
	title={$t('referrals.rejectDialog.title')}
	onConfirm={handleReject}
	onCancel={() => {
		showRejectDialog = false;
		rejectReason = '';
	}}
	confirmText={$t('referrals.actions.reject')}
	cancelText={$t('common.cancel')}
	variant="destructive"
	disabled={isSubmitting || rejectReason.trim().length < 10}
>
	<div class="space-y-4">
		<p>{$t('referrals.rejectDialog.message')}</p>
		<div class="space-y-2">
			<Label for="reject-reason"
				>{$t('referrals.rejectDialog.reasonRequired')} <span class="text-destructive">*</span
				></Label
			>
			<Textarea
				id="reject-reason"
				bind:value={rejectReason}
				placeholder={$t('referrals.rejectDialog.reasonPlaceholder')}
				rows={4}
				required
			/>
			{#if rejectReason.length > 0 && rejectReason.length < 10}
				<p class="text-sm text-destructive">
					{$t('referrals.rejectDialog.reasonMinLength')}
				</p>
			{/if}
		</div>
	</div>
</ConfirmDialog>
