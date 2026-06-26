import { message } from "@/utils/message";
import { Button, Empty, Form, Input, InputNumber, Radio, Space, Spin, TimePicker } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  fetchClockLimits,
  fetchClockMeta,
  fetchClockRulesByUser,
  matchCurrentDisname,
  saveClockLimit,
  saveClockMeta,
} from "../../../api/clockConfig";
import { getCurrentDisname } from "../../../api/request";
import { AttendanceHeader } from "../shared";

const icon = new URL(
  "../../../assets/images/nav-clock-config.png",
  import.meta.url,
).href;

type TimeKey =
  | "start1"
  | "end1"
  | "start2"
  | "end2"
  | "start3"
  | "end3"
  | "start4"
  | "end4";

type ClockRow = Record<string, string | number | undefined>;

const clockCountOptions = [2, 4, 6, 8];

const timePeriods: Array<{
  endKey: TimeKey;
  index: number;
  startKey: TimeKey;
  title: string;
}> = [
  { index: 1, startKey: "start1", endKey: "end1", title: "时段一" },
  { index: 2, startKey: "start2", endKey: "end2", title: "时段二" },
  { index: 3, startKey: "start3", endKey: "end3", title: "时段三" },
  { index: 4, startKey: "start4", endKey: "end4", title: "时段四" },
];

const emptyTimeConfig: Record<TimeKey, string> = {
  start1: "",
  end1: "",
  start2: "",
  end2: "",
  start3: "",
  end3: "",
  start4: "",
  end4: "",
};

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}") as {
      userphone?: string;
    };
  } catch {
    return {};
  }
}

function normalizeNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}

function normalizeClockCount(value: unknown) {
  const count = normalizeNumber(value);

  return clockCountOptions.includes(Number(count)) ? Number(count) : 8;
}

function getRows(value: unknown): ClockRow[] {
  if (Array.isArray(value)) {
    return value as ClockRow[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  if (value && typeof value === "object" && "records" in value) {
    return getRows((value as { records?: unknown }).records);
  }

  return [];
}

function parseTime(value: string) {
  return value ? dayjs(`2000-01-01 ${value}`) : null;
}

function getPeriodCount(clockCount: number | undefined) {
  return Math.max(
    1,
    Math.min(4, Math.floor(normalizeClockCount(clockCount) / 2)),
  );
}

function getTimeConfigByClockCount(
  config: Record<TimeKey, string>,
  clockCount: number | undefined,
) {
  const periodCount = getPeriodCount(clockCount);

  return timePeriods.reduce(
    (nextConfig, period) => ({
      ...nextConfig,
      [period.startKey]:
        period.index <= periodCount ? config[period.startKey] : "",
      [period.endKey]: period.index <= periodCount ? config[period.endKey] : "",
    }),
    { ...emptyTimeConfig },
  );
}

export function ClockOptPage() {
  const [rules, setRules] = useState<string[]>([]);
  const [limitInfo, setLimitInfo] = useState<ClockRow>({});
  const [metaInfo, setMetaInfo] = useState<ClockRow>({});
  const [timeConfig, setTimeConfig] =
    useState<Record<TimeKey, string>>(emptyTimeConfig);
  const [savedTimeConfig, setSavedTimeConfig] =
    useState<Record<TimeKey, string>>(emptyTimeConfig);
  const [metainfo1, setMetainfo1] = useState<number | undefined>();
  const [metainfo2, setMetainfo2] = useState<number | undefined>();
  const [metainfo3, setMetainfo3] = useState("0");
  const [savedMetainfo1, setSavedMetainfo1] = useState<number | undefined>();
  const [savedMetainfo2, setSavedMetainfo2] = useState<number | undefined>();
  const [savedMetainfo3, setSavedMetainfo3] = useState("0");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasVisibleConfig = useMemo(
    () =>
      ["10001", "10002", "10003", "10004"].some((code) => rules.includes(code)),
    [rules],
  );

  useEffect(() => {
    loadPageData();
  }, []);

  function hasRule(code: string) {
    return rules.includes(code);
  }

  async function loadPageData() {
    setLoading(true);

    try {
      const sessionUser = getSessionUser();
      const [ruleRes, limitRes, metaRes] = await Promise.all([
        sessionUser.userphone
          ? fetchClockRulesByUser(sessionUser.userphone)
          : Promise.resolve({ data: {} }),
        fetchClockLimits(),
        fetchClockMeta(),
      ]);
      const nextRules = String(
        (ruleRes as { data?: { recvcode?: string } })?.data?.recvcode || "",
      )
        .split(",")
        .filter(Boolean);
      const currentLimit = getRows(limitRes).find(matchCurrentDisname);
      const currentMeta = getRows(metaRes).find(matchCurrentDisname);
      const nextMetainfo1 = normalizeClockCount(currentMeta?.metainfo1);
      const nextTimeConfig = currentLimit
        ? timePeriods.reduce(
            (config, item) => ({
              ...config,
              [item.startKey]: String(currentLimit[item.startKey] || ""),
              [item.endKey]: String(currentLimit[item.endKey] || ""),
            }),
            { ...emptyTimeConfig },
          )
        : { ...emptyTimeConfig };
      const nextMetainfo2 = normalizeNumber(currentMeta?.metainfo2);
      const nextMetainfo3 = String(currentMeta?.metainfo3 || "0");
      const visibleTimeConfig = getTimeConfigByClockCount(
        nextTimeConfig,
        nextMetainfo1,
      );

      setRules(nextRules);
      setLimitInfo(currentLimit || {});
      setMetaInfo(currentMeta || {});
      setTimeConfig(visibleTimeConfig);
      setSavedTimeConfig(visibleTimeConfig);
      setMetainfo1(nextMetainfo1);
      setSavedMetainfo1(nextMetainfo1);
      setMetainfo2(nextMetainfo2);
      setSavedMetainfo2(nextMetainfo2);
      setMetainfo3(nextMetainfo3);
      setSavedMetainfo3(nextMetainfo3);
      setIsEditing(false);
    } catch {
      message.error("配置加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  function cancelEdit() {
    setTimeConfig(savedTimeConfig);
    setMetainfo1(savedMetainfo1);
    setMetainfo2(savedMetainfo2);
    setMetainfo3(savedMetainfo3);
    setIsEditing(false);
  }

  function changeClockCount(value: number) {
    setMetainfo1(value);
    setTimeConfig((config) => getTimeConfigByClockCount(config, value));
  }

  async function submit() {
    if (!isEditing) {
      return;
    }

    setSubmitting(true);

    try {
      const limitRes = await saveClockLimit(
        {
          ...getTimeConfigByClockCount(timeConfig, metainfo1),
          disname: getCurrentDisname() || undefined,
          id: limitInfo.id || undefined,
        },
        Boolean(limitInfo.id),
      );

      if ((limitRes as { data?: unknown })?.data !== true) {
        message.error("打卡时段提交失败");
        return;
      }

      const metaRes = await saveClockMeta(
        {
          disname: getCurrentDisname() || undefined,
          id: metaInfo.id || undefined,
          metainfo1: normalizeClockCount(metainfo1),
          metainfo2: metainfo2 ?? "",
          metainfo3,
        },
        Boolean(metaInfo.id),
      );

      if ((metaRes as { data?: unknown })?.data !== true) {
        message.error("基础配置提交失败");
        return;
      }

      message.success("提交成功");
      await loadPageData();
    } catch {
      message.error("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="react-att-page react-clock-opt-page">
      <AttendanceHeader
        description="配置打卡时段、打卡次数、范围和提示规则。"
        icon={icon}
        title="打卡配置"
      />

      {loading ? (
        <section className="react-att-loading">
          <Spin size="large" />
          <span>正在加载配置...</span>
        </section>
      ) : (
        <Form
          className={
            isEditing
              ? "react-clock-opt-form is-editing"
              : "react-clock-opt-form is-viewing"
          }
          layout="vertical"
        >
          {hasRule("10002") ? (
            <section className="react-att-section">
              <div className="react-att-section-title">
                <div>
                  <h2>打卡次数</h2>
                </div>
                <span className="react-clock-opt-mode">
                  {isEditing ? "编辑中" : "查看模式"}
                </span>
              </div>
              <Form.Item label="打卡次数">
                <Radio.Group
                  className="react-clock-count-options"
                  disabled={!isEditing}
                  optionType="button"
                  value={normalizeClockCount(metainfo1)}
                  onChange={(event) => changeClockCount(event.target.value)}
                >
                  {clockCountOptions.map((value) => (
                    <Radio.Button key={value} value={value}>
                      {value} 次
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </section>
          ) : null}

          {hasRule("10001") ? (
            <section className="react-att-section">
              <div className="react-att-section-title">
                <div>
                  <h2>打卡时段</h2>
                  <span>
                    当前打卡次数为 {normalizeClockCount(metainfo1)} 次，需要配置{" "}
                    {getPeriodCount(metainfo1)} 个时段。
                  </span>
                </div>
                <span className="react-clock-opt-mode">
                  {isEditing ? "编辑中" : "查看模式"}
                </span>
              </div>
              <div className="react-clock-period-list">
                {timePeriods
                  .slice(0, getPeriodCount(metainfo1))
                  .map((period) => (
                    <div className="react-clock-period-row" key={period.index}>
                      <strong>{period.title}</strong>
                      <Form.Item label="开始">
                        <TimePicker
                          disabled={!isEditing}
                          format="HH:mm"
                          value={parseTime(timeConfig[period.startKey])}
                          onChange={(_value, valueString) =>
                            setTimeConfig((config) => ({
                              ...config,
                              [period.startKey]: Array.isArray(valueString)
                                ? valueString[0] || ""
                                : valueString,
                            }))
                          }
                        />
                      </Form.Item>
                      <Form.Item label="结束">
                        <TimePicker
                          disabled={!isEditing}
                          format="HH:mm"
                          value={parseTime(timeConfig[period.endKey])}
                          onChange={(_value, valueString) =>
                            setTimeConfig((config) => ({
                              ...config,
                              [period.endKey]: Array.isArray(valueString)
                                ? valueString[0] || ""
                                : valueString,
                            }))
                          }
                        />
                      </Form.Item>
                    </div>
                  ))}
              </div>
            </section>
          ) : null}

          {hasRule("10003") || hasRule("10004") ? (
            <section className="react-att-section">
              <div className="react-att-section-title">
                <h2>基础配置</h2>
                <span className="react-clock-opt-mode">
                  {isEditing ? "编辑中" : "查看模式"}
                </span>
              </div>
              <div className="react-clock-opt-grid compact">
                {hasRule("10003") ? (
                  <Form.Item label="打卡范围">
                    <Space.Compact className="react-clock-opt-unit-input">
                      <InputNumber
                        disabled={!isEditing}
                        max={999999}
                        min={0}
                        precision={0}
                        value={metainfo2}
                        onChange={(value) =>
                          setMetainfo2(normalizeNumber(value))
                        }
                      />
                      <span className="react-clock-opt-unit">米</span>
                    </Space.Compact>
                  </Form.Item>
                ) : null}
                {hasRule("10004") ? (
                  <Form.Item label="开启提示">
                    <Radio.Group
                      disabled={!isEditing}
                      optionType="button"
                      value={metainfo3}
                      onChange={(event) => setMetainfo3(event.target.value)}
                    >
                      <Radio.Button value="1">是</Radio.Button>
                      <Radio.Button value="0">否</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                ) : null}
                {hasRule("10003") || hasRule("10004") ? (
                  <Form.Item label="时段数量">
                    <Input
                      disabled
                      value={`${getPeriodCount(metainfo1)} 个时段`}
                    />
                  </Form.Item>
                ) : null}
              </div>
            </section>
          ) : null}

          {!hasVisibleConfig ? (
            <section className="react-att-section">
              <Empty description="当前账号没有可维护的打卡配置权限。" />
            </section>
          ) : null}

          {hasVisibleConfig ? (
            <div className="react-att-bottom-actions">
              {isEditing ? (
                <>
                  <Button onClick={cancelEdit}>取消编辑</Button>
                  <Button loading={submitting} type="primary" onClick={submit}>
                    提交配置
                  </Button>
                </>
              ) : (
                <Button type="primary" onClick={() => setIsEditing(true)}>
                  编辑配置
                </Button>
              )}
            </div>
          ) : null}
        </Form>
      )}
    </div>
  );
}
