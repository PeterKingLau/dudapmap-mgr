import { message } from "@/utils/message";
import { Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAttendanceByPhone } from "../../api/attendance";
import { getImageUrl } from "../../api/request";
import { useRouteQueryValue } from "../../hooks/useRouteQueryValue";
import {
  AttendanceEmpty,
  AttendanceHeader,
  AttendanceLoading,
  AttendanceSection,
  AttendanceStats,
  getResponseArray,
} from "./shared";

type AttendancePunchRecord = {
  __rowKey?: string;
  id?: number | string;
  infoflag?: number | string;
  recordaddr?: string;
  recorddate?: string;
  recordimg?: string;
  recordla?: string;
  recordlo?: string;
  recordtoken?: string | null;
  userphone?: string;
};

type PeopleResultPageProps = {
  description: string;
  icon: string;
  mode: "day" | "month";
  title: string;
};

export function PeopleResultPage({
  description,
  icon,
  mode,
  title,
}: PeopleResultPageProps) {
  const [searchParams] = useSearchParams();
  const date = useRouteQueryValue(searchParams, ["d", "monthPeopledate"]);
  const phone = useRouteQueryValue(searchParams, ["p", "monthTel"]);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendancePunchRecord[]>([]);
  const tableRecords = useMemo(
    () =>
      records.map((record, index) => ({
        ...record,
        __rowKey: String(
          record.id ||
            record.recordimg ||
            `${record.userphone || phone}-${record.recorddate || index}`,
        ),
      })),
    [phone, records],
  );

  useEffect(() => {
    if (!date || !phone) {
      setRecords([]);
      return;
    }

    setLoading(true);
    fetchAttendanceByPhone({ dates: date, phone })
      .then((res) => {
        setRecords(
          getResponseArray<AttendancePunchRecord>(
            (res as { data?: unknown })?.data,
          ),
        );
      })
      .catch(() => {
        message.error("打卡信息加载失败，请稍后重试");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [date, mode, phone]);

  function formatValue(value: unknown) {
    const text = String(value ?? "").trim();

    return text || "-";
  }

  function getRecordStatus(value: unknown) {
    if (String(value) === "1") {
      return { color: "green", text: "正常" };
    }

    return { color: "default", text: formatValue(value) };
  }

  function resolveImageUrl(image: unknown) {
    const value = String(image || "");

    if (!value) {
      return "";
    }

    if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
      return value;
    }

    return getImageUrl(value);
  }

  return (
    <div className="react-att-page">
      <AttendanceHeader description={description} icon={icon} title={title} />
      {loading ? (
        <AttendanceLoading />
      ) : (
        <>
          <AttendanceStats
            items={[
              {
                label: mode === "month" ? "查询月份" : "查询日期",
                value: date || "-",
                theme: "blue",
              },
              { label: "电话号码", value: phone || "-", theme: "green" },
              { label: "打卡次数", value: records.length, theme: "orange" },
            ]}
          />
          <AttendanceSection
            title="查询结果"
            subtitle={`${date || "-"} ${mode === "month" ? "月记录" : "日记录"}`}
            action={records.length ? <Tag color="green">已查询</Tag> : null}
          >
            {records.length ? (
              <Table
                className="react-att-table"
                dataSource={tableRecords}
                pagination={false}
                rowKey="__rowKey"
                scroll={{ x: 1120 }}
                columns={[
                  {
                    title: "序号",
                    render: (_value, _record, index) => index + 1,
                    width: 80,
                  },
                  {
                    title: "照片",
                    dataIndex: "recordimg",
                    width: 88,
                    render: (value) => {
                      const imageUrl = resolveImageUrl(value);

                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          style={{
                            borderRadius: 6,
                            display: "block",
                            height: 44,
                            objectFit: "cover",
                            width: 44,
                          }}
                        />
                      ) : (
                        "-"
                      );
                    },
                  },
                  {
                    title: "电话号码",
                    render: (_value, record) =>
                      formatValue(record.userphone || phone),
                  },
                  {
                    title: "打卡时间",
                    dataIndex: "recorddate",
                    render: formatValue,
                  },
                  {
                    title: "打卡地址",
                    dataIndex: "recordaddr",
                    render: formatValue,
                  },
                  {
                    title: "点位",
                    dataIndex: "recordtoken",
                    render: formatValue,
                  },
                  {
                    title: "经度",
                    dataIndex: "recordlo",
                    render: formatValue,
                  },
                  {
                    title: "纬度",
                    dataIndex: "recordla",
                    render: formatValue,
                  },
                  {
                    title: "状态",
                    dataIndex: "infoflag",
                    render: (value) => {
                      const status = getRecordStatus(value);

                      return <Tag color={status.color}>{status.text}</Tag>;
                    },
                  },
                ]}
              />
            ) : (
              <AttendanceEmpty
                description={`当前员工在所选${mode === "month" ? "月份" : "日期"}没有打卡记录。`}
                title="暂无打卡信息"
              />
            )}
          </AttendanceSection>
        </>
      )}
    </div>
  );
}
