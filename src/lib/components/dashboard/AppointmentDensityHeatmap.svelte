<script lang="ts">
	import { get } from 'svelte/store';
	import { theme } from '$stores/theme';
	import BaseChart from '$lib/components/charts/echarts/BaseChart.svelte';
	import type { EChartsOption, ECharts } from 'echarts';

	interface Props {
		data?: number[][];
		xAxisData?: string[];
		yAxisData?: string[];
		title?: string;
		height?: number | string;
	}

	let {
		data = [],
		xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		yAxisData = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
		title = '',
		height = 400
	}: Props = $props();

	let chartInstance: ECharts | null = null;
	let baseChart: BaseChart;

	const isDarkMode = $derived(get(theme).effectiveTheme === 'dark');

	// Transform 2D array data to ECharts heatmap format
	const transformedData = $derived(data.flatMap((row, yIndex) =>
		row.map((value, xIndex) => [xIndex, yIndex, value || 0])
	));

	// Calculate min/max for color scale
	const minValue = $derived(transformedData.length > 0 ? Math.min(...transformedData.map(d => d[2])) : 0);
	const maxValue = $derived(transformedData.length > 0 ? Math.max(...transformedData.map(d => d[2])) : 10);

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
		grid: {
			left: '10%',
			right: '10%',
			bottom: '15%',
			top: title ? '15%' : '10%',
			containLabel: true
		},
		tooltip: {
			position: 'top',
			backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
			borderColor: isDarkMode ? '#FF6B00' : '#ddd',
			borderWidth: 1,
			textStyle: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			},
			formatter: (params: any) => {
				const xLabel = xAxisData[params.data[0]];
				const yLabel = yAxisData[params.data[1]];
				const value = params.data[2];
				return `${xLabel} ${yLabel}<br/>Appointments: ${value}`;
			}
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			splitArea: {
				show: true,
				areaStyle: {
					color: isDarkMode
						? ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
						: ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.05)']
				}
			},
			axisLine: {
				lineStyle: {
					color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
				}
			},
			axisLabel: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			}
		},
		yAxis: {
			type: 'category',
			data: yAxisData,
			splitArea: {
				show: true,
				areaStyle: {
					color: isDarkMode
						? ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
						: ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.05)']
				}
			},
			axisLine: {
				lineStyle: {
					color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
				}
			},
			axisLabel: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			}
		},
		visualMap: {
			min: minValue,
			max: maxValue,
			calculable: true,
			orient: 'horizontal',
			left: 'center',
			bottom: '0%',
			inRange: {
				color: isDarkMode
					? ['#0d47a1', '#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb']
					: ['#e3f2fd', '#90caf9', '#64b5f6', '#42a5f5', '#1976d2', '#0d47a1']
			},
			textStyle: {
				color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Sans'
			}
		},
		series: [
			{
				name: 'Appointment Density',
				type: 'heatmap',
				data: transformedData,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
						borderWidth: 2,
						borderColor: isDarkMode ? '#FF6B00' : '#FF6B00'
					}
				},
				animationDuration: 1000,
				animationEasing: 'cubicOut'
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
