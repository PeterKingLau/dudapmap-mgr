export const BAIDU_MAP_AK = "92ocG5CWALrKFvPODxhE2KqKlSbr6o53";

export type CoordinateOrder = "lngLat" | "latLng";

export interface LngLat {
  lat: number;
  lng: number;
}

export interface PixelOffset {
  x?: number;
  y?: number;
}

export type BaiduPoint = unknown;
export type BaiduOverlay = unknown;
export type BaiduMapInstance = {
  addEventListener?: (
    eventName: string,
    handler: (event: unknown) => void,
  ) => void;
  addOverlay?: (overlay: BaiduOverlay) => void;
  centerAndZoom?: (point: BaiduPoint, zoom?: number) => void;
  clearOverlays?: () => void;
  enableScrollWheelZoom?: (enabled?: boolean) => void;
  getPanes?: () => Record<string, HTMLElement | undefined>;
  panTo?: (point: BaiduPoint) => void;
  pointToOverlayPixel?: (point: BaiduPoint) => { x: number; y: number };
  removeOverlay?: (overlay: BaiduOverlay) => void;
  setCenter?: (point: BaiduPoint) => void;
  setViewport?: (points: BaiduPoint[]) => void;
};

export type BaiduMapApi = {
  Bounds?: new () => {
    extend?: (point: BaiduPoint) => void;
  };
  Convertor?: new () => {
    translate?: (
      points: BaiduPoint[],
      from: number,
      to: number,
      callback: (result: { points?: BaiduPoint[]; status?: number }) => void,
    ) => void;
  };
  Circle?: new (
    point: BaiduPoint,
    radius: number,
    options?: Record<string, unknown>,
  ) => BaiduOverlay;
  Geocoder?: new () => {
    getLocation?: (
      point: BaiduPoint,
      callback: (result: {
        address?: string;
        addressComponents?: {
          city?: string;
          district?: string;
          province?: string;
          street?: string;
          streetNumber?: string;
        };
        business?: string;
        surroundingPois?: Array<{
          title?: string;
        }>;
      }) => void,
    ) => void;
  };
  Label?: new (
    content: string,
    options?: Record<string, unknown>,
  ) => BaiduOverlay;
  Map?: new (container: HTMLElement | string) => BaiduMapInstance;
  Marker?: new (
    point: BaiduPoint,
    options?: Record<string, unknown>,
  ) => BaiduOverlay;
  Overlay?: new () => BaiduOverlay;
  Point?: new (lng: number, lat: number) => BaiduPoint;
  Polygon?: new (
    points: BaiduPoint[],
    options?: Record<string, unknown>,
  ) => BaiduOverlay;
  Polyline?: new (
    points: BaiduPoint[],
    options?: Record<string, unknown>,
  ) => BaiduOverlay;
  Size?: new (width: number, height: number) => unknown;
};

interface CreateMapOptions {
  center?: LngLat;
  scrollWheelZoom?: boolean;
  zoom?: number;
}

interface CreateLabelOverlayOptions {
  offset?: PixelOffset;
  style?: Record<string, string>;
}

interface OverlayDrawContext {
  BMap?: BaiduMapApi | null;
  map?: BaiduMapInstance | null;
}

declare global {
  interface Window {
    BMap?: BaiduMapApi;
    BMapGL?: BaiduMapApi;
  }
}

let scriptLoading: Promise<void> | null = null;

const mapThemeObservers = new WeakMap<BaiduMapInstance, MutationObserver>();

export function getBaiduMapApi(api?: BaiduMapApi | null): BaiduMapApi | null {
  return api || window.BMap || window.BMapGL || null;
}

export async function loadBaiduMap(): Promise<BaiduMapApi | null> {
  if (!getBaiduMapApi()) {
    if (!scriptLoading) {
      scriptLoading = new Promise((resolve, reject) => {
        const callbackName = `__loadBaiduMap_${Date.now()}`;
        const existingScript = document.querySelector<HTMLScriptElement>(
          "script[data-baidu-map-loader='true']",
        );

        const globalCallbacks = window as unknown as Record<string, () => void>;

        globalCallbacks[callbackName] = () => {
          delete globalCallbacks[callbackName];
          resolve();
        };

        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
          existingScript.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.async = true;
        script.dataset.baiduMapLoader = "true";
        script.src = `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_AK}&callback=${callbackName}`;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    await scriptLoading;
  }

  return getBaiduMapApi();
}

export function getCurrentMapTheme(): "dark" | "light" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyBaiduMapTheme(
  container: HTMLElement | null | undefined,
  theme = getCurrentMapTheme(),
): void {
  if (!container) {
    return;
  }

  container.dataset.mapTheme = theme;
}

export function bindBaiduMapTheme(
  map: BaiduMapInstance | null | undefined,
  container: HTMLElement | null | undefined,
): void {
  if (!map || !container || mapThemeObservers.has(map)) {
    return;
  }

  applyBaiduMapTheme(container);

  const observer = new MutationObserver(() => {
    applyBaiduMapTheme(container);
  });

  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
    attributes: true,
  });

  mapThemeObservers.set(map, observer);
}

export function unbindBaiduMapTheme(
  map: BaiduMapInstance | null | undefined,
): void {
  if (!map) {
    return;
  }

  mapThemeObservers.get(map)?.disconnect();
  mapThemeObservers.delete(map);
}

export function isValidLng(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

export function isValidLat(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function toNumber(value: unknown): number {
  if (typeof value === "string" && value.trim() === "") {
    return Number.NaN;
  }

  return typeof value === "number" ? value : Number(value);
}

function readCoordinateValues(input: unknown): [number, number] | null {
  if (Array.isArray(input)) {
    return [toNumber(input[0]), toNumber(input[1])];
  }

  if (!input || typeof input !== "object") {
    return null;
  }

  const row = input as Record<string, unknown>;
  const lng = row.lng ?? row.longitude ?? row.lon;
  const lat = row.lat ?? row.latitude;

  if (lng !== undefined && lat !== undefined) {
    return [toNumber(lng), toNumber(lat)];
  }

  return null;
}

export function normalizeLngLat(
  input: unknown,
  order: CoordinateOrder = "lngLat",
): LngLat | null {
  const values = readCoordinateValues(input);

  if (!values) {
    return null;
  }

  const [first, second] = values;
  const primary =
    order === "latLng"
      ? { lng: second, lat: first }
      : { lng: first, lat: second };

  if (isValidLng(primary.lng) && isValidLat(primary.lat)) {
    return primary;
  }

  const fallback =
    order === "latLng"
      ? { lng: first, lat: second }
      : { lng: second, lat: first };

  return isValidLng(fallback.lng) && isValidLat(fallback.lat) ? fallback : null;
}

export function createPoint(
  api: BaiduMapApi | null | undefined,
  coordinate: unknown,
): BaiduPoint | null {
  const baiduApi = getBaiduMapApi(api);
  const point = normalizeLngLat(coordinate);

  if (!baiduApi?.Point || !point) {
    return null;
  }

  return new baiduApi.Point(point.lng, point.lat);
}

export function createMap(
  container: HTMLElement | string,
  options: CreateMapOptions = {},
): BaiduMapInstance {
  const api = getBaiduMapApi();

  if (!api?.Map) {
    throw new Error("Baidu Map API is not ready");
  }

  const map = new api.Map(container);
  const mapContainer =
    typeof container === "string" ? document.getElementById(container) : container;
  const center = createPoint(api, options.center);

  if (center) {
    map.centerAndZoom?.(center, options.zoom || 15);
  }

  if (options.scrollWheelZoom !== false) {
    map.enableScrollWheelZoom?.(true);
  }

  bindBaiduMapTheme(map, mapContainer);

  return map;
}

export function setCenter(
  map: BaiduMapInstance | null | undefined,
  coordinate: unknown,
): void {
  const point = createPoint(null, coordinate);

  if (!map || !point) {
    return;
  }

  if (typeof map.panTo === "function") {
    map.panTo(point);
    return;
  }

  map.setCenter?.(point);
}

export function createMarker(
  map: BaiduMapInstance | null | undefined,
  coordinate: unknown,
  options: Record<string, unknown> = {},
): BaiduOverlay | null {
  const api = getBaiduMapApi();
  const point = createPoint(api, coordinate);

  if (!api?.Marker || !map || !point) {
    return null;
  }

  const marker = new api.Marker(point, options);
  map.addOverlay?.(marker);

  return marker;
}

export function createLabelOverlay(
  map: BaiduMapInstance | null | undefined,
  coordinate: unknown,
  content: string,
  options: CreateLabelOverlayOptions = {},
): BaiduOverlay | null {
  const api = getBaiduMapApi();
  const point = createPoint(api, coordinate);

  if (!api?.Label || !map || !point) {
    return null;
  }

  const offset =
    api.Size && options.offset
      ? new api.Size(
          Number(options.offset.x || 0),
          Number(options.offset.y || 0),
        )
      : undefined;
  const label = new api.Label(content, {
    offset,
    position: point,
  });

  if (options.style && "setStyle" in Object(label)) {
    (
      label as { setStyle?: (style: Record<string, string>) => void }
    ).setStyle?.(options.style);
  }

  map.addOverlay?.(label);

  return label;
}

export function fitBounds(
  map: BaiduMapInstance | null | undefined,
  coordinates: unknown[],
): void {
  const points = coordinates
    .map((coordinate) => createPoint(null, coordinate))
    .filter((point): point is BaiduPoint => Boolean(point));

  if (!map || !points.length) {
    return;
  }

  if (points.length === 1) {
    map.setCenter?.(points[0]);
    return;
  }

  map.setViewport?.(points);
}

export function pointToOverlayPixel(
  context: OverlayDrawContext,
  coordinate: unknown,
  offset: PixelOffset = {},
): { x: number; y: number } | null {
  const api = getBaiduMapApi(context.BMap);
  const point = createPoint(api, coordinate);
  const pixel = point ? context.map?.pointToOverlayPixel?.(point) : null;

  if (!pixel) {
    return null;
  }

  return {
    x: pixel.x + Number(offset.x || 0),
    y: pixel.y + Number(offset.y || 0),
  };
}
