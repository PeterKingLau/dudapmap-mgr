import { message } from "@/utils/message";
import { Button } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteVirtualStaff,
  fetchAllUsers,
  fetchUserLocations,
  fetchUsersByRole,
} from "../../api/home";
import { normalizeLngLat } from "../../utils/baiduMapAdapter";
import { formatDay } from "../../utils/date";
import { createRouteQuery } from "../../utils/routeQuery";
import { HomeMap, type HomeMapReadyEvent } from "../../components/home/HomeMap";
import { CurrentPositionDialog } from "../../components/home/CurrentPositionDialog";
import { StaffSheet } from "../../components/home/StaffSheet";
import { UnclockedDialog } from "../../components/home/UnclockedDialog";
import { UserSearchDialog } from "../../components/home/UserSearchDialog";
import { useAppStore } from "../../store/useAppStore";

type Coordinate = {
  lat: number;
  lng: number;
};

type StaffRow = {
  infoflag?: number | string;
  userdate?: string;
  userphone?: string;
  userrole?: string | null;
  username?: string;
};

type PhoneOption = {
  label: string;
  name?: string;
  value: string;
};

type LocationRow = {
  infoflag?: number | string;
  locationinfo?: string;
};

const DEFAULT_MAP_CENTER: Coordinate = { lng: 104.648323, lat: 31.525121 };
const MAP_LOADING_TIMEOUT = 6000;
const radius = 100;
const userroleList = [
  "全部",
  "项目经理",
  "技术负责人",
  "资料员",
  "施工员",
  "驾驶员",
  "车辆",
  "班主负责人",
];
const minDate = dayjs("2020-01-01");
const today = dayjs();

function getResponseRows<T>(value: unknown): T[] {
  const row = value as { data?: unknown };

  return Array.isArray(row?.data) ? (row.data as T[]) : [];
}

function getResponseData(value: unknown): unknown {
  return (value as { data?: unknown })?.data;
}

function normalizeUserRole(item: StaffRow): StaffRow {
  const next = { ...item };

  switch (next.userrole) {
    case null:
      next.userrole = "人员-人员";
      next.infoflag = 2;
      break;
    case "null-小工":
      next.userrole = "小工-小工";
      break;
    case "null-大工":
      next.userrole = "大工-大工";
      break;
    case "null-宣传员":
      next.userrole = "宣传员-宣传员";
      break;
    case "null-人员":
      next.userrole = "人员-人员";
      break;
    case "null-安装员":
      next.userrole = "安装员-安装员";
      break;
    case "null-配送员":
      next.userrole = "配送员-配送员";
      break;
  }

  return next;
}

function getLocationParts(row: LocationRow): string[] {
  return String(row.locationinfo || "").split("&");
}

function getPointFromLocation(row: LocationRow): Coordinate | null {
  const location = getLocationParts(row);
  const point = normalizeLngLat(
    {
      lat: location[1],
      lng: location[2],
    },
    "lngLat",
  );

  return point;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const updateCenter = useAppStore((state) => state.updateCenter);
  const updateAddress = useAppStore((state) => state.updateAddress);
  const geocoderRef = useRef<{
    getLocation?: (
      point: unknown,
      callback: (result: { address?: string }) => void,
    ) => void;
  } | null>(null);
  const [center, setCenterState] = useState<Coordinate>(DEFAULT_MAP_CENTER);
  const [zoom] = useState(15);
  const [mapReady, setMapReady] = useState(false);
  const [mapBusy, setMapBusy] = useState(true);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [equipmentAddress, setEquipmentAddress] = useState("");
  const [showCurrentMarker, setShowCurrentMarker] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [propAddress, setPropAddress] = useState("");
  const [addCoord, setAddCoord] = useState<Coordinate | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [phoneOptions, setPhoneOptions] = useState<PhoneOption[]>([]);
  const [userTel, setUserTel] = useState("");
  const [userDate, setUserDate] = useState(formatDay(new Date()));
  const [routeLoading, setRouteLoading] = useState(false);
  const [routePoints, setRoutePoints] = useState<Coordinate[]>([]);
  const [exceedPoints, setExceedPoints] = useState<Coordinate[]>([]);
  const [stopTimeMinutes, setStopTimeMinutes] = useState(0);
  const [unclockedOpen, setUnclockedOpen] = useState(false);
  const [unclockedDate, setUnclockedDate] = useState(formatDay(new Date()));

  const mapStatusText = mapReady && !mapBusy ? "地图已就绪" : "地图加载中";
  const currentLongitude = longitude || center.lng;
  const currentLatitude = latitude || center.lat;
  const routeHours = Math.floor(stopTimeMinutes / 60);
  const routeMinutes = stopTimeMinutes % 60;
  function setMapLocation({
    address = "",
    lat,
    lng,
    showMarker = true,
  }: Coordinate & {
    address?: string;
    showMarker?: boolean;
  }) {
    const nextCenter = { lng: Number(lng), lat: Number(lat) };

    setCenterState(nextCenter);
    setLongitude(nextCenter.lng);
    setLatitude(nextCenter.lat);
    setEquipmentAddress(address);
    setShowCurrentMarker(showMarker);
  }

  function loadStaffRows() {
    fetchAllUsers().then((res) => {
      const rows = getResponseRows<StaffRow>(res);
      const nextRows = rows.map(normalizeUserRole);

      setStaffRows(nextRows);
      setPhoneOptions(
        nextRows
          .map((item) => ({
            name: String(item.username || "").trim(),
            phone: String(item.userphone || "").trim(),
          }))
          .filter((item) => item.phone)
          .map((item) => ({
            label: item.phone,
            name: item.name,
            value: item.phone,
          })),
      );
    });
  }

  function refreshVirtualStaff() {
    deleteVirtualStaff().finally(() => {
      setActiveRoleIndex(0);
      loadStaffRows();
    });
  }

  function selectRole(index: number, roleName: string) {
    setActiveRoleIndex(index);

    if (roleName === "全部") {
      loadStaffRows();
      return;
    }

    fetchUsersByRole(roleName).then((res) => {
      setStaffRows(getResponseRows<StaffRow>(res));
    });
  }

  function addCoordClick() {
    if (!longitude || !latitude) {
      return;
    }

    setAddCoord({
      lng: longitude,
      lat: latitude,
    });
    setPositionOpen(false);
    setRoutePoints([]);
    setExceedPoints([]);
    setStopTimeMinutes(0);
  }

  function resetCurrentPosition() {
    setAddCoord(null);
    setPositionOpen(false);
  }

  function resetUserSearchForm() {
    setUserTel("");
    setUserDate(formatDay(new Date()));
  }

  function openUserSearch() {
    resetUserSearchForm();
    setSearchOpen(true);
  }

  function closeUserSearch() {
    setSearchOpen(false);
    resetUserSearchForm();
  }

  function searchUserInfo() {
    if (!userTel) {
      message.warning("请选择员工电话！");
      return;
    }

    if (!userDate) {
      message.warning("请选择日期！");
      return;
    }

    setRouteLoading(true);
    setSearchOpen(false);
    fetchUserLocations({
      phone: userTel,
      dats: userDate,
    })
      .then((res) => {
        const rows = getResponseRows<LocationRow>(res);

        if (!rows.length) {
          setRoutePoints([]);
          setExceedPoints([]);
          setStopTimeMinutes(0);
          message.warning("暂无员工的定位信息！");
          return;
        }

        const points = rows
          .map(getPointFromLocation)
          .filter((item): item is Coordinate => Boolean(item));
        const exceeds = rows
          .filter((item) => String(item.infoflag) === "2")
          .map(getPointFromLocation)
          .filter((item): item is Coordinate => Boolean(item));

        setRoutePoints(points);
        setExceedPoints(exceeds);
        setAddCoord(null);
        setShowCurrentMarker(false);

        if (points[0]) {
          setMapLocation({
            ...points[0],
            showMarker: false,
          });
        }

        setStopTimeMinutes(exceeds.length ? (exceeds.length - 1) * 6 : 0);
      })
      .catch(() => {
        message.error("定位路线查询失败");
      })
      .finally(() => {
        setRouteLoading(false);
      });
  }

  function searchUnclocked() {
    if (!unclockedDate) {
      message.warning("请选择日期进行查询！");
      return;
    }

    setUnclockedOpen(false);
    navigate(
      `/attendance/unclocked${createRouteQuery({ d: unclockedDate })}`,
    );
  }

  function handleMapReady({ BMap }: HomeMapReadyEvent) {
    geocoderRef.current = BMap.Geocoder ? new BMap.Geocoder() : null;
    setMapReady(true);
    setMapBusy(false);
  }

  function handleMapClick(event: unknown) {
    const point = (event as { point?: unknown })?.point;
    const lngLat = normalizeLngLat(point);

    if (!point || !lngLat) {
      return;
    }

    setLongitude(lngLat.lng);
    setLatitude(lngLat.lat);
    geocoderRef.current?.getLocation?.(point, (result) => {
      setPropAddress(result.address || "");
      setPositionOpen(true);
    });
  }

  useEffect(() => {
    let disposed = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!disposed) {
        setMapBusy(false);
      }
    }, MAP_LOADING_TIMEOUT);

    loadStaffRows();
    refreshVirtualStaff();

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      geocoderRef.current = null;
    };
  }, []);

  useEffect(() => {
    updateCenter(center);
  }, [center, updateCenter]);

  useEffect(() => {
    updateAddress(equipmentAddress);
  }, [equipmentAddress, updateAddress]);

  return (
    <div className="react-home-page">
      <header className="react-home-toolbar">
        <div className="react-toolbar-title">
          <h1>地图工作台</h1>
          <p>{equipmentAddress || "点击地图可查看并新增坐标点"}</p>
        </div>

        <div className="react-toolbar-actions">
          <Button
            type={staffOpen ? "primary" : "default"}
            onClick={() => setStaffOpen(true)}
          >
            施工人员
          </Button>
          <Button
            type={searchOpen ? "primary" : "default"}
            onClick={openUserSearch}
          >
            查询
          </Button>
          <Button onClick={() => navigate("/devices/create")}>增加设备</Button>
          <Button
            type={unclockedOpen ? "primary" : "default"}
            onClick={() => setUnclockedOpen(true)}
          >
            未打卡查询
          </Button>
        </div>

        <div className="react-toolbar-meta">
          <span
            className={
              mapReady && !mapBusy ? "status-pill ready" : "status-pill"
            }
          >
            {mapStatusText}
          </span>
          <span className="coordinate-pill">
            经度：{currentLongitude}，纬度：{currentLatitude}
          </span>
        </div>
      </header>

      <HomeMap
        addCoord={addCoord}
        addCoordShow={Boolean(addCoord)}
        center={center}
        embrace={Boolean(routePoints.length)}
        exceedArry={exceedPoints}
        hours={routeHours}
        mapBusy={mapBusy}
        mapVisible
        minute={routeMinutes}
        polygonPath={routePoints}
        radius={radius}
        routeLoading={routeLoading}
        routePoints={routePoints}
        scopeCircle={routePoints[0] || center}
        shouldRenderMapOverlays={mapReady}
        showDq={showCurrentMarker}
        stoptime={stopTimeMinutes > 0}
        zoom={zoom}
        onLoaded={() => {
          setMapReady(true);
          setMapBusy(false);
        }}
        onLoadError={() => {
          setMapBusy(false);
          message.error("百度地图加载失败");
        }}
        onMapClick={handleMapClick}
        onReady={handleMapReady}
      />

      <StaffSheet
        activeRoleIndex={activeRoleIndex}
        findAll={staffRows}
        open={staffOpen}
        userroleList={userroleList}
        onActiveRoleIndexChange={setActiveRoleIndex}
        onClose={refreshVirtualStaff}
        onOpenChange={setStaffOpen}
        onOpenRole={(changeName, tel) =>
          navigate(
            `/system/users/role${createRouteQuery({
              n: changeName,
              p: tel,
            })}`,
          )
        }
        onSelectTab={({ name, title }) => selectRole(name, title)}
      />

      <UserSearchDialog
        maxDate={today}
        minDate={minDate}
        open={searchOpen}
        phoneLis={phoneOptions}
        userDate={userDate}
        userTel={userTel}
        onOpenChange={(open) => {
          if (open) {
            openUserSearch();
            return;
          }

          closeUserSearch();
        }}
        onSearch={searchUserInfo}
        onUserDateChange={setUserDate}
        onUserTelChange={setUserTel}
      />

      <CurrentPositionDialog
        latitude={latitude}
        longitude={longitude}
        open={positionOpen}
        propaddress={propAddress}
        onAdd={addCoordClick}
        onOpenChange={setPositionOpen}
        onReset={resetCurrentPosition}
      />

      <UnclockedDialog
        dayValue={unclockedDate}
        maxDate={today}
        minDate={minDate}
        open={unclockedOpen}
        onDayValueChange={setUnclockedDate}
        onOpenChange={setUnclockedOpen}
        onSearch={searchUnclocked}
      />
    </div>
  );
}
