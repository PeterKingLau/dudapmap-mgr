import { Button, DatePicker, Form, Modal, Select, message } from "antd";
import { Icon } from "@iconify/react";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserPhones } from "../../../api/user";
import { validatePhoneNumber } from "../../../utils/validators";
import "./index.css";

type PhoneRow = {
  useravator?: string;
  userphone?: string;
  username?: string;
};

type PhoneOption = {
  label: string;
  value: string;
};

const today = dayjs();
const minDate = dayjs("2023-01-01");

const queryItems = [
  {
    description: "查询某一月打卡的全部信息",
    icon: new URL("../../../assets/images/attendance-month.png", import.meta.url).href,
    key: "month",
    text: "指定月份查询",
  },
  {
    description: "查询某月其中一天的全部信息",
    icon: new URL("../../../assets/images/attendance-day.png", import.meta.url).href,
    key: "day",
    text: "指定日期查询",
  },
  {
    description: "按人员和月份筛选打卡信息",
    icon: new URL("../../../assets/images/attendance-user-month.png", import.meta.url).href,
    key: "personMonth",
    text: "指定人员查询当月",
  },
  {
    description: "按人员和日期筛选打卡信息",
    icon: new URL("../../../assets/images/attendance-user-day.png", import.meta.url).href,
    key: "personDay",
    text: "指定人员查询当天",
  },
  {
    description: "按时间段查询打卡时长数据",
    icon: new URL("../../../assets/images/attendance-duration.png", import.meta.url).href,
    key: "duration",
    text: "打卡时长",
  },
  {
    description: "查看打卡数据统计报表",
    icon: new URL("../../../assets/images/attendance-statistics.png", import.meta.url).href,
    key: "stats",
    text: "打卡信息统计",
  },
] as const;

const heroIcon = new URL("../../../assets/images/nav-clock-query.png", import.meta.url).href;

function normalizePhone(phone: unknown): string {
  return String(phone || "").replace(/\s+/g, "");
}

function getPhoneRows(data: unknown): PhoneRow[] {
  if (Array.isArray(data)) {
    return data as PhoneRow[];
  }

  const record = data as { data?: unknown; records?: unknown };

  if (Array.isArray(record?.data)) {
    return record.data as PhoneRow[];
  }

  if (Array.isArray(record?.records)) {
    return record.records as PhoneRow[];
  }

  return [];
}

function getPhoneOptions(data: unknown): PhoneOption[] {
  const phones = new Set<string>();

  return getPhoneRows(data).reduce<PhoneOption[]>((options, item) => {
    const phone = normalizePhone(item.userphone);

    if (!validatePhoneNumber(phone) || phones.has(phone)) {
      return options;
    }

    phones.add(phone);
    const username = item.username || "暂未上传名";
    const area = item.useravator && item.useravator !== "1" ? item.useravator : "";

    options.push({
      label: area ? `${username} ${phone} (${area})` : `${username} ${phone}`,
      value: phone,
    });

    return options;
  }, []);
}

function getDateString(value: Dayjs | null, format: string): string {
  return value ? value.format(format) : "";
}

export function ClockInPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [monthValue, setMonthValue] = useState("");
  const [dayValue, setDayValue] = useState("");
  const [monthTel, setMonthTel] = useState("");
  const [monthPeopleDate, setMonthPeopleDate] = useState("");
  const [dayTel, setDayTel] = useState("");
  const [dayPeopleDate, setDayPeopleDate] = useState("");
  const [durationStartDate, setDurationStartDate] = useState("");
  const [durationEndDate, setDurationEndDate] = useState("");
  const [phoneOptions, setPhoneOptions] = useState<PhoneOption[]>([]);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const selectedMonthUser = useMemo(
    () => phoneOptions.find((item) => item.value === monthTel)?.label || "",
    [monthTel, phoneOptions],
  );
  const selectedDayUser = useMemo(
    () => phoneOptions.find((item) => item.value === dayTel)?.label || "",
    [dayTel, phoneOptions],
  );

  function openModal(key: string) {
    if (key === "stats") {
      navigate("/attendance/stats");
      return;
    }

    if (key === "duration") {
      setDurationStartDate("");
      setDurationEndDate("");
    }

    if (key === "personMonth" || key === "personDay") {
      loadPhoneOptions();
    }

    setActiveModal(key);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function loadPhoneOptions() {
    if (phoneOptions.length || phoneLoading) {
      return;
    }

    setPhoneLoading(true);
    fetchUserPhones()
      .then((res) => {
        const options = getPhoneOptions((res as { data?: unknown })?.data);

        setPhoneOptions(options);

        if (!options.length) {
          message.warning("暂无可选择的电话号码！");
        }
      })
      .catch(() => {
        message.error("电话号码加载失败，请稍后重试");
      })
      .finally(() => {
        setPhoneLoading(false);
      });
  }

  function disabledDate(current: Dayjs) {
    return Boolean(current && (current < minDate.startOf("day") || current > today.endOf("day")));
  }

  function searchMonth() {
    if (!monthValue) {
      message.warning("请选择月份进行查询！");
      return;
    }

    navigate(`/attendance/month?month=${encodeURIComponent(monthValue)}`);
  }

  function searchDay() {
    if (!dayValue) {
      message.warning("请选择日期进行查询！");
      return;
    }

    navigate(`/attendance/day?day=${encodeURIComponent(dayValue)}`);
  }

  function searchPersonMonth() {
    if (!validatePhoneNumber(monthTel)) {
      message.warning("请选择电话号码！");
      return;
    }

    if (!monthPeopleDate) {
      message.warning("请选择月份进行查询！");
      return;
    }

    navigate(
      `/attendance/month-people?monthPeopledate=${encodeURIComponent(
        monthPeopleDate,
      )}&monthTel=${encodeURIComponent(monthTel)}`,
    );
  }

  function searchPersonDay() {
    if (!validatePhoneNumber(dayTel)) {
      message.warning("请选择电话号码！");
      return;
    }

    if (!dayPeopleDate) {
      message.warning("请选择日期进行查询！");
      return;
    }

    navigate(
      `/attendance/day-people?monthPeopledate=${encodeURIComponent(
        dayPeopleDate,
      )}&monthTel=${encodeURIComponent(dayTel)}`,
    );
  }

  function getDateTimestamp(value: string) {
    return dayjs(value, "YYYY-MM-DD").valueOf();
  }

  function searchDuration() {
    if (!durationStartDate || !durationEndDate) {
      message.warning("请选择时间段进行查询！");
      return;
    }

    if (getDateTimestamp(durationStartDate) > getDateTimestamp(durationEndDate)) {
      message.warning("开始日期不能晚于结束日期！");
      return;
    }

    navigate(
      `/attendance/duration?start=${encodeURIComponent(
        durationStartDate,
      )}&end=${encodeURIComponent(durationEndDate)}`,
    );
  }

  return (
    <div className="react-clockin-page">
      <section className="react-clockin-hero">
        <div className="react-clockin-copy">
          <h1>打卡查询</h1>
          <p>按月份、日期、人员和时长维度查询人员打卡数据。</p>
        </div>
        <div className="react-clockin-hero-icon">
          <img src={heroIcon} alt="" />
        </div>
      </section>

      <section className="react-clockin-grid">
        {queryItems.map((item) => (
          <button
            className="react-clockin-card"
            key={item.key}
            type="button"
            onClick={() => openModal(item.key)}
          >
            <span className="react-clockin-card-icon">
              <img src={item.icon} alt="" />
            </span>
            <span className="react-clockin-card-info">
              <strong>{item.text}</strong>
              <small>{item.description}</small>
            </span>
            <Icon className="react-clockin-arrow" icon="ri:arrow-right-line" />
          </button>
        ))}
      </section>

      <Modal
        className="react-query-modal"
        footer={null}
        open={activeModal === "month"}
        title="指定月份查询"
        width={440}
        onCancel={closeModal}
      >
        <Form className="react-query-form" layout="vertical">
          <Form.Item label="选择月份">
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM"
              picker="month"
              placeholder="请选择月份"
              value={monthValue ? dayjs(monthValue) : null}
              onChange={(value) => setMonthValue(getDateString(value, "YYYY-MM"))}
            />
          </Form.Item>
        </Form>
        <div className="react-query-actions">
          <Button onClick={closeModal}>取消</Button>
          <Button type="primary" onClick={searchMonth}>
            查询
          </Button>
        </div>
      </Modal>

      <Modal
        className="react-query-modal"
        footer={null}
        open={activeModal === "day"}
        title="指定日期查询"
        width={440}
        onCancel={closeModal}
      >
        <Form className="react-query-form" layout="vertical">
          <Form.Item label="选择日期">
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              value={dayValue ? dayjs(dayValue) : null}
              onChange={(value) => setDayValue(getDateString(value, "YYYY-MM-DD"))}
            />
          </Form.Item>
        </Form>
        <div className="react-query-actions">
          <Button onClick={closeModal}>取消</Button>
          <Button type="primary" onClick={searchDay}>
            查询
          </Button>
        </div>
      </Modal>

      <Modal
        className="react-query-modal"
        footer={null}
        open={activeModal === "personMonth"}
        title="指定人员查询当月"
        width={440}
        onCancel={closeModal}
      >
        <Form className="react-query-form" layout="vertical">
          <Form.Item label="电话号码">
            <Select
              allowClear
              showSearch
              loading={phoneLoading}
              optionFilterProp="label"
              options={phoneOptions}
              placeholder="请选择电话号码"
              value={monthTel || undefined}
              onChange={(value) => setMonthTel(value || "")}
              onFocus={loadPhoneOptions}
            />
            {selectedMonthUser ? (
              <div className="react-query-user">{selectedMonthUser}</div>
            ) : null}
          </Form.Item>
          <Form.Item label="选择月份">
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM"
              picker="month"
              placeholder="请选择月份"
              value={monthPeopleDate ? dayjs(monthPeopleDate) : null}
              onChange={(value) =>
                setMonthPeopleDate(getDateString(value, "YYYY-MM"))
              }
            />
          </Form.Item>
        </Form>
        <div className="react-query-actions">
          <Button onClick={closeModal}>取消</Button>
          <Button type="primary" onClick={searchPersonMonth}>
            查询
          </Button>
        </div>
      </Modal>

      <Modal
        className="react-query-modal"
        footer={null}
        open={activeModal === "personDay"}
        title="指定人员查询当天"
        width={440}
        onCancel={closeModal}
      >
        <Form className="react-query-form" layout="vertical">
          <Form.Item label="电话号码">
            <Select
              allowClear
              showSearch
              loading={phoneLoading}
              optionFilterProp="label"
              options={phoneOptions}
              placeholder="请选择电话号码"
              value={dayTel || undefined}
              onChange={(value) => setDayTel(value || "")}
              onFocus={loadPhoneOptions}
            />
            {selectedDayUser ? (
              <div className="react-query-user">{selectedDayUser}</div>
            ) : null}
          </Form.Item>
          <Form.Item label="选择日期">
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              value={dayPeopleDate ? dayjs(dayPeopleDate) : null}
              onChange={(value) =>
                setDayPeopleDate(getDateString(value, "YYYY-MM-DD"))
              }
            />
          </Form.Item>
        </Form>
        <div className="react-query-actions">
          <Button onClick={closeModal}>取消</Button>
          <Button type="primary" onClick={searchPersonDay}>
            查询
          </Button>
        </div>
      </Modal>

      <Modal
        className="react-query-modal"
        footer={null}
        open={activeModal === "duration"}
        title="打卡时长查询"
        width={440}
        onCancel={closeModal}
      >
        <Form className="react-query-form" layout="vertical">
          <Form.Item label="开始日期">
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
              placeholder="请选择开始日期"
              value={durationStartDate ? dayjs(durationStartDate) : null}
              onChange={(value) =>
                setDurationStartDate(getDateString(value, "YYYY-MM-DD"))
              }
            />
          </Form.Item>
          <Form.Item label="结束日期">
            <DatePicker
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
              placeholder="请选择结束日期"
              value={durationEndDate ? dayjs(durationEndDate) : null}
              onChange={(value) =>
                setDurationEndDate(getDateString(value, "YYYY-MM-DD"))
              }
            />
          </Form.Item>
        </Form>
        <div className="react-query-actions">
          <Button onClick={closeModal}>取消</Button>
          <Button type="primary" onClick={searchDuration}>
            查询
          </Button>
        </div>
      </Modal>
    </div>
  );
}
