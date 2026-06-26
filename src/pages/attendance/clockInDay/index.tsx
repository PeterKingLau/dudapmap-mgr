import { message } from "@/utils/message";
import { Table, Tag } from "antd";
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
  attendanceSummaryFields,
  formatDuration,
  formatName,
  parseAttendanceSummaryRecords,
  parseDurationMinutes,
  renderAttendanceSummaryValue,
} from "../shared";

const icon = new URL(
  "../../../assets/images/attendance-day.png",
  import.meta.url,
).href;

export function ClockInDayPage() {
  const [searchParams] = useSearchParams();
  const day = useRouteQueryValue(searchParams, ["d", "day"]);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceSummaryRow[]>([]);

  const durationTotal = useMemo(
    () =>
      records.reduce(
        (total, item) => total + parseDurationMinutes(item.totalDuration),
        0,
      ),
    [records],
  );
  const lackCardTotal = useMemo(
    () =>
      records.reduce(
        (total, item) => total + Number(item.lackCardCount || 0),
        0,
      ),
    [records],
  );

  useEffect(() => {
    if (!day) {
      setRecords([]);
      return;
    }

    setLoading(true);
    fetchAttendanceByDate({ end: day, start: day })
      .then((res) => {
        setRecords(parseAttendanceSummaryRecords((res as { data?: unknown })?.data));
      })
      .catch(() => {
        message.error("打卡信息加载失败，请稍后重试");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [day]);

  return (
    <div className="react-att-page">
      <AttendanceHeader
        description="查看指定日期的人员考勤统计与明细记录。"
        extra={<Tag color="blue">{records.length} 条记录</Tag>}
        icon={icon}
        title={`${day || "-"} 打卡信息`}
      />
      {loading ? (
        <AttendanceLoading />
      ) : (
        <>
          <AttendanceStats
            items={[
              { label: "统计日期", value: day || "-", theme: "blue" },
              { label: "打卡人数", value: records.length, theme: "green" },
              {
                label: "总时长合计",
                value: formatDuration(durationTotal),
                theme: "orange",
              },
              { label: "缺卡合计", value: lackCardTotal, theme: "red" },
            ]}
          />
          <AttendanceSection title="打卡记录" subtitle={`${day || "-"} 日统计`}>
            {records.length ? (
              <Table
                className="react-att-table"
                dataSource={records}
                pagination={false}
                rowKey={(record) => record.tel}
                columns={[
                  {
                    title: "序号",
                    render: (_value, _record, index) => index + 1,
                    width: 80,
                  },
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
                description="当前日期没有可展示的打卡记录。"
                title="暂无打卡信息"
              />
            )}
          </AttendanceSection>
        </>
      )}
    </div>
  );
}
