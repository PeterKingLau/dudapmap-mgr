import { message } from "@/utils/message";
import { Button, Modal, Radio, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { acceptTask, denyTask, fetchTasks } from "../../../api/task";
import navTaskIcon from "../../../assets/images/nav-task.png";
import { useRouteQueryValue } from "../../../hooks/useRouteQueryValue";
import type { TaskRow } from "../list";
import "../shared.css";

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

function normalizeTask(item: TaskRow): TaskRow {
  const addressParts = String(item.useraddress || "").split("&");

  return {
    ...item,
    adress: item.adress || addressParts[0] || "",
    lat: item.lat || addressParts[2] || "",
    lng: item.lng || addressParts[1] || "",
  };
}

function formatValue(value: unknown, fallback = "暂无") {
  return value === "" || value === null || value === undefined
    ? fallback
    : String(value);
}

function getTaskStatus(infoflag: unknown) {
  return statusMap[Number(infoflag)] || { color: "default", text: "未知状态" };
}

function parseLegacyTaskQuery(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return normalizeTask(JSON.parse(value) as TaskRow);
  } catch {
    return null;
  }
}

export function TaskDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = useRouteQueryValue(searchParams, ["id", "taskId"]);
  const [task, setTask] = useState<TaskRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [radio, setRadio] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const backTimerRef = useRef<number | null>(null);
  const taskStatus = getTaskStatus(task?.infoflag);
  const isPendingTask = Number(task?.infoflag) === 5;
  const detailRows = useMemo(
    () => [
      {
        label: "施工员",
        value: formatValue(task?.worker, "暂无名字显示"),
      },
      {
        label: "电话",
        value: formatValue(task?.userphone, "暂无电话号码显示"),
      },
      {
        label: "地址",
        value: formatValue(task?.adress, "暂无地址信息显示"),
      },
      {
        label: "经度",
        value: formatValue(task?.lng, "暂无经度信息显示"),
      },
      {
        label: "纬度",
        value: formatValue(task?.lat, "暂无纬度信息显示"),
      },
      {
        label: "时间",
        value: formatValue(task?.taskdate, "暂无时间信息显示"),
      },
    ],
    [task],
  );

  useEffect(() => {
    loadTaskDetail();
  }, [searchParams, taskId]);

  useEffect(
    () => () => {
      if (backTimerRef.current) {
        window.clearTimeout(backTimerRef.current);
      }
    },
    [],
  );

  function loadTaskDetail() {
    const legacyTask = parseLegacyTaskQuery(searchParams.get("lists"));

    if (legacyTask) {
      setTask(legacyTask);
      return;
    }

    if (!taskId) {
      setTask(null);
      return;
    }

    const cachedTask = sessionStorage.getItem(`${TASK_DETAIL_CACHE_KEY}:${taskId}`);

    if (cachedTask) {
      try {
        setTask(normalizeTask(JSON.parse(cachedTask) as TaskRow));
        return;
      } catch {
        sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${taskId}`);
      }
    }

    setLoading(true);
    fetchTasks()
      .then((res) => {
        const matchedTask = getRows(res).find(
          (item) => String(item.id) === String(taskId),
        );

        setTask(matchedTask ? normalizeTask(matchedTask) : null);
      })
      .catch(() => {
        setTask(null);
        message.error("任务详情加载失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function backToList() {
    navigate("/business/tasks", { replace: true });
  }

  function submitTask() {
    const id = task?.id;

    if (!id) {
      message.warning("任务信息异常，无法提交");
      return;
    }

    const accept = radio === "1";

    Modal.confirm({
      cancelText: "取消",
      content: accept ? "确定接受任务吗？" : "确定拒绝任务吗？",
      okText: "确定",
      title: "任务确认",
      onOk: () => {
        setSubmitting(true);
        return (accept ? acceptTask(id) : denyTask(id))
          .then((res) => {
            if ((res as { data?: unknown })?.data === true) {
              message.success(accept ? "已接受任务" : "已拒绝任务");
              sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${id}`);
              backTimerRef.current = window.setTimeout(backToList, 500);
            } else {
              message.warning("任务处理失败，请稍后重试");
            }
          })
          .finally(() => {
            setSubmitting(false);
          });
      },
    });
  }

  return (
    <div className="react-task-page">
      <section className="react-task-header">
        <div className="react-task-header-main">
          <div className="react-task-header-copy">
            <h1>任务详情</h1>
            <p>查看施工任务的人员、联系方式、地址、坐标和派单状态。</p>
          </div>
        </div>
        <div className="react-task-header-side">
          <Tag color={taskStatus.color}>{taskStatus.text}</Tag>
          <div className="react-task-header-icon">
            <img src={navTaskIcon} alt="" />
          </div>
        </div>
      </section>

      {loading ? (
        <section className="react-task-section">
          <div className="react-task-state">
            <Spin size="large" />
            <span>加载中...</span>
          </div>
        </section>
      ) : task ? (
        <>
          <section className="react-task-section">
            <div className="react-task-section-title">
              <h2>基础信息</h2>
            </div>

            <dl className="react-task-detail-grid">
              {detailRows.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              <div>
                <dt>派单状态</dt>
                <dd>
                  <Tag color={taskStatus.color}>{taskStatus.text}</Tag>
                </dd>
              </div>
            </dl>
          </section>

          {isPendingTask ? (
            <section className="react-task-section">
              <div className="react-task-section-title">
                <h2>任务处理</h2>
              </div>
              <div className="react-task-handle-row">
                <span>接受派单</span>
                <Radio.Group
                  optionType="button"
                  value={radio}
                  onChange={(event) => setRadio(event.target.value)}
                >
                  <Radio.Button value="1">接受</Radio.Button>
                  <Radio.Button value="2">拒绝</Radio.Button>
                </Radio.Group>
              </div>
            </section>
          ) : null}

          {isPendingTask ? (
            <div className="react-task-actions">
              <Button
                loading={submitting}
                type="primary"
                onClick={submitTask}
              >
                确定
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <section className="react-task-section">
          <div className="react-task-state">
            <Icon icon="ri:file-search-line" />
            <h3>暂无任务详情</h3>
            <p>当前任务不存在，或任务数据已经被删除。</p>
          </div>
        </section>
      )}
    </div>
  );
}
