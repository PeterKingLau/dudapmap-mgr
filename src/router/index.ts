import { useAppStore } from "../store";
import { Message } from "@arco-design/web-vue";
import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from "vue-router";
import { ROUTE_PATHS } from "./paths";
import { canAccessRoute, ROUTE_PERMISSION_META } from "./permissions";
import { ROUTE_ICONS, ROUTE_TITLES, getRouteMenuPath } from "../layouts/menu";

declare module "vue-router" {
  interface RouteMeta {
    adminOnly?: boolean;
    allowAdmin?: boolean;
    guestOnly?: boolean;
    icon?: string;
    permissionMode?: "all" | "any";
    permissions?: string[];
    requiresAuth?: boolean;
    requiresBaiduMap?: boolean;
    roles?: string[];
    title?: string;
  }
}

type UserInfo = Record<string, unknown> & {
  recvcode?: string;
  userrole?: string;
};

type AppStore = ReturnType<typeof useAppStore>;
type NotifyType = "danger" | "error" | "info" | "success" | "warning";

const publicRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.auth.login,
    name: "login",
    component: () => import("@/views/auth/login.vue"),
    meta: {
      guestOnly: true,
    },
  },
];

const rawProtectedRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.home.index,
    name: "index",
    component: () => import("@/views/home/index.vue"),
    meta: {
      requiresBaiduMap: true,
    },
  },
  {
    path: ROUTE_PATHS.admin.forRole,
    name: "forRole",
    component: () => import("@/views/admin/forRole.vue"),
  },
  {
    path: ROUTE_PATHS.device.equipment,
    name: "equipment",
    component: () => import("@/views/device/equipment.vue"),
    meta: {
      requiresBaiduMap: true,
    },
  },
  {
    path: ROUTE_PATHS.indoor.list,
    name: "households",
    component: () => import("@/views/indoor/households.vue"),
  },
  {
    path: ROUTE_PATHS.indoor.detail,
    name: "householdsLists",
    component: () => import("@/views/indoor/householdsLists.vue"),
  },
  {
    path: ROUTE_PATHS.appointment.list,
    name: "findAllYyue",
    component: () => import("@/views/appointment/findAllYyue.vue"),
  },
  {
    path: ROUTE_PATHS.appointment.search,
    name: "finAllYyueSearch",
    component: () => import("@/views/appointment/finAllYyueSearch.vue"),
  },
  {
    path: ROUTE_PATHS.map.rider,
    name: "rider",
    component: () => import("@/views/map/rider.vue"),
    meta: {
      requiresBaiduMap: true,
    },
  },
  {
    path: ROUTE_PATHS.task.detail,
    name: "task",
    component: () => import("@/views/task/task.vue"),
  },
  {
    path: ROUTE_PATHS.task.list,
    name: "taskLists",
    component: () => import("@/views/task/taskLists.vue"),
  },
  {
    path: ROUTE_PATHS.system.journal,
    name: "journal",
    component: () => import("@/views/system/journal.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.clockOpt,
    name: "clockOpt",
    component: () => import("@/views/attendance/clockOpt.vue"),
    meta: {
      ...ROUTE_PERMISSION_META.clockOpt,
    },
  },
  {
    path: ROUTE_PATHS.device.list,
    name: "driverquery",
    component: () => import("@/views/device/driverquery.vue"),
  },
  {
    path: ROUTE_PATHS.device.detail,
    name: "dirverqueryList",
    component: () => import("@/views/device/dirverqueryList.vue"),
  },
  {
    path: ROUTE_PATHS.device.update,
    name: "drivequeryupdate",
    component: () => import("@/views/device/drivequeryupdate.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.clockIn,
    name: "clockIn",
    component: () => import("@/views/attendance/clockIn.vue"),
  },
  {
    path: ROUTE_PATHS.map.trajectory,
    name: "trajectory",
    component: () => import("@/views/map/trajectory.vue"),
    meta: {
      requiresBaiduMap: true,
    },
  },
  {
    path: ROUTE_PATHS.attendance.clockInMonth,
    name: "clockInMonth",
    component: () => import("@/views/attendance/clockInMonth.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.clockInDay,
    name: "clockInDay",
    component: () => import("@/views/attendance/clockInDay.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.clockInMonthPeople,
    name: "clockInMonthPeople",
    component: () => import("@/views/attendance/clockInMonthPeople.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.clockInDayPeople,
    name: "clockInDayPeople",
    component: () => import("@/views/attendance/clockInDayPeople.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.unclockedClickIn,
    name: "unclockedClickIn",
    component: () => import("@/views/attendance/unclockedClickIn.vue"),
  },
  {
    path: ROUTE_PATHS.attendance.playClockIntime,
    name: "palyClockIntime",
    component: () => import("@/views/attendance/palyClockIntime.vue"),
  },
  {
    path: ROUTE_PATHS.admin.userMgr,
    name: "userMgr",
    component: () => import("@/views/admin/userMgr.vue"),
    meta: {
      ...ROUTE_PERMISSION_META.userMgr,
    },
  },
  {
    path: ROUTE_PATHS.admin.leaveMgr,
    name: "leaveMgr",
    component: () => import("@/views/admin/leaveMgr.vue"),
    meta: {
      ...ROUTE_PERMISSION_META.leaveMgr,
    },
  },
  {
    path: ROUTE_PATHS.attendance.clockTotal,
    name: "clockTotal",
    component: () => import("@/views/attendance/clockTotal.vue"),
  },
];

const protectedRoutes: RouteRecordRaw[] = rawProtectedRoutes.map((route) => ({
  ...route,
  meta: {
    ...(route.meta || {}),
    icon: ROUTE_ICONS[route.path] || route.meta?.icon,
    title: ROUTE_TITLES[route.path] || route.meta?.title,
    requiresAuth: true,
  },
}));

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...publicRoutes,
    ...protectedRoutes,
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: () => import("@/views/error/NotFound.vue"),
      meta: {
        icon: "ri:error-warning-line",
        requiresAuth: true,
        title: "页面不存在",
      },
    },
  ],
});

function getSessionUser(): UserInfo {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}") as UserInfo;
  } catch (error) {
    return {};
  }
}

function getCurrentUser(store: AppStore): UserInfo {
  const loginUser = store.getLogin;

  return loginUser && typeof loginUser === "object"
    ? (loginUser as UserInfo)
    : getSessionUser();
}

function isDirectEntry(from: RouteLocationNormalized): boolean {
  return !from.matched.length;
}

function isHiddenMenuRoute(path: string): boolean {
  return getRouteMenuPath(path) !== path;
}

function notify(type: NotifyType, content: string): void {
  const method = type === "danger" ? "error" : type;
  const handler = Message[method] || Message.info;

  handler(content);
}

router.beforeEach((to, from) => {
  const store = useAppStore();
  const isLoggedIn = Boolean(store.getLogin);
  const currentUser = getCurrentUser(store);
  const parentMenuPath = getRouteMenuPath(to.path);
  const isDirectHiddenRoute =
    to.meta.requiresAuth && isHiddenMenuRoute(to.path) && isDirectEntry(from);

  if (to.meta.requiresAuth && !isLoggedIn) {
    notify("error", "请登录后进行查看！");

    return {
      path: ROUTE_PATHS.auth.login,
      query: {
        redirect: isDirectHiddenRoute ? parentMenuPath : to.fullPath,
      },
    };
  }

  if (!canAccessRoute(currentUser, to.meta)) {
    notify("warning", "暂无权限访问该页面！");

    return { path: ROUTE_PATHS.home.index };
  }

  if (isDirectHiddenRoute) {
    notify("warning", "请从对应功能入口进入该页面！");

    return { path: parentMenuPath };
  }

  if (to.meta.guestOnly && isLoggedIn) {
    return { path: ROUTE_PATHS.home.index };
  }

  return true;
});

export default router;
