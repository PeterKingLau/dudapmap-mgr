import { Button, Modal, Pagination, Spin, Tag, message } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTaskById, fetchTasks } from "../../../api/task";
import navTaskIcon from "../../../assets/images/nav-task.png";
import { useSafeAsync } from "../../../hooks/useSafeAsync";
import "../shared.css";

export type TaskRow = {
  adress?: string;
  id?: number | string;
  infoflag?: number | string;
  lat?: string;
  lng?: string;
  taskdate?: string;
  useraddress?: string;
  userphone?: string;
  worker?: string;
};

const PAGE_SIZE = 20;
const TASK_DETAIL_CACHE_KEY = "taskDetail";

const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: "blue", text: "已经派发" },
  2: { color: "green", text: "接受任务" },
  3: { color: "red", text: "拒绝任务" },
  4: { color: "cyan", text: "完成任务" },
  5: { color: "default", text: "未派单" },
};

function getRows(value: unknown): TaskRow[] {
  if (Array.isArray(value)) {
    return value as TaskRow[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  return [];
}

function formatValue(value: unknown) {
  return value === "" || value === null || value === undefined
    ? "暂无"
    : String(value);
}

function getTaskStatus(infoflag: unknown) {
  return statusMap[Number(infoflag)] || { color: "default", text: "未知状态" };
}

function normalizeTask(item: TaskRow): TaskRow {
  const addressParts = String(item.useraddress || "").split("&");

  return {
    ...item,
    adress: item.adress || addressParts[0] || "",
    lat: item.lat || addressParts[2] || "",
    lng: item.lng || addressParts[1] || "",
  };
}

export function TaskListPage() {
  const navigate = useNavigate();
  const { run } = useSafeAsync();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return tasks.slice(start, start + PAGE_SIZE);
  }, [currentPage, tasks]);
  const pendingCount = tasks.filter((item) => Number(item.infoflag) === 5).length;
  const acceptedCount = tasks.filter((item) => Number(item.infoflag) === 2).length;
  const completedCount = tasks.filter((item) => Number(item.infoflag) === 4).length;

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(Math.ceil(tasks.length / PAGE_SIZE), 1);

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, tasks.length]);

  function loadTasks() {
    setLoading(true);
    run((signal) => fetchTasks({ signal }), {
      onSuccess: (res) => {
        setTasks(getRows(res).map(normalizeTask));
        setCurrentPage(1);
      },
      onError: () => {
        setTasks([]);
        message.error("任务列表加载失败");
      },
      onFinally: () => setLoading(false),
    });
  }

  function openTask(task: TaskRow) {
    if (!task.id) {
      return;
    }

    sessionStorage.setItem(
      `${TASK_DETAIL_CACHE_KEY}:${task.id}`,
      JSON.stringify(task),
    );
    navigate(`/business/tasks/detail?taskId=${encodeURIComponent(String(task.id))}`);
  }

  function removeTask(index: number, id?: number | string) {
    if (!id) {
      message.warning("缺少任务编号，无法删除");
      return;
    }

    Modal.confirm({
      cancelText: "取消",
      content: "确定删除这个任务吗？",
      okButtonProps: { danger: true },
      okText: "删除",
      title: "删除确认",
      onOk: () =>
        deleteTaskById(id).then(() => {
          setTasks((items) => items.filter((_item, itemIndex) => itemIndex !== index));
          sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${id}`);
          message.success("任务已删除");
        }),
    });
  }

  return (
    <div className="react-task-page">
      <section className="react-task-header">
        <div className="react-task-header-main">
          <div className="react-task-header-icon">
            <img src={navTaskIcon} alt="" />
          </div>
          <div className="react-task-header-copy">
            <h1>全部任务</h1>
            <p>查看任务派发、接受、拒绝与完成情况。</p>
          </div>
        </div>
        <div className="react-task-header-side">
          <Tag color="blue">{tasks.length} 条</Tag>
        </div>
      </section>

      <section className="react-task-summary-grid">
        <article className="react-task-summary-card theme-blue">
          <span>任务总数</span>
          <strong>{tasks.length}</strong>
        </article>
        <article className="react-task-summary-card theme-orange">
          <span>待派单</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className="react-task-summary-card theme-green">
          <span>已接受</span>
          <strong>{acceptedCount}</strong>
        </article>
        <article className="react-task-summary-card theme-cyan">
          <span>已完成</span>
          <strong>{completedCount}</strong>
        </article>
      </section>

      <section className="react-task-section">
        {loading ? (
          <div className="react-task-state">
            <Spin size="large" />
            <span>加载中...</span>
          </div>
        ) : tasks.length ? (
          <>
            <div className="react-task-grid">
              {pagedTasks.map((item, index) => {
                const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;
                const status = getTaskStatus(item.infoflag);

                return (
                  <article
                    className="react-task-card"
                    key={`${item.id || item.userphone || absoluteIndex}`}
                    onClick={() => openTask(item)}
                  >
                    <div className="react-task-card-header">
                      <div>
                        <span>任务 {absoluteIndex + 1}</span>
                        <strong>{formatValue(item.userphone)}</strong>
                      </div>
                      <div className="react-task-card-actions">
                        <Tag color={status.color}>{status.text}</Tag>
                        <Button
                          className="react-task-delete-button"
                          danger
                          icon={<Icon icon="ri:delete-bin-line" />}
                          shape="circle"
                          type="text"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeTask(absoluteIndex, item.id);
                          }}
                        />
                      </div>
                    </div>

                    <dl className="react-task-info-grid">
                      <div className="react-task-full">
                        <dt>地址</dt>
                        <dd>{formatValue(item.adress)}</dd>
                      </div>
                      <div>
                        <dt>日期</dt>
                        <dd>{formatValue(item.taskdate)}</dd>
                      </div>
                      <div>
                        <dt>状态</dt>
                        <dd>{status.text}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>

            {tasks.length > PAGE_SIZE ? (
              <div className="react-task-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
                  }
                  total={tasks.length}
                  onChange={setCurrentPage}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="react-task-state">
            <Icon icon="ri:file-search-line" />
            <h3>暂无详细信息</h3>
            <p>当前没有任务记录。</p>
          </div>
        )}
      </section>
    </div>
  );
}
