<script lang="ts">
	import { get } from 'svelte/store';
	import { theme } from '$stores/theme';
	import BaseChart from '$lib/components/charts/echarts/BaseChart.svelte';
	import type { EChartsOption, ECharts } from 'echarts';

	interface ChartJsDataset {
		label: string;
		data: number[];
		backgroundColor?: string;
		borderColor?: string;
	}

	interface ChartJsData {
		labels: string[];
		datasets: ChartJsDataset[];
	}

	interface Props {
		data: ChartJsData;
	}

	let { data }: Props = $props();

	let chartInstance: ECharts | null = null;
	let baseChart: BaseChart;

	const isDarkMode = $derived(get(theme).effectiveTheme === 'dark');

	// Transform Chart.js data format to ECharts format
	const chartOption = $derived({
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '15%',
			containLabel: true
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
			borderColor: isDarkMode ? '#FF6B00' : '#ddd',
			borderWidth: 1,
			textStyle: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			}
		},
		legend: {
			data: data.datasets.map((d) => d.label),
			top: 0,
			textStyle: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			}
		},
		xAxis: {
			type: 'category',
			data: data.labels,
			axisLine: {
				lineStyle: {
					color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
				}
			},
			axisLabel: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			},
			splitLine: {
				show: false
			}
		},
		yAxis: {
			type: 'value',
			axisLine: {
				show: false
			},
			axisLabel: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			},
			splitLine: {
				lineStyle: {
					color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
					type: 'dashed'
				}
			}
		},
		series: data.datasets.map((dataset) => ({
			name: dataset.label,
			type: 'bar',
			data: dataset.data,
			itemStyle: {
				color: 'rgba(153, 102, 255, 0.8)',
				borderRadius: [4, 4, 0, 0]
			},
			emphasis: {
				itemStyle: {
					color: 'rgba(153, 102, 255, 1)',
					shadowBlur: 10,
					shadowColor: 'rgba(153, 102, 255, 0.5)'
				}
			},
			animationDuration: 1000,
			animationEasing: 'elasticOut',
			animationDelay: (idx: number) => idx * 30
		}))
	} as EChartsOption);

	function handleChartReady(chart: ECharts) {
		chartInstance = chart;
	}
</script>

<div class="h-64">
	<BaseChart
		bind:this={baseChart}
		option={chartOption}
		theme={isDarkMode ? 'dark' : 'light'}
		onChartReady={handleChartReady}
	/>
</div>
