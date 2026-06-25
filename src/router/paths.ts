export const ROUTE_PATHS = {
  auth: {
    login: "/login",
  },
  home: {
    index: "/dashboard",
  },
  admin: {
    forRole: "/system/users/role",
    leaveMgr: "/system/leaves",
    userMgr: "/system/users",
  },
  appointment: {
    list: "/business/appointments",
    search: "/business/appointments/search",
  },
  attendance: {
    clockIn: "/attendance",
    clockInDay: "/attendance/day",
    clockInDayPeople: "/attendance/day-people",
    clockInMonth: "/attendance/month",
    clockInMonthPeople: "/attendance/month-people",
    clockOpt: "/attendance/config",
    clockTotal: "/attendance/stats",
    playClockIntime: "/attendance/duration",
    unclockedClickIn: "/attendance/unclocked",
  },
  device: {
    create: "/devices/create",
    detail: "/devices/detail",
    list: "/devices",
    update: "/devices/update",
  },
  indoor: {
    detail: "/business/photos/detail",
    list: "/business/photos",
  },
  map: {
    rider: "/maps/rider",
    trajectory: "/maps/trajectory",
  },
  system: {
    journal: "/system/journal",
  },
  task: {
    detail: "/business/tasks/detail",
    list: "/business/tasks",
  },
} as const;

