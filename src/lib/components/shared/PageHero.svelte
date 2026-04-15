<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow: string;
		title: string;
		description: string;
		class?: string;
		children?: Snippet;
	}

	let { eyebrow, title, description, class: className = '', children }: Props = $props();
</script>

<section class={cn('mf-page-header flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between', className)}>
	<div class="relative z-10 space-y-3">
		<div class="flex flex-wrap items-center gap-2">
			<span class="mf-chip mf-chip-cyan px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.18em]">
				Yerel demo
			</span>
			<p class="mf-kicker text-[0.72rem] font-semibold">{eyebrow}</p>
		</div>
		<div class="space-y-2">
			<h1 class="mf-page-title">{title}</h1>
			<p class="mf-page-description">{description}</p>
		</div>
	</div>

	{#if children}
		<div class="relative z-10 mf-page-hero-actions">
			{@render children()}
		</div>
	{/if}
</section>
