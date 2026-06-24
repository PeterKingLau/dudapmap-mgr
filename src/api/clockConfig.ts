import { get, getCurrentDisname, post } from "./request";

type ClockConfigParams = Record<
  string,
  string | number | boolean | null | undefined
>;

interface DisnameRow {
  disname?: string;
}

const CLOCK_CONFIG_API = {
  addLimit: "hxdlimit/addLimitinfo",
  addMeta: "hxdmeta/addMetaInfo",
  findLimits: "hxdlimit/findAll",
  findMeta: "hxdmeta/findAll",
  findUserRules: "hxduser/findSolo",
  updateLimit: "hxdlimit/updateLimit",
  updateMeta: "hxdmeta/updateMetaInfo",
};

export function fetchClockRulesByUser(userphone: string) {
  return get(CLOCK_CONFIG_API.findUserRules, {
    params: {
      userphone,
    },
  });
}

export function fetchClockMeta() {
  return post(CLOCK_CONFIG_API.findMeta);
}

export function fetchClockLimits() {
  return post(CLOCK_CONFIG_API.findLimits);
}

export function saveClockLimit(params: ClockConfigParams, isEdit = false) {
  return post(
    isEdit ? CLOCK_CONFIG_API.updateLimit : CLOCK_CONFIG_API.addLimit,
    params,
  );
}

export function saveClockMeta(params: ClockConfigParams, isEdit = false) {
  return post(
    isEdit ? CLOCK_CONFIG_API.updateMeta : CLOCK_CONFIG_API.addMeta,
    params,
  );
}

export function matchCurrentDisname(item?: DisnameRow | null) {
  return item?.disname === getCurrentDisname();
}
