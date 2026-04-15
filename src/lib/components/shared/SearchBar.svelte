<script lang="ts">
	import { Search } from 'lucide-svelte';

	interface Props {
		searchTerm?: string; // Renamed from value
		placeholder?: string;
		onInput?: (searchTerm: string) => void; // Updated parameter name
		class?: string;
	}

	let { searchTerm = $bindable(''), placeholder = 'Ara...', onInput, class: className = '' }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchTerm = target.value; // Renamed from value
		onInput?.(target.value);
	}
</script>

<div class={`relative w-full min-w-0 ${className}`}>
	<div class="mf-control-shell h-12">
		<Search class="h-4 w-4 text-[color:var(--mf-ink-faint)]" />
		<input
			type="text"
			{placeholder}
			value={searchTerm}
			oninput={handleInput}
			class="h-auto min-h-0 w-full border-0 bg-transparent px-0 py-0 pl-0 text-[0.95rem] text-[var(--mf-ink)] outline-none placeholder:text-[var(--mf-ink-faint)]"
		/>
	</div>
</div>
