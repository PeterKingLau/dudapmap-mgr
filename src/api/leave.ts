import { get, post } from "./request";

type LeavePayload = Record<
  string,
  string | number | boolean | null | undefined
>;
type LeaveId = string | number;

const LEAVE_API = {
  add: "hxdvocation/addVocation",
  deleteById: "/hxdvocation/deleteVocationById",
  findAll: "hxdvocation/findAll",
  findByManager: "/hxdvocation/findAllByManager",
  update: "hxdvocation/updateVocation",
};

export function fetchLeaves() {
  return get(LEAVE_API.findAll);
}

export function fetchLeavesByManager(params: LeavePayload) {
  return get(LEAVE_API.findByManager, { params });
}

export function saveLeave(params: LeavePayload, isEdit = false) {
  return post(isEdit ? LEAVE_API.update : LEAVE_API.add, params);
}

export function updateLeave(params: LeavePayload) {
  return post(LEAVE_API.update, params);
}

export function deleteLeaveById(id: LeaveId) {
  return get(`${LEAVE_API.deleteById}/${id}`);
}
