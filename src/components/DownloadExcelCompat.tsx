import type { ReactNode } from "react";

type ExcelRow = Record<string, unknown> | unknown[];

type DownloadExcelCompatProps = {
  beforeGenerate?: () => Promise<void> | void;
  children?: ReactNode;
  className?: string;
  data?: ExcelRow[];
  fields?: Record<string, string>;
  header?: string | string[];
  name?: string;
};

function getValue(row: ExcelRow, key: string): unknown {
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

function normalizeFileName(name = "data.xlsx"): string {
  if (/\.(xlsx|xls)$/i.test(name)) {
    return name.replace(/\.xls$/i, ".xlsx");
  }

  return `${name}.xlsx`;
}

function normalizeHeader(header?: string | string[]): string[] {
  if (!header) {
    return [];
  }

  return Array.isArray(header) ? header : [header];
}

function normalizeCellValue(value: unknown): string | number | boolean | Date {
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

function buildSheetRows({
  data = [],
  fields = {},
  header,
}: Required<Pick<DownloadExcelCompatProps, "data" | "fields">> &
  Pick<DownloadExcelCompatProps, "header">) {
  const columns = Object.entries(fields).map(([title, key]) => ({
    key,
    title,
  }));
  const rows = normalizeHeader(header).map((text) => [
    normalizeCellValue(text),
  ]);

  if (columns.length) {
    rows.push(columns.map((column) => column.title));
    data.forEach((row) => {
      rows.push(
        columns.map((column) => normalizeCellValue(getValue(row, column.key))),
      );
    });

    return rows;
  }

  data.forEach((row) => {
    rows.push(
      (Array.isArray(row) ? row : Object.values(row || {})).map(
        normalizeCellValue,
      ),
    );
  });

  return rows;
}

function getColumnWidths(rows: Array<Array<unknown>>) {
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

export function DownloadExcelCompat({
  beforeGenerate,
  children,
  className,
  data = [],
  fields = {},
  header = "",
  name = "data.xlsx",
}: DownloadExcelCompatProps) {
  async function download() {
    await beforeGenerate?.();

    const excelModule = await import("write-excel-file/browser");
    const writeExcelFile = excelModule.default || excelModule;
    const rows = buildSheetRows({
      data,
      fields,
      header,
    });

    await writeExcelFile(rows, {
      columns: getColumnWidths(rows),
    }).toFile(normalizeFileName(name));
  }

  return (
    <span
      className={className}
      style={{ display: "contents" }}
      onClick={download}
    >
      {children}
    </span>
  );
}

export default DownloadExcelCompat;

