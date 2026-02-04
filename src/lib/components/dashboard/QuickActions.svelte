<script lang="ts">
	import { Button } from '$components/ui/button';
	import { ArrowRight, type Icon as LucideIcon } from 'lucide-svelte';
	import * as Lucide from 'lucide-svelte';
	import { goto } from '$app/navigation';

	export interface QuickAction {
		label: string;
		icon: keyof typeof Lucide;
		href: string;
	}

	export let quickActions: QuickAction[] = [];

	function navigateToAction(href: string) {
		goto(href);
	}
</script>

<div class="grid gap-4">
	{#each quickActions as action}
		{@const IconComponent = Lucide[action.icon]}
		<Button variant="outline" class="flex items-center justify-between gap-2" on:click={() => navigateToAction(action.href)}>
			<div class="flex items-center gap-2">
				<svelte:component this={IconComponent} class="h-4 w-4" />
				<span>{action.label}</span>
			</div>
			<ArrowRight class="h-4 w-4 text-muted-foreground" />
		</Button>
	{/each}
</div>
