import { Spin } from "antd";
import { useEffect, useRef } from "react";
import {
  createLabelOverlay,
  createMap,
  createMarker,
  createPoint,
  fitBounds,
  loadBaiduMap,
  unbindBaiduMapTheme,
  type BaiduMapApi,
  type BaiduMapInstance,
} from "../../utils/baiduMapAdapter";

export type HomeMapCoordinate = {
  lat: number;
  lng: number;
};

export type HomeMapReadyEvent = {
  BMap: BaiduMapApi;
  map: BaiduMapInstance;
};

type HomeMapProps = {
  active?: boolean;
  addCoord?: HomeMapCoordinate | null;
  addCoordShow?: boolean;
  center: HomeMapCoordinate;
  embrace?: boolean;
  exceedArry?: HomeMapCoordinate[];
  hours?: number;
  mapBusy?: boolean;
  mapVisible?: boolean;
  minute?: number;
  polygonPath?: HomeMapCoordinate[];
  radius?: number;
  routeLoading?: boolean;
  routePoints?: HomeMapCoordinate[];
  scopeCircle: HomeMapCoordinate;
  shouldRenderMapOverlays?: boolean;
  showDq?: boolean;
  stoptime?: boolean;
  zoom?: number;
  onInteractionEnd?: () => void;
  onInteractionStart?: () => void;
  onLoaded?: () => void;
  onLoadError?: (error: unknown) => void;
  onMapClick?: (event: unknown) => void;
  onReady?: (event: HomeMapReadyEvent) => void;
};

const DEFAULT_RADIUS = 100;
const MAX_EXCEED_MARKERS = 12;

function getVisibleExceedPoints(points: HomeMapCoordinate[]) {
  if (points.length <= MAX_EXCEED_MARKERS) {
    return points.map((point, index) => ({ index, point }));
  }

  const step = Math.ceil(points.length / MAX_EXCEED_MARKERS);

  return points
    .map((point, index) => ({ index, point }))
    .filter(
      (item) =>
        item.index === 0 ||
        item.index === points.length - 1 ||
        item.index % step === 0,
    )
    .slice(0, MAX_EXCEED_MARKERS);
}

function getDurationText(hours: number, minute: number) {
  const parts = [];

  if (hours) {
    parts.push(`${hours}小时`);
  }

  if (minute) {
    parts.push(`${minute}分钟`);
  }

  return parts.join("") || "0分钟";
}

function addCircle(
  map: BaiduMapInstance,
  coordinate: HomeMapCoordinate,
  radius: number,
  options: Record<string, unknown>,
) {
  const api = window.BMap || window.BMapGL;
  const point = createPoint(api, coordinate);

  if (!api?.Circle || !point) {
    return;
  }

  map.addOverlay?.(new api.Circle(point, radius, options));
}

function addPolygon(
  map: BaiduMapInstance,
  coordinates: HomeMapCoordinate[],
  options: Record<string, unknown>,
) {
  const api = window.BMap || window.BMapGL;
  const points = coordinates
    .map((item) => createPoint(api, item))
    .filter((point): point is NonNullable<typeof point> => Boolean(point));

  if (!api?.Polygon || points.length < 2) {
    return;
  }

  map.addOverlay?.(new api.Polygon(points, options));
}

function addPolyline(
  map: BaiduMapInstance,
  coordinates: HomeMapCoordinate[],
  options: Record<string, unknown>,
) {
  const api = window.BMap || window.BMapGL;
  const points = coordinates
    .map((item) => createPoint(api, item))
    .filter((point): point is NonNullable<typeof point> => Boolean(point));

  if (!api?.Polyline || points.length < 2) {
    return;
  }

  map.addOverlay?.(new api.Polyline(points, options));
}

export function HomeMap({
  addCoord,
  addCoordShow = false,
  center,
  embrace = false,
  exceedArry = [],
  hours = 0,
  mapBusy = false,
  mapVisible = true,
  minute = 0,
  polygonPath = [],
  radius = DEFAULT_RADIUS,
  routeLoading = false,
  routePoints = [],
  scopeCircle,
  shouldRenderMapOverlays = true,
  showDq = false,
  stoptime = false,
  zoom = 15,
  onInteractionEnd,
  onInteractionStart,
  onLoaded,
  onLoadError,
  onMapClick,
  onReady,
}: HomeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<BaiduMapInstance | null>(null);
  const handlersRef = useRef({
    onInteractionEnd,
    onInteractionStart,
    onLoaded,
    onLoadError,
    onMapClick,
    onReady,
  });

  useEffect(() => {
    handlersRef.current = {
      onInteractionEnd,
      onInteractionStart,
      onLoaded,
      onLoadError,
      onMapClick,
      onReady,
    };
  });

  useEffect(() => {
    if (!mapVisible || mapRef.current || !containerRef.current) {
      return;
    }

    let disposed = false;

    loadBaiduMap()
      .then((api) => {
        if (disposed || !api || !containerRef.current) {
          return;
        }

        const map = createMap(containerRef.current, {
          center,
          scrollWheelZoom: true,
          zoom,
        });
        mapRef.current = map;

        map.addEventListener?.("click", (event) =>
          handlersRef.current.onMapClick?.(event),
        );
        map.addEventListener?.("dragstart", () =>
          handlersRef.current.onInteractionStart?.(),
        );
        map.addEventListener?.("dragend", () =>
          handlersRef.current.onInteractionEnd?.(),
        );
        map.addEventListener?.("moving", () =>
          handlersRef.current.onInteractionStart?.(),
        );
        map.addEventListener?.("moveend", () =>
          handlersRef.current.onInteractionEnd?.(),
        );
        map.addEventListener?.("zoomstart", () =>
          handlersRef.current.onInteractionStart?.(),
        );
        map.addEventListener?.("zoomend", () =>
          handlersRef.current.onInteractionEnd?.(),
        );
        map.addEventListener?.("tilesloaded", () =>
          handlersRef.current.onLoaded?.(),
        );

        handlersRef.current.onReady?.({
          BMap: api,
          map,
        });
        handlersRef.current.onLoaded?.();
      })
      .catch((error) => {
        handlersRef.current.onLoadError?.(error);
      });

    return () => {
      disposed = true;
      unbindBaiduMapTheme(mapRef.current);
      mapRef.current?.clearOverlays?.();
      mapRef.current = null;
    };
  }, [mapVisible, zoom]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !shouldRenderMapOverlays) {
      return;
    }

    map.clearOverlays?.();

    if (showDq) {
      createMarker(map, center);
    }

    if (embrace) {
      addCircle(map, scopeCircle, radius, {
        fillColor: "rgba(239, 68, 68, 0.04)",
        strokeColor: "#ef4444",
        strokeOpacity: 0.45,
        strokeWeight: 1,
      });
      addPolygon(map, polygonPath, {
        strokeColor: "#ef4444",
        strokeOpacity: 0.35,
        strokeWeight: 1,
      });
      getVisibleExceedPoints(exceedArry).forEach(({ index, point }) => {
        createLabelOverlay(map, point, String(index + 1), {
          offset: { x: -9, y: -9 },
          style: {
            width: "18px",
            height: "18px",
            background: "#ef4444",
            border: "2px solid #ffffff",
            borderRadius: "50%",
            boxShadow: "0 3px 10px rgba(220, 38, 38, 0.34)",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "600",
            lineHeight: "14px",
            padding: "0",
            textAlign: "center",
            whiteSpace: "nowrap",
          },
        });
      });
    }

    if (addCoordShow && addCoord) {
      createMarker(map, addCoord);
      addCircle(map, addCoord, radius, {
        fillColor: "rgba(239, 68, 68, 0.12)",
        strokeColor: "#ef4444",
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });
    }

    if (routePoints.length) {
      addPolyline(map, routePoints, {
        strokeColor: "#ffffff",
        strokeOpacity: 0.86,
        strokeWeight: 8,
      });
      addPolyline(map, routePoints, {
        strokeColor: "#13b996",
        strokeOpacity: 0.92,
        strokeWeight: 4,
      });

      routePoints.forEach((point, index) => {
        if (index !== 0 && index !== routePoints.length - 1) {
          return;
        }

        createMarker(map, point);
        createLabelOverlay(map, point, index === 0 ? "起点" : "终点", {
          offset: { x: 18, y: -12 },
          style: {
            border: "0",
            borderRadius: "6px",
            boxShadow: "0 4px 14px rgba(0,0,0,.14)",
            color: "#202124",
            padding: "4px 8px",
          },
        });
      });

      fitBounds(map, routePoints);
      return;
    }

    fitBounds(map, [center]);
  }, [
    addCoord,
    addCoordShow,
    center,
    embrace,
    exceedArry,
    polygonPath,
    radius,
    routePoints,
    scopeCircle,
    shouldRenderMapOverlays,
    showDq,
  ]);

  return (
    <section className="react-map-workspace">
      {routePoints.length ? (
        <div className="react-route-summary">
          <span>轨迹点 {routePoints.length}</span>
          <span>外出 {exceedArry.length}</span>
          {stoptime ? <strong>{getDurationText(hours, minute)}</strong> : null}
        </div>
      ) : null}

      {mapBusy || routeLoading ? (
        <div className="react-map-loading">
          <Spin size="large" />
          <span>
            {routeLoading ? "正在请求定位路线，请稍等！" : "地图加载中..."}
          </span>
        </div>
      ) : null}
      {mapVisible ? (
        <div ref={containerRef} className="react-map-canvas" />
      ) : null}
    </section>
  );
}
