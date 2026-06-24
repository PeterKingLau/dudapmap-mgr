import { get } from "./request";

type IndoorQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;
type IndoorRecordId = string | number;

const INDOOR_API = {
  deleteById: "hxdindoor/deleteIndoorById",
  findAll: "hxdindoor/findAll",
  findByPhone: "hxdindoor/findByPhone",
};

export function fetchIndoorRecords() {
  return get(INDOOR_API.findAll);
}

export function fetchIndoorRecordsByPhone(params: IndoorQueryParams) {
  return get(INDOOR_API.findByPhone, { params });
}

export function deleteIndoorRecord(id: IndoorRecordId) {
  return get(INDOOR_API.deleteById, {
    params: {
      id,
    },
  });
}
