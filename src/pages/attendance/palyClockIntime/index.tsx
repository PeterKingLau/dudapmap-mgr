import { message } from "@/utils/message";
import { Button, Table, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAttendanceByDate } from "../../../api/attendance";
import { useRouteQueryValue } from "../../../hooks/useRouteQueryValue";
import {
  type AttendanceSummaryRow,
  AttendanceEmpty,
  AttendanceHeader,
  AttendanceLoading,
  AttendanceSection,
  AttendanceStats,
  ExportDialog,
  attendanceSummaryFields,
  formatDuration,
  formatName,
  getAttendanceSummaryColumns,
  parseAttendanceSummaryRecords,
  parseDurationMinutes,
  renderAttendanceSummaryValue,
} from "../shared";

const icon = new URL("../../../assets/images/attendance-duration.png", import.meta.url).href;

export function PalyClockIntimePage() {
  const [searchParams] = useSearchParams();
  const start = useRouteQueryValue(searchParams, ["s", "start"]);
  const end = useRouteQueryValue(searchParams, ["e", "end"]);
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceSummaryRow[]>([]);

  const lackCardTotal = useMemo(
    () =>
      records.reduce(
        (total, item) => total + Number(item.lackCardCount || 0),
        0,
      ),
    [records],
  );
  const durationTotal = useMemo(
    () =>
      records.reduce(
        (total, item) => total + parseDurationMinutes(item.totalDuration),
        0,
      ),
    [records],
  );
  const exportRows = records.map((item, index) => ({
    ...item,
    id: index + 1,
    name: formatName(item.name),
  }));

  useEffect(() => {
    if (!start || !end) {
      setRecords([]);
      return;
    }

    setLoading(true);
    fetchAttendanceByDate({ end, start })
      .then((res) => {
        setRecords(parseAttendanceSummaryRecords((res as { data?: unknown })?.data));
      })
      .catch(() => {
        message.error("打卡信息加载失败，请稍后重试");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [end, start]);

  function openExport() {
    if (!records.length) {
      message.warning("暂无可导出的打卡信息！");
      return;
    }

    setExportOpen(true);
  }

  return (
    <div className="react-att-page">
      <AttendanceHeader
        description="查看所选时间段内人员打卡时长、缺卡、迟到和早退情况。"
        extra={<Tag color="blue">{records.length} 条记录</Tag>}
        icon={icon}
        title="打卡时长"
      />
      {loading ? (
        <AttendanceLoading />
      ) : (
        <>
          <AttendanceStats
            items={[
              { label: "开始日期", value: start || "-", theme: "blue" },
              { label: "结束日期", value: end || "-", theme: "green" },
              { label: "记录数量", value: records.length, theme: "orange" },
              {
                label: "总时长合计",
                value: formatDuration(durationTotal),
                theme: "blue",
              },
              { label: "缺卡合计", value: lackCardTotal, theme: "red" },
            ]}
          />
          <AttendanceSection
            action={
              <Button type="primary" onClick={openExport}>
                <Icon icon="ri:file-excel-2-line" />
                导出 Excel
              </Button>
            }
            title="时长记录"
            subtitle={`${start || "-"} 至 ${end || "-"}`}
          >
            {records.length ? (
              <Table
                className="react-att-table"
                dataSource={records}
                pagination={false}
                rowKey={(record) => record.tel}
                columns={[
                  { title: "序号", render: (_value, _record, index) => index + 1, width: 80 },
                  { title: "姓名", dataIndex: "name", render: formatName },
                  { title: "电话号码", dataIndex: "tel" },
                  ...attendanceSummaryFields.map((field) => ({
                    title: field.title,
                    dataIndex: field.key,
                    render: (value: unknown) =>
                      renderAttendanceSummaryValue(field, value),
                  })),
                ]}
              />
            ) : (
              <AttendanceEmpty
                description="当前时间段没有可展示的打卡时长记录。"
                title="暂无打卡信息"
              />
            )}
          </AttendanceSection>
        </>
      )}
      <ExportDialog
        columns={getAttendanceSummaryColumns()}
        fileName={`${start}-${end}人员打卡信息`}
        open={exportOpen}
        rows={exportRows}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}
