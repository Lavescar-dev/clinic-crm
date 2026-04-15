<script lang="ts">
	interface ColumnConfig {
		id: string;
		label: string;
		visible: boolean;
		width?: number;
		order: number;
	}

	interface SortableColumnItemProps {
		config: ColumnConfig;
		index: number;
		isResizing: boolean;
		resizingColumnId: string | null;
		isDragging: boolean;
		onToggleVisibility: () => void;
		onStartResize: (e: MouseEvent) => void;
		onDragStart: () => void;
		onDragOver: (e: DragEvent) => void;
		onDragEnd: () => void;
	}

	let {
		config,
		index,
		isResizing,
		resizingColumnId,
		isDragging,
		onToggleVisibility,
		onStartResize,
		onDragStart,
		onDragOver,
		onDragEnd
	}: SortableColumnItemProps = $props();
</script>

<div
	draggable="true"
	ondragstart={onDragStart}
	ondragover={onDragOver}
	ondragend={onDragEnd}
	role="listitem"
	class="flex items-center gap-3 p-3 bg-background border border-border rounded hover:border-accent transition-colors {isDragging ? 'opacity-50' : ''}"
>
	<!-- Drag handle -->
	<button
		type="button"
		class="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text transition-colors"
		aria-label="Drag to reorder"
	>
		<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
			<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
		</svg>
	</button>

	<!-- Visibility toggle -->
	<button
		type="button"
		onclick={onToggleVisibility}
		class="flex items-center justify-center w-5 h-5 text-text-secondary hover:text-text transition-colors"
		aria-label="{config.visible ? 'Hide column' : 'Show column'}"
	>
		{#if config.visible}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
			</svg>
		{:else}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
			</svg>
		{/if}
	</button>

	<!-- Column label -->
	<div class="flex-1 min-w-0">
		<span class="{config.visible ? 'text-text' : 'text-text-secondary line-through'}">{config.label}</span>
	</div>

	<!-- Width display and resize handle -->
	<div class="flex items-center gap-2">
		{#if config.width}
			<span class="text-sm text-text-secondary">{config.width}px</span>
		{/if}
		<button
			type="button"
			onmousedown={onStartResize}
			class="cursor-col-resize text-text-secondary hover:text-accent transition-colors px-1"
			aria-label="Resize column"
		>
			<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
				<path d="M7 10a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"/>
			</svg>
		</button>
	</div>
</div>
