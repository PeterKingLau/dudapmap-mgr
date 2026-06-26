import { message } from "@/utils/message";
import { Button, Checkbox, Form, Input, Modal, Select, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import {
  deleteUserById,
  fetchAllUsers,
  fetchUserByPhone,
  saveUser,
} from "../../../api/user";
import { getCurrentDisname } from "../../../api/request";
import { validatePhoneNumber } from "../../../utils/validators";
import "../shared.css";

type UserRow = {
  id?: number | string;
  recvcode?: string;
  useravator?: string;
  userphone?: string;
  userrole?: string;
  username?: string;
};

const headerIcon = new URL(
  "../../../assets/images/nav-user-admin.png",
  import.meta.url,
).href;

const roleColumns = ["管理员", "人员"];
const userTypeColumns = ["管理员", "人员", "小工"];
const permissionList = [
  { name: "可分配二级权限子功能", value: "10000" },
  { name: "可设置打卡时间段", value: "10001" },
  { name: "可设置打卡次数", value: "10002" },
  { name: "可设置打卡范围", value: "10003" },
  { name: "可开启提示信息", value: "10004" },
  { name: "可编辑人员信息", value: "10005" },
];

function getRows(value: unknown): UserRow[] {
  if (Array.isArray(value)) {
    return value as UserRow[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  return [];
}

function getSessionUserInfo() {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}") as UserRow;
  } catch {
    return {};
  }
}

function formatValue(value: unknown): string | number {
  if (value === "" || value === null || value === undefined) {
    return "-";
  }

  return typeof value === "number" || typeof value === "string"
    ? value
    : String(value);
}

function formatRole(value?: string): string | number {
  return value === "1" ? "-" : formatValue(value);
}

function formatArea(value?: string): string | number {
  return value === "1" ? "-" : formatValue(value);
}

function getUserInitial(item: UserRow) {
  const value = item.username || item.userrole || item.userphone || "人";

  return String(value).slice(0, 1);
}

export function UserMgrPage() {
  const [showEditUser, setShowEditUser] = useState(false);
  const [userList, setUserList] = useState<UserRow[]>([]);
  const [userType, setUserType] = useState("");
  const [selectId, setSelectId] = useState<string | number>("");
  const [userphone, setUserphone] = useState("");
  const [username, setUsername] = useState("");
  const [userrole, setUserrole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canEditUser = rules.includes("10005");
  const editTitle = selectId
    ? canEditUser
      ? "修改人员信息"
      : "查看人员信息"
    : "新增人员信息";

  const summaryItems = useMemo(() => {
    const adminCount = userList.filter(
      (item) => item.userrole === "管理员",
    ).length;
    const peopleCount = userList.filter(
      (item) => item.userrole === "人员",
    ).length;
    const workerCount = userList.filter(
      (item) => item.userrole === "小工",
    ).length;

    return [
      { label: "当前人员", value: userList.length, theme: "blue" },
      { label: "管理员", value: adminCount, theme: "green" },
      { label: "人员", value: peopleCount, theme: "orange" },
      { label: "小工", value: workerCount, theme: "red" },
    ];
  }, [userList]);

  useEffect(() => {
    loadUsers();
    loadCurrentUserRules();
  }, []);

  function clearForm() {
    setUserphone("");
    setUsername("");
    setUserrole("");
    setPermissions([]);
    setSelectId("");
  }

  function openAddUser() {
    clearForm();
    setShowEditUser(true);
  }

  function openEditUser(row: UserRow) {
    setUserphone(row.userphone || "");
    setUsername(row.username || "");
    setUserrole(row.userrole || "");
    setSelectId(row.id || "");
    setPermissions(row.recvcode ? row.recvcode.split(",").filter(Boolean) : []);
    setShowEditUser(true);
  }

  function validateUserForm() {
    if (!validatePhoneNumber(userphone)) {
      message.warning("请输入正确的电话号码");
      return false;
    }

    if (!username.trim()) {
      message.warning("请输入人员姓名");
      return false;
    }

    return true;
  }

  function loadCurrentUserRules() {
    const userInfo = getSessionUserInfo();

    if (!userInfo.userphone) {
      setRules([]);
      return;
    }

    fetchUserByPhone(userInfo.userphone)
      .then((res) => {
        const data = (res as { data?: { recvcode?: string } })?.data;
        setRules(data?.recvcode ? data.recvcode.split(",") : []);
      })
      .catch(() => setRules([]));
  }

  function loadUsers(type = userType) {
    setLoading(true);
    fetchAllUsers()
      .then((res) => {
        const rows = getRows(res);
        setUserList(
          type ? rows.filter((item) => item.userrole === type) : rows,
        );
      })
      .catch(() => {
        setUserList([]);
        message.error("人员信息加载失败");
      })
      .finally(() => setLoading(false));
  }

  function changeUserType(value?: string) {
    const nextType = value || "";

    setUserType(nextType);
    loadUsers(nextType);
  }

  function submitUser() {
    if (!canEditUser || !validateUserForm()) {
      return;
    }

    setSubmitting(true);
    saveUser(
      {
        id: selectId || undefined,
        recvcode: permissions.join(","),
        useravator: getCurrentDisname() || undefined,
        userphone,
        userrole,
        username,
      },
      Boolean(selectId),
    )
      .then((res) => {
        if (!res) {
          message.warning("保存失败");
          return;
        }

        message.success("保存成功");
        setShowEditUser(false);
        loadUsers();
      })
      .catch(() => message.error("保存失败，请稍后重试"))
      .finally(() => setSubmitting(false));
  }

  function removeUser(id?: string | number) {
    if (!id) {
      return;
    }

    Modal.confirm({
      title: "删除确认",
      content: "确定删除这个人员吗？",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () =>
        deleteUserById(id).then(() => {
          message.success("删除成功");
          loadUsers();
        }),
    });
  }

  return (
    <div className="react-admin-page">
      <section className="react-admin-header">
        <div className="react-admin-header-main">
          <div>
            <h1>人员管理</h1>
            <p>查看人员信息、筛选角色，并维护人员基础资料与权限。</p>
          </div>
        </div>
        <div className="react-admin-header-side">
          <Tag color="blue">{userList.length} 人</Tag>
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
        <Form className="react-admin-filter" layout="vertical">
          <Form.Item label="人员类型">
            <Select
              allowClear
              options={[
                { label: "全部", value: "" },
                ...userTypeColumns.map((item) => ({
                  label: item,
                  value: item,
                })),
              ]}
              placeholder="全部"
              value={userType || undefined}
              onChange={changeUserType}
            />
          </Form.Item>
          <Form.Item label="操作">
            {canEditUser ? (
              <Button
                icon={<Icon icon="ri:add-line" />}
                type="primary"
                onClick={openAddUser}
              >
                新增人员
              </Button>
            ) : (
              <Button disabled icon={<Icon icon="ri:lock-line" />}>
                仅可查看
              </Button>
            )}
          </Form.Item>
        </Form>
      </section>

      <section className="react-admin-list">
        {loading ? (
          <div className="react-admin-loading">
            <Spin size="large" />
            <span>加载中...</span>
          </div>
        ) : userList.length ? (
          <div className="react-admin-grid">
            {userList.map((item, index) => (
              <article
                className="react-user-card"
                key={`${item.id || item.userphone || index}`}
                onClick={() => openEditUser(item)}
              >
                <div className="react-user-card-header">
                  <div className="react-user-avatar">
                    {getUserInitial(item)}
                  </div>
                  <div className="react-user-main">
                    <strong>{formatValue(item.username)}</strong>
                    <span>{formatValue(item.userphone)}</span>
                  </div>
                  {canEditUser ? (
                    <Button
                      danger
                      icon={<Icon icon="ri:delete-bin-line" />}
                      shape="circle"
                      type="text"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeUser(item.id);
                      }}
                    />
                  ) : null}
                </div>
                <dl className="react-admin-meta">
                  <div>
                    <dt>电话</dt>
                    <dd>{formatValue(item.userphone)}</dd>
                  </div>
                  <div>
                    <dt>角色</dt>
                    <dd>{formatRole(item.userrole)}</dd>
                  </div>
                  <div>
                    <dt>区域</dt>
                    <dd>{formatArea(item.useravator)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="react-admin-empty">
            <Icon icon="ri:user-search-line" />
            <h3>暂无人员信息</h3>
            <p>当前筛选下没有人员记录。</p>
          </div>
        )}
      </section>

      <Modal
        className="react-admin-user-modal"
        footer={null}
        open={showEditUser}
        title={editTitle}
        width={1080}
        onCancel={() => setShowEditUser(false)}
        afterOpenChange={(open) => {
          if (!open) {
            clearForm();
          }
        }}
      >
        <div className="react-admin-modal-summary">
          <Icon icon={canEditUser ? "ri:user-settings-line" : "ri:eye-line"} />
          <span>{canEditUser ? "完善人员信息与权限" : "仅可查看人员信息"}</span>
        </div>
        <Form className="react-admin-form" layout="vertical">
          <section className="react-admin-form-section">
            <div className="react-admin-section-title">
              <h2>基本信息</h2>
            </div>
            <div className="react-admin-form-grid">
              <Form.Item label="人员角色">
                <Select
                  disabled={!canEditUser}
                  options={roleColumns.map((item) => ({
                    label: item,
                    value: item,
                  }))}
                  placeholder="请选择人员角色"
                  value={userrole || undefined}
                  onChange={(value) => setUserrole(value || "")}
                />
              </Form.Item>
              <Form.Item label="电话号码" required>
                <Input
                  maxLength={11}
                  placeholder="请输入电话号码"
                  readOnly={!canEditUser}
                  value={userphone}
                  onChange={(event) => setUserphone(event.target.value.trim())}
                />
              </Form.Item>
              <Form.Item label="人员姓名" required>
                <Input
                  placeholder="请输入人员姓名"
                  readOnly={!canEditUser}
                  value={username}
                  onChange={(event) => setUsername(event.target.value.trim())}
                />
              </Form.Item>
            </div>
          </section>

          <section className="react-admin-form-section">
            <div className="react-admin-section-title">
              <h2>权限管理</h2>
            </div>
            <Checkbox.Group
              className="react-permission-grid"
              disabled={!canEditUser}
              value={permissions}
              onChange={(value) => setPermissions(value.map(String))}
            >
              {permissionList.map((item) => (
                <div
                  className={
                    permissions.includes(item.value)
                      ? "react-permission-card selected"
                      : "react-permission-card"
                  }
                  key={item.value}
                >
                  <Checkbox disabled={!canEditUser} value={item.value}>
                    {item.name}
                  </Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </section>
        </Form>

        {canEditUser ? (
          <div className="react-admin-modal-actions">
            <Button onClick={() => setShowEditUser(false)}>取消</Button>
            <Button loading={submitting} type="primary" onClick={submitUser}>
              保存
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
