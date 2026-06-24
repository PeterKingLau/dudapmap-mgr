import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from "axios";
import { Message } from "@arco-design/web-vue";
import router from "../router";
import { ROUTE_PATHS } from "../router/paths";
import { useAppStore } from "../store";

const baseUrl = import.meta.env.VITE_BASE_URL_HTTPS;
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
const requestTimeout = 6000000;
type PlainRecord = Record<string, unknown>;
type RequestPayload =
  | PlainRecord
  | Blob
  | FormData
  | URLSearchParams
  | null
  | undefined;
type BusinessCode = boolean | number | string;

interface BusinessResponseData extends PlainRecord {
  code?: BusinessCode;
  errCode?: BusinessCode;
  error?: string;
  message?: string;
  msg?: string;
}

interface AppRequestConfig extends Omit<AxiosRequestConfig, "data" | "params"> {
  cache?: boolean;
  cacheTtl?: number;
  checkBusinessCode?: boolean;
  data?: RequestPayload;
  dedupe?: boolean;
  duplicateKey?: string;
  loading?: boolean;
  loadingText?: string;
  params?: RequestPayload;
  showError?: boolean;
  unwrap?: boolean;
}

interface RequestKeySource {
  data?: unknown;
  duplicateKey?: string;
  method?: string;
  params?: unknown;
  url?: string;
}

interface BusinessError extends Error {
  code?: BusinessCode;
  response?: AxiosResponse;
}

interface CachedResponse {
  expiresAt: number;
  value: unknown;
}

type LoadingToast = ReturnType<typeof Message.loading> | (() => void);

const bodyMethods = ["post", "put", "patch"];
const successCodes = new Set([0, "0", 200, "200", true]);
const loginExpiredCodes = new Set<BusinessCode>([
  401,
  "401",
  "LOGIN_EXPIRED",
  "TOKEN_EXPIRED",
]);
const httpErrorMessages: Record<number, string> = {
  400: "请求参数错误",
  401: "登录已失效，请重新登录",
  403: "暂无权限访问",
  404: "接口错误",
  500: "服务异常",
  502: "网关错误",
  503: "服务暂不可用",
  504: "请求超时！",
};
const businessErrorMessages: Record<string, string> = {
  401: "登录已失效，请重新登录",
  403: "暂无权限访问",
  500: "服务异常",
};

const pendingRequests = new Map<string, AbortController>();
const responseCache = new Map<string, CachedResponse>();
let loadingCount = 0;
let loadingToast: LoadingToast | null = null;
let isHandlingLoginExpired = false;

export const http = axios.create({
  baseURL: baseUrl,
  timeout: requestTimeout,
});

function isPlainRecord(value: unknown): value is PlainRecord {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !(value instanceof FormData) &&
    !(value instanceof URLSearchParams)
  );
}

function getSessionDisname(): string {
  try {
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

    return userInfo.useravator || sessionStorage.getItem("useravator") || "";
  } catch (error) {
    return sessionStorage.getItem("useravator") || "";
  }
}

function cloneFormData(data: FormData): FormData {
  const formData = new FormData();

  data.forEach((value, key) => {
    formData.append(key, value);
  });

  return formData;
}

function withCurrentDisname(params: RequestPayload = {}): RequestPayload {
  const disname = getCurrentDisname();

  if (params instanceof Blob) {
    return params;
  }

  if (params instanceof FormData) {
    const formData = cloneFormData(params);

    if (disname && !formData.has("disname")) {
      formData.append("disname", disname);
    }

    return formData;
  }

  if (params instanceof URLSearchParams) {
    const searchParams = new URLSearchParams(params);

    if (disname && !searchParams.has("disname")) {
      searchParams.append("disname", disname);
    }

    return searchParams;
  }

  const source = isPlainRecord(params) ? params : {};

  return disname ? { ...source, disname } : { ...source };
}

function getDefaultPostHeaders(params: RequestPayload): Record<string, string> {
  if (params instanceof FormData) {
    return {};
  }

  return {
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

function getBusinessCode(data: unknown): BusinessCode | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const responseData = data as BusinessResponseData;

  return responseData.code ?? responseData.errCode;
}

function getBusinessMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "";
  }

  const responseData = data as BusinessResponseData;

  return responseData.message || responseData.msg || responseData.error || "";
}

function normalizeRequestValue(value: unknown): string {
  if (!value) {
    return "";
  }

  if (value instanceof FormData) {
    return "[form-data]";
  }

  if (value instanceof URLSearchParams) {
    return value.toString();
  }

  if (typeof value !== "object") {
    return String(value);
  }

  return JSON.stringify(
    Object.keys(value as PlainRecord)
      .sort()
      .reduce<PlainRecord>((result, key) => {
        result[key] = (value as PlainRecord)[key];
        return result;
      }, {}),
  );
}

function getRequestKey({
  method,
  url,
  params,
  data,
  duplicateKey,
}: RequestKeySource): string {
  if (duplicateKey) {
    return duplicateKey;
  }

  return [
    method,
    url,
    normalizeRequestValue(params),
    normalizeRequestValue(data),
  ].join("&");
}

function startLoading(message: string): void {
  loadingCount += 1;

  if (!loadingToast) {
    loadingToast = Message.loading({
      content: message,
      duration: 0,
    });
  }
}

function closeLoading(): void {
  loadingCount = Math.max(loadingCount - 1, 0);

  if (loadingCount === 0 && loadingToast) {
    if (typeof loadingToast === "function") {
      loadingToast();
    } else {
      loadingToast.close?.();
    }

    loadingToast = null;
  }
}

function clearLoginState(): void {
  const store = useAppStore();

  store.clearLogin();
  sessionStorage.removeItem("userInfo");
  sessionStorage.removeItem("useravator");
}

function handleLoginExpired(): void {
  if (isHandlingLoginExpired) {
    return;
  }

  isHandlingLoginExpired = true;
  clearLoginState();
  Message.error(httpErrorMessages[401]);

  const currentPath = router.currentRoute.value.fullPath;

  if (router.currentRoute.value.path !== ROUTE_PATHS.auth.login) {
    router.replace({
      path: ROUTE_PATHS.auth.login,
      query: {
        redirect: currentPath,
      },
    });
  }

  window.setTimeout(() => {
    isHandlingLoginExpired = false;
  }, 800);
}

function handleRequestError(error: unknown, showError = true): void {
  if (!axios.isAxiosError(error) || error.code === "ERR_CANCELED") {
    return;
  }

  const status = error.response?.status;

  if (status === 401) {
    handleLoginExpired();
    return;
  }

  if (!showError) {
    return;
  }

  Message.error(
    httpErrorMessages[status] || error.message || "请求失败，请稍后重试",
  );
}

function createBusinessError(
  response: AxiosResponse,
  message: string,
  code: BusinessCode,
): BusinessError {
  const error = new Error(message) as BusinessError;
  error.name = "BusinessError";
  error.code = code;
  error.response = response;

  return error;
}

function validateBusinessResponse(
  response: AxiosResponse,
  showError: boolean,
): void {
  const code = getBusinessCode(response.data);

  if (code === undefined || successCodes.has(code)) {
    return;
  }

  if (loginExpiredCodes.has(code)) {
    handleLoginExpired();
  }

  const message =
    getBusinessMessage(response.data) ||
    businessErrorMessages[String(code)] ||
    "请求失败，请稍后重试";

  if (showError) {
    Message.error(message);
  }

  throw createBusinessError(response, message, code);
}

export function createApiUrl(path: string): string {
  return `${baseUrl}${path}`;
}

export function request<T = unknown>(
  method: Method | string,
  path: string,
  config: AppRequestConfig = {},
): Promise<AxiosResponse<T> | T> {
  const {
    cache = false,
    cacheTtl = 300000,
    checkBusinessCode = true,
    dedupe,
    duplicateKey,
    loading = false,
    loadingText = "加载中...",
    showError = true,
    unwrap = false,
    ...axiosConfig
  } = config;
  const requestMethod = method.toLowerCase();
  const hasRequestBody =
    bodyMethods.includes(requestMethod) || axiosConfig.data !== undefined;
  const data = hasRequestBody
    ? withCurrentDisname(axiosConfig.data)
    : undefined;
  const params = hasRequestBody
    ? axiosConfig.params
    : withCurrentDisname(axiosConfig.params || {});
  const headers = hasRequestBody
    ? {
        ...getDefaultPostHeaders(data),
        ...(axiosConfig.headers || {}),
      }
    : axiosConfig.headers;
  const shouldDedupe =
    dedupe ?? (requestMethod !== "get" && requestMethod !== "head");
  const requestConfig: AxiosRequestConfig = {
    ...axiosConfig,
    method: requestMethod,
    url: path,
    data,
    params,
    headers,
    timeout: axiosConfig.timeout || requestTimeout,
  };
  const shouldCache = cache && requestMethod === "get";
  const cacheKey = shouldCache
    ? getRequestKey({ ...requestConfig, duplicateKey })
    : "";
  const cachedResponse = shouldCache ? responseCache.get(cacheKey) : undefined;

  if (cachedResponse) {
    if (cachedResponse.expiresAt > Date.now()) {
      return Promise.resolve(cachedResponse.value as AxiosResponse<T> | T);
    }

    responseCache.delete(cacheKey);
  }

  const requestKey = shouldDedupe
    ? getRequestKey({ ...requestConfig, duplicateKey })
    : "";
  const controller = shouldDedupe ? new AbortController() : undefined;

  if (shouldDedupe && controller) {
    pendingRequests.get(requestKey)?.abort();
    pendingRequests.set(requestKey, controller);
    requestConfig.signal = controller.signal;
  }

  if (loading) {
    startLoading(loadingText);
  }

  return http
    .request(requestConfig)
    .then((response) => {
      if (checkBusinessCode) {
        validateBusinessResponse(response, showError);
      }

      const result = unwrap ? response.data : response;

      if (shouldCache) {
        responseCache.set(cacheKey, {
          expiresAt: Date.now() + cacheTtl,
          value: result,
        });
      }

      return result;
    })
    .catch((error) => {
      handleRequestError(error, showError);
      throw error;
    })
    .finally(() => {
      if (shouldDedupe && pendingRequests.get(requestKey) === controller) {
        pendingRequests.delete(requestKey);
      }

      if (loading) {
        closeLoading();
      }
    });
}

export function get<T = unknown>(
  path: string,
  config?: AppRequestConfig,
): Promise<AxiosResponse<T> | T> {
  return request("get", path, config);
}

export function post<T = unknown>(
  path: string,
  data?: RequestPayload,
  config?: AppRequestConfig,
): Promise<AxiosResponse<T> | T> {
  return request("post", path, { ...config, data });
}

export function put<T = unknown>(
  path: string,
  data?: RequestPayload,
  config?: AppRequestConfig,
): Promise<AxiosResponse<T> | T> {
  return request("put", path, { ...config, data });
}

export function patch<T = unknown>(
  path: string,
  data?: RequestPayload,
  config?: AppRequestConfig,
): Promise<AxiosResponse<T> | T> {
  return request("patch", path, { ...config, data });
}

export function deleteRequest<T = unknown>(
  path: string,
  config?: AppRequestConfig,
): Promise<AxiosResponse<T> | T> {
  return request("delete", path, config);
}

export function cancelPendingRequests(): void {
  pendingRequests.forEach((controller) => {
    controller.abort();
  });
  pendingRequests.clear();
}

export function clearRequestCache(keyPrefix = ""): void {
  if (!keyPrefix) {
    responseCache.clear();
    return;
  }

  responseCache.forEach((_value, key) => {
    if (key.startsWith(keyPrefix)) {
      responseCache.delete(key);
    }
  });
}

export function getImageUrl(path = ""): string {
  return path ? `${imageBaseUrl || ""}${path}` : "";
}

export function getCurrentDisname(): string {
  try {
    const store = useAppStore();
    const loginInfo = store.getLogin;
    const loginDisname =
      loginInfo && typeof loginInfo === "object" ? loginInfo.useravator : "";

    return loginDisname || store.getDisname || getSessionDisname();
  } catch (error) {
    return getSessionDisname();
  }
}
