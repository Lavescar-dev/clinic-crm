<script lang="ts">
	import BaseChart from './BaseChart.svelte';
	import type { EChartsOption, ECharts } from 'echarts';

	interface HeatmapDataItem {
		value: [number | string, number | string, number];
		itemStyle?: {
			color?: string;
		};
	}

	interface Props {
		data: HeatmapDataItem[] | number[][];
		xAxisData?: string[];
		yAxisData?: string[];
		title?: string;
		height?: number | string;
		width?: number | string;
		theme?: 'dark' | 'light';
		loading?: boolean;
		error?: string;
		showVisualMap?: boolean;
		minValue?: number;
		maxValue?: number;
		colorRange?: string[];
		showDataLabels?: boolean;
		showGrid?: boolean;
		onClick?: (params: any) => void;
		exportFilename?: string;
		xAxisLabel?: string;
		yAxisLabel?: string;
		tooltipFormatter?: (params: any) => string;
		splitNumber?: number;
	}

	let {
		data,
		xAxisData = [],
		yAxisData = [],
		title = '',
		height = 400,
		width = '100%',
		theme = 'dark',
		loading = false,
		error = '',
		showVisualMap = true,
		minValue,
		maxValue,
		colorRange,
		showDataLabels = false,
		showGrid = true,
		onClick,
		exportFilename = 'heatmap',
		xAxisLabel = '',
		yAxisLabel = '',
		tooltipFormatter,
		splitNumber = 4
	}: Props = $props();

	let chartInstance: ECharts | null = null;
	let baseChart: BaseChart;

	// Calculate min/max values from data if not provided
	const calculatedMinMax = $derived(() => {
		let min = minValue;
		let max = maxValue;

		if (min === undefined || max === undefined) {
			const values: number[] = [];
			if (Array.isArray(data[0])) {
				// data is number[][]
				(data as number[][]).forEach((row) => {
					row.forEach((val) => values.push(val));
				});
			} else {
				// data is HeatmapDataItem[]
				(data as HeatmapDataItem[]).forEach((item) => values.push(item.value[2]));
			}

			if (min === undefined) min = Math.min(...values);
			if (max === undefined) max = Math.max(...values);
		}

		return { min, max };
	});

	// Transform data to ECharts format
	const transformedData = $derived(() => {
		if (Array.isArray(data[0])) {
			// Convert number[][] to HeatmapDataItem[]
			return (data as number[][]).flatMap((row, yIndex) =>
				row.map((value, xIndex) => [xIndex, yIndex, value || 0])
			);
		}
		// Already in correct format
		return data as HeatmapDataItem[];
	});

	// Default color range based on theme
	const defaultColorRange = $derived(
		colorRange ||
			(theme === 'dark'
				? ['#001852', '#0033A0', '#0055CC', '#0077FF', '#00D9FF', '#FFD500', '#FF6B00']
				: ['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0', '#FFB74D', '#FF6B00'])
	);

	// Generate chart option
	const chartOption = $derived<EChartsOption>({
		title: title
			? {
					text: title,
					left: 'center',
					top: 10,
					textStyle: {
						color: theme === 'dark' ? '#FF6B00' : '#FF6B00',
						fontSize: 18,
						fontWeight: 'bold',
						fontFamily: 'IBM Plex Sans'
					}
			  }
			: undefined,
		grid: showGrid
			? {
					left: yAxisLabel ? '80px' : '60px',
					right: showVisualMap ? '140px' : '40px',
					bottom: xAxisLabel ? '80px' : '60px',
					top: title ? 70 : 40,
					containLabel: false
			  }
			: undefined,
		tooltip: {
			position: 'top',
			backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
			borderColor: '#FF6B00',
			borderWidth: 1,
			textStyle: {
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
				fontFamily: 'IBM Plex Sans',
				fontSize: 12
			},
			padding: 10,
			formatter: tooltipFormatter
				? tooltipFormatter
				: function (params: any) {
						const xLabel = xAxisData[params.value[0]] || params.value[0];
						const yLabel = yAxisData[params.value[1]] || params.value[1];
						const value = params.value[2];
						return `<div style="font-weight: bold; margin-bottom: 5px;">${yLabel} - ${xLabel}</div>
								<div>Value: <strong>${value}</strong></div>`;
				  }
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			name: xAxisLabel,
			nameLocation: 'middle',
			nameGap: 40,
			nameTextStyle: {
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
				fontFamily: 'IBM Plex Sans',
				fontSize: 14,
				fontWeight: 'bold'
			},
			axisLine: {
				lineStyle: {
					color: theme === 'dark' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)'
				}
			},
			axisLabel: {
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Mono',
				fontSize: 11,
				rotate: xAxisData.length > 20 ? 45 : 0
			},
			splitArea: {
				show: true,
				areaStyle: {
					color: [
						theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
						theme === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'
					]
				}
			}
		},
		yAxis: {
			type: 'category',
			data: yAxisData,
			name: yAxisLabel,
			nameLocation: 'middle',
			nameGap: 50,
			nameTextStyle: {
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
				fontFamily: 'IBM Plex Sans',
				fontSize: 14,
				fontWeight: 'bold'
			},
			axisLine: {
				lineStyle: {
					color: theme === 'dark' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)'
				}
			},
			axisLabel: {
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Mono',
				fontSize: 11
			},
			splitArea: {
				show: true,
				areaStyle: {
					color: [
						theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
						theme === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'
					]
				}
			}
		},
		visualMap: showVisualMap
			? {
					min: calculatedMinMax().min,
					max: calculatedMinMax().max,
					calculable: true,
					orient: 'vertical',
					right: 20,
					top: 'center',
					inRange: {
						color: defaultColorRange
					},
					textStyle: {
						color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
						fontFamily: 'IBM Plex Sans',
						fontSize: 11
					},
					splitNumber: splitNumber
			  }
			: undefined,
		series: [
			{
				name: 'Heatmap',
				type: 'heatmap',
				data: transformedData(),
				label: showDataLabels
					? {
							show: true,
							color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
							fontFamily: 'IBM Plex Mono',
							fontSize: 10,
							formatter: function (params: any) {
								return params.value[2];
							}
					  }
					: {
							show: false
					  },
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowColor: 'rgba(255, 107, 0, 0.5)',
						borderColor: '#FF6B00',
						borderWidth: 2
					}
				},
				progressive: 1000,
				animation: true
			}
		],
		// Toolbox for export
		toolbox: {
			feature: {
				restore: {
					icon: 'path://M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.96805 21 8.11804 20.2507 6.6875 19.0234L8.4375 17.2734C9.47363 18.1289 10.6758 18.5 12 18.5C15.5898 18.5 18.5 15.5898 18.5 12C18.5 8.41016 15.5898 5.5 12 5.5C8.41016 5.5 5.5 8.41016 5.5 12H8L4.5 15.5L1 12H3Z',
					iconStyle: {
						borderColor: '#FF6B00'
					}
				},
				saveAsImage: {
					name: exportFilename,
					pixelRatio: 2,
					backgroundColor: theme === 'dark' ? '#000' : '#fff',
					icon: 'path://M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12H19V19H5V5H12V3H5ZM14 3V5H17.5858L7.29289 15.2929L8.70711 16.7071L19 6.41421V10H21V3H14Z',
					iconStyle: {
						borderColor: '#FF6B00'
					}
				}
			},
			right: showVisualMap ? 160 : 20,
			top: 10,
			iconStyle: {
				borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)'
			},
			emphasis: {
				iconStyle: {
					borderColor: '#FF6B00'
				}
			}
		},
		// Animation
		animation: true,
		animationDuration: 1000,
		animationEasing: 'cubicOut'
	});

	// Handle chart ready
	function handleChartReady(chart: ECharts) {
		chartInstance = chart;
	}

	// Handle click
	function handleClick(params: any) {
		if (onClick && params.componentType === 'series') {
			onClick(params);
		}
	}

	// Export methods
	export function exportToPNG() {
		if (chartInstance) {
			const url = chartInstance.getDataURL({
				type: 'png',
				pixelRatio: 2,
				backgroundColor: theme === 'dark' ? '#000' : '#fff'
			});
			const link = document.createElement('a');
			link.download = `${exportFilename}.png`;
			link.href = url;
			link.click();
		}
	}

	export function exportToSVG() {
		if (chartInstance) {
			const url = chartInstance.getDataURL({
				type: 'svg',
				backgroundColor: theme === 'dark' ? '#000' : '#fff'
			});
			const link = document.createElement('a');
			link.download = `${exportFilename}.svg`;
			link.href = url;
			link.click();
		}
	}

	export function getChartInstance(): ECharts | null {
		return chartInstance;
	}

	// Highlight specific data item
	export function highlight(dataIndex: number) {
		if (chartInstance) {
			chartInstance.dispatchAction({
				type: 'highlight',
				seriesIndex: 0,
				dataIndex: dataIndex
			});
		}
	}

	// Remove highlight
	export function downplay(dataIndex?: number) {
		if (chartInstance) {
			chartInstance.dispatchAction({
				type: 'downplay',
				seriesIndex: 0,
				dataIndex: dataIndex
			});
		}
	}

	// Update visual map range
	export function updateVisualMapRange(min: number, max: number) {
		if (chartInstance) {
			chartInstance.dispatchAction({
				type: 'selectDataRange',
				selected: [min, max]
			});
		}
	}
</script>

<BaseChart
	bind:this={baseChart}
	option={chartOption}
	{loading}
	{error}
	{height}
	{width}
	{theme}
	onChartReady={handleChartReady}
	onClick={handleClick}
/>
