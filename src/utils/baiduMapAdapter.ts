import type { App, Plugin } from "vue";

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

type BaiduPoint = unknown;
type BaiduOverlay = unknown;
type BaiduMapInstance = {
  addOverlay?: (overlay: BaiduOverlay) => void;
  centerAndZoom?: (point: BaiduPoint, zoom?: number) => void;
  clearOverlays?: () => void;
  enableScrollWheelZoom?: (enabled?: boolean) => void;
  panTo?: (point: BaiduPoint) => void;
  pointToOverlayPixel?: (point: BaiduPoint) => { x: number; y: number };
  removeOverlay?: (overlay: BaiduOverlay) => void;
  setCenter?: (point: BaiduPoint) => void;
  setViewport?: (points: BaiduPoint[]) => void;
};

type BaiduMapApi = {
  Bounds?: new () => {
    extend?: (point: BaiduPoint) => void;
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
  Point?: new (lng: number, lat: number) => BaiduPoint;
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

let installed = false;
let installing: Promise<void> | null = null;

export function getBaiduMapApi(api?: BaiduMapApi | null): BaiduMapApi | null {
  return api || window.BMap || window.BMapGL || null;
}

export async function loadBaiduMap(app?: App): Promise<BaiduMapApi | null> {
  if (app && !installed) {
    if (!installing) {
      installing = import("vue-baidu-map-3x").then((module) => {
        app.use(module.default as Plugin, {
          ak: BAIDU_MAP_AK,
        });
        installed = true;
      });
    }

    await installing;
  }

  return getBaiduMapApi();
}

export function isValidLng(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

export function isValidLat(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

function toNumber(value: unknown): number {
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

  return isValidLng(fallback.lng) && isValidLat(fallback.lat)
    ? fallback
    : null;
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
  const center = createPoint(api, options.center);

  if (center) {
    map.centerAndZoom?.(center, options.zoom || 15);
  }

  if (options.scrollWheelZoom !== false) {
    map.enableScrollWheelZoom?.(true);
  }

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
      ? new api.Size(Number(options.offset.x || 0), Number(options.offset.y || 0))
      : undefined;
  const label = new api.Label(content, {
    offset,
    position: point,
  });

  if (options.style && "setStyle" in Object(label)) {
    (label as { setStyle?: (style: Record<string, string>) => void }).setStyle?.(
      options.style,
    );
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
