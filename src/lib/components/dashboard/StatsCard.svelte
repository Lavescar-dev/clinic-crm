<script lang="ts">
	import { Card, CardContent } from '$components/ui/card';
	import * as Lucide from 'lucide-svelte';
	import { formatCurrency } from '$utils/currency';
	import { get } from 'svelte/store';
	import { language } from '$i18n';

	export let title: string;
	export let value: number | null | undefined = 0;
	export let icon: string;
	export let description: string;
	export let format: 'currency' | 'number' = 'number';
	export let tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' = 'neutral';
	export let eyebrow = 'LIVE';

	const toneClasses = {
		neutral: 'bg-[linear-gradient(145deg,#173149_0%,#1b435d_100%)] text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.78)]',
		primary: 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-[0_18px_34px_-18px_rgba(8,145,178,0.72)]',
		success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_18px_34px_-18px_rgba(5,150,105,0.72)]',
		warning: 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-[0_18px_34px_-18px_rgba(249,115,22,0.68)]',
		danger: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_18px_34px_-18px_rgba(225,29,72,0.8)]'
	} as const;

	$: currentLanguage = get(language);
	$: currentLocale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
	$: safeValue = Number.isFinite(value ?? NaN) ? Number(value) : 0;
	$: formattedValue =
		format === 'currency'
			? formatCurrency(safeValue, undefined, currentLocale)
			: safeValue.toLocaleString(currentLocale);
	$: toneClass = toneClasses[tone];

	$: IconComponent = (Lucide[icon as keyof typeof Lucide] ?? Lucide.Activity) as any;
</script>

<Card class="group relative overflow-hidden mf-glass">
	<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"></div>
	<CardContent class="space-y-5 p-6">
		<div class="flex items-start justify-between gap-4">
			<div class="space-y-2">
				<p class="mf-kicker text-[0.65rem] font-semibold">{eyebrow}</p>
				<p class="text-sm font-semibold text-[color:var(--mf-ink)]">{title}</p>
			</div>
			<div class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
				<svelte:component this={IconComponent} class="h-5 w-5" />
			</div>
		</div>

		<div class="space-y-2">
			<div class="mf-heading text-3xl font-semibold">{formattedValue}</div>
			<p class="mf-copy max-w-[22rem] text-sm leading-6">{description}</p>
		</div>
	</CardContent>
</Card>
