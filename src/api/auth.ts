import { get, post } from "./request";

interface LoginParams {
  phone: string;
  pwd: string;
}

interface UpdateLoginUserParams {
  useravator: string;
  userphone: string;
}

const AUTH_API = {
  login: "hxduser/login",
  updateUser: "hxduser/updateUser",
};

export function login(params: LoginParams) {
  return get(AUTH_API.login, { params });
}

export function updateLoginUser(params: UpdateLoginUserParams) {
  return post(AUTH_API.updateUser, params);
}
