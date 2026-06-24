import { get } from "./request";

type AttendanceQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const ATTENDANCE_API = {
  byDate: "/hxdrecord/getSomtingByDisnameDate",
  byPhone: "hxdrecord/findSoloByPhone",
  summaryByPhone: "/hxdrecord/getSomeingByPhone",
  unclockedByDate: "hxdrecord/findByDate2",
  exportByPhone: "/hxdrecord/getSomeingByPhone",
  exportByDisnameDate: "/hxdrecord/getSomtingByDisnameDate",
};

export function fetchAttendanceByDate(params: AttendanceQueryParams) {
  return get(ATTENDANCE_API.byDate, { params });
}

export function fetchAttendanceByPhone(params: AttendanceQueryParams) {
  return get(ATTENDANCE_API.byPhone, { params });
}

export function fetchAttendanceSummaryByPhone(params: AttendanceQueryParams) {
  return get(ATTENDANCE_API.summaryByPhone, { params });
}

export function fetchUnclockedByDate(params: AttendanceQueryParams) {
  return get(ATTENDANCE_API.unclockedByDate, { params });
}

export function exportAttendanceByPhone(params: AttendanceQueryParams) {
  return get(ATTENDANCE_API.exportByPhone, { params });
}

export function exportAttendanceByDisnameDate(params: AttendanceQueryParams) {
  return get(ATTENDANCE_API.exportByDisnameDate, { params });
}
