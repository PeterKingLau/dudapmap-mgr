import { message } from "@/utils/message";
import { Button, Form, Input, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { fetchAppointmentsByPhone } from "../../../api/appointment";
import navAppointmentIcon from "../../../assets/images/nav-appointment.png";
import { validatePhoneNumber } from "../../../utils/validators";
import "../shared.css";

type AppointmentRow = {
  from?: string;
  la?: string | number;
  lo?: string | number;
  location?: string;
  to?: string;
  userphone?: string;
};

function getResponseData(value: unknown): AppointmentRow {
  if (value && typeof value === "object" && "data" in value) {
    const data = (value as { data?: unknown }).data;

    return data && typeof data === "object" && !Array.isArray(data)
      ? (data as AppointmentRow)
      : {};
  }

  return {};
}

function formatValue(value: unknown): string | number {
  if (value === "" || value === null || value === undefined) {
    return "暂无";
  }

  return typeof value === "number" || typeof value === "string"
    ? value
    : String(value);
}

export function AppointmentSearchPage() {
  const [phone, setPhone] = useState("");
  const [searchResult, setSearchResult] = useState<AppointmentRow>({});
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasResult = useMemo(
    () => Boolean(searchResult && Object.keys(searchResult).length),
    [searchResult],
  );

  function resetResult(nextPhone: string) {
    setPhone(nextPhone);
    setSearched(false);
    setSearchResult({});
  }

  function onSearch() {
    const targetPhone = phone.trim();

    if (!validatePhoneNumber(targetPhone)) {
      message.warning("请输入正确的 11 位电话号码！");
      return;
    }

    setLoading(true);
    setSearched(true);
    setSearchResult({});

    fetchAppointmentsByPhone({ phone: targetPhone })
      .then((res) => {
        setSearchResult(getResponseData(res));
      })
      .catch(() => {
        setSearchResult({});
        message.error("搜索失败，请稍后重试");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="react-appointment-page">
      <section className="react-appointment-header">
        <div className="react-appointment-header-main">
          <h1>预约查询</h1>
          <p>通过 11 位电话号码查询预约时间、地址和坐标信息。</p>
        </div>
        <div className="react-appointment-header-icon">
          <img src={navAppointmentIcon} alt="" />
        </div>
      </section>

      <section className="react-appointment-section">
        <Form className="react-appointment-search-form" layout="vertical">
          <Form.Item label="电话号码">
            <Input
              allowClear
              maxLength={11}
              placeholder="请输入 11 位电话号码"
              prefix={<Icon icon="ri:phone-line" />}
              value={phone}
              onChange={(event) => resetResult(event.target.value.trim())}
              onPressEnter={onSearch}
            />
          </Form.Item>
          <Form.Item label="操作">
            <Button
              icon={<Icon icon="ri:search-line" />}
              loading={loading}
              type="primary"
              onClick={onSearch}
            >
              搜索
            </Button>
          </Form.Item>
        </Form>
      </section>

      <section className="react-appointment-section">
        {loading ? (
          <div className="react-appointment-state">
            <Spin size="large" />
            <span>正在搜索...</span>
          </div>
        ) : searched && !hasResult ? (
          <div className="react-appointment-state">
            <Icon icon="ri:file-search-line" />
            <h3>暂无详细信息</h3>
            <p>未查询到该电话号码对应的预约信息。</p>
          </div>
        ) : hasResult ? (
          <article className="react-appointment-card">
            <div className="react-appointment-card-header">
              <div>
                <span>预约信息</span>
                <strong>{formatValue(searchResult.userphone)}</strong>
              </div>
              <Tag color="blue">已查询</Tag>
            </div>

            <dl className="react-appointment-info-grid">
              <div>
                <dt>联系方式</dt>
                <dd>{formatValue(searchResult.userphone)}</dd>
              </div>
              <div>
                <dt>开始时间</dt>
                <dd>{formatValue(searchResult.from)}</dd>
              </div>
              <div>
                <dt>结束时间</dt>
                <dd>{formatValue(searchResult.to)}</dd>
              </div>
              <div className="react-appointment-full">
                <dt>详细地址</dt>
                <dd>{formatValue(searchResult.location)}</dd>
              </div>
              <div>
                <dt>经度</dt>
                <dd>{formatValue(searchResult.lo)}</dd>
              </div>
              <div>
                <dt>纬度</dt>
                <dd>{formatValue(searchResult.la)}</dd>
              </div>
            </dl>
          </article>
        ) : (
          <div className="react-appointment-state muted">
            <Icon icon="ri:search-eye-line" />
            <h3>输入手机号开始查询</h3>
            <p>查询结果会显示在这里。</p>
          </div>
        )}
      </section>
    </div>
  );
}
