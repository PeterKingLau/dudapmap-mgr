import { Card, ConfigProvider, Typography, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Icon } from "@iconify/react";
import "dayjs/locale/zh-cn";
import { useEffect, useMemo, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { menuSections } from "./layouts/menu";
import { ForRolePage } from "./pages/admin/forRole";
import { LeaveMgrPage } from "./pages/admin/leaveMgr";
import { UserMgrPage } from "./pages/admin/userMgr";
import { AppointmentListPage } from "./pages/appointment/list";
import { AppointmentSearchPage } from "./pages/appointment/search";
import { ClockInPage } from "./pages/attendance/clockIn";
import { ClockInDayPage } from "./pages/attendance/clockInDay";
import { ClockInDayPeoplePage } from "./pages/attendance/clockInDayPeople";
import { ClockInMonthPage } from "./pages/attendance/clockInMonth";
import { ClockInMonthPeoplePage } from "./pages/attendance/clockInMonthPeople";
import { ClockOptPage } from "./pages/attendance/clockOpt";
import { ClockTotalPage } from "./pages/attendance/clockTotal";
import { PalyClockIntimePage } from "./pages/attendance/palyClockIntime";
import { UnclockedClickInPage } from "./pages/attendance/unclockedClickIn";
import { DashboardPage } from "./pages/dashboard";
import { DeviceCreatePage } from "./pages/device/create";
import { DeviceDetailPage } from "./pages/device/detail";
import { DeviceListPage } from "./pages/device/list";
import { DeviceUpdatePage } from "./pages/device/update";
import { NotFoundPage } from "./pages/error/NotFound";
import { IndoorDetailPage } from "./pages/indoor/detail";
import { IndoorListPage } from "./pages/indoor/list";
import { LoginPage } from "./pages/login";
import { RiderPage } from "./pages/map/rider";
import { TrajectoryPage } from "./pages/map/trajectory";
import { JournalPage } from "./pages/system/journal";
import { TaskDetailPage } from "./pages/task/detail";
import { TaskListPage } from "./pages/task/list";
import { ROUTE_PATHS } from "./router/paths";

const { Title, Paragraph } = Typography;
const THEME_STORAGE_KEY = "app-theme";

function getInitialDarkMode() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  } catch {
    return false;
  }
}

function PlaceholderPage({ icon, title }: { icon: string; title: string }) {
  return (
    <Card className="react-placeholder" variant="borderless">
      <Icon icon={icon} />
      <Title level={4}>{title}</Title>
      <Paragraph>
        当前模块正在接入 React 版本。页面结构已经就绪，可以继续迁移真实业务组件。
      </Paragraph>
    </Card>
  );
}

const migratedPaths = new Set([
  ROUTE_PATHS.home.index,
  ROUTE_PATHS.attendance.clockIn,
  ROUTE_PATHS.attendance.clockTotal,
  ROUTE_PATHS.attendance.clockOpt,
  ROUTE_PATHS.device.list,
  ROUTE_PATHS.device.create,
  ROUTE_PATHS.indoor.list,
  ROUTE_PATHS.appointment.list,
  ROUTE_PATHS.task.list,
  ROUTE_PATHS.map.trajectory,
  ROUTE_PATHS.map.rider,
  ROUTE_PATHS.admin.userMgr,
  ROUTE_PATHS.admin.leaveMgr,
  ROUTE_PATHS.system.journal,
]);

export function App() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const reactTheme = useMemo(
    () => ({
      algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: "#13b996",
        colorLink: "#13b996",
        borderRadius: 8,
      },
    }),
    [isDarkMode],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <ConfigProvider locale={zhCN} theme={reactTheme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTE_PATHS.auth.login} replace />} />
          <Route path={ROUTE_PATHS.auth.login} element={<LoginPage />} />
          <Route
            element={
              <AppLayout
                isDarkMode={isDarkMode}
                toggleTheme={() => setIsDarkMode((value) => !value)}
              />
            }
          >
            <Route path={ROUTE_PATHS.home.index} element={<DashboardPage />} />
            <Route path={ROUTE_PATHS.attendance.clockIn} element={<ClockInPage />} />
            <Route path={ROUTE_PATHS.attendance.clockInMonth} element={<ClockInMonthPage />} />
            <Route path={ROUTE_PATHS.attendance.clockInDay} element={<ClockInDayPage />} />
            <Route
              path={ROUTE_PATHS.attendance.clockInMonthPeople}
              element={<ClockInMonthPeoplePage />}
            />
            <Route
              path={ROUTE_PATHS.attendance.clockInDayPeople}
              element={<ClockInDayPeoplePage />}
            />
            <Route path={ROUTE_PATHS.attendance.playClockIntime} element={<PalyClockIntimePage />} />
            <Route
              path={ROUTE_PATHS.attendance.unclockedClickIn}
              element={<UnclockedClickInPage />}
            />
            <Route path={ROUTE_PATHS.attendance.clockTotal} element={<ClockTotalPage />} />
            <Route path={ROUTE_PATHS.attendance.clockOpt} element={<ClockOptPage />} />
            <Route path={ROUTE_PATHS.device.list} element={<DeviceListPage />} />
            <Route path={ROUTE_PATHS.device.create} element={<DeviceCreatePage />} />
            <Route path={ROUTE_PATHS.device.detail} element={<DeviceDetailPage />} />
            <Route path={ROUTE_PATHS.device.update} element={<DeviceUpdatePage />} />
            <Route path={ROUTE_PATHS.indoor.list} element={<IndoorListPage />} />
            <Route
              path={ROUTE_PATHS.indoor.detail}
              element={<IndoorDetailPage />}
            />
            <Route
              path={ROUTE_PATHS.appointment.list}
              element={<AppointmentListPage />}
            />
            <Route
              path={ROUTE_PATHS.appointment.search}
              element={<AppointmentSearchPage />}
            />
            <Route path={ROUTE_PATHS.task.list} element={<TaskListPage />} />
            <Route
              path={ROUTE_PATHS.task.detail}
              element={<TaskDetailPage />}
            />
            <Route path={ROUTE_PATHS.map.trajectory} element={<TrajectoryPage />} />
            <Route path={ROUTE_PATHS.map.rider} element={<RiderPage />} />
            <Route path={ROUTE_PATHS.admin.userMgr} element={<UserMgrPage />} />
            <Route path={ROUTE_PATHS.admin.leaveMgr} element={<LeaveMgrPage />} />
            <Route path={ROUTE_PATHS.admin.forRole} element={<ForRolePage />} />
            <Route path={ROUTE_PATHS.system.journal} element={<JournalPage />} />
            {menuSections
              .flatMap((section) => section.items)
              .filter((item) => !migratedPaths.has(item.path))
              .map((item) => (
                <Route
                  element={
                    <PlaceholderPage icon={item.icon} title={item.label} />
                  }
                  key={item.path}
                  path={item.path}
                />
              ))}
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}
