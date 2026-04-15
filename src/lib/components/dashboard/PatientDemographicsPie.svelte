<script lang="ts">
	import { get } from 'svelte/store';
	import { theme } from '$stores/theme';
	import BaseChart from '$lib/components/charts/echarts/BaseChart.svelte';
	import type { EChartsOption, ECharts } from 'echarts';

	interface DataItem {
		value: number;
		name: string;
	}

	interface Props {
		data?: DataItem[];
		title?: string;
		height?: number | string;
		showPercentage?: boolean;
	}

	let {
		data = [],
		title = '',
		height = 400,
		showPercentage = true
	}: Props = $props();

	let chartInstance: ECharts | null = null;
	let baseChart: BaseChart;

	const isDarkMode = $derived(get(theme).effectiveTheme === 'dark');

	// Color palette
	const colorPalette = [
		'#FF6B00', // Rust orange
		'#00D9FF', // Cyan
		'#FF3D71', // Pink
		'#00E096', // Green
		'#AA00FF', // Purple
		'#FFD500', // Yellow
		'#FF6D00', // Deep orange
		'#00BFA5'  // Teal
	];

	const chartOption = $derived({
		title: title ? {
			text: title,
			left: 'center',
			textStyle: {
				color: isDarkMode ? '#FF6B00' : '#FF6B00',
				fontSize: 16,
				fontWeight: 'bold',
				fontFamily: 'IBM Plex Sans'
			}
		} : undefined,
		color: colorPalette,
		tooltip: {
			trigger: 'item',
			backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
			borderColor: isDarkMode ? '#FF6B00' : '#ddd',
			borderWidth: 1,
			textStyle: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			},
			formatter: '{b}: {c} ({d}%)'
		},
		legend: {
			orient: 'vertical',
			left: 'left',
			top: 'center',
			textStyle: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			},
			selectedMode: 'multiple'
		},
		series: [
			{
				name: 'Patient Demographics',
				type: 'pie',
				radius: '60%',
				center: ['60%', '50%'],
				data: data,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
						borderWidth: 3,
						borderColor: isDarkMode ? '#FF6B00' : '#fff'
					},
					label: {
						show: true,
						fontSize: 14,
						fontWeight: 'bold'
					}
				},
				label: {
					show: showPercentage,
					formatter: '{b}: {d}%',
					color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
					fontFamily: 'IBM Plex Sans'
				},
				labelLine: {
					show: showPercentage,
					lineStyle: {
						color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
					}
				},
				animationType: 'scale',
				animationDuration: 1000,
				animationEasing: 'elasticOut',
				animationDelay: (idx: number) => idx * 50
			}
		]
	} as EChartsOption);

	function handleChartReady(chart: ECharts) {
		chartInstance = chart;
	}
</script>

<div style="height: {typeof height === 'number' ? `${height}px` : height};">
	<BaseChart
		bind:this={baseChart}
		option={chartOption}
		theme={isDarkMode ? 'dark' : 'light'}
		onChartReady={handleChartReady}
	/>
</div>
