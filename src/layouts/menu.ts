import { ROUTE_PERMISSION_META, type PermissionMeta } from "../router/permissions";
import { ROUTE_PATHS } from "../router/paths";

export type ReactMenuItem = {
  access?: PermissionMeta;
  icon: string;
  label: string;
  path: string;
};

export type ReactMenuSection = {
  icon: string;
  items: ReactMenuItem[];
  label: string;
};

export const menuSections: ReactMenuSection[] = [
  {
    label: "工作台",
    icon: "ri:dashboard-line",
    items: [
      {
        icon: "ri:dashboard-3-line",
        label: "地图工作台",
        path: ROUTE_PATHS.home.index,
      },
    ],
  },
  {
    label: "考勤管理",
    icon: "ri:calendar-check-line",
    items: [
      {
        icon: "ri:time-line",
        label: "人员打卡查询",
        path: ROUTE_PATHS.attendance.clockIn,
      },
      {
        icon: "ri:bar-chart-box-line",
        label: "打卡统计",
        path: ROUTE_PATHS.attendance.clockTotal,
      },
      {
        access: ROUTE_PERMISSION_META.clockOpt,
        icon: "ri:settings-3-line",
        label: "打卡配置",
        path: ROUTE_PATHS.attendance.clockOpt,
      },
    ],
  },
  {
    label: "业务管理",
    icon: "ri:briefcase-4-line",
    items: [
      {
        icon: "ri:image-line",
        label: "照片信息",
        path: ROUTE_PATHS.indoor.list,
      },
      {
        icon: "ri:calendar-check-line",
        label: "预约信息",
        path: ROUTE_PATHS.appointment.list,
      },
      {
        icon: "ri:task-line",
        label: "任务",
        path: ROUTE_PATHS.task.list,
      },
    ],
  },
  {
    label: "设备管理",
    icon: "ri:hard-drive-3-line",
    items: [
      {
        icon: "ri:add-box-line",
        label: "增加设备",
        path: ROUTE_PATHS.device.create,
      },
      {
        icon: "ri:hard-drive-3-line",
        label: "查看设备",
        path: ROUTE_PATHS.device.list,
      },
    ],
  },
  {
    label: "地图工具",
    icon: "ri:map-2-line",
    items: [
      {
        icon: "ri:route-line",
        label: "人员点位查询",
        path: ROUTE_PATHS.map.trajectory,
      },
      {
        icon: "ri:map-pin-line",
        label: "清运车",
        path: ROUTE_PATHS.map.rider,
      },
    ],
  },
  {
    label: "系统管理",
    icon: "ri:settings-4-line",
    items: [
      {
        access: ROUTE_PERMISSION_META.userMgr,
        icon: "ri:team-line",
        label: "人员管理",
        path: ROUTE_PATHS.admin.userMgr,
      },
      {
        access: ROUTE_PERMISSION_META.leaveMgr,
        icon: "ri:calendar-event-line",
        label: "请假管理",
        path: ROUTE_PATHS.admin.leaveMgr,
      },
      {
        icon: "ri:bug-line",
        label: "错误日志",
        path: ROUTE_PATHS.system.journal,
      },
    ],
  },
];

export const routeMenuPathMap: Record<string, string> = {
  [ROUTE_PATHS.admin.forRole]: ROUTE_PATHS.admin.userMgr,
  [ROUTE_PATHS.appointment.search]: ROUTE_PATHS.appointment.list,
  [ROUTE_PATHS.attendance.clockInDay]: ROUTE_PATHS.attendance.clockIn,
  [ROUTE_PATHS.attendance.clockInDayPeople]: ROUTE_PATHS.attendance.clockIn,
  [ROUTE_PATHS.attendance.clockInMonth]: ROUTE_PATHS.attendance.clockIn,
  [ROUTE_PATHS.attendance.clockInMonthPeople]: ROUTE_PATHS.attendance.clockIn,
  [ROUTE_PATHS.attendance.playClockIntime]: ROUTE_PATHS.attendance.clockIn,
  [ROUTE_PATHS.attendance.unclockedClickIn]: ROUTE_PATHS.attendance.clockIn,
  [ROUTE_PATHS.device.detail]: ROUTE_PATHS.device.list,
  [ROUTE_PATHS.device.update]: ROUTE_PATHS.device.list,
  [ROUTE_PATHS.indoor.detail]: ROUTE_PATHS.indoor.list,
  [ROUTE_PATHS.task.detail]: ROUTE_PATHS.task.list,
};

export const extraRouteIcons: Record<string, string> = {
  [ROUTE_PATHS.auth.login]: "ri:login-box-line",
  [ROUTE_PATHS.admin.forRole]: "ri:user-settings-line",
  [ROUTE_PATHS.appointment.search]: "ri:search-line",
  [ROUTE_PATHS.attendance.clockInDay]: "ri:file-list-3-line",
  [ROUTE_PATHS.attendance.clockInDayPeople]: "ri:user-search-line",
  [ROUTE_PATHS.attendance.clockInMonth]: "ri:calendar-2-line",
  [ROUTE_PATHS.attendance.clockInMonthPeople]: "ri:team-line",
  [ROUTE_PATHS.attendance.playClockIntime]: "ri:timer-flash-line",
  [ROUTE_PATHS.attendance.unclockedClickIn]: "ri:calendar-close-line",
  [ROUTE_PATHS.device.detail]: "ri:file-info-line",
  [ROUTE_PATHS.device.update]: "ri:edit-box-line",
  [ROUTE_PATHS.indoor.detail]: "ri:home-gear-line",
  [ROUTE_PATHS.task.detail]: "ri:task-line",
};

export const extraRouteTitles: Record<string, string> = {
  [ROUTE_PATHS.auth.login]: "登录",
  [ROUTE_PATHS.admin.forRole]: "角色调整",
  [ROUTE_PATHS.appointment.search]: "预约查询",
  [ROUTE_PATHS.attendance.clockInDay]: "日打卡明细",
  [ROUTE_PATHS.attendance.clockInDayPeople]: "员工日打卡明细",
  [ROUTE_PATHS.attendance.clockInMonth]: "月打卡信息",
  [ROUTE_PATHS.attendance.clockInMonthPeople]: "员工月打卡信息",
  [ROUTE_PATHS.attendance.playClockIntime]: "打卡时长",
  [ROUTE_PATHS.attendance.unclockedClickIn]: "未打卡查询",
  [ROUTE_PATHS.device.detail]: "设备详情",
  [ROUTE_PATHS.device.update]: "设备编辑",
  [ROUTE_PATHS.indoor.detail]: "照片详情",
  [ROUTE_PATHS.task.detail]: "任务详情",
};

const menuRouteTitles = Object.fromEntries(
  menuSections.flatMap((section) =>
    section.items.map((item) => [item.path, item.label]),
  ),
);

const menuRouteIcons = Object.fromEntries(
  menuSections.flatMap((section) =>
    section.items.map((item) => [item.path, item.icon]),
  ),
);

export const routeTitles = {
  ...menuRouteTitles,
  ...extraRouteTitles,
};

export const routeIcons = {
  ...menuRouteIcons,
  ...extraRouteIcons,
};

export function getActiveMenuPath(pathname: string): string {
  const mappedPath = routeMenuPathMap[pathname];

  if (mappedPath) {
    return mappedPath;
  }

  const items = menuSections.flatMap((section) => section.items);
  const matched =
    items.find((item) => item.path === pathname) ||
    items.find((item) => pathname.startsWith(item.path) && item.path !== "/");

  return matched?.path || ROUTE_PATHS.home.index;
}

export function getActiveSection(
  pathname: string,
): ReactMenuSection | undefined {
  const activePath = getActiveMenuPath(pathname);

  return menuSections.find((section) =>
    section.items.some((item) => item.path === activePath),
  );
}

export function getBreadcrumb(pathname: string): Array<{
  icon: string;
  title: string;
}> {
  const section = getActiveSection(pathname);
  const activePath = getActiveMenuPath(pathname);
  const title = routeTitles[pathname] || routeTitles[activePath] || "页面";
  const icon = routeIcons[pathname] || routeIcons[activePath] || "ri:file-list-line";

  if (!section) {
    return [{ icon, title }];
  }

  return [
    {
      icon: section.icon,
      title: section.label,
    },
    {
      icon,
      title,
    },
  ];
}

