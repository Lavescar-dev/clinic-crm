<script lang="ts">
	import { demoSession } from '$lib/stores/demoSession';
	import { t } from '$lib/i18n';
	import { Button } from '$components/ui/button';
	import { FlaskConical, RefreshCw, ShieldCheck } from 'lucide-svelte';

	let isResetting = $state(false);

	async function handleReset() {
		// Ask for confirmation
		const confirmed = window.confirm($t('demo.resetConfirm'));
		if (!confirmed) return;

		isResetting = true;
		// Small delay to show the loading state before reload
		await new Promise((resolve) => setTimeout(resolve, 300));
		demoSession.reset();
	}
</script>

<div class="mf-glass mt-4 overflow-hidden rounded-[26px] px-4 py-4 text-sm sm:px-5 sm:py-4">
	<div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
		<div class="flex items-start gap-3">
			<div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_18px_36px_-24px_rgba(11,123,140,0.45)]">
			<FlaskConical class="h-5 w-5" />
		</div>
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<span class="mf-chip mf-chip-cyan px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.18em]">
						Demo
					</span>
					<span class="mf-kicker text-[0.68rem] font-semibold">
						Yerel Demo Alanı
					</span>
				</div>
				<p class="mt-2 text-sm font-semibold text-[color:var(--mf-ink-strong)] sm:text-[0.98rem]">
					{$t('demo.title')} - {$t('demo.subtitle')}
				</p>
				<p class="mf-copy mt-1 text-xs leading-5 sm:text-[0.78rem]">
					İşlemler sadece yerel örnek verilerde tutulur, gerçek klinik kayıtlarını etkilemez.
				</p>
			</div>
		</div>

		<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,auto))] xl:items-center">
			<div class="mf-mini-stat">
				<div class="mf-chip mf-chip-emerald inline-flex gap-2 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em]">
					<ShieldCheck class="h-3.5 w-3.5 text-emerald-600" />
					<span>Güvende çalışıyor</span>
				</div>
			</div>
			<div class="mf-mini-stat">
				<p class="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">Oturum</p>
				<p class="mt-1 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
					{$t('demo.sessionDuration', {
						duration: demoSession.getFormattedDuration($demoSession)
					})}
				</p>
			</div>
			<div class="mf-mini-stat">
				<p class="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mf-ink-faint)]">Etkileşim</p>
				<p class="mt-1 text-sm font-semibold text-[color:var(--mf-ink-strong)]">
					{$t('demo.actionCount', { count: $demoSession.actionCount })}
				</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2 xl:justify-end">
			<Button
				variant="outline"
				size="sm"
				onclick={handleReset}
				disabled={isResetting}
				class="h-10 rounded-full border-primary/18 bg-white px-4 text-primary hover:bg-primary/6"
			>
				<RefreshCw class={isResetting ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
				<span>{$t('demo.resetButton')}</span>
			</Button>
		</div>
	</div>
</div>
