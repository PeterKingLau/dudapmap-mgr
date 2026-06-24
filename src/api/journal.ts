import { get } from "./request";

const JOURNAL_API = {
  findAll: "hxderror/findAll",
};

export function fetchErrorLogs() {
  return get(JOURNAL_API.findAll);
}
