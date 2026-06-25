import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Tag,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  deleteLeaveById,
  fetchLeaves,
  saveLeave,
  updateLeave,
} from "../../../api/leave";
import { fetchAllUsers } from "../../../api/user";
import "../shared.css";

type LeaveRow = {
  endtime?: string;
  id?: number | string;
  infoflag?: string;
  manager?: string;
  reason?: string;
  remake?: string;
  startime?: string;
  userphone?: string;
};

type UserRow = {
  userphone?: string;
  userrole?: string;
  username?: string;
};

type LeaveFormState = {
  endtime: string;
  id?: number | string;
  manager: string;
  reason: string;
  startime: string;
  userphone: string;
};

const headerIcon = new URL(
  "../../../assets/images/nav-leave.png",
  import.meta.url,
).href;

const emptyLeaveForm: LeaveFormState = {
  endtime: "",
  manager: "",
  reason: "",
  startime: "",
  userphone: "",
};

const pickerMinDate = dayjs("2020-01-01 00:00");
const pickerMaxDate = dayjs("2030-12-31 23:59");

function getRows<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows<T>((value as { data?: unknown }).data);
  }

  return [];
}

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}") as {
      userphone?: string;
    };
  } catch {
    return {};
  }
}

function getDateTimeString(value: Dayjs | null): string {
  return value ? value.format("YYYY-MM-DD HH:mm") : "";
}

function parseDateTime(value?: string) {
  if (!value) {
    return null;
  }

  const nextValue = dayjs(value);
  return nextValue.isValid() ? nextValue : null;
}

function getStatusMeta(status?: string) {
  if (status === "通过") {
    return { color: "green", text: "通过" };
  }

  if (status === "驳回") {
    return { color: "red", text: "驳回" };
  }

  return { color: "orange", text: "待审核" };
}

function formatLeaveRange(item: LeaveRow) {
  return `${item.startime || "-"} ~ ${item.endtime || "-"}`;
}

export function LeaveMgrPage() {
  const [activeLeaveList, setActiveLeaveList] = useState(0);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [taskList, setTaskList] = useState<LeaveRow[]>([]);
  const [userList, setUserList] = useState<UserRow[]>([]);
  const [leaveForm, setLeaveForm] = useState<LeaveFormState>(emptyLeaveForm);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRow, setSelectedRow] = useState<LeaveRow>({});
  const [editType, setEditType] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(false);

  const pendingApprovals = useMemo(
    () => taskList.filter((item) => !item.infoflag),
    [taskList],
  );
  const approvedCount = useMemo(
    () => taskList.filter((item) => item.infoflag === "通过").length,
    [taskList],
  );
  const rejectedCount = useMemo(
    () => taskList.filter((item) => item.infoflag === "驳回").length,
    [taskList],
  );
  const visibleRecords =
    activeLeaveList === 0 ? taskList : pendingApprovals;
  const userOptions = useMemo(
    () =>
      userList.map((item) => {
        const label = item.username || item.userphone || "未命名人员";

        return {
          label,
          value: label,
          userphone: item.userphone,
        };
      }),
    [userList],
  );
  const tabItems = [
    {
      count: taskList.length,
      icon: "ri:file-list-3-line",
      label: "请假记录",
      value: 0,
    },
    {
      count: pendingApprovals.length,
      icon: "ri:shield-check-line",
      label: "去审批",
      value: 1,
    },
  ];
  const summaryItems = [
    { label: "全部记录", value: taskList.length, theme: "blue" },
    { label: "待审批", value: pendingApprovals.length, theme: "orange" },
    { label: "已通过", value: approvedCount, theme: "green" },
    { label: "已驳回", value: rejectedCount, theme: "red" },
  ];

  useEffect(() => {
    loadLeaves();
    loadManagers();
  }, []);

  function resetLeaveForm() {
    setLeaveForm(emptyLeaveForm);
    setSelectedRow({});
    setEditType("add");
  }

  function openAddLeave() {
    setEditType("add");
    setSelectedRow({});
    setLeaveForm({
      ...emptyLeaveForm,
      userphone: getSessionUser().userphone || "",
    });
    setShowLeaveForm(true);
  }

  function editLeave(row: LeaveRow) {
    setEditType("edit");
    setSelectedRow(row);
    setLeaveForm({
      endtime: row.endtime || "",
      id: row.id,
      manager: row.manager || "",
      reason: row.reason || "",
      startime: row.startime || "",
      userphone: row.userphone || "",
    });
    setShowLeaveForm(true);
  }

  function loadLeaves() {
    setLoading(true);
    fetchLeaves()
      .then((res) => setTaskList(getRows<LeaveRow>(res)))
      .catch(() => message.error("请假信息加载失败"))
      .finally(() => setLoading(false));
  }

  function loadManagers() {
    fetchAllUsers()
      .then((res) => {
        const rows = getRows<UserRow>(res);
        setUserList(rows.filter((item) => item.userrole === "管理员"));
      })
      .catch(() => message.error("审批人加载失败"));
  }

  function onManagerChange(value?: string) {
    setLeaveForm((form) => ({
      ...form,
      manager: value || "",
      userphone: form.userphone || getSessionUser().userphone || "",
    }));
  }

  function validateLeaveForm() {
    if (!leaveForm.manager) {
      message.warning("请选择审批人");
      return false;
    }

    if (!leaveForm.startime) {
      message.warning("请选择请假开始时间");
      return false;
    }

    if (!leaveForm.endtime) {
      message.warning("请选择请假结束时间");
      return false;
    }

    if (!leaveForm.reason.trim()) {
      message.warning("请填写请假原因");
      return false;
    }

    if (dayjs(leaveForm.endtime).diff(dayjs(leaveForm.startime), "minute") < 30) {
      message.warning("结束时间需要晚于开始时间至少 30 分钟");
      return false;
    }

    return true;
  }

  function submitLeaveForm() {
    if (!validateLeaveForm()) {
      return;
    }

    setLoading(true);
    saveLeave(
      {
        ...leaveForm,
        id: editType === "edit" ? selectedRow.id : undefined,
        userphone: leaveForm.userphone || getSessionUser().userphone,
      },
      editType !== "add",
    )
      .then((res) => {
        if (!res) {
          message.warning("保存失败");
          return;
        }

        message.success("保存成功");
        setShowLeaveForm(false);
        setActiveLeaveList(0);
        loadLeaves();
      })
      .catch(() => message.error("保存失败，请稍后重试"))
      .finally(() => setLoading(false));
  }

  function updateLeaveStatus(row: LeaveRow, infoflag: string, remake = "") {
    setLoading(true);
    updateLeave({
      id: row.id,
      infoflag,
      remake: remake || undefined,
      userphone: row.userphone,
    })
      .then((res) => {
        if (res) {
          message.success("保存成功");
          setRejectOpen(false);
          setRejectReason("");
          loadLeaves();
        }
      })
      .catch(() => message.error("保存失败，请稍后重试"))
      .finally(() => setLoading(false));
  }

  function resolveApprove(row: LeaveRow) {
    Modal.confirm({
      cancelText: "取消",
      content: "确定通过该条审批信息？",
      okText: "通过",
      title: "操作确认",
      onOk: () => updateLeaveStatus(row, "通过"),
    });
  }

  function rejectApprove(row: LeaveRow) {
    setSelectedRow(row);
    setRejectOpen(true);
  }

  function confirmReject() {
    Modal.confirm({
      cancelText: "取消",
      content: "确定驳回该条审批信息？",
      okText: "确认驳回",
      title: "操作确认",
      onOk: () => updateLeaveStatus(selectedRow, "驳回", rejectReason),
    });
  }

  function removeLeave(row: LeaveRow) {
    Modal.confirm({
      cancelText: "取消",
      content: "确定撤销这条请假信息吗？",
      okText: "撤销",
      title: "操作确认",
      onOk: () => {
        setLoading(true);
        return deleteLeaveById(row.id || "")
          .then((res) => {
            if (res) {
              message.success("保存成功");
              loadLeaves();
            }
          })
          .finally(() => setLoading(false));
      },
    });
  }

  return (
    <div className="react-admin-page">
      <section className="react-admin-header">
        <div className="react-admin-header-main">
          <div>
            <h1>请假管理</h1>
            <p>维护个人请假申请，处理待审批的请假记录。</p>
          </div>
        </div>
        <div className="react-admin-header-side">
          <Tag color="blue">{taskList.length} 条</Tag>
          <div className="react-admin-header-icon">
            <img src={headerIcon} alt="" />
          </div>
        </div>
      </section>

      <section className="react-admin-summary">
        {summaryItems.map((item) => (
          <article
            className={`react-admin-stat theme-${item.theme}`}
            key={item.label}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="react-admin-toolbar">
        <div className="react-leave-toolbar">
          <div className="react-admin-tabs" role="tablist">
            {tabItems.map((item) => (
              <button
                className={
                  activeLeaveList === item.value
                    ? "react-admin-tab active"
                    : "react-admin-tab"
                }
                key={item.value}
                type="button"
                onClick={() => setActiveLeaveList(item.value)}
              >
                <Icon icon={item.icon} />
                {item.label}
                <small>{item.count}</small>
              </button>
            ))}
          </div>
          <Button
            icon={<Icon icon="ri:add-line" />}
            type="primary"
            onClick={openAddLeave}
          >
            我要请假
          </Button>
        </div>
      </section>

      <section className="react-admin-list">
        {visibleRecords.length ? (
          <div className="react-leave-grid">
            {visibleRecords.map((item, index) => (
              <article
                className="react-leave-card"
                key={`${item.id || item.startime || index}`}
              >
                <div className="react-leave-header">
                  <div>
                    <span>开始时间</span>
                    <strong>{item.startime || "-"}</strong>
                  </div>
                  <Tag color={getStatusMeta(item.infoflag).color}>
                    {getStatusMeta(item.infoflag).text}
                  </Tag>
                </div>

                <dl className="react-admin-meta">
                  <div>
                    <dt>请假时间</dt>
                    <dd>{formatLeaveRange(item)}</dd>
                  </div>
                  <div>
                    <dt>{activeLeaveList === 0 ? "审批人" : "申请人电话"}</dt>
                    <dd>
                      {activeLeaveList === 0
                        ? item.manager || "-"
                        : item.userphone || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt>请假原因</dt>
                    <dd>{item.reason || "-"}</dd>
                  </div>
                  {item.remake ? (
                    <div>
                      <dt>驳回理由</dt>
                      <dd>{item.remake}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="react-admin-actions">
                  {activeLeaveList === 0 ? (
                    <>
                      <Button size="small" onClick={() => editLeave(item)}>
                        修改
                      </Button>
                      {!item.infoflag ? (
                        <Button danger size="small" onClick={() => removeLeave(item)}>
                          撤销
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => resolveApprove(item)}
                      >
                        通过
                      </Button>
                      <Button danger size="small" onClick={() => rejectApprove(item)}>
                        驳回
                      </Button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="react-admin-empty">
            <Icon icon="ri:file-list-3-line" />
            <h3>{activeLeaveList === 0 ? "暂无请假记录" : "暂无待审批信息"}</h3>
            <p>当前筛选下没有需要展示的请假信息。</p>
          </div>
        )}
      </section>

      <Modal
        className="react-admin-leave-modal"
        footer={null}
        open={showLeaveForm}
        title={editType === "add" ? "新增请假申请" : "修改请假申请"}
        width={760}
        onCancel={() => setShowLeaveForm(false)}
        afterOpenChange={(open) => {
          if (!open) {
            resetLeaveForm();
          }
        }}
      >
        <Form className="react-admin-form" layout="vertical">
          <div className="react-admin-form-grid two">
            <Form.Item label="审批人" required>
              <Select
                allowClear
                showSearch
                options={userOptions}
                placeholder="请选择审批人"
                value={leaveForm.manager || undefined}
                onChange={onManagerChange}
              />
            </Form.Item>
            <Form.Item label="开始时间" required>
              <DatePicker
                disabledDate={(current) =>
                  Boolean(current && (current < pickerMinDate || current > pickerMaxDate))
                }
                format="YYYY-MM-DD HH:mm"
                showTime
                value={parseDateTime(leaveForm.startime)}
                onChange={(value) =>
                  setLeaveForm((form) => ({
                    ...form,
                    startime: getDateTimeString(value),
                  }))
                }
              />
            </Form.Item>
            <Form.Item label="结束时间" required>
              <DatePicker
                disabledDate={(current) =>
                  Boolean(current && (current < pickerMinDate || current > pickerMaxDate))
                }
                format="YYYY-MM-DD HH:mm"
                showTime
                value={parseDateTime(leaveForm.endtime)}
                onChange={(value) =>
                  setLeaveForm((form) => ({
                    ...form,
                    endtime: getDateTimeString(value),
                  }))
                }
              />
            </Form.Item>
            <Form.Item className="react-admin-full" label="请假原因" required>
              <Input.TextArea
                maxLength={1000}
                placeholder="请输入请假原因"
                rows={4}
                showCount
                value={leaveForm.reason}
                onChange={(event) =>
                  setLeaveForm((form) => ({
                    ...form,
                    reason: event.target.value,
                  }))
                }
              />
            </Form.Item>
          </div>
        </Form>
        <div className="react-admin-modal-actions">
          <Button onClick={() => setShowLeaveForm(false)}>取消</Button>
          <Button type="primary" onClick={submitLeaveForm}>
            保存
          </Button>
        </div>
      </Modal>

      <Modal
        className="react-admin-reject-modal"
        footer={null}
        open={rejectOpen}
        title="驳回请假信息"
        width={520}
        onCancel={() => {
          setRejectOpen(false);
          setRejectReason("");
        }}
      >
        <Form layout="vertical">
          <Form.Item label="驳回原因">
            <Input.TextArea
              maxLength={1000}
              placeholder="请输入驳回原因"
              rows={4}
              showCount
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
          </Form.Item>
        </Form>
        <div className="react-admin-modal-actions">
          <Button onClick={() => setRejectOpen(false)}>取消</Button>
          <Button danger type="primary" onClick={confirmReject}>
            确认驳回
          </Button>
        </div>
      </Modal>

      {loading ? (
        <div className="react-admin-loading-cover">
          <Spin size="large" />
          <span>正在请求数据，请稍后...</span>
        </div>
      ) : null}
    </div>
  );
}
