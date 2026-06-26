import { message } from "@/utils/message";
import { Button, Modal, Pagination, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteAppointment,
  fetchAppointments,
} from "../../../api/appointment";
import navAppointmentIcon from "../../../assets/images/nav-appointment.png";
import { useSafeAsync } from "../../../hooks/useSafeAsync";
import "../shared.css";

type AppointmentRow = {
  from?: string;
  id?: number | string;
  la?: string | number;
  lo?: string | number;
  location?: string;
  to?: string;
  userphone?: string;
};

const PAGE_SIZE = 20;

function getRows(value: unknown): AppointmentRow[] {
  if (Array.isArray(value)) {
    return value as AppointmentRow[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  return [];
}

function formatValue(value: unknown): string | number {
  if (value === "" || value === null || value === undefined) {
    return "暂无";
  }

  return typeof value === "number" || typeof value === "string"
    ? value
    : String(value);
}

export function AppointmentListPage() {
  const navigate = useNavigate();
  const { run } = useSafeAsync();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pagedAppointments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return appointments.slice(start, start + PAGE_SIZE);
  }, [appointments, currentPage]);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(Math.ceil(appointments.length / PAGE_SIZE), 1);

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [appointments.length, currentPage]);

  function loadAppointments() {
    setLoading(true);
    run((signal) => fetchAppointments({ signal }), {
      onSuccess: (res) => {
        setAppointments(getRows(res));
        setCurrentPage(1);
      },
      onError: () => {
        setAppointments([]);
        message.error("预约信息加载失败");
      },
      onFinally: () => setLoading(false),
    });
  }

  function removeAppointment(index: number, id?: string | number) {
    if (!id) {
      return;
    }

    Modal.confirm({
      cancelText: "取消",
      content: "确定删除这条预约信息吗？",
      okButtonProps: { danger: true },
      okText: "删除",
      title: "删除确认",
      onOk: () =>
        deleteAppointment(id).then(() => {
          setAppointments((rows) =>
            rows.filter((_item, itemIndex) => itemIndex !== index),
          );
          message.success("删除成功");
        }),
    });
  }

  return (
    <div className="react-appointment-page">
      <section className="react-appointment-header">
        <div className="react-appointment-header-main">
          <h1>预约信息</h1>
          <p>查看全部预约记录，并按需进入电话号码查询。</p>
        </div>
        <div className="react-appointment-header-icon">
          <img src={navAppointmentIcon} alt="" />
        </div>
      </section>

      <section className="react-appointment-summary">
        <article className="react-appointment-stat">
          <span>预约记录</span>
          <strong>{appointments.length}</strong>
        </article>
        <Button
          icon={<Icon icon="ri:search-line" />}
          type="primary"
          onClick={() => navigate("/business/appointments/search")}
        >
          查询
        </Button>
      </section>

      <section className="react-appointment-section">
        {loading ? (
          <div className="react-appointment-state">
            <Spin size="large" />
            <span>加载中...</span>
          </div>
        ) : appointments.length ? (
          <div className="react-appointment-grid">
            {pagedAppointments.map((item, index) => {
              const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;

              return (
                <article
                  className="react-appointment-card"
                  key={`${item.id || item.from || absoluteIndex}`}
                >
                  <div className="react-appointment-card-header">
                    <div>
                      <span>预约 {absoluteIndex + 1}</span>
                      <strong>{formatValue(item.userphone)}</strong>
                    </div>
                    <Button
                      className="react-appointment-delete-button"
                      danger
                      icon={<Icon icon="ri:delete-bin-line" />}
                      shape="circle"
                      type="text"
                      onClick={() => removeAppointment(absoluteIndex, item.id)}
                    />
                  </div>

                  <dl className="react-appointment-info-grid">
                    <div>
                      <dt>开始时间</dt>
                      <dd>{formatValue(item.from)}</dd>
                    </div>
                    <div>
                      <dt>结束时间</dt>
                      <dd>{formatValue(item.to)}</dd>
                    </div>
                    <div>
                      <dt>对应手机号</dt>
                      <dd>{formatValue(item.location)}</dd>
                    </div>
                    <div>
                      <dt>经度</dt>
                      <dd>{formatValue(item.lo)}</dd>
                    </div>
                    <div className="react-appointment-full">
                      <dt>详细地址</dt>
                      <dd>{formatValue(item.la)}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
            {appointments.length > PAGE_SIZE ? (
              <div className="react-appointment-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
                  }
                  total={appointments.length}
                  onChange={setCurrentPage}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="react-appointment-state">
            <Icon icon="ri:file-search-line" />
            <h3>暂无详细信息</h3>
            <p>当前还没有预约记录。</p>
          </div>
        )}
      </section>
    </div>
  );
}
