import { get, post } from "./request";

type UserId = string | number;
type UserPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

const USER_API = {
  add: "hxduser/addUser",
  agreeRole: "hxduser/agreeForRole",
  deleteById: "/hxduser/deleteUserById/",
  disagreeRole: "hxduser/disagreeForRole",
  findAll: "hxduser/findAllByDisname",
  findByRole: "hxduser/findUserByRole",
  findSolo: "hxduser/findSolo",
  onlineCount: "hxduser/getServerBasicNumber",
  phones: "hxduser/getUserPhone",
  update: "hxduser/updateUser",
};

export function fetchUserByPhone(userphone: string) {
  return get(USER_API.findSolo, {
    params: {
      userphone,
    },
  });
}

export function fetchAllUsers() {
  return get(USER_API.findAll);
}

export function fetchUsersByRole(userrole: string) {
  return get(USER_API.findByRole, {
    params: {
      userrole,
    },
  });
}

export function fetchUserPhones() {
  return get(USER_API.phones);
}

export function fetchOnlineUserCount() {
  return get(USER_API.onlineCount);
}

export function saveUser(params: UserPayload, isEdit = false) {
  return post(isEdit ? USER_API.update : USER_API.add, params);
}

export function deleteUserById(id: UserId) {
  return get(`${USER_API.deleteById}${id}`);
}

export function reviewRoleChange(params: UserPayload, approved: boolean) {
  return get(approved ? USER_API.agreeRole : USER_API.disagreeRole, { params });
}
