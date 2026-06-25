import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  Modal,
  type MenuProps,
} from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { canAccessRoute } from "../router/permissions";
import { ROUTE_PATHS } from "../router/paths";
import { useAppStore } from "../store/useAppStore";
import brandLogo from "../assets/images/brand-logo.png";
import { AppBreadcrumb } from "./components/AppBreadcrumb";
import { TagsView } from "./components/TagsView";
import {
  getActiveMenuPath,
  getActiveSection,
  menuSections,
  type ReactMenuSection,
} from "./menu";

const { Header, Sider, Content } = Layout;

type AppLayoutProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

function buildMenuItems(sections: ReactMenuSection[]): MenuProps["items"] {
  return sections.map((section) => ({
    key: section.label,
    icon: <Icon className="react-menu-icon" icon={section.icon} />,
    label: section.label,
    children: section.items.map((item) => ({
      key: item.path,
      icon: <Icon className="react-menu-icon" icon={item.icon} />,
      label: <Link to={item.path}>{item.label}</Link>,
    })),
  }));
}

export function AppLayout({ isDarkMode, toggleTheme }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([]);
  const currentUser = useAppStore((state) => state.login);
  const clearLogin = useAppStore((state) => state.clearLogin);
  const activePath = getActiveMenuPath(location.pathname);
  const activeSection = getActiveSection(location.pathname);
  const currentUserInfo = currentUser || {};
  const username = currentUserInfo.username || currentUserInfo.userphone || "用户";
  const userInitial = String(username).slice(0, 1);
  const visibleMenuSections = useMemo(
    () =>
      menuSections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              !item.access ||
              canAccessRoute(
                {
                  recvcode: String(currentUserInfo.recvcode || ""),
                  userrole: String(currentUserInfo.userrole || ""),
                },
                item.access,
              ),
          ),
        }))
        .filter((section) => section.items.length),
    [currentUserInfo.recvcode, currentUserInfo.userrole],
  );
  const menuItems = useMemo(
    () => buildMenuItems(visibleMenuSections),
    [visibleMenuSections],
  );
  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <Icon icon="ri:logout-box-r-line" />,
      label: "退出登录",
    },
  ];

  function logout() {
    Modal.confirm({
      title: "退出登录",
      content: "确定退出当前账号吗？",
      okText: "退出",
      cancelText: "取消",
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        clearLogin();
        navigate(ROUTE_PATHS.auth.login, { replace: true });
      },
    });
  }

  useEffect(() => {
    if (collapsed) {
      setOpenMenuKeys([]);
      return;
    }

    if (activeSection) {
      setOpenMenuKeys((keys) =>
        keys.includes(activeSection.label) ? keys : [activeSection.label],
      );
    }
  }, [activeSection, collapsed]);

  return (
    <Layout className={isDarkMode ? "react-shell theme-dark" : "react-shell"}>
      <Sider
        className="react-sider"
        collapsed={collapsed}
        collapsedWidth={64}
        collapsible
        trigger={null}
        width={232}
      >
        <div className={collapsed ? "react-brand collapsed" : "react-brand"}>
          <img src={brandLogo} alt="" />
          {!collapsed ? (
            <div>
              <strong>华信达</strong>
              <span>管理工作台</span>
            </div>
          ) : null}
        </div>

        <div className="react-menu-wrap">
          <Menu
            className="react-menu"
            inlineCollapsed={collapsed}
            items={menuItems}
            mode="inline"
            openKeys={collapsed ? undefined : openMenuKeys}
            onOpenChange={(keys) => setOpenMenuKeys(keys as string[])}
            selectedKeys={[activePath]}
            theme="dark"
          />
        </div>
      </Sider>

      <Layout className="react-body">
        <Header className="react-header">
          <div className="react-header-left">
            <Button
              className="react-collapse-button"
              size="small"
              type="text"
              onClick={() => setCollapsed((value) => !value)}
            >
              <Icon
                icon={collapsed ? "ri:menu-unfold-line" : "ri:menu-fold-line"}
              />
              {collapsed ? "展开" : "收起"}
            </Button>
            <AppBreadcrumb />
          </div>

          <div className="react-header-right">
            <Button
              className="react-theme-toggle"
              shape="circle"
              title={isDarkMode ? "切换浅色模式" : "切换暗黑模式"}
              type="text"
              onClick={toggleTheme}
            >
              <Icon icon={isDarkMode ? "ri:sun-line" : "ri:moon-clear-line"} />
            </Button>
            <div className="react-user-region" title="区域">
              <Icon icon="ri:map-pin-2-line" />
              <span>{currentUserInfo.useravator || "-"}</span>
            </div>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === "logout") {
                    logout();
                  }
                },
              }}
              trigger={["click"]}
            >
              <button className="react-user-button" type="button">
                <Avatar className="react-user-avatar" size={32}>
                  {userInitial}
                </Avatar>
                <span>{username}</span>
                <Icon icon="ri:arrow-down-s-line" />
              </button>
            </Dropdown>
          </div>
        </Header>

        <TagsView />

        <Content className="react-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
