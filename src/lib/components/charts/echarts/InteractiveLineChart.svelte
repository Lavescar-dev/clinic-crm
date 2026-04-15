<script lang="ts">
	import BaseChart from './BaseChart.svelte';
	import type { EChartsOption, ECharts } from 'echarts';

	interface DataPoint {
		value: number;
		name?: string;
		[key: string]: any;
	}

	interface Dataset {
		name: string;
		data: (number | DataPoint)[];
		smooth?: boolean;
		areaStyle?: boolean;
		color?: string;
	}

	interface Props {
		datasets: Dataset[];
		xAxisData?: string[];
		title?: string;
		height?: number | string;
		width?: number | string;
		theme?: 'dark' | 'light';
		loading?: boolean;
		error?: string;
		enableZoom?: boolean;
		enableBrush?: boolean;
		enableCrosshair?: boolean;
		enableDataZoom?: boolean;
		showLegend?: boolean;
		showGrid?: boolean;
		onDrillDown?: (params: any) => void;
		onBrushSelected?: (params: any) => void;
		exportFilename?: string;
	}

	let {
		datasets,
		xAxisData = [],
		title = '',
		height = 400,
		width = '100%',
		theme = 'dark',
		loading = false,
		error = '',
		enableZoom = true,
		enableBrush = true,
		enableCrosshair = true,
		enableDataZoom = true,
		showLegend = true,
		showGrid = true,
		onDrillDown,
		onBrushSelected,
		exportFilename = 'line-chart'
	}: Props = $props();

	let chartInstance: ECharts | null = null;
	let baseChart: BaseChart;

	// Generate chart option
	const chartOption = $derived<EChartsOption>({
		title: title
			? {
					text: title,
					left: 'center',
					textStyle: {
						color: theme === 'dark' ? '#FF6B00' : '#FF6B00',
						fontSize: 18,
						fontWeight: 'bold',
						fontFamily: 'IBM Plex Sans'
					}
			  }
			: undefined,
		legend: showLegend
			? {
					data: datasets.map((d) => d.name),
					top: title ? 40 : 10,
					textStyle: {
						color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
						fontFamily: 'IBM Plex Sans'
					}
			  }
			: undefined,
		grid: showGrid
			? {
					left: '3%',
					right: '4%',
					bottom: enableDataZoom ? '15%' : '3%',
					top: showLegend ? (title ? 80 : 50) : title ? 60 : 30,
					containLabel: true
			  }
			: undefined,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: enableCrosshair ? 'cross' : 'line',
				crossStyle: {
					color: '#FF6B00',
					width: 1,
					type: 'dashed'
				},
				lineStyle: {
					color: '#FF6B00',
					width: 1,
					type: 'dashed'
				}
			},
			backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
			borderColor: '#FF6B00',
			borderWidth: 1,
			textStyle: {
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
				fontFamily: 'IBM Plex Sans',
				fontSize: 12
			},
			padding: 10,
			formatter: function (params: any) {
				if (!Array.isArray(params)) return '';
				let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
				params.forEach((param: any) => {
					const marker = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px;"></span>`;
					result += `<div>${marker}${param.seriesName}: <strong>${param.value}</strong></div>`;
				});
				return result;
			}
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			boundaryGap: false,
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
				color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
				fontFamily: 'IBM Plex Mono',
				fontSize: 11
			},
			splitLine: {
				lineStyle: {
					color: theme === 'dark' ? 'rgba(255, 107, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)',
					type: 'dashed'
				}
			}
		},
		series: datasets.map((dataset) => ({
			name: dataset.name,
			type: 'line',
			data: dataset.data,
			smooth: dataset.smooth ?? true,
			lineStyle: {
				width: 2,
				color: dataset.color
			},
			areaStyle: dataset.areaStyle
				? {
						opacity: 0.3
				  }
				: undefined,
			emphasis: {
				focus: 'series',
				blurScope: 'coordinateSystem'
			},
			symbolSize: 6,
			symbol: 'circle'
		})),
		// DataZoom for zoom and pan
		dataZoom: enableDataZoom
			? [
					{
						type: 'inside',
						start: 0,
						end: 100,
						zoomOnMouseWheel: enableZoom,
						moveOnMouseMove: true,
						moveOnMouseWheel: false
					},
					{
						type: 'slider',
						start: 0,
						end: 100,
						height: 20,
						bottom: 10,
						handleSize: '80%',
						handleStyle: {
							color: '#FF6B00'
						},
						textStyle: {
							color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
							fontFamily: 'IBM Plex Sans'
						},
						borderColor: theme === 'dark' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',
						fillerColor: 'rgba(255, 107, 0, 0.2)',
						backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
					}
			  ]
			: undefined,
		// Brush for selection
		brush: enableBrush
			? {
					toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
					xAxisIndex: 0,
					brushStyle: {
						borderWidth: 1,
						color: 'rgba(255, 107, 0, 0.2)',
						borderColor: '#FF6B00'
					},
					outOfBrush: {
						colorAlpha: 0.1
					}
			  }
			: undefined,
		// Toolbox for export and other tools
		toolbox: {
			feature: {
				dataZoom: enableZoom
					? {
							yAxisIndex: 'none',
							icon: {
								zoom: 'path://M4.5 12C4.5 7.85786 7.85786 4.5 12 4.5C16.1421 4.5 19.5 7.85786 19.5 12C19.5 16.1421 16.1421 19.5 12 19.5C7.85786 19.5 4.5 16.1421 4.5 12Z',
								back: 'path://M5 12L11 6V9C14.866 9 18 12.134 18 16C18 17.0357 17.7485 18.0144 17.3014 18.8786C16.5856 17.034 14.9404 15.6988 13 15.1938V18L5 12Z'
							},
							iconStyle: {
								borderColor: '#FF6B00'
							}
					  }
					: undefined,
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
			right: 20,
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
		animationDuration: 800,
		animationEasing: 'cubicOut',
		animationDurationUpdate: 500,
		animationEasingUpdate: 'cubicInOut'
	});

	// Handle chart ready
	function handleChartReady(chart: ECharts) {
		chartInstance = chart;

		// Set up brush selected event
		if (enableBrush && onBrushSelected) {
			chart.on('brushSelected', onBrushSelected);
		}
	}

	// Handle click for drill down
	function handleClick(params: any) {
		if (onDrillDown && params.componentType === 'series') {
			onDrillDown(params);
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

	export function resetZoom() {
		if (chartInstance) {
			chartInstance.dispatchAction({
				type: 'dataZoom',
				start: 0,
				end: 100
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
