import { useMemo } from "react";
import { getRouteQueryValue } from "../utils/routeQuery";

export function useRouteQueryValue(
  searchParams: URLSearchParams,
  keys: string[],
) {
  const searchText = searchParams.toString();
  const keysText = keys.join("\u0000");

  return useMemo(
    () => getRouteQueryValue(searchParams, keys),
    [keysText, searchParams, searchText],
  );
}
