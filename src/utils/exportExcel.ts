export type ExcelRow = Record<string, unknown> | unknown[];
export type ExcelCellValue = string | number | boolean | Date;
export type ExcelSheetRow = ExcelCellValue[];

export type ExcelColumn<T = ExcelRow> = {
  key: keyof T | string;
  title: string;
};

export type ExportExcelOptions<T = ExcelRow> = {
  columns?: Array<ExcelColumn<T>>;
  data?: T[];
  fields?: Record<string, string>;
  fileName?: string;
  header?: string | string[];
};

type WriteExcelFile = (
  rows: ExcelSheetRow[],
  options: {
    columns?: Array<{ width: number }>;
  },
) => {
  toFile: (fileName: string) => Promise<void>;
};

type WriteExcelFileModule = {
  default?: WriteExcelFile;
};

function getValue(row: unknown, key: string): unknown {
  if (!key) {
    return "";
  }

  return key.split(".").reduce<unknown>((value, part) => {
    if (value === null || value === undefined || typeof value !== "object") {
      return "";
    }

    return (value as Record<string, unknown>)[part];
  }, row);
}

function normalizeFileName(fileName = "data.xlsx"): string {
  if (/\.(xlsx|xls)$/i.test(fileName)) {
    return fileName.replace(/\.xls$/i, ".xlsx");
  }

  return `${fileName}.xlsx`;
}

function normalizeHeader(header?: string | string[]): string[] {
  if (!header) {
    return [];
  }

  return Array.isArray(header) ? header : [header];
}

function normalizeCellValue(value: unknown): ExcelCellValue {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value;
  }

  return String(value);
}

function getCellLength(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return String(value).length;
}

function normalizeColumns<T>({
  columns,
  fields,
}: Pick<ExportExcelOptions<T>, "columns" | "fields">) {
  if (columns?.length) {
    return columns.map((column) => ({
      key: String(column.key),
      title: column.title,
    }));
  }

  return Object.entries(fields || {}).map(([title, key]) => ({
    key,
    title,
  }));
}

export function buildExcelRows<T = ExcelRow>({
  columns,
  data = [],
  fields,
  header,
}: ExportExcelOptions<T>): ExcelSheetRow[] {
  const normalizedColumns = normalizeColumns({ columns, fields });
  const rows = normalizeHeader(header).map((text) => [
    normalizeCellValue(text),
  ]);

  if (normalizedColumns.length) {
    rows.push(normalizedColumns.map((column) => column.title));
    data.forEach((row) => {
      rows.push(
        normalizedColumns.map((column) =>
          normalizeCellValue(getValue(row, column.key)),
        ),
      );
    });

    return rows;
  }

  data.forEach((row) => {
    const values = Array.isArray(row)
      ? row
      : Object.values((row || {}) as Record<string, unknown>);

    rows.push(values.map(normalizeCellValue));
  });

  return rows;
}

export function getExcelColumnWidths(rows: ExcelSheetRow[]) {
  const widths: number[] = [];

  rows.forEach((row) => {
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index] || 10, getCellLength(cell) + 2);
    });
  });

  return widths.map((width) => ({
    width: Math.min(width, 40),
  }));
}

export async function exportExcel<T = ExcelRow>(
  options: ExportExcelOptions<T>,
): Promise<void> {
  const excelModule = await import("write-excel-file/browser");
  const writeExcelFile =
    (excelModule as WriteExcelFileModule).default ||
    (excelModule as unknown as WriteExcelFile);
  const rows = buildExcelRows(options);

  await writeExcelFile(rows, {
    columns: getExcelColumnWidths(rows),
  }).toFile(normalizeFileName(options.fileName));
}
