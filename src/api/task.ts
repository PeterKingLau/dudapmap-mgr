import { get } from "./request";

type TaskId = string | number;

const TASK_API = {
  accept: "hxdtask/acceptTask",
  deny: "hxdtask/denyTask",
  deleteById: "hxdtask/deleteTaskById",
  findAll: "hxdtask/findAll",
};

export function fetchTasks() {
  return get(TASK_API.findAll);
}

export function deleteTaskById(id: TaskId) {
  return get(`${TASK_API.deleteById}/${id}`);
}

export function acceptTask(id: TaskId) {
  return get(TASK_API.accept, {
    params: {
      id,
    },
  });
}

export function denyTask(id: TaskId) {
  return get(TASK_API.deny, {
    params: {
      id,
    },
  });
}
