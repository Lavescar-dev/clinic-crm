<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { Button } from '$components/ui/button';

	interface Props {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		class?: string;
	}

	let { currentPage, totalPages, onPageChange, class: className = '' }: Props = $props();

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			onPageChange(page);
		}
	}

	const pages = $derived(() => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];
		let l: number | undefined;

		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
				range.push(i);
			}
		}

		for (const i of range) {
			if (l) {
				if (i - l === 2) {
					rangeWithDots.push(l + 1);
				} else if (i - l !== 1) {
					rangeWithDots.push('...');
				}
			}
			rangeWithDots.push(i);
			l = i;
		}

		return rangeWithDots;
	});
</script>

<div class={`flex items-center justify-center gap-2 ${className}`}>
	<Button
		variant="outline"
		size="sm"
		onclick={() => goToPage(currentPage - 1)}
		disabled={currentPage === 1}
	>
		<ChevronLeft class="h-4 w-4" />
	</Button>

	{#each pages() as page}
		{#if page === '...'}
			<span class="px-2 text-muted-foreground">...</span>
		{:else}
			<Button
				variant={currentPage === page ? 'default' : 'outline'}
				size="sm"
				onclick={() => goToPage(page as number)}
			>
				{page}
			</Button>
		{/if}
	{/each}

	<Button
		variant="outline"
		size="sm"
		onclick={() => goToPage(currentPage + 1)}
		disabled={currentPage === totalPages}
	>
		<ChevronRight class="h-4 w-4" />
	</Button>
</div>
