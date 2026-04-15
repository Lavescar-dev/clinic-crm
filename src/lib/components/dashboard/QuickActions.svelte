<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';
	import * as Lucide from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface QuickAction {
		label: string;
		icon: string;
		href: string;
		description?: string;
		meta?: string;
		tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
	}
	export let quickActions: QuickAction[] = [];

	const toneClasses = {
		neutral: 'bg-[linear-gradient(145deg,#173149_0%,#1b435d_100%)] text-white',
		primary: 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white',
		success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
		warning: 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950',
		danger: 'bg-gradient-to-br from-rose-500 to-red-600 text-white'
	} as const;

	function navigateToAction(href: string) {
		goto(href);
	}

	function getIconComponent(icon: string): any {
		return (Lucide as Record<string, any>)[icon] ?? Lucide.Activity;
	}
</script>

<div class="grid gap-3">
	{#each quickActions as action}
		{@const IconComponent = getIconComponent(action.icon)}
		<button
			type="button"
			class="group mf-soft-card flex w-full items-start gap-4 rounded-[1.4rem] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200/40"
			onclick={() => navigateToAction(action.href)}
		>
			<div class={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[action.tone ?? 'neutral']}`}>
				<svelte:component this={IconComponent} class="h-5 w-5" />
			</div>

			<div class="min-w-0 flex-1">
				<div class="flex items-center justify-between gap-3">
					<p class="truncate text-sm font-semibold text-[color:var(--mf-ink-strong)]">{action.label}</p>
					<ArrowUpRight class="h-4 w-4 shrink-0 text-[color:var(--mf-ink-faint)] transition group-hover:text-cyan-600" />
				</div>

				{#if action.description}
					<p class="mf-copy mt-2 text-sm leading-6">{action.description}</p>
				{/if}

				{#if action.meta}
					<p class="mf-kicker mt-3 text-[0.72rem] font-semibold">{action.meta}</p>
				{/if}
			</div>
		</button>
	{/each}
</div>
