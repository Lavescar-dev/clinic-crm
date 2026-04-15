<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import type { EChartsOption, ECharts } from 'echarts';

	interface Props {
		option: EChartsOption;
		loading?: boolean;
		error?: string;
		height?: number | string;
		width?: number | string;
		theme?: 'dark' | 'light';
		notMerge?: boolean;
		lazyUpdate?: boolean;
		onChartReady?: (chart: ECharts) => void;
		onClick?: (params: any) => void;
		onDblClick?: (params: any) => void;
		onMouseOver?: (params: any) => void;
		onMouseOut?: (params: any) => void;
	}

	let {
		option,
		loading = false,
		error = '',
		height = 400,
		width = '100%',
		theme = 'dark',
		notMerge = false,
		lazyUpdate = false,
		onChartReady,
		onClick,
		onDblClick,
		onMouseOver,
		onMouseOut
	}: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let chart: ECharts | null = null;
	let resizeObserver: ResizeObserver | null = null;

	// Theme configurations
	const themes = {
		dark: {
			backgroundColor: 'transparent',
			textStyle: {
				color: 'rgba(255, 255, 255, 0.7)',
				fontFamily: 'IBM Plex Sans'
			},
			grid: {
				borderColor: 'rgba(255, 107, 0, 0.1)'
			},
			color: [
				'#FF6B00', // Rust industrial orange
				'#00D9FF', // Cyan
				'#FF3D71', // Red
				'#00E096', // Green
				'#AA00FF', // Purple
				'#FFD500', // Yellow
				'#FF6D00', // Deep Orange
				'#00BFA5' // Teal
			]
		},
		light: {
			backgroundColor: 'transparent',
			textStyle: {
				color: 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			},
			grid: {
				borderColor: 'rgba(0, 0, 0, 0.1)'
			},
			color: [
				'#FF6B00',
				'#0091EA',
				'#D32F2F',
				'#388E3C',
				'#7B1FA2',
				'#F57C00',
				'#E64A19',
				'#00796B'
			]
		}
	};

	// Initialize chart
	onMount(() => {
		if (!container) return;

		// Create chart instance
		chart = echarts.init(container, null, {
			renderer: 'canvas',
			useDirtyRect: true // Performance optimization
		});

		// Set up ResizeObserver for responsive sizing
		resizeObserver = new ResizeObserver(() => {
			if (chart) {
				chart.resize();
			}
		});

		resizeObserver.observe(container);

		// Set up event listeners
		if (onClick) {
			chart.on('click', onClick);
		}
		if (onDblClick) {
			chart.on('dblclick', onDblClick);
		}
		if (onMouseOver) {
			chart.on('mouseover', onMouseOver);
		}
		if (onMouseOut) {
			chart.on('mouseout', onMouseOut);
		}

		// Call onChartReady callback
		if (onChartReady) {
			onChartReady(chart);
		}

		// Initial option set
		updateChart();
	});

	// Update chart when option or theme changes
	$effect(() => {
		updateChart();
	});

	// Handle loading state
	$effect(() => {
		if (chart) {
			if (loading) {
				chart.showLoading('default', {
					text: 'Loading...',
					color: '#FF6B00',
					textColor: 'rgba(255, 255, 255, 0.7)',
					maskColor: 'rgba(0, 0, 0, 0.4)',
					zlevel: 0
				});
			} else {
				chart.hideLoading();
			}
		}
	});

	function updateChart() {
		if (!chart || !option) return;

		// Merge theme with user option
		const themeConfig = themes[theme];
		const mergedOption: EChartsOption = {
			...themeConfig,
			...option,
			textStyle: {
				...themeConfig.textStyle,
				...(option.textStyle || {})
			}
		};

		try {
			chart.setOption(mergedOption, notMerge, lazyUpdate);
		} catch (err) {
			console.error('Error setting chart option:', err);
		}
	}

	// Cleanup on destroy
	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}

		if (chart) {
			// Remove event listeners
			if (onClick) chart.off('click', onClick);
			if (onDblClick) chart.off('dblclick', onDblClick);
			if (onMouseOver) chart.off('mouseover', onMouseOver);
			if (onMouseOut) chart.off('mouseout', onMouseOut);

			chart.dispose();
			chart = null;
		}
	});

	// Export chart instance for parent components
	export function getChart(): ECharts | null {
		return chart;
	}

	// Export resize method
	export function resize() {
		if (chart) {
			chart.resize();
		}
	}

	// Export clear method
	export function clear() {
		if (chart) {
			chart.clear();
		}
	}
</script>

<div
	class="chart-wrapper"
	style:height={typeof height === 'number' ? `${height}px` : height}
	style:width={typeof width === 'number' ? `${width}px` : width}
>
	{#if error}
		<div class="error-state">
			<div class="error-icon">⚠️</div>
			<div class="error-message">{error}</div>
		</div>
	{:else}
		<div bind:this={container} class="chart-container"></div>
	{/if}
</div>

<style>
	.chart-wrapper {
		width: 100%;
		position: relative;
		min-height: 200px;
	}

	.chart-container {
		width: 100%;
		height: 100%;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 1rem;
		color: rgba(255, 255, 255, 0.5);
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.error-icon {
		font-size: 3rem;
		opacity: 0.5;
	}

	.error-message {
		font-size: 0.875rem;
		text-align: center;
		max-width: 80%;
	}
</style>
