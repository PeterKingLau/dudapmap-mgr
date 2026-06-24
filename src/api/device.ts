import { get, getImageUrl, post } from "./request";
import type { AxiosRequestConfig } from "axios";

type DevicePayload = Record<
  string,
  string | number | boolean | File | Blob | null | undefined
>;

type UploadPayload = FormData | File | Blob;

const DEVICE_API = {
  add: "hxddevice/addDevice",
  findAll: "hxddevice/findAll",
  update: "hxddevice/updateDevice",
  upload: "fileupload",
};

export function fetchDevices() {
  return get(DEVICE_API.findAll);
}

export function addDevice(params: DevicePayload) {
  return post(DEVICE_API.add, params);
}

export function updateDevice(params: DevicePayload) {
  return post(DEVICE_API.update, params);
}

export function uploadFile(file: UploadPayload, config?: AxiosRequestConfig) {
  return post(DEVICE_API.upload, file, config);
}

export { getImageUrl };
