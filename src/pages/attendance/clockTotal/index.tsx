import { message } from "@/utils/message";
import { Button, DatePicker, Form, Select, Tag } from "antd";
import { Icon } from "@iconify/react";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  exportAttendanceByDisnameDate,
  exportAttendanceByPhone,
  fetchAttendanceSummaryByPhone,
} from "../../../api/attendance";
import { fetchAllUsers } from "../../../api/user";
import {
  AttendanceHeader,
  AttendanceSection,
  AttendanceStats,
  ExportDialog,
  attendanceSummaryFields,
  getAttendanceSummaryColumns,
  getRecordObject,
  normalizeSummaryValue,
  parseAttendanceSummaryRecords,
} from "../shared";

const icon = new URL("../../../assets/images/attendance-statistics.png", import.meta.url).href;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1980 + 1 }, (_item, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_item, index) => index);

type UserRow = {
  userphone?: string;
  username?: string;
  userrole?: string;
};

type ExportRow = Record<string, string | number>;

function getDateString(value: Dayjs | null) {
  return value ? value.format("YYYY-MM-DD") : "";
}

function getRows(value: unknown): UserRow[] {
  return Array.isArray(value) ? (value as UserRow[]) : [];
}

function getMonthStart(year: number, monthIndex: number) {
  return dayjs(`${year}-${monthIndex + 1}-01`).startOf("month").format("YYYY-MM-DD");
}

function getMonthEnd(year: number, monthIndex: number) {
  return dayjs(`${year}-${monthIndex + 1}-01`).endOf("month").format("YYYY-MM-DD");
}

function buildExportData(source: unknown) {
  const rows = parseAttendanceSummaryRecords(source) as ExportRow[];
  const columns = getAttendanceSummaryColumns<ExportRow>();

  return { columns, rows };
}

export function ClockTotalPage() {
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [userPhone, setUserPhone] = useState<string>();
  const [username, setUsername] = useState("");
  const [period, setPeriod] = useState<"月" | "日">("月");
  const [year, setYear] = useState(currentYear);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState("");
  const [totalData, setTotalData] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportName, setExportName] = useState("");
  const [exportRows, setExportRows] = useState<ExportRow[]>([]);
  const [exportColumns, setExportColumns] = useState<Array<{ key: string; title: string }>>([]);
  const scheduledActionRef = useRef<number | null>(null);

  const userOptions = useMemo(
    () =>
      userRows.map((item) => ({
        label: item.username
          ? `${item.username}（${item.userphone || "-"}）`
          : item.userphone || "-",
        value: item.userphone || "",
      })),
    [userRows],
  );
  const monthStats = attendanceSummaryFields.map((field) => ({
    label: field.title,
    value: normalizeSummaryValue(totalData[field.index], field.valueType),
    theme: field.theme,
  }));

  useEffect(() => {
    fetchAllUsers().then((res) => {
      setUserRows(getRows((res as { data?: unknown })?.data));
    });
  }, []);

  useEffect(
    () => () => {
      if (scheduledActionRef.current) {
        window.clearTimeout(scheduledActionRef.current);
      }
    },
    [],
  );

  function scheduleAction(action: () => void) {
    if (scheduledActionRef.current) {
      window.clearTimeout(scheduledActionRef.current);
    }

    scheduledActionRef.current = window.setTimeout(() => {
      scheduledActionRef.current = null;
      action();
    }, 0);
  }

  function disabledDate(current: Dayjs) {
    return Boolean(
      current &&
        (current < dayjs("2010-01-01").startOf("day") ||
          current > dayjs("2030-01-31").endOf("day")),
    );
  }

  function resetFilters() {
    setYear(currentYear);
    setActiveMonth(new Date().getMonth());
    setUsername("");
    setPeriod("月");
    setTotalData([]);
    setUserPhone(undefined);
    setSelectedDay("");
    setExportOpen(false);
    setExportName("");
    setExportRows([]);
    setExportColumns([]);
    message.success("筛选条件已重置");
  }

  function getDkData(
    nextMonth = activeMonth,
    nextPhone = userPhone,
    nextYear = year,
  ) {
    if (!nextPhone) {
      message.warning("请选择被统计人！");
      return;
    }

    fetchAttendanceSummaryByPhone({
      end: getMonthEnd(nextYear, nextMonth),
      phone: nextPhone,
      start: getMonthStart(nextYear, nextMonth),
    }).then((res) => {
      const row = getRecordObject((res as { data?: unknown })?.data)[nextPhone];

      setTotalData(row ? String(row).split("&") : []);
    });
  }

  function onUserChange(phone?: string) {
    const row = userRows.find((item) => item.userphone === phone);

    setUserPhone(phone);
    setUsername(row?.username || "");

    if (!phone) {
      setTotalData([]);
      return;
    }

    if (period === "月") {
      scheduleAction(() => getDkData(activeMonth, phone, year));
    } else if (selectedDay) {
      scheduleAction(() => selectDay(selectedDay, phone));
    }
  }

  function monthChange(monthIndex: number) {
    setActiveMonth(monthIndex);
    getDkData(monthIndex);
  }

  function selectDay(day: string, nextPhone = userPhone) {
    if (!day) {
      return;
    }

    if (!nextPhone) {
      message.warning("请选择被统计人！");
      return;
    }

    const targetDay = dayjs(day).format("YYYY-MM-DD");

    setSelectedDay(targetDay);
    fetchAttendanceSummaryByPhone({
      end: targetDay,
      phone: nextPhone,
      start: targetDay,
    }).then((res) => {
      const row = getRecordObject((res as { data?: unknown })?.data)[nextPhone];

      setTotalData(row ? String(row).split("&") : []);

      if (!row) {
        message.warning("当日无打卡信息！");
      }
    });
  }

  function openExportDialog(name: string, source: unknown) {
    const next = buildExportData(source);

    if (!next.rows.length) {
      message.error("暂无可导出的考勤信息");
      return;
    }

    setExportName(name);
    setExportRows(next.rows);
    setExportColumns(next.columns);
    setExportOpen(true);
  }

  function exportSingleRecord() {
    if (!userPhone) {
      message.warning("请选择统计人");
      return;
    }

    if (period === "日" && !selectedDay) {
      message.warning("请选择统计日期");
      return;
    }

    const start = period === "日" ? selectedDay : getMonthStart(year, activeMonth);
    const end = period === "日" ? selectedDay : getMonthEnd(year, activeMonth);
    const dateText = period === "日" ? selectedDay : `${activeMonth + 1}月`;

    exportAttendanceByPhone({
      end,
      phone: userPhone,
      start,
    }).then((res) => {
      openExportDialog(
        `${username || userPhone}${dateText}考勤信息`,
        (res as { data?: unknown })?.data,
      );
    });
  }

  function exportAllRecord() {
    if (period === "日" && !selectedDay) {
      message.warning("请选择统计日期");
      return;
    }

    const start = period === "日" ? selectedDay : getMonthStart(year, activeMonth);
    const end = period === "日" ? selectedDay : getMonthEnd(year, activeMonth);
    const dateText = period === "日" ? selectedDay : `${activeMonth + 1}月`;

    exportAttendanceByDisnameDate({
      end,
      start,
    }).then((res) => {
      openExportDialog(`${dateText}全员考勤信息`, (res as { data?: unknown })?.data);
    });
  }

  return (
    <div className="react-att-page">
      <AttendanceHeader
        description="按人员、日期或月份查看考勤统计，并导出 Excel 报表。"
        icon={icon}
        title="打卡统计"
      />

      <section className="react-att-panel">
        <Form className="react-att-filter" layout="vertical">
          <Form.Item label="被统计人">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={userOptions}
              placeholder="请选择被统计人"
              value={userPhone}
              onChange={onUserChange}
            />
          </Form.Item>
          <Form.Item label="统计周期">
            <Select
              options={[
                { label: "月", value: "月" },
                { label: "日", value: "日" },
              ]}
              value={period}
              onChange={(value) => {
                setPeriod(value);
                setTotalData([]);

                if (value === "月" && userPhone) {
                  scheduleAction(() => getDkData(activeMonth, userPhone, year));
                } else if (value === "日" && selectedDay && userPhone) {
                  scheduleAction(() => selectDay(selectedDay, userPhone));
                }
              }}
            />
          </Form.Item>
          {period === "月" ? (
            <Form.Item label="年份">
              <Select
                options={years.map((item) => ({ label: String(item), value: item }))}
                value={year}
                onChange={(value) => {
                  setYear(value);
                  scheduleAction(() => getDkData(activeMonth, userPhone, value));
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item label="日期">
              <DatePicker
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                placeholder="请选择日期"
                value={selectedDay ? dayjs(selectedDay) : null}
                onChange={(value) => selectDay(getDateString(value))}
              />
            </Form.Item>
          )}
          <Form.Item label="操作">
            <Button onClick={resetFilters}>
              <Icon icon="ri:refresh-line" />
              重置
            </Button>
          </Form.Item>
        </Form>
      </section>

      {period === "月" ? (
        <>
          <AttendanceSection title="月份选择" subtitle={`${year} 年`}>
            <div className="react-att-month-tabs">
              {months.map((item) => (
                <button
                  className={
                    activeMonth === item
                      ? "react-att-month-tab active"
                      : "react-att-month-tab"
                  }
                  key={item}
                  type="button"
                  onClick={() => monthChange(item)}
                >
                  {item + 1}月
                </button>
              ))}
            </div>
          </AttendanceSection>
          <AttendanceStats items={monthStats} />
        </>
      ) : (
        <AttendanceStats items={monthStats} />
      )}

      <AttendanceSection
        title="数据导出"
        subtitle={period === "月" ? `${activeMonth + 1}月` : "日统计"}
        action={
          <div className="react-att-inline-actions">
            <Button type="primary" onClick={exportSingleRecord}>
              <Icon icon="ri:download-2-line" />
              导出单个员工考勤
            </Button>
            <Button onClick={exportAllRecord}>
              <Icon icon="ri:file-excel-2-line" />
              导出所有员工考勤信息
            </Button>
          </div>
        }
      >
        <p className="react-att-muted">选择人员和月份后可查看统计，并导出考勤信息。</p>
      </AttendanceSection>

      <ExportDialog
        columns={exportColumns}
        fileName={exportName || "考勤信息"}
        open={exportOpen}
        rows={exportRows}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}
