import { Button, Empty, Modal, Spin, Tag, message } from "antd";
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
