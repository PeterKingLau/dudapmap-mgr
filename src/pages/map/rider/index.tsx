import { Button, Modal, Spin, Tag, message } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRealLocations } from "../../../api/location";
import { deleteTaskById, fetchTasks } from "../../../api/task";
import { fetchOnlineUserCount } from "../../../api/user";
import {
  createLabelOverlay,
  createMap,
  createMarker,
  fitBounds,
  loadBaiduMap,
  normalizeLngLat,
  setCenter,
  unbindBaiduMapTheme,
  type BaiduMapInstance,
  type LngLat,
  type PixelOffset,
} from "../../../utils/baiduMapAdapter";
import navCoordinateIcon from "../../../assets/images/nav-coordinate.png";
import "./../shared.css";

type TaskRow = {
  adress?: string;
  id?: number | string;
  infoflag?: number | string;
  lat?: string;
  lng?: string;
  taskdate?: string;
  useraddress?: string;
  userphone?: string;
};

type LocationItem = LngLat & {
  adress?: string;
  name?: string;
  phone: string;
  region?: string;
};

type DisplayPoint = LngLat & {
  overlayOffset?: PixelOffset;
  phone: string;
};

const DEFAULT_CENTER = { lng: 104.648323, lat: 31.525121 };
const TASK_DETAIL_CACHE_KEY = "taskDetail";
const NEARBY_COORDINATE_THRESHOLD = 0.0002;
const OVERLAY_SPREAD_X = 72;
const OVERLAY_SPREAD_Y = 28;

const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: "blue", text: "已经派发" },
  2: { color: "green", text: "接受任务" },
  3: { color: "red", text: "拒绝任务" },
  4: { color: "cyan", text: "完成任务" },
  5: { color: "default", text: "未派单" },
};

function getRows<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object" && "data" in value) {
    return getRows((value as { data?: unknown }).data);
  }

  return [];
}

function formatValue(value: unknown) {
  return value === "" || value === null || value === undefined
    ? "暂无"
    : String(value);
}

function getTaskStatus(infoflag: unknown) {
  return statusMap[Number(infoflag)] || { color: "default", text: "未知状态" };
}

function normalizeTask(item: TaskRow): TaskRow {
  const addressParts = String(item.useraddress || "").split("&");

  return {
    ...item,
    adress: item.adress || addressParts[0] || "",
    lat: item.lat || addressParts[2] || "",
    lng: item.lng || addressParts[1] || "",
  };
}

function parseLocationRow(row: string[], phone: string): LocationItem | null {
  const coordinate =
    normalizeLngLat([row[1], row[2]], "latLng") ||
    normalizeLngLat(row.slice(-2), "latLng");

  if (!coordinate) {
    return null;
  }

  return {
    adress: row[0] || "",
    lat: coordinate.lat,
    lng: coordinate.lng,
    name: row[3] || "",
    phone,
    region: row[4] || "",
  };
}

function areNearbyCoordinates(first: LngLat, second: LngLat) {
  return (
    Math.abs(first.lng - second.lng) <= NEARBY_COORDINATE_THRESHOLD &&
    Math.abs(first.lat - second.lat) <= NEARBY_COORDINATE_THRESHOLD
  );
}

function createMapPoints(items: LocationItem[]): DisplayPoint[] {
  const groups: LocationItem[][] = [];

  items.forEach((item) => {
    const group = groups.find((row) => areNearbyCoordinates(row[0], item));

    if (group) {
      group.push(item);
      return;
    }

    groups.push([item]);
  });

  return groups.flatMap((group) => {
    if (group.length === 1) {
      return [{ ...group[0], overlayOffset: { x: 0, y: 0 } }];
    }

    return group.map((item, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      const layer = Math.floor(index / 2) + 1;

      return {
        ...item,
        overlayOffset: {
          x: direction * OVERLAY_SPREAD_X * layer,
          y: OVERLAY_SPREAD_Y * (layer - 1),
        },
      };
    });
  });
}

function createRealLocationSignature(locationMap: Record<string, unknown>) {
  return JSON.stringify(
    Object.keys(locationMap)
      .sort()
      .map((phone) => [phone, locationMap[phone]]),
  );
}

export function RiderPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<BaiduMapInstance | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const lastSignatureRef = useRef("");
  const initialCenteredRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [points, setPoints] = useState<DisplayPoint[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const visibleTasks = useMemo(() => tasks.slice(0, 80), [tasks]);

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

    loadTasks();
    refreshRealtimeData(true);
    startRefreshTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      stopRefreshTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    points.forEach((point, index) => {
      createMarker(map, point);
      createLabelOverlay(map, point, `人员${index + 1}号 ${point.phone}`, {
        offset: {
          x: -56 + Number(point.overlayOffset?.x || 0),
          y: -48 + Number(point.overlayOffset?.y || 0),
        },
        style: {
          border: "1px solid rgba(19, 185, 150, 0.18)",
          borderRadius: "8px",
          boxShadow: "0 8px 20px rgba(31,45,61,.15)",
          color: "#202124",
          fontSize: "13px",
          padding: "6px 10px",
          whiteSpace: "nowrap",
        },
      });
    });

    if (locations.length > 1) {
      fitBounds(map, locations);
    }
  }, [locations, mapReady, points]);

  function loadTasks() {
    setTaskLoading(true);
    fetchTasks()
      .then((res) => {
        setTasks(getRows<TaskRow>(res).map(normalizeTask));
      })
      .catch(() => {
        setTasks([]);
        message.error("任务信息加载失败");
      })
      .finally(() => setTaskLoading(false));
  }

  function refreshRealtimeData(force = false) {
    if (document.hidden || locationLoading) {
      return;
    }

    setLocationLoading(true);
    fetchRealLocations()
      .then((res) => {
        const locationMap =
          ((res as { data?: unknown })?.data as Record<string, unknown>) || {};
        const signature = createRealLocationSignature(locationMap);

        if (!force && signature === lastSignatureRef.current) {
          return;
        }

        lastSignatureRef.current = signature;
        const phones = Object.keys(locationMap);
        const nextLocations = Object.values(locationMap)
          .map((item, index) =>
            parseLocationRow(String(item).split("&"), phones[index]),
          )
          .filter((item): item is LocationItem => Boolean(item));
        const nextPoints = createMapPoints(nextLocations);

        setLocations(nextLocations);
        setPoints(nextPoints);

        if (!initialCenteredRef.current && nextLocations[0]) {
          setCenter(mapRef.current, nextLocations[0]);
          initialCenteredRef.current = true;
        }
      })
      .catch(() => {
        if (force) {
          message.error("实时坐标加载失败");
        }
      })
      .finally(() => setLocationLoading(false));

    fetchOnlineUserCount()
      .then((res) =>
        setOnlineCount(Number((res as { data?: unknown }).data || 0)),
      )
      .catch(() => setOnlineCount(0));
  }

  function startRefreshTimer() {
    if (refreshTimerRef.current || document.hidden) {
      return;
    }

    refreshTimerRef.current = window.setInterval(() => {
      refreshRealtimeData();
    }, 3000);
  }

  function stopRefreshTimer() {
    if (!refreshTimerRef.current) {
      return;
    }

    window.clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = null;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopRefreshTimer();
      return;
    }

    refreshRealtimeData(true);
    startRefreshTimer();
  }

  function openTask(task: TaskRow) {
    if (!task.id) {
      return;
    }

    sessionStorage.setItem(
      `${TASK_DETAIL_CACHE_KEY}:${task.id}`,
      JSON.stringify(task),
    );
    navigate(
      `/business/tasks/detail?taskId=${encodeURIComponent(String(task.id))}`,
    );
  }

  function removeTask(index: number, id?: number | string) {
    if (!id) {
      message.warning("缺少任务编号，无法删除");
      return;
    }

    Modal.confirm({
      cancelText: "取消",
      content: "确定删除这个任务吗？",
      okButtonProps: { danger: true },
      okText: "删除",
      title: "删除确认",
      onOk: () =>
        deleteTaskById(id).then(() => {
          setTasks((items) =>
            items.filter((_item, itemIndex) => itemIndex !== index),
          );
          sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${id}`);
          message.success("删除成功");
        }),
    });
  }

  function jumpCoordinate(point: LngLat) {
    setCenter(mapRef.current, point);
    setPeopleOpen(false);
  }

  return (
    <div className="react-map-page">
      <div className="react-map-canvas-page" ref={mapContainerRef} />

      <section className="react-map-toolbar">
        <div className="react-map-toolbar-main">
          <div className="react-map-toolbar-title">
            <div className="react-map-title-icon">
              <img src={navCoordinateIcon} alt="" />
            </div>
            <div>
              <h1>清运车实时位置</h1>
              <p>查看在线人员位置、坐标与任务分布。</p>
            </div>
          </div>
        </div>

        <div className="react-map-toolbar-actions">
          <div className="react-map-online-card">
            <span>当前清运车在线数量</span>
            <strong>{onlineCount || 0}</strong>
            <em>辆</em>
          </div>
          <Button
            icon={<Icon icon="ri:map-pin-user-line" />}
            onClick={() => {
              setTaskOpen(false);
              setPeopleOpen(true);
            }}
          >
            人员坐标
          </Button>
          <Button
            icon={<Icon icon="ri:task-line" />}
            type="primary"
            onClick={() => {
              setPeopleOpen(false);
              setTaskOpen(true);
            }}
          >
            全部任务
          </Button>
        </div>
      </section>

      <section className="react-map-legend">
        <div>
          <span className="react-map-legend-dot" />
          <strong>{points.length}</strong>
          <span>个实时坐标</span>
        </div>
        <div>
          <Icon icon="ri:refresh-line" />
          <span>3 秒自动刷新</span>
        </div>
      </section>

      {taskOpen ? (
        <aside className="react-map-side-panel">
          <div className="react-map-panel-header">
            <div>
              <h2>全部任务</h2>
              <p>{tasks.length} 条任务记录</p>
            </div>
            <Button
              icon={<Icon icon="ri:close-line" />}
              shape="circle"
              onClick={() => setTaskOpen(false)}
            />
          </div>

          {taskLoading ? (
            <div className="react-map-panel-state">
              <Spin size="large" />
              <span>加载中...</span>
            </div>
          ) : visibleTasks.length ? (
            <div className="react-map-panel-list">
              {visibleTasks.map((item, index) => {
                const status = getTaskStatus(item.infoflag);

                return (
                  <article
                    className="react-map-task-card"
                    key={`${item.id || item.userphone || index}`}
                    onClick={() => openTask(item)}
                  >
                    <div className="react-map-task-card-header">
                      <div>
                        <span>任务 {index + 1}</span>
                        <strong>{formatValue(item.userphone)}</strong>
                      </div>
                      <div className="react-map-task-actions">
                        <Tag color={status.color}>{status.text}</Tag>
                        <Button
                          className="react-map-delete-button"
                          danger
                          icon={<Icon icon="ri:delete-bin-line" />}
                          shape="circle"
                          type="text"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeTask(index, item.id);
                          }}
                        />
                      </div>
                    </div>
                    <dl className="react-map-info-list">
                      <div className="full-field">
                        <dt>地址</dt>
                        <dd>{formatValue(item.adress)}</dd>
                      </div>
                      <div>
                        <dt>日期</dt>
                        <dd>{formatValue(item.taskdate)}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="react-map-panel-state">
              <Icon icon="ri:file-search-line" />
              <h3>暂无详细信息</h3>
              <p>当前没有任务记录。</p>
            </div>
          )}
        </aside>
      ) : null}

      {peopleOpen ? (
        <aside className="react-map-side-panel">
          <div className="react-map-panel-header">
            <div>
              <h2>人员坐标</h2>
              <p>{locations.length} 个在线坐标</p>
            </div>
            <Button
              icon={<Icon icon="ri:close-line" />}
              shape="circle"
              onClick={() => setPeopleOpen(false)}
            />
          </div>

          {locations.length ? (
            <div className="react-map-panel-list">
              {locations.map((item, index) => (
                <button
                  className="react-map-people-card"
                  key={`${item.phone}-${index}`}
                  type="button"
                  onClick={() => jumpCoordinate(item)}
                >
                  <div className="react-map-people-main">
                    <span>人员 {index + 1} 号</span>
                    <strong>{formatValue(item.phone)}</strong>
                  </div>
                  <Icon icon="ri:map-pin-line" />
                  <p>{formatValue(item.adress)}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="react-map-panel-state">
              <Icon icon="ri:map-pin-line" />
              <h3>暂无人员坐标信息</h3>
              <p>当前没有可查看的在线坐标。</p>
            </div>
          )}
        </aside>
      ) : null}
    </div>
  );
}
