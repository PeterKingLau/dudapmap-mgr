<template>
  <span class="download-excel-compat" @click="download">
    <slot />
  </span>
</template>

<script>
function getValue(row, key) {
  if (!key) {
    return "";
  }

  return key.split(".").reduce((value, part) => {
    if (value === null || value === undefined) {
      return "";
    }

    return value[part];
  }, row);
}

function normalizeFileName(name) {
  const fileName = name || "data.xlsx";

  if (/\.(xlsx|xls)$/i.test(fileName)) {
    return fileName.replace(/\.xls$/i, ".xlsx");
  }

  return `${fileName}.xlsx`;
}

function normalizeHeader(header) {
  if (!header) {
    return [];
  }

  return Array.isArray(header) ? header : [header];
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
}

function getCellLength(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  return String(value).length;
}

function buildSheetRows({ data, fields, header }) {
  const columns = Object.entries(fields || {}).map(([title, key]) => ({
    title,
    key,
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

function getColumnWidths(rows) {
  const widths = [];

  rows.forEach((row) => {
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index] || 10, getCellLength(cell) + 2);
    });
  });

  return widths.map((width) => ({
    width: Math.min(width, 40),
  }));
}

export default {
  name: "DownloadExcelCompat",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Object,
      default: () => ({}),
    },
    header: {
      type: [String, Array],
      default: "",
    },
    name: {
      type: String,
      default: "data.xlsx",
    },
    beforeGenerate: {
      type: Function,
      default: () => {},
    },
  },
  methods: {
    async download() {
      await this.beforeGenerate();
      await this.$nextTick();

      const excelModule = await import("write-excel-file/browser");
      const writeExcelFile = excelModule.default || excelModule;
      const rows = buildSheetRows({
        data: this.data,
        fields: this.fields,
        header: this.header,
      });

      await writeExcelFile(rows, {
        columns: getColumnWidths(rows),
      }).toFile(normalizeFileName(this.name));
    },
  },
};
</script>

<style scoped>
.download-excel-compat {
  display: contents;
}
</style>
