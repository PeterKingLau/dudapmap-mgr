import { message } from "@/utils/message";
import { Button, Empty, Modal, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
import { useExcelExport } from "../../hooks/useExcelExport";
import "./shared.css";

export type StatCard = {
  label: string;
  theme?: "blue" | "green" | "orange" | "red";
  value: string | number;
};

export type CsvColumn<T> = {
  key: keyof T | string;
  title: string;
};

export type AttendanceSummaryRow = {
  attendanceDays: string | number;
  id?: number;
  lackCardCount: string | number;
  lateCount: string | number;
  lateDuration: string | number;
  leaveEarlyCount: string | number;
  leaveEarlyDuration: string | number;
  name: string;
  seriousLateCount: string | number;
  seriousLateDuration: string | number;
  seriousLeaveEarlyCount: string | number;
  seriousLeaveEarlyDuration: string | number;
  tel: string;
  totalDuration: string | number;
};

export type AttendanceSummaryFieldKey = Exclude<
  keyof AttendanceSummaryRow,
  "id" | "name" | "tel"
>;

export type AttendanceSummaryField = {
  index: number;
  key: AttendanceSummaryFieldKey;
  theme: NonNullable<StatCard["theme"]>;
  title: string;
  valueType?: "duration";
};

export const attendanceSummaryFields: AttendanceSummaryField[] = [
  {
    key: "totalDuration",
    title: "总时长",
    index: 1,
    theme: "blue",
    valueType: "duration",
  },
  {
    key: "lackCardCount",
    title: "缺卡次数",
    index: 2,
    theme: "red",
  },
  {
    key: "lateCount",
    title: "迟到次数",
    index: 3,
    theme: "orange",
  },
  {
    key: "leaveEarlyCount",
    title: "早退次数",
    index: 4,
    theme: "orange",
  },
  {
    key: "attendanceDays",
    title: "出勤天数",
    index: 5,
    theme: "green",
  },
  {
    key: "seriousLateCount",
    title: "严重迟到次数",
    index: 6,
    theme: "red",
  },
  {
    key: "seriousLeaveEarlyCount",
    title: "严重早退次数",
    index: 7,
    theme: "red",
  },
  {
    key: "lateDuration",
    title: "迟到时长",
    index: 8,
    theme: "orange",
    valueType: "duration",
  },
  {
    key: "leaveEarlyDuration",
    title: "早退时长",
    index: 9,
    theme: "orange",
    valueType: "duration",
  },
  {
    key: "seriousLateDuration",
    title: "严重迟到时长",
    index: 10,
    theme: "red",
    valueType: "duration",
  },
  {
    key: "seriousLeaveEarlyDuration",
    title: "严重早退时长",
    index: 11,
    theme: "red",
    valueType: "duration",
  },
];

type AttendanceHeaderProps = {
  description: string;
  extra?: React.ReactNode;
  icon?: string;
  title: string;
};

type AttendanceSectionProps = {
  action?: React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
  title: string;
};

type ExportDialogProps<T> = {
  columns: Array<CsvColumn<T>>;
  fileName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  rows: T[];
};

export function AttendanceHeader({
  description,
  extra,
  icon,
  title,
}: AttendanceHeaderProps) {
  return (
    <section className="react-att-header">
      <div className="react-att-header-main">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="react-att-header-side">
        {extra}
        {icon ? (
          <div className="react-att-header-icon">
            <img src={icon} alt="" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AttendanceLoading() {
  return (
    <section className="react-att-loading">
      <Spin size="large" />
      <span>正在请求数据，请稍后...</span>
    </section>
  );
}

export function AttendanceStats({ items }: { items: StatCard[] }) {
  return (
    <section className="react-att-stats">
      {items.map((item) => (
        <article
          className={`react-att-stat theme-${item.theme || "blue"}`}
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

export function AttendanceSection({
  action,
  children,
  subtitle,
  title,
}: AttendanceSectionProps) {
  return (
    <section className="react-att-section">
      <div className="react-att-section-title">
        <div>
          <h2>{title}</h2>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AttendanceEmpty({
  description,
  title = "暂无数据",
}: {
  description: string;
  title?: string;
}) {
  return (
    <div className="react-att-empty">
      <Empty description={title} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      <p>{description}</p>
    </div>
  );
}

export function formatName(name: unknown) {
  const value = String(name || "");

  if (!value || value === "noname" || value === "null") {
    return "暂未上传名";
  }

  return value;
}

export function getRecordObject(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

export function getResponseArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export function normalizeSummaryValue(
  value: unknown,
  valueType?: "duration",
): string | number {
  const text = String(value ?? "").trim();

  if (!text) {
    return valueType === "duration" ? "0m" : 0;
  }

  if (valueType === "duration") {
    return /(?:h|m|小时|分钟)$/i.test(text) ? text : `${text}m`;
  }

  return text;
}

export function parseDurationMinutes(value: unknown): number {
  const text = String(value || "").trim();

  if (!text) {
    return 0;
  }

  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:h|小时)/i);
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|分钟)/i);

  if (hourMatch || minuteMatch) {
    return Number(hourMatch?.[1] || 0) * 60 + Number(minuteMatch?.[1] || 0);
  }

  const numericValue = Number(text);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function formatDuration(minutes: number): string {
  const safeMinutes = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const restMinutes = safeMinutes % 60;

  if (hours && restMinutes) {
    return `${hours}h${restMinutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${restMinutes}m`;
}

export function parseAttendanceSummaryRecords(
  source: unknown,
): AttendanceSummaryRow[] {
  const record = getRecordObject(source);

  return Object.entries(record).map(([tel, value], index) => {
    const itemArr = String(value || "").split("&");
    const row: AttendanceSummaryRow = {
      attendanceDays: 0,
      id: index + 1,
      lackCardCount: 0,
      lateCount: 0,
      lateDuration: "0m",
      leaveEarlyCount: 0,
      leaveEarlyDuration: "0m",
      name: itemArr[0] || "",
      seriousLateCount: 0,
      seriousLateDuration: "0m",
      seriousLeaveEarlyCount: 0,
      seriousLeaveEarlyDuration: "0m",
      tel,
      totalDuration: "0m",
    };

    attendanceSummaryFields.forEach((field) => {
      (row as Record<string, string | number | undefined>)[field.key] =
        normalizeSummaryValue(itemArr[field.index], field.valueType);
    });

    return row;
  });
}

export function renderAttendanceSummaryValue(
  field: AttendanceSummaryField,
  value: unknown,
) {
  const displayValue =
    typeof value === "string" || typeof value === "number" ? value : 0;

  if (field.valueType === "duration") {
    return displayValue || "0m";
  }

  const unit = field.key === "attendanceDays" ? "天" : "次";

  return (
    <Tag color={Number(displayValue || 0) > 0 ? field.theme : "green"}>
      {displayValue || 0} {unit}
    </Tag>
  );
}

export function getAttendanceSummaryColumns<T = AttendanceSummaryRow>() {
  return [
    { key: "id", title: "序号" },
    { key: "name", title: "姓名" },
    { key: "tel", title: "电话号码" },
    ...attendanceSummaryFields.map((field) => ({
      key: field.key as keyof T | string,
      title: field.title,
    })),
  ];
}

export function ExportDialog<T>({
  columns,
  fileName,
  onOpenChange,
  open,
  rows,
}: ExportDialogProps<T>) {
  const successTimerRef = useRef<number | null>(null);
  const { exportExcel, exporting } = useExcelExport();

  useEffect(
    () => () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    },
    [],
  );

  async function confirmExport() {
    try {
      await exportExcel({
        columns,
        data: rows,
        fileName,
      });
      onOpenChange(false);
      successTimerRef.current = window.setTimeout(() => {
        message.success(`${fileName}导出成功`);
      }, 300);
    } catch {
      message.error(`${fileName}导出失败`);
    }
  }

  return (
    <Modal
      className="react-att-modal"
      footer={null}
      open={open}
      title="导出 Excel"
      width={460}
      onCancel={() => onOpenChange(false)}
    >
      <div className="react-att-export">
        <div className="react-att-export-icon">
          <Icon icon="ri:file-excel-2-line" />
        </div>
        <h3>确认导出</h3>
        <p>
          是否要导出 <span>{fileName}</span>？
        </p>
        <Tag color="blue">{rows.length} 条记录</Tag>
        <div className="react-att-actions">
          <Button onClick={() => onOpenChange(false)}>取消</Button>
          <Button loading={exporting} type="primary" onClick={confirmExport}>
            导出
          </Button>
        </div>
      </div>
    </Modal>
  );
}
