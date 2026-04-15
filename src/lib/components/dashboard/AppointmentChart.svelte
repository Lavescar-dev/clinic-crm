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
		tension?: number;
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
				type: 'cross',
				crossStyle: {
					color: '#FF6B00'
				}
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
			type: 'line',
			data: dataset.data,
			smooth: true,
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(75, 192, 192, 0.4)' },
						{ offset: 1, color: 'rgba(75, 192, 192, 0.05)' }
					]
				}
			},
			lineStyle: {
				width: 2,
				color: 'rgba(75, 192, 192, 1)'
			},
			itemStyle: {
				color: 'rgba(75, 192, 192, 1)',
				borderWidth: 2,
				borderColor: '#fff'
			},
			emphasis: {
				focus: 'series',
				itemStyle: {
					borderWidth: 3,
					shadowBlur: 10,
					shadowColor: 'rgba(75, 192, 192, 0.5)'
				}
			},
			animationDuration: 1000,
			animationEasing: 'cubicOut'
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
