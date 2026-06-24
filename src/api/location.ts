import { get } from "./request";

type LocationQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const LOCATION_API = {
  byDateAndDistrict: "hxdlocation/getLocationDateAndDistrict",
  realLocation: "hxdlocation/getRealLocation",
};
const MAP_QUERY_CACHE_TTL = 5 * 60 * 1000;

export function fetchRealLocations() {
  return get(LOCATION_API.realLocation);
}

export function fetchLocationsByDateAndDistrict(params: LocationQueryParams) {
  return get(LOCATION_API.byDateAndDistrict, {
    cache: true,
    cacheTtl: MAP_QUERY_CACHE_TTL,
    dedupe: true,
    params,
  });
}
