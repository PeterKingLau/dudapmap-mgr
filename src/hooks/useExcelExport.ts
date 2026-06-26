import { useCallback, useState } from "react";
import {
  exportExcel as exportExcelFile,
  type ExportExcelOptions,
} from "../utils/exportExcel";

export function useExcelExport() {
  const [exporting, setExporting] = useState(false);

  const exportExcel = useCallback(async <T,>(options: ExportExcelOptions<T>) => {
    setExporting(true);

    try {
      await exportExcelFile(options);
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exporting,
    exportExcel,
  };
}
