<script lang="ts">
	import { t } from '$i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { referrals } from '$stores/referrals';
	import { users } from '$stores/users';
	import { currentUser } from '$lib/stores';
	import { Button } from '$components/ui/button';
	import ReferralForm from '$lib/components/referrals/ReferralForm.svelte';
	import type { CreateReferralDto } from '$types/referral';
	import { toast } from 'svelte-sonner';
	import { ArrowLeft } from 'lucide-svelte';

	// Get patientId from URL params if provided
	let patientId = $derived($page.url.searchParams.get('patientId') || '');

	let currentDoctorId = $derived.by(
		() => ($currentUser?.role === 'doctor' ? $currentUser.id : $users.data.find((user) => user.role === 'doctor')?.id) || ''
	);

	let isSubmitting = $state(false);

	async function handleSubmit(referralData: CreateReferralDto) {
		isSubmitting = true;

		const result = await referrals.createReferral(referralData);

		isSubmitting = false;

		if (result.success && result.data) {
			toast.success($t('referrals.messages.referralCreated'));
			goto(`/referrals/${result.data.id}`);
		} else {
			toast.error(result.error || $t('referrals.messages.createFailed'));
		}
	}

	function handleCancel() {
		goto('/referrals');
	}
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" on:click={() => goto('/referrals')}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<h1 class="text-3xl font-bold">{$t('referrals.newReferral')}</h1>
	</div>

	<ReferralForm
		patientId={patientId}
		fromDoctorId={currentDoctorId}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
	/>

	{#if isSubmitting}
		<div class="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
			<p class="text-lg">{$t('common.loading')}</p>
		</div>
	{/if}
</div>
