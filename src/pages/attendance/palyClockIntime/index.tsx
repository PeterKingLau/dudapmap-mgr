import { Button, Table, Tag, message } from "antd";
import { Icon } from "@iconify/react";
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

const icon = new URL("../../../assets/images/attendance-duration.png", import.meta.url).href;

type DurationRecord = {
  LackCard: string;
  clockTime: string;
  late: string;
  leaveEarly: string;
  name: string;
  tel: string;
};

export function PalyClockIntimePage() {
  const [searchParams] = useSearchParams();
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [records, setRecords] = useState<DurationRecord[]>([]);

  const lackCardTotal = useMemo(
    () => records.reduce((total, item) => total + Number(item.LackCard || 0), 0),
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
        const source = getRecordObject((res as { data?: unknown })?.data);

        setRecords(
          Object.entries(source).map(([tel, value]) => {
            const itemArr = String(value || "").split("&");

            return {
              LackCard: itemArr[2] || "0",
              clockTime: itemArr[1] || "",
              late: itemArr[3] || "0",
              leaveEarly: itemArr[4] || "0",
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
                  { title: "打卡时长", dataIndex: "clockTime" },
                  {
                    title: "缺卡",
                    dataIndex: "LackCard",
                    render: (value) => (
                      <Tag color={Number(value) > 0 ? "red" : "green"}>
                        {value || 0} 次
                      </Tag>
                    ),
                  },
                  { title: "迟到", dataIndex: "late", render: (value) => `${value || 0} 次` },
                  {
                    title: "早退",
                    dataIndex: "leaveEarly",
                    render: (value) => `${value || 0} 次`,
                  },
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
        columns={[
          { key: "id", title: "序号" },
          { key: "name", title: "姓名" },
          { key: "tel", title: "电话号码" },
          { key: "clockTime", title: "打卡时长" },
          { key: "LackCard", title: "缺卡" },
          { key: "late", title: "迟到" },
          { key: "leaveEarly", title: "早退" },
        ]}
        fileName={`${start}-${end}人员打卡信息`}
        open={exportOpen}
        rows={exportRows}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}
