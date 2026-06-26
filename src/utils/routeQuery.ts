import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

type QueryValue = boolean | number | string | null | undefined;

const ROUTE_QUERY_KEY = "q";
const ROUTE_QUERY_SECRET = "management-platform-route-query-v1";

function getNormalizedParams(params: Record<string, QueryValue>) {
  const nextParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    nextParams[key] = String(value);
  });

  return nextParams;
}

function toUrlSafeBase64(value: string) {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromUrlSafeBase64(value: string) {
  return value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
}

function encryptRouteParams(params: Record<string, string>) {
  return toUrlSafeBase64(
    AES.encrypt(
      JSON.stringify(params),
      ROUTE_QUERY_SECRET,
    ).toString(),
  );
}

function decryptRouteParams(payload: string) {
  if (!payload) {
    return {};
  }

  try {
    const decrypted = AES.decrypt(
      fromUrlSafeBase64(payload),
      ROUTE_QUERY_SECRET,
    ).toString(Utf8);
    const parsed = JSON.parse(decrypted);

    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function createRouteQuery(params: Record<string, QueryValue>) {
  const normalizedParams = getNormalizedParams(params);

  if (!Object.keys(normalizedParams).length) {
    return "";
  }

  const searchParams = new URLSearchParams({
    [ROUTE_QUERY_KEY]: encryptRouteParams(normalizedParams),
  });

  return `?${searchParams.toString()}`;
}

export function getRouteQueryValue(
  searchParams: URLSearchParams,
  keys: string[],
) {
  const routeParams = decryptRouteParams(searchParams.get(ROUTE_QUERY_KEY) || "");

  for (const key of keys) {
    const value = routeParams[key];

    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  return "";
}
