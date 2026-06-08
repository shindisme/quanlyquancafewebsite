import * as XLSX from 'xlsx';

interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, item: any) => string;
}

export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string = 'export'
) {
  // header row
  const header = columns.map((c) => c.label);

  // data rows
  const rows = data.map((item) =>
    columns.map((col) => {
      if (col.format) return col.format(item[col.key], item);
      const val = col.key.includes('.')
        ? col.key.split('.').reduce((o, k) => o?.[k], item)
        : item[col.key];
      return val ?? '';
    })
  );

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Auto column widths
  const colWidths = columns.map((col, i) => {
    const maxLen = Math.max(
      col.label.length,
      ...rows.map((r) => String(r[i] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
  });
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Download
  const safeName = filename.replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, '_');
  XLSX.writeFile(wb, `${safeName}.xlsx`);
}
