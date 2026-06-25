import { get, type AppRequestConfig } from "./request";

type AppointmentQueryParams = Record<string, string | number | undefined>;
type AppointmentId = string | number;

const APPOINTMENT_API = {
  deleteById: "hxdappointment/deleteAppointById",
  findAll: "hxdappointment/findAll",
  findByPhone: "hxdappointment/findByPhone",
};

export function fetchAppointments(config?: AppRequestConfig) {
  return get(APPOINTMENT_API.findAll, config);
}

export function fetchAppointmentsByPhone(
  params: AppointmentQueryParams,
  config?: AppRequestConfig,
) {
  return get(APPOINTMENT_API.findByPhone, { ...config, params });
}

export function deleteAppointment(id: AppointmentId) {
  return get(APPOINTMENT_API.deleteById, {
    params: {
      id,
    },
  });
}
