import { Table, Tag, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAttendanceByDate } from "../../../api/attendance";
import {
  AttendanceEmpty,
  AttendanceHeader,
  AttendanceLoading,
  AttendanceSection,
  AttendanceStats,
  formatName,
  getRecordObject,
} from "../shared";

const icon = new URL("../../../assets/images/attendance-day.png", import.meta.url).href;

type DayRecord = {
  clockNumber: string;
  name: string;
  tel: string;
};

export function ClockInDayPage() {
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day") || "";
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DayRecord[]>([]);

  const clockTotal = useMemo(
    () => records.reduce((total, item) => total + Number(item.clockNumber || 0), 0),
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
        const source = getRecordObject((res as { data?: unknown })?.data);

        setRecords(
          Object.entries(source).map(([tel, value]) => {
            const itemArr = String(value || "").split("&");

            return {
              clockNumber: itemArr[1] || "0",
              name: itemArr[0] || "",
              tel,
            };
          }),
        );
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
        description="查看指定日期的人员打卡次数与明细记录。"
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
              { label: "打卡合计", value: clockTotal, theme: "orange" },
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
                  { title: "序号", render: (_value, _record, index) => index + 1, width: 80 },
                  { title: "姓名", dataIndex: "name", render: formatName },
                  { title: "电话号码", dataIndex: "tel" },
                  {
                    title: "打卡次数",
                    dataIndex: "clockNumber",
                    render: (value) => <Tag color="green">{value || 0} 次</Tag>,
                  },
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
