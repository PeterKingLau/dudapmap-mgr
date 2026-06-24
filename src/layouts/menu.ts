import { ROUTE_PATHS } from "../router/paths";
import { ROUTE_PERMISSION_META } from "../router/permissions";

type RouteMeta = {
  icon?: string;
  title?: string;
};

type RouteLike = {
  meta?: RouteMeta;
  path?: string;
};

export type MenuItem = {
  access?: unknown;
  icon?: string;
  path: string;
  title: string;
};

export type MenuSection = {
  icon: string;
  items: MenuItem[];
  title: string;
};

export type RouteBreadcrumbItem = {
  icon: string;
  title: string;
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: "工作台",
    icon: "ri:dashboard-line",
    items: [
      {
        title: "地图工作台",
        path: ROUTE_PATHS.home.index,
        icon: "ri:dashboard-3-line",
      },
    ],
  },
  {
    title: "考勤管理",
    icon: "ri:calendar-check-line",
    items: [
      {
        title: "人员打卡查询",
        path: ROUTE_PATHS.attendance.clockIn,
        icon: "ri:time-line",
      },
      {
        title: "打卡统计",
        path: ROUTE_PATHS.attendance.clockTotal,
        icon: "ri:bar-chart-box-line",
      },
      {
        title: "打卡配置",
        path: ROUTE_PATHS.attendance.clockOpt,
        icon: "ri:settings-3-line",
        access: ROUTE_PERMISSION_META.clockOpt,
      },
    ],
  },
  {
    title: "业务管理",
    icon: "ri:briefcase-4-line",
    items: [
      {
        title: "照片信息",
        path: ROUTE_PATHS.indoor.list,
        icon: "ri:home-heart-line",
      },
      {
        title: "预约信息",
        path: ROUTE_PATHS.appointment.list,
        icon: "ri:calendar-check-line",
      },
      {
        title: "任务",
        path: ROUTE_PATHS.task.list,
        icon: "ri:task-line",
      },
    ],
  },
  {
    title: "设备管理",
    icon: "ri:hard-drive-3-line",
    items: [
      {
        title: "增加设备",
        path: ROUTE_PATHS.device.equipment,
        icon: "ri:add-box-line",
      },
      {
        title: "查看设备",
        path: ROUTE_PATHS.device.list,
        icon: "ri:hard-drive-3-line",
      },
    ],
  },
  {
    title: "地图工具",
    icon: "ri:map-2-line",
    items: [
      {
        title: "人员点位查询",
        path: ROUTE_PATHS.map.trajectory,
        icon: "ri:route-line",
      },
      {
        title: "坐标",
        path: ROUTE_PATHS.map.rider,
        icon: "ri:map-pin-line",
      },
    ],
  },
  {
    title: "系统管理",
    icon: "ri:settings-4-line",
    items: [
      {
        title: "人员管理",
        path: ROUTE_PATHS.admin.userMgr,
        icon: "ri:team-line",
        access: ROUTE_PERMISSION_META.userMgr,
      },
      {
        title: "请假管理",
        path: ROUTE_PATHS.admin.leaveMgr,
        icon: "ri:calendar-event-line",
        access: ROUTE_PERMISSION_META.leaveMgr,
      },
      {
        title: "错误日志",
        path: ROUTE_PATHS.system.journal,
        icon: "ri:bug-line",
      },
    ],
  },
];

const MENU_ITEMS: MenuItem[] = MENU_SECTIONS.flatMap(
  (section) => section.items,
);

export const ROUTE_PARENT_MENU_PATHS: Record<string, string> = {
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

export function getRouteMenuPath(path = ""): string {
  return ROUTE_PARENT_MENU_PATHS[path] || path;
}

function findMenuSection(path = ""): MenuSection | undefined {
  const parentPath = getRouteMenuPath(path);

  return MENU_SECTIONS.find((section) =>
    section.items.some((item) => item.path === parentPath),
  );
}

export const ROUTE_ICONS: Record<string, string> = {
  ...Object.fromEntries(
    MENU_ITEMS.filter((item) => item.icon).map((item) => [
      item.path,
      item.icon,
    ]),
  ),
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

export const ROUTE_TITLES: Record<string, string> = {
  [ROUTE_PATHS.auth.login]: "登录",
  [ROUTE_PATHS.home.index]: "地图工作台",
  [ROUTE_PATHS.admin.forRole]: "角色调整",
  [ROUTE_PATHS.admin.leaveMgr]: "请假管理",
  [ROUTE_PATHS.admin.userMgr]: "人员管理",
  [ROUTE_PATHS.appointment.list]: "预约信息",
  [ROUTE_PATHS.appointment.search]: "预约查询",
  [ROUTE_PATHS.attendance.clockIn]: "人员打卡查询",
  [ROUTE_PATHS.attendance.clockInDay]: "日打卡明细",
  [ROUTE_PATHS.attendance.clockInDayPeople]: "员工日打卡明细",
  [ROUTE_PATHS.attendance.clockInMonth]: "月打卡信息",
  [ROUTE_PATHS.attendance.clockInMonthPeople]: "员工月打卡信息",
  [ROUTE_PATHS.attendance.clockOpt]: "打卡配置",
  [ROUTE_PATHS.attendance.clockTotal]: "打卡统计",
  [ROUTE_PATHS.attendance.playClockIntime]: "打卡时长",
  [ROUTE_PATHS.attendance.unclockedClickIn]: "未打卡查询",
  [ROUTE_PATHS.device.detail]: "设备详情",
  [ROUTE_PATHS.device.equipment]: "增加设备",
  [ROUTE_PATHS.device.list]: "查看设备",
  [ROUTE_PATHS.device.update]: "设备编辑",
  [ROUTE_PATHS.indoor.detail]: "照片详情",
  [ROUTE_PATHS.indoor.list]: "照片信息",
  [ROUTE_PATHS.map.rider]: "坐标",
  [ROUTE_PATHS.map.trajectory]: "人员点位查询",
  [ROUTE_PATHS.system.journal]: "错误日志",
  [ROUTE_PATHS.task.detail]: "任务详情",
  [ROUTE_PATHS.task.list]: "任务",
};

export function getRouteTitle(route?: RouteLike): string {
  return route?.meta?.title || ROUTE_TITLES[route?.path] || "未命名页面";
}

export function getRouteIcon(route?: RouteLike): string {
  return route?.meta?.icon || ROUTE_ICONS[route?.path] || "ri:file-list-line";
}

export function getRouteBreadcrumb(route?: RouteLike): RouteBreadcrumbItem[] {
  const section = findMenuSection(route?.path);
  const title = getRouteTitle(route);

  if (!section) {
    return [
      {
        icon: getRouteIcon(route),
        title,
      },
    ];
  }

  return [
    {
      icon: section.icon,
      title: section.title,
    },
    {
      icon: getRouteIcon(route),
      title,
    },
  ];
}
