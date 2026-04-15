<script lang="ts">
	import BaseChart from './BaseChart.svelte';
	import type { EChartsOption, ECharts } from 'echarts';

	interface DataItem {
		value: number;
		name: string;
		itemStyle?: {
			color?: string | {
				type: 'linear' | 'radial';
				x?: number;
				y?: number;
				x2?: number;
				y2?: number;
				r?: number;
				colorStops: { offset: number; color: string }[];
			};
		};
		[key: string]: any;
	}

	interface Props {
		data: DataItem[];
		title?: string;
		height?: number | string;
		width?: number | string;
		theme?: 'dark' | 'light';
		loading?: boolean;
		error?: string;
		doughnut?: boolean;
		showPercentage?: boolean;
		showLegend?: boolean;
		showLabels?: boolean;
		enableGradient?: boolean;
		onDrillDown?: (params: any) => void;
		exportFilename?: string;
		radius?: [string, string] | string;
		roseType?: boolean | 'radius' | 'area';
	}

	let {
		data,
		title = '',
		height = 400,
		width = '100%',
		theme = 'dark',
		loading = false,
		error = '',
		doughnut = false,
		showPercentage = true,
		showLegend = true,
		showLabels = true,
		enableGradient = false,
		onDrillDown,
		exportFilename = 'pie-chart',
		radius = doughnut ? ['40%', '70%'] : '70%',
		roseType = false
	}: Props = $props();

	let chartInstance: ECharts | null = null;
	let baseChart: BaseChart;

	// Generate gradient colors if enabled
	function getGradientColor(baseColor: string, index: number): any {
		if (!enableGradient) return baseColor;

		// Create radial gradient for pie slices
		return {
			type: 'radial',
			x: 0.5,
			y: 0.5,
			r: 0.5,
			colorStops: [
				{ offset: 0, color: baseColor },
				{
					offset: 1,
					color: adjustColorBrightness(baseColor, -30)
				}
			]
		};
	}

	// Helper to adjust color brightness
	function adjustColorBrightness(color: string, amount: number): string {
		// Simple brightness adjustment for hex colors
		const hex = color.replace('#', '');
		const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
		const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
		const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	// Color palette from BaseChart theme
	const colorPalette = $derived.by(() =>
		theme === 'dark'
			? [
				'#FF6B00', '#00D9FF', '#FF3D71', '#00E096',
				'#AA00FF', '#FFD500', '#FF6D00', '#00BFA5'
			]
			: [
				'#FF6B00', '#0091EA', '#D32F2F', '#388E3C',
				'#7B1FA2', '#F57C00', '#E64A19', '#00796B'
			]
	);

	// Process data with colors and gradients
	const processedData = $derived(
		data.map((item, index) => {
			const baseColor = item.itemStyle?.color || colorPalette[index % colorPalette.length];
			return {
				...item,
				itemStyle: {
					...item.itemStyle,
					color: typeof baseColor === 'string'
						? getGradientColor(baseColor, index)
						: baseColor
				}
			};
		})
	);

	// Calculate total for percentages
	const total = $derived(data.reduce((sum, item) => sum + item.value, 0));

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
		tooltip: {
			trigger: 'item',
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
				const percentage = ((params.value / total) * 100).toFixed(1);
				const marker = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>`;
				return `
					<div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
					<div>${marker}Value: <strong>${params.value}</strong></div>
					<div style="margin-left: 15px;">Percentage: <strong>${percentage}%</strong></div>
				`;
			}
		},
		legend: showLegend
			? {
					orient: 'vertical',
					right: '5%',
					top: 'center',
					data: data.map((item) => item.name),
					textStyle: {
						color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
						fontFamily: 'IBM Plex Sans',
						fontSize: 12
					},
					icon: 'circle',
					itemGap: 12,
					// Enable legend toggle
					selectedMode: 'multiple',
					itemWidth: 12,
					itemHeight: 12
			  }
			: undefined,
		series: [
			{
				name: title || 'Data',
				type: 'pie',
				radius: radius as any,
				center: showLegend ? ['40%', '50%'] : ['50%', '50%'],
				data: processedData,
				roseType: roseType as any,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(255, 107, 0, 0.5)'
					},
					label: {
						show: true,
						fontSize: 14,
						fontWeight: 'bold'
					},
					// Scale up on hover
					scale: true,
					scaleSize: 5
				},
				label: showLabels
					? {
							show: true,
							formatter: showPercentage
								? '{b}: {d}%'
								: '{b}: {c}',
							color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
							fontFamily: 'IBM Plex Sans',
							fontSize: 11,
							fontWeight: 'normal'
					  }
					: {
							show: false
					  },
				labelLine: showLabels
					? {
							show: true,
							lineStyle: {
								color: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
							},
							smooth: 0.2,
							length: 10,
							length2: 10
					  }
					: {
							show: false
					  },
				// Animation settings
				animationType: 'scale',
				animationEasing: 'elasticOut',
				animationDelay: function (idx: number) {
					return idx * 50;
				}
			}
		],
		// Overall animation
		animation: true,
		animationDuration: 1000,
		animationEasing: 'cubicOut',
		animationDurationUpdate: 500,
		animationEasingUpdate: 'cubicInOut',
		// Toolbox for export
		toolbox: {
			feature: {
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
		}
	});

	// Handle chart ready
	function handleChartReady(chart: ECharts) {
		chartInstance = chart;
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

	// Toggle legend item visibility
	export function toggleLegendItem(name: string) {
		if (chartInstance) {
			chartInstance.dispatchAction({
				type: 'legendToggleSelect',
				name: name
			});
		}
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
