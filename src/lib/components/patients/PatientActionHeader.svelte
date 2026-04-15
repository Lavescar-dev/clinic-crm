<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$components/ui/avatar';
	import { Badge } from '$components/ui/badge';
	import { MapPin, Phone, ShieldPlus } from 'lucide-svelte';
	import type { Patient } from '$types';
	import { calculateAge } from '$utils/date';
	import { formatPhoneNumber } from '$utils/formatting';

	type PatientActionMetric = {
		label: string;
		value: string;
		detail: string;
		tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
	};

	interface Props {
		patient: Patient;
		eyebrow: string;
		title: string;
		description: string;
		metrics?: PatientActionMetric[];
	}

	let { patient, eyebrow, title, description, metrics = [] }: Props = $props();

	function displayName(entry: Patient) {
		return entry.fullName ?? `${entry.firstName} ${entry.lastName}`;
	}

	function initials(entry: Patient) {
		return `${entry.firstName?.[0] ?? ''}${entry.lastName?.[0] ?? ''}`.toUpperCase();
	}

	function insuranceLabel(entry: Patient) {
		if (entry.insurance.type === 'private') {
			return entry.insurance.company || entry.insurance.provider || 'Özel sigorta';
		}

		if (entry.insurance.type === 'sgk') {
			return 'SGK kapsamı';
		}

		return 'Özel ödeme';
	}

	function locationLabel(entry: Patient) {
		if (!entry.contact.address) {
			return 'Adres kaydı eklenmedi';
		}

		return [entry.contact.address.district, entry.contact.address.city].filter(Boolean).join(', ');
	}

	function metricToneClass(tone: PatientActionMetric['tone']) {
		switch (tone) {
			case 'emerald':
				return 'mf-tint-emerald';
			case 'amber':
				return 'mf-tint-amber';
			case 'rose':
				return 'mf-tint-rose';
			default:
				return 'mf-tint-cyan';
		}
	}
</script>

<section class="patient-action-hero">
	<div class="patient-action-grid">
		<div class="space-y-6">
			<div class="flex flex-col gap-5 lg:flex-row lg:items-start">
				<div class="patient-action-avatar-shell">
					<div class="patient-action-avatar-orb"></div>
					<Avatar class="patient-action-avatar">
						{#if patient.avatar}
							<AvatarImage src={patient.avatar} alt={displayName(patient)} />
						{:else}
							<AvatarFallback class="patient-action-avatar-fallback">
								{initials(patient)}
							</AvatarFallback>
						{/if}
					</Avatar>
				</div>

				<div class="min-w-0 flex-1 space-y-4">
					<div class="flex flex-wrap items-center gap-2">
						<span class="mf-chip mf-chip-cyan px-3 py-1 text-[0.72rem] font-semibold">{eyebrow}</span>
						<Badge variant={patient.status === 'active' ? 'success' : patient.status === 'inactive' ? 'secondary' : 'destructive'}>
							{patient.status === 'active' ? 'Aktif' : patient.status === 'inactive' ? 'Pasif' : 'Kapalı'}
						</Badge>
						<span class="mf-chip px-3 py-1 text-xs font-medium">{insuranceLabel(patient)}</span>
						<span class="mf-chip px-3 py-1 text-xs font-medium">
							{patient.birthDate ? `${calculateAge(patient.birthDate)} yaş` : 'Yaş bilinmiyor'}
						</span>
					</div>

					<div class="space-y-3">
						<h1 class="patient-action-title">{title}</h1>
						<p class="patient-action-copy">{description}</p>
					</div>

					<div class="flex flex-col gap-2 text-sm text-[color:var(--mf-ink-soft)] lg:flex-row lg:flex-wrap lg:items-center">
						<div class="patient-action-inline">
							<Phone class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
							<span>{patient.contact.phone ? formatPhoneNumber(patient.contact.phone) : 'Telefon bilgisi yok'}</span>
						</div>
						<div class="patient-action-inline">
							<MapPin class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
							<span>{locationLabel(patient)}</span>
						</div>
						<div class="patient-action-inline">
							<ShieldPlus class="h-4 w-4 text-[color:var(--mf-accent-strong)]" />
							<span>{patient.tcNo}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		{#if metrics.length > 0}
			<div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
				{#each metrics as metric}
					<div class={`patient-action-metric ${metricToneClass(metric.tone)}`}>
						<p class="patient-action-metric-label">{metric.label}</p>
						<p class="patient-action-metric-value">{metric.value}</p>
						<p class="patient-action-metric-detail">{metric.detail}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.patient-action-hero {
		border: 1px solid var(--mf-line-soft);
		border-radius: 2rem;
		padding: clamp(1.25rem, 2vw, 1.85rem);
		background:
			radial-gradient(circle at top left, rgba(73, 201, 218, 0.16), transparent 28%),
			radial-gradient(circle at 86% 12%, rgba(56, 189, 248, 0.14), transparent 22%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(243, 250, 253, 0.9));
		box-shadow: var(--mf-shadow-lg);
	}

	.patient-action-grid {
		display: grid;
		gap: 1.5rem;
	}

	.patient-action-avatar-shell {
		position: relative;
		width: fit-content;
	}

	.patient-action-avatar-orb {
		position: absolute;
		inset: -0.65rem;
		border-radius: 2rem;
		background: linear-gradient(145deg, rgba(11, 123, 140, 0.2), rgba(56, 189, 248, 0.08));
	}

	.patient-action-avatar {
		position: relative;
		z-index: 1;
		height: 6.5rem;
		width: 6.5rem;
		border: 1px solid rgba(255, 255, 255, 0.82);
		box-shadow: var(--mf-shadow-soft);
	}

	.patient-action-avatar-fallback {
		background:
			radial-gradient(circle at top left, rgba(80, 203, 220, 0.2), transparent 32%),
			linear-gradient(145deg, #edfaff, #dff4f8);
		color: var(--mf-ink-strong);
		font-size: 1.28rem;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	.patient-action-title {
		color: var(--mf-ink-strong);
		font-size: clamp(2rem, 1.74rem + 1.1vw, 3rem);
		font-weight: 800;
		letter-spacing: -0.055em;
		line-height: 0.98;
	}

	.patient-action-copy {
		max-width: 54rem;
		color: var(--mf-ink-soft);
		font-size: 0.98rem;
		line-height: 1.8;
	}

	.patient-action-inline {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		border: 1px solid var(--mf-line-soft);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.7);
		padding: 0.55rem 0.9rem;
	}

	.patient-action-metric {
		border: 1px solid var(--mf-line-soft);
		border-radius: 1.35rem;
		padding: 1rem 1.05rem;
		box-shadow: var(--mf-shadow-soft);
	}

	.patient-action-metric-label {
		color: var(--mf-ink-faint);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.patient-action-metric-value {
		margin-top: 0.6rem;
		color: var(--mf-ink-strong);
		font-size: 1.12rem;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	.patient-action-metric-detail {
		margin-top: 0.3rem;
		color: var(--mf-ink-soft);
		font-size: 0.84rem;
		line-height: 1.6;
	}

	@media (min-width: 1280px) {
		.patient-action-grid {
			grid-template-columns: minmax(0, 1.16fr) 340px;
			align-items: stretch;
		}
	}
</style>
