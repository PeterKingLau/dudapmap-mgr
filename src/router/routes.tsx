import { lazy, type ComponentType } from "react";
import { ROUTE_PATHS } from "./paths";

type PageComponent = ComponentType<Record<string, never>>;

export type AppRouteItem = {
  Component: PageComponent;
  path: string;
};

function lazyPage<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: keyof T,
) {
  return lazy(async () => {
    const module = await loader();

    return {
      default: module[exportName] as PageComponent,
    };
  });
}

export const LoginPage = lazyPage(() => import("../pages/login"), "LoginPage");
export const NotFoundPage = lazyPage(
  () => import("../pages/error/NotFound"),
  "NotFoundPage",
);

export const appRoutes: AppRouteItem[] = [
  {
    path: ROUTE_PATHS.home.index,
    Component: lazyPage(() => import("../pages/dashboard"), "DashboardPage"),
  },
  {
    path: ROUTE_PATHS.attendance.clockIn,
    Component: lazyPage(
      () => import("../pages/attendance/clockIn"),
      "ClockInPage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.clockInMonth,
    Component: lazyPage(
      () => import("../pages/attendance/clockInMonth"),
      "ClockInMonthPage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.clockInDay,
    Component: lazyPage(
      () => import("../pages/attendance/clockInDay"),
      "ClockInDayPage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.clockInMonthPeople,
    Component: lazyPage(
      () => import("../pages/attendance/clockInMonthPeople"),
      "ClockInMonthPeoplePage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.clockInDayPeople,
    Component: lazyPage(
      () => import("../pages/attendance/clockInDayPeople"),
      "ClockInDayPeoplePage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.playClockIntime,
    Component: lazyPage(
      () => import("../pages/attendance/palyClockIntime"),
      "PalyClockIntimePage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.unclockedClickIn,
    Component: lazyPage(
      () => import("../pages/attendance/unclockedClickIn"),
      "UnclockedClickInPage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.clockTotal,
    Component: lazyPage(
      () => import("../pages/attendance/clockTotal"),
      "ClockTotalPage",
    ),
  },
  {
    path: ROUTE_PATHS.attendance.clockOpt,
    Component: lazyPage(
      () => import("../pages/attendance/clockOpt"),
      "ClockOptPage",
    ),
  },
  {
    path: ROUTE_PATHS.device.list,
    Component: lazyPage(() => import("../pages/device/list"), "DeviceListPage"),
  },
  {
    path: ROUTE_PATHS.device.create,
    Component: lazyPage(
      () => import("../pages/device/create"),
      "DeviceCreatePage",
    ),
  },
  {
    path: ROUTE_PATHS.device.detail,
    Component: lazyPage(
      () => import("../pages/device/detail"),
      "DeviceDetailPage",
    ),
  },
  {
    path: ROUTE_PATHS.device.update,
    Component: lazyPage(
      () => import("../pages/device/update"),
      "DeviceUpdatePage",
    ),
  },
  {
    path: ROUTE_PATHS.indoor.list,
    Component: lazyPage(() => import("../pages/indoor/list"), "IndoorListPage"),
  },
  {
    path: ROUTE_PATHS.indoor.detail,
    Component: lazyPage(
      () => import("../pages/indoor/detail"),
      "IndoorDetailPage",
    ),
  },
  {
    path: ROUTE_PATHS.appointment.list,
    Component: lazyPage(
      () => import("../pages/appointment/list"),
      "AppointmentListPage",
    ),
  },
  {
    path: ROUTE_PATHS.appointment.search,
    Component: lazyPage(
      () => import("../pages/appointment/search"),
      "AppointmentSearchPage",
    ),
  },
  {
    path: ROUTE_PATHS.task.list,
    Component: lazyPage(() => import("../pages/task/list"), "TaskListPage"),
  },
  {
    path: ROUTE_PATHS.task.detail,
    Component: lazyPage(() => import("../pages/task/detail"), "TaskDetailPage"),
  },
  {
    path: ROUTE_PATHS.map.trajectory,
    Component: lazyPage(
      () => import("../pages/map/trajectory"),
      "TrajectoryPage",
    ),
  },
  {
    path: ROUTE_PATHS.map.rider,
    Component: lazyPage(() => import("../pages/map/rider"), "RiderPage"),
  },
  {
    path: ROUTE_PATHS.admin.userMgr,
    Component: lazyPage(() => import("../pages/admin/userMgr"), "UserMgrPage"),
  },
  {
    path: ROUTE_PATHS.admin.leaveMgr,
    Component: lazyPage(
      () => import("../pages/admin/leaveMgr"),
      "LeaveMgrPage",
    ),
  },
  {
    path: ROUTE_PATHS.admin.forRole,
    Component: lazyPage(() => import("../pages/admin/forRole"), "ForRolePage"),
  },
  {
    path: ROUTE_PATHS.system.journal,
    Component: lazyPage(() => import("../pages/system/journal"), "JournalPage"),
  },
];
