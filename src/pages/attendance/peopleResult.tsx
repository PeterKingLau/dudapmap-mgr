import { Tag, message } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAttendanceByPhone } from "../../api/attendance";
import {
  AttendanceEmpty,
  AttendanceHeader,
  AttendanceLoading,
  AttendanceSection,
  AttendanceStats,
  getResponseArray,
} from "./shared";

type AttendanceRow = {
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
  const date = searchParams.get("monthPeopledate") || "";
  const phone = searchParams.get("monthTel") || "";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; tel: string } | null>(
    null,
  );

  useEffect(() => {
    if (!date || !phone) {
      setResult(null);
      return;
    }

    setLoading(true);
    fetchAttendanceByPhone({ dates: date, phone })
      .then((res) => {
        const rows = getResponseArray<AttendanceRow>(
          (res as { data?: unknown })?.data,
        );

        setResult(
          rows.length
            ? {
                count: rows.length,
                tel: rows[0].userphone || phone,
              }
            : null,
        );
      })
      .catch(() => {
        message.error("打卡信息加载失败，请稍后重试");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [date, phone]);

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
              { label: "打卡次数", value: result?.count || 0, theme: "orange" },
            ]}
          />
          <AttendanceSection
            title="查询结果"
            subtitle={`${date || "-"} ${mode === "month" ? "月统计" : "日统计"}`}
            action={result ? <Tag color="green">已查询</Tag> : null}
          >
            {result ? (
              <div className="react-att-result-card">
                <div className="react-att-result-row">
                  <span>电话号码</span>
                  <strong>{result.tel || "-"}</strong>
                </div>
                <div className="react-att-result-row">
                  <span>打卡次数</span>
                  <strong>{result.count || 0} 次</strong>
                </div>
              </div>
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
