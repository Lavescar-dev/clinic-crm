<script lang="ts">
	import { Search } from 'lucide-svelte';
	import { Input } from '$components/ui/input';

	interface Props {
		searchTerm?: string; // Renamed from value
		placeholder?: string;
		onInput?: (searchTerm: string) => void; // Updated parameter name
		class?: string;
	}

	let { searchTerm = $bindable(''), placeholder = 'Search...', onInput, class: className = '' }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchTerm = target.value; // Renamed from value
		onInput?.(target.value);
	}
</script>

<div class={`relative ${className}`}>
	<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
	<Input
		type="text"
		{placeholder}
		{searchTerm}
		oninput={handleInput}
		class="pl-10"
	/>
</div>
