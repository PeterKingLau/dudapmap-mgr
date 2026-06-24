export const ROUTE_PATHS = {
  auth: {
    login: "/",
  },
  home: {
    index: "/index",
  },
  admin: {
    forRole: "/forRole",
    leaveMgr: "/leaveMgr",
    userMgr: "/userMgr",
  },
  appointment: {
    list: "/findAllYyue",
    search: "/finAllYyueSearch",
  },
  attendance: {
    clockIn: "/clockIn",
    clockInDay: "/clockInDay",
    clockInDayPeople: "/clockInDayPeople",
    clockInMonth: "/clockInMonth",
    clockInMonthPeople: "/clockInMonthPeople",
    clockOpt: "/clockOpt",
    clockTotal: "/clockTotal",
    playClockIntime: "/palyClockIntime",
    unclockedClickIn: "/unclockedClickIn",
  },
  device: {
    detail: "/dirverqueryList",
    equipment: "/equipment",
    list: "/driverquery",
    update: "/drivequeryupdate",
  },
  indoor: {
    detail: "/householdsLists",
    list: "/households",
  },
  map: {
    rider: "/rider",
    trajectory: "/trajectory",
  },
  system: {
    journal: "/journal",
  },
  task: {
    detail: "/task",
    list: "/taskLists",
  },
} as const;
