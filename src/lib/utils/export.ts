import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Table } from '@tanstack/svelte-table';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
	filename?: string;
	includeHeaders?: boolean;
	selectedRowsOnly?: boolean;
}

/**
 * Get table data for export based on options
 */
function getTableData<TData>(
	table: Table<TData>,
	options: ExportOptions = {}
): { headers: string[]; rows: any[][] } {
	const { includeHeaders = true, selectedRowsOnly = false } = options;

	// Get visible columns
	const visibleColumns = table
		.getAllColumns()
		.filter((col) => col.getIsVisible() && col.id !== 'select');

	// Get headers
	const headers = visibleColumns.map((col) => {
		const header = col.columnDef.header;
		if (typeof header === 'string') {
			return header;
		}
		return col.id;
	});

	// Get rows to export
	const rowsToExport = selectedRowsOnly
		? table.getSelectedRowModel().rows
		: table.getFilteredRowModel().rows;

	// Extract data from rows
	const rows = rowsToExport.map((row) => {
		return visibleColumns.map((col) => {
			const cell = row.getAllCells().find((c) => c.column.id === col.id);
			if (!cell) return '';

			// Get the raw value
			const value = cell.getValue();

			// Handle different value types
			if (value === null || value === undefined) return '';
			if (typeof value === 'object') return JSON.stringify(value);
			return String(value);
		});
	});

	return { headers, rows };
}

/**
 * Export table data to CSV
 */
export function exportToCSV<TData>(table: Table<TData>, options: ExportOptions = {}) {
	const { filename = 'export.csv' } = options;
	const { headers, rows } = getTableData(table, options);

	// Build CSV content
	const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

	// Create blob and download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Export table data to Excel
 */
export function exportToExcel<TData>(table: Table<TData>, options: ExportOptions = {}) {
	const { filename = 'export.xlsx' } = options;
	const { headers, rows } = getTableData(table, options);

	// Create workbook and worksheet
	const wb = XLSX.utils.book_new();
	const wsData = [headers, ...rows];
	const ws = XLSX.utils.aoa_to_sheet(wsData);

	// Auto-size columns
	const colWidths = headers.map((header, i) => {
		const headerWidth = header.length;
		const maxCellWidth = Math.max(...rows.map((row) => String(row[i] || '').length));
		return { wch: Math.max(headerWidth, maxCellWidth, 10) };
	});
	ws['!cols'] = colWidths;

	// Add worksheet to workbook
	XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

	// Generate Excel file and download
	XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Export table data to PDF
 */
export function exportToPDF<TData>(table: Table<TData>, options: ExportOptions = {}) {
	const { filename = 'export.pdf' } = options;
	const { headers, rows } = getTableData(table, options);

	// Create PDF document
	const doc = new jsPDF({
		orientation: headers.length > 5 ? 'landscape' : 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	// Add title
	doc.setFontSize(16);
	doc.text(filename.replace(/\.(pdf)$/i, ''), 14, 15);

	// Add table
	autoTable(doc, {
		head: [headers],
		body: rows,
		startY: 25,
		theme: 'grid',
		styles: {
			fontSize: 8,
			cellPadding: 2
		},
		headStyles: {
			fillColor: [79, 70, 229], // Accent color
			textColor: 255,
			fontStyle: 'bold'
		},
		alternateRowStyles: {
			fillColor: [245, 245, 245]
		},
		margin: { top: 25 }
	});

	// Save PDF
	doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Export table data in the specified format
 */
export function exportTable<TData>(
	table: Table<TData>,
	format: ExportFormat,
	options: ExportOptions = {}
) {
	switch (format) {
		case 'csv':
			exportToCSV(table, options);
			break;
		case 'excel':
			exportToExcel(table, options);
			break;
		case 'pdf':
			exportToPDF(table, options);
			break;
		default:
			console.error(`Unsupported export format: ${format}`);
	}
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
