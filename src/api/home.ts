import { get } from "./request";

type HomeQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const HOME_API = {
  addVirtualStaff: "hxduser/addUserBatch",
  deleteVirtualStaff: "hxduser/deleteUserBatch",
  findAllUsers: "hxduser/findAllByDisname",
  findLocations: "hxdlocation/findAll",
  findUserByRole: "hxduser/findUserByRole",
  findUserInfo: "hxduser/findSolo",
};
const MAP_QUERY_CACHE_TTL = 5 * 60 * 1000;

export function fetchUserInfo(userphone: string) {
  return get(HOME_API.findUserInfo, {
    params: {
      userphone,
    },
  });
}

export function fetchAllUsers() {
  return get(HOME_API.findAllUsers);
}

export function fetchUsersByRole(userrole: string) {
  return get(HOME_API.findUserByRole, {
    params: {
      userrole,
    },
  });
}

export function addVirtualStaff() {
  return get(HOME_API.addVirtualStaff);
}

export function deleteVirtualStaff() {
  return get(HOME_API.deleteVirtualStaff);
}

export function fetchUserLocations(params: HomeQueryParams) {
  return get(HOME_API.findLocations, {
    cache: true,
    cacheTtl: MAP_QUERY_CACHE_TTL,
    dedupe: true,
    params,
  });
}
