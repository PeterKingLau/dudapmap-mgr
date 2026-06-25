import { Button, DatePicker, Form, Modal, Select, Tag, message } from "antd";
import { Icon } from "@iconify/react";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLocationsByDateAndDistrict } from "../../../api/location";
import {
  createLabelOverlay,
  createMap,
  createMarker,
  fitBounds,
  loadBaiduMap,
  unbindBaiduMapTheme,
  type BaiduMapInstance,
  type LngLat,
} from "../../../utils/baiduMapAdapter";
import iconLocation from "../../../assets/images/icon-location.png";
import navTrajectoryIcon from "../../../assets/images/nav-trajectory.png";
import "./../shared.css";

type PointRow = LngLat & {
  adress?: string;
  displayLat?: number;
  displayLng?: number;
  locationdate?: string;
  originalIndex?: number;
  userphone?: string;
};

const DEFAULT_CENTER = { lng: 104.648323, lat: 31.525121 };
const NEARBY_POINT_THRESHOLD = 0.00015;
const POINT_SPREAD_RADIUS = 0.00006;
const minDate = dayjs("2020-01-01");
const maxDate = dayjs();
const areaOptions = ["绵阳", "安州", "广汉", "射洪", "成华"].map((item) => ({
  label: item,
  value: item,
}));

function getRows<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  return [];
}

function normalizePoint(item: {
  locationdate?: string;
  locationinfo?: string;
  userphone?: string;
}): PointRow | null {
  const location = String(item.locationinfo || "").split("&");
  const lat = Number(location[1]);
  const lng = Number(location[2]);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return {
    adress: location[0] || "",
    lat,
    lng,
    locationdate: item.locationdate,
    userphone: item.userphone,
  };
}

function isNearbyPoint(point: LngLat, target: LngLat) {
  return (
    Math.abs(point.lng - target.lng) <= NEARBY_POINT_THRESHOLD &&
    Math.abs(point.lat - target.lat) <= NEARBY_POINT_THRESHOLD
  );
}

function createDisplayPoints(points: PointRow[]): PointRow[] {
  const groups = points.reduce<PointRow[][]>((rows, point, index) => {
    const sourcePoint = { ...point, originalIndex: index };
    const targetGroup = rows.find((group) =>
      group.some((item) => isNearbyPoint(sourcePoint, item)),
    );

    if (targetGroup) {
      targetGroup.push(sourcePoint);
      return rows;
    }

    rows.push([sourcePoint]);
    return rows;
  }, []);

  return groups.flatMap((group) =>
    group.map((point, index) => {
      if (group.length <= 1) {
        return {
          ...point,
          displayLat: point.lat,
          displayLng: point.lng,
        };
      }

      const angle =
        group.length === 2 ? index * Math.PI : (Math.PI * 2 * index) / group.length;
      const lngRadius =
        POINT_SPREAD_RADIUS / Math.max(Math.cos((point.lat * Math.PI) / 180), 0.2);

      return {
        ...point,
        displayLng: point.lng + Math.cos(angle) * lngRadius,
        displayLat: point.lat + Math.sin(angle) * POINT_SPREAD_RADIUS,
      };
    }),
  );
}

export function TrajectoryPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<BaiduMapInstance | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [date, setDate] = useState("");
  const [area, setArea] = useState("");
  const [points, setPoints] = useState<PointRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PointRow | null>(null);
  const displayPoints = useMemo(() => createDisplayPoints(points), [points]);

  useEffect(() => {
    let disposed = false;

    loadBaiduMap()
      .then(() => {
        if (disposed || !mapContainerRef.current) {
          return;
        }

        const map = createMap(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          scrollWheelZoom: true,
          zoom: 15,
        });
        mapRef.current = map;
        setMapReady(true);
      })
      .catch(() => {
        message.error("百度地图加载失败");
      });

    return () => {
      disposed = true;
      unbindBaiduMapTheme(mapRef.current);
      mapRef.current?.clearOverlays?.();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) {
      return;
    }

    map.clearOverlays?.();
    displayPoints.forEach((point) => {
      const markerPoint = {
        lng: point.displayLng || point.lng,
        lat: point.displayLat || point.lat,
      };
      const marker = createMarker(map, markerPoint);
      const markerWithClick = marker as
        | { addEventListener?: (name: string, handler: () => void) => void }
        | null;

      markerWithClick?.addEventListener?.("click", () => setSelectedPoint(point));
      createLabelOverlay(map, markerPoint, point.userphone || "-", {
        offset: { x: -46, y: -28 },
        style: {
          background: "#fff",
          border: "0",
          borderRadius: "999px",
          boxShadow: "0 2px 8px rgba(31,45,61,.12)",
          color: "#202124",
          fontSize: "13px",
          padding: "3px 8px",
        },
      });
    });

    if (points.length) {
      fitBounds(map, points);
    }
  }, [displayPoints, mapReady, points]);

  function searchArea() {
    if (!date) {
      message.warning("请选择日期进行查询！");
      return;
    }

    if (!area) {
      message.warning("请选择地区进行查询！");
      return;
    }

    setSearchLoading(true);
    fetchLocationsByDateAndDistrict({
      date,
      dis: area,
    })
      .then((res) => {
        const nextPoints = getRows<{
          locationdate?: string;
          locationinfo?: string;
          userphone?: string;
        }>(res)
          .map(normalizePoint)
          .filter((item): item is PointRow => Boolean(item));

        setPoints(nextPoints);

        if (!nextPoints.length) {
          message.warning(`${date} 暂无点位信息`);
        }
      })
      .catch(() => {
        setPoints([]);
        message.error("点位信息查询失败");
      })
      .finally(() => setSearchLoading(false));
  }

  function clearSearch() {
    setDate("");
    setArea("");
    setPoints([]);
    setSelectedPoint(null);
    mapRef.current?.clearOverlays?.();
  }

  return (
    <div className="react-map-page">
      <div className="react-map-canvas-page" ref={mapContainerRef} />

      <section className="react-map-toolbar">
        <div className="react-map-toolbar-main">
          <div className="react-map-toolbar-title">
            <div className="react-map-title-icon">
              <img src={navTrajectoryIcon} alt="" />
            </div>
            <div>
              <h1>点位查询</h1>
              <p>按日期和地区查询人员历史点位。</p>
            </div>
          </div>
        </div>
        <Tag color="blue">{points.length} 个点位</Tag>
      </section>

      <section className="react-map-query-panel">
        <Form layout="vertical">
          <Form.Item label="日期">
            <DatePicker
              disabledDate={(current) =>
                Boolean(current && (current < minDate || current > maxDate))
              }
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              value={date ? dayjs(date) : null}
              onChange={(value: Dayjs | null) =>
                setDate(value ? value.format("YYYY-MM-DD") : "")
              }
            />
          </Form.Item>
          <Form.Item label="地区">
            <Select
              allowClear
              options={areaOptions}
              placeholder="请选择地区"
              value={area || undefined}
              onChange={(value) => setArea(value || "")}
            />
          </Form.Item>
          <Form.Item label="操作">
            <div className="react-map-query-actions">
              <Button
                icon={<Icon icon="ri:search-line" />}
                loading={searchLoading}
                type="primary"
                onClick={searchArea}
              >
                查找
              </Button>
              <Button icon={<Icon icon="ri:refresh-line" />} onClick={clearSearch}>
                清空
              </Button>
            </div>
          </Form.Item>
        </Form>
      </section>

      <section className="react-map-legend">
        <div>
          <span className="react-map-legend-dot" />
          <strong>{points.length}</strong>
          <span>个点位</span>
        </div>
        <div>
          <Icon icon="ri:map-pin-line" />
          <span>{area || "未选择地区"}</span>
        </div>
      </section>

      <Modal
        footer={null}
        open={Boolean(selectedPoint)}
        title="点位信息"
        width={480}
        onCancel={() => setSelectedPoint(null)}
      >
        <div className="react-map-point-summary">
          <div className="react-map-point-icon">
            <img src={iconLocation} alt="" />
          </div>
          <div>
            <strong>{selectedPoint?.userphone || "-"}</strong>
            <span>{selectedPoint?.adress || "-"}</span>
          </div>
        </div>
        <dl className="react-map-point-info">
          <div>
            <dt>电话号码</dt>
            <dd>{selectedPoint?.userphone || "-"}</dd>
          </div>
          <div>
            <dt>所在地址</dt>
            <dd>{selectedPoint?.adress || "-"}</dd>
          </div>
        </dl>
      </Modal>
    </div>
  );
}
