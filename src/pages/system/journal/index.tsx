import { message } from "@/utils/message";
import { Pagination, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { fetchErrorLogs } from "../../../api/journal";
import navErrorLogIcon from "../../../assets/images/nav-error-log.png";
import "./index.css";

type JournalRow = {
  errordate?: string;
  errorinfo?: string | number;
  errormodel?: string;
  id?: number | string;
  infoflag?: number | string;
};

const PAGE_SIZE = 20;

function getRows(value: unknown): JournalRow[] {
  if (Array.isArray(value)) {
    return value as JournalRow[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  return [];
}

function formatValue(value: unknown) {
  return value === "" || value === null || value === undefined
    ? "-"
    : String(value);
}

function getStatusMeta(infoflag: unknown) {
  if (String(infoflag) === "1") {
    return {
      color: "orange",
      text: "有效",
    };
  }

  return {
    color: "green",
    text: "已处理",
  };
}

export function JournalPage() {
  const [logs, setLogs] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const activeCount = logs.filter((item) => String(item.infoflag) === "1").length;
  const handledCount = logs.length - activeCount;
  const pagedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return logs.slice(start, start + PAGE_SIZE);
  }, [currentPage, logs]);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(Math.ceil(logs.length / PAGE_SIZE), 1);

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, logs.length]);

  function loadLogs() {
    setLoading(true);
    fetchErrorLogs()
      .then((res) => {
        setLogs(getRows(res));
        setCurrentPage(1);
      })
      .catch(() => {
        setLogs([]);
        message.error("错误日志加载失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="react-journal-page">
      <section className="react-journal-header">
        <div className="react-journal-header-main">
          <h1>错误日志</h1>
          <p>查看设备或账号产生的错误记录、错误码和处理状态。</p>
        </div>
        <div className="react-journal-header-side">
          <Tag color="blue">{logs.length} 条</Tag>
          <div className="react-journal-header-icon">
            <img src={navErrorLogIcon} alt="" />
          </div>
        </div>
      </section>

      <section className="react-journal-summary-grid">
        <article className="react-journal-summary-card theme-blue">
          <span>日志总数</span>
          <strong>{logs.length}</strong>
        </article>
        <article className="react-journal-summary-card theme-orange">
          <span>有效日志</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="react-journal-summary-card theme-green">
          <span>已处理</span>
          <strong>{handledCount}</strong>
        </article>
      </section>

      <section className="react-journal-section">
        {loading ? (
          <div className="react-journal-state">
            <Spin size="large" />
            <span>加载中...</span>
          </div>
        ) : logs.length ? (
          <>
            <div className="react-journal-grid">
              {pagedLogs.map((item, index) => {
                const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;
                const status = getStatusMeta(item.infoflag);

                return (
                  <article
                    className="react-journal-card"
                    key={`${item.id || item.errorinfo || absoluteIndex}`}
                  >
                    <div className="react-journal-card-header">
                      <div>
                        <span>错误码</span>
                        <strong>{formatValue(item.errorinfo)}</strong>
                      </div>
                      <Tag color={status.color}>{status.text}</Tag>
                    </div>

                    <dl className="react-journal-meta">
                      <div>
                        <dt>设备/账号</dt>
                        <dd>{formatValue(item.errormodel)}</dd>
                      </div>
                      <div>
                        <dt>发生时间</dt>
                        <dd>{formatValue(item.errordate)}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>

            {logs.length > PAGE_SIZE ? (
              <div className="react-journal-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
                  }
                  total={logs.length}
                  onChange={setCurrentPage}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="react-journal-state">
            <Icon icon="ri:file-search-line" />
            <h3>暂无错误日志</h3>
            <p>当前没有错误日志记录。</p>
          </div>
        )}
      </section>
    </div>
  );
}
