import { Table, Tag, message } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchUnclockedByDate } from "../../../api/attendance";
import {
  AttendanceEmpty,
  AttendanceHeader,
  AttendanceLoading,
  AttendanceSection,
  AttendanceStats,
  getRecordObject,
} from "../shared";

type UnclockedRecord = {
  clockNumber: number;
  name: string;
  tel: string;
};

export function UnclockedClickInPage() {
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day") || "";
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<UnclockedRecord[]>([]);

  useEffect(() => {
    if (!day) {
      setRecords([]);
      return;
    }

    setLoading(true);
    fetchUnclockedByDate({ date: day })
      .then((res) => {
        const source = getRecordObject((res as { data?: unknown })?.data);

        setRecords(
          Object.entries(source).map(([tel, value]) => ({
            clockNumber: 0,
            name: value == null || value === "" ? "暂未上传名" : String(value),
            tel,
          })),
        );
      })
      .catch(() => {
        message.error("未打卡信息加载失败，请稍后重试");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [day]);

  return (
    <div className="react-att-page">
      <AttendanceHeader
        description="查看指定日期未完成打卡的人员名单。"
        extra={<Tag color="red">{records.length} 人未打卡</Tag>}
        icon=""
        title={`${day || "-"} 未打卡`}
      />
      {loading ? (
        <AttendanceLoading />
      ) : (
        <>
          <AttendanceStats
            items={[
              { label: "未打卡人员", value: records.length, theme: "red" },
              { label: "查询日期", value: day || "-", theme: "blue" },
            ]}
          />
          <AttendanceSection title="未打卡名单" subtitle={`${day || "-"} 日统计`}>
            {records.length ? (
              <Table
                className="react-att-table"
                dataSource={records}
                pagination={false}
                rowKey={(record) => record.tel}
                columns={[
                  { title: "序号", render: (_value, _record, index) => index + 1, width: 80 },
                  { title: "姓名", dataIndex: "name" },
                  { title: "电话号码", dataIndex: "tel" },
                  {
                    title: "打卡次数",
                    dataIndex: "clockNumber",
                    render: (value) => <Tag color="red">{value || 0} 次</Tag>,
                  },
                ]}
              />
            ) : (
              <AttendanceEmpty
                description="当前日期没有未打卡人员记录。"
                title="暂无未打卡信息"
              />
            )}
          </AttendanceSection>
        </>
      )}
    </div>
  );
}
