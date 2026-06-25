import { Button, Table, Tag, message } from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAttendanceByDate } from "../../../api/attendance";
import {
  AttendanceEmpty,
  AttendanceHeader,
  AttendanceLoading,
  AttendanceSection,
  AttendanceStats,
  ExportDialog,
  formatName,
  getRecordObject,
} from "../shared";

const icon = new URL("../../../assets/images/attendance-month.png", import.meta.url).href;

type MonthRecord = {
  clockNumber: string;
  lostClock: string;
  name: string;
  tel: string;
};

export function ClockInMonthPage() {
  const [searchParams] = useSearchParams();
  const month = searchParams.get("month") || "";
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [records, setRecords] = useState<MonthRecord[]>([]);

  const lostClockTotal = useMemo(
    () => records.reduce((total, item) => total + Number(item.lostClock || 0), 0),
    [records],
  );
  const exportRows = records.map((item, index) => ({
    ...item,
    id: index + 1,
    name: formatName(item.name),
  }));

  useEffect(() => {
    if (!month) {
      setRecords([]);
      return;
    }

    const start = dayjs(month).startOf("month").format("YYYY-MM-DD");
    const end = dayjs(month).endOf("month").format("YYYY-MM-DD");

    setLoading(true);
    fetchAttendanceByDate({ end, start })
      .then((res) => {
        const source = getRecordObject((res as { data?: unknown })?.data);

        setRecords(
          Object.entries(source).map(([tel, value]) => {
            const itemArr = String(value || "").split("&");

            return {
              clockNumber: itemArr[1] || "",
              lostClock: itemArr[2] || "0",
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
  }, [month]);

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
        description="查看指定月份的打卡统计明细，并支持导出 CSV 报表。"
        extra={<Tag color="blue">{records.length} 条记录</Tag>}
        icon={icon}
        title={`${month || "-"} 打卡信息`}
      />
      {loading ? (
        <AttendanceLoading />
      ) : (
        <>
          <AttendanceStats
            items={[
              { label: "统计月份", value: month || "-", theme: "blue" },
              { label: "记录数量", value: records.length, theme: "green" },
              { label: "缺卡合计", value: lostClockTotal, theme: "red" },
            ]}
          />
          <AttendanceSection
            action={
              <Button type="primary" onClick={openExport}>
                <Icon icon="ri:file-excel-2-line" />
                导出 CSV
              </Button>
            }
            title="打卡记录"
            subtitle={`${month || "-"} 月度汇总`}
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
                  { title: "总在线时长", dataIndex: "clockNumber" },
                  {
                    title: "缺卡次数",
                    dataIndex: "lostClock",
                    render: (value) => (
                      <Tag color={Number(value) > 0 ? "red" : "green"}>
                        {value || 0} 次
                      </Tag>
                    ),
                  },
                ]}
              />
            ) : (
              <AttendanceEmpty
                description="当前月份没有可展示的打卡记录。"
                title="暂无打卡信息"
              />
            )}
          </AttendanceSection>
        </>
      )}
      <ExportDialog
        columns={[
          { key: "id", title: "序号" },
          { key: "name", title: "姓名" },
          { key: "tel", title: "电话号码" },
          { key: "clockNumber", title: "总在线时长" },
          { key: "lostClock", title: "缺卡次数" },
        ]}
        fileName={`${month || "月份"}全部打卡信息`}
        open={exportOpen}
        rows={exportRows}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}
