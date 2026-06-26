import { message } from "@/utils/message";
import { Button, DatePicker, Form, Input, Modal, Radio, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  createMap,
  createMarker,
  loadBaiduMap,
  normalizeLngLat,
  setCenter,
  unbindBaiduMapTheme,
  type BaiduMapApi,
  type BaiduMapInstance,
  type LngLat,
} from "../../utils/baiduMapAdapter";
import "./shared.css";

export type DeviceRow = Record<string, unknown> & {
  activation?: string;
  activationtime?: string;
  address?: string;
  card?: string;
  correct?: string;
  createstaff?: string;
  createtime?: string;
  departmentid?: string;
  devicearea?: string;
  devicetypeid?: string;
  face?: string;
  id?: string | number;
  imei?: string;
  lat?: string | number;
  lng?: string | number;
  maintenancestaff?: string;
  name?: string;
  onlinetime?: string;
  operators?: string;
  Operators?: string;
  phone?: string;
  pic?: string;
  qrcode?: string;
  ruleid?: string;
  serialnumber?: string;
  status?: string | number;
  upatetime?: string;
  updatestaff?: string;
  updatetime?: string;
};

export type DeviceFormValues = {
  activation: string;
  activationtime: string;
  address: string;
  card: string;
  correct: string;
  createstaff: string;
  createtime: string;
  departmentid: string;
  devicearea: string;
  devicetypeid: string;
  face: string;
  imei: string;
  lat: string;
  lng: string;
  maintenancestaff: string;
  name: string;
  onlinetime: string;
  operators: string;
  phone: string;
  pic: string;
  qrcode: string;
  ruleid: string;
  serialnumber: string;
  status: string;
  updatestaff: string;
  updatetime: string;
};

type DeviceHeaderProps = {
  description: string;
  extra?: React.ReactNode;
  icon: string;
  title: string;
};

type DeviceStateProps = {
  description?: string;
  loading?: boolean;
  title?: string;
};

type InfoItemProps = {
  className?: string;
  label: string;
  value?: React.ReactNode;
};

type MapPickerProps = {
  lat?: string | number;
  lng?: string | number;
  onChange: (payload: { address: string; lat: string; lng: string }) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const DEFAULT_DEVICE_MAP_CENTER: LngLat = { lng: 116.404, lat: 39.915 };

type GeocoderResult = {
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
};

export const defaultDeviceForm: DeviceFormValues = {
  activation: "1",
  activationtime: "",
  address: "",
  card: "1",
  correct: "0",
  createstaff: "",
  createtime: "",
  departmentid: "",
  devicearea: "",
  devicetypeid: "",
  face: "1",
  imei: "",
  lat: "",
  lng: "",
  maintenancestaff: "",
  name: "",
  onlinetime: "",
  operators: "",
  phone: "1",
  pic: "",
  qrcode: "1",
  ruleid: "",
  serialnumber: "",
  status: "1",
  updatestaff: "",
  updatetime: "",
};

export const statusOptions = [
  { color: "default", label: "待使用", value: "1" },
  { color: "success", label: "使用中", value: "2" },
  { color: "error", label: "已禁用", value: "3" },
  { color: "warning", label: "故障", value: "4" },
  { color: "error", label: "已欠费", value: "5" },
  { color: "processing", label: "未激活", value: "6" },
];

export const yesNoOptions = [
  { label: "是", value: "1" },
  { label: "否", value: "2" },
];

export const correctOptions = [
  { label: "是", value: "0" },
  { label: "否", value: "1" },
];

export function formatValue(value: unknown, fallback = "暂无") {
  return value === "" || value === null || value === undefined
    ? fallback
    : String(value);
}

export function getDeviceStatus(status: unknown) {
  return (
    statusOptions.find((item) => item.value === String(status)) || {
      color: "default",
      label: "未知状态",
      value: "",
    }
  );
}

export function getRows<T>(value: unknown): T[] {
  const row = value as { data?: unknown };

  return Array.isArray(row?.data) ? (row.data as T[]) : [];
}

export function toInputValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

export function normalizeDeviceForm(row: DeviceRow = {}): DeviceFormValues {
  return {
    ...defaultDeviceForm,
    activation: toInputValue(row.activation || defaultDeviceForm.activation),
    activationtime: toInputValue(row.activationtime),
    address: toInputValue(row.address),
    card: toInputValue(row.card || defaultDeviceForm.card),
    correct: toInputValue(row.correct ?? defaultDeviceForm.correct),
    createstaff: toInputValue(row.createstaff),
    createtime: toInputValue(row.createtime),
    departmentid: toInputValue(row.departmentid),
    devicearea: toInputValue(row.devicearea),
    devicetypeid: toInputValue(row.devicetypeid),
    face: toInputValue(row.face || defaultDeviceForm.face),
    imei: toInputValue(row.imei),
    lat: toInputValue(row.lat),
    lng: toInputValue(row.lng),
    maintenancestaff: toInputValue(row.maintenancestaff),
    name: toInputValue(row.name),
    onlinetime: toInputValue(row.onlinetime),
    operators: toInputValue(row.operators || row.Operators),
    phone: toInputValue(row.phone || defaultDeviceForm.phone),
    pic: toInputValue(row.pic),
    qrcode: toInputValue(row.qrcode || defaultDeviceForm.qrcode),
    ruleid: toInputValue(row.ruleid),
    serialnumber: toInputValue(row.serialnumber),
    status: toInputValue(row.status || defaultDeviceForm.status),
    updatestaff: toInputValue(row.updatestaff),
    updatetime: toInputValue(row.updatetime || row.upatetime),
  };
}

export function toDateValue(value?: string): Dayjs | null {
  return value ? dayjs(value) : null;
}

export function fromDateValue(value: Dayjs | null): string {
  return value ? value.format("YYYY-MM-DD") : "";
}

export function DeviceHeader({
  description,
  extra,
  icon,
  title,
}: DeviceHeaderProps) {
  return (
    <section className="react-device-header">
      <div className="react-device-header-main">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="react-device-header-side">
        {extra}
        <div className="react-device-header-icon">
          <img src={icon} alt="" />
        </div>
      </div>
    </section>
  );
}

export function DeviceState({
  description = "未查询到可展示的设备信息。",
  loading,
  title = "暂无设备信息",
}: DeviceStateProps) {
  return (
    <section className="react-device-state">
      {loading ? (
        <>
          <Spin size="large" />
          <span>加载中...</span>
        </>
      ) : (
        <>
          <Icon icon="ri:device-line" />
          <h3>{title}</h3>
          <p>{description}</p>
        </>
      )}
    </section>
  );
}

export function InfoItem({ className = "", label, value }: InfoItemProps) {
  return (
    <div className={`react-device-info-item ${className}`.trim()}>
      <dt>{label}</dt>
      <dd>{value ?? "暂无"}</dd>
    </div>
  );
}

export function DeviceStatusTag({ status }: { status?: unknown }) {
  const meta = getDeviceStatus(status);

  return <Tag color={meta.color}>{meta.label}</Tag>;
}

export function DateField({
  onChange,
  value,
}: {
  onChange?: (value: string) => void;
  value?: string;
}) {
  return (
    <DatePicker
      format="YYYY-MM-DD"
      placeholder="请选择日期"
      value={toDateValue(value)}
      onChange={(nextValue) => onChange?.(fromDateValue(nextValue))}
    />
  );
}

export function RadioButtons({
  options,
  value,
  onChange,
}: {
  onChange?: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value?: string;
}) {
  return (
    <Radio.Group
      optionType="button"
      options={options}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

function getBrowserCoordinate(): Promise<LngLat | null> {
  if (!navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 6_000,
      },
    );
  });
}

function convertGpsToBaidu(
  api: BaiduMapApi,
  coordinate: LngLat,
): Promise<LngLat> {
  if (!api.Convertor || !api.Point) {
    return Promise.resolve(coordinate);
  }

  return new Promise((resolve) => {
    try {
      const point = new api.Point(coordinate.lng, coordinate.lat);
      const convertor = new api.Convertor();

      convertor.translate?.([point], 1, 5, (result) => {
        const converted = normalizeLngLat(result.points?.[0]);

        resolve(result.status === 0 && converted ? converted : coordinate);
      });
    } catch {
      resolve(coordinate);
    }
  });
}

async function getInitialMapCenter(
  api: BaiduMapApi,
  coordinate: { lat?: string | number; lng?: string | number },
): Promise<LngLat> {
  const formCenter = normalizeLngLat(coordinate);

  if (formCenter) {
    return formCenter;
  }

  const browserCenter = await getBrowserCoordinate();

  if (browserCenter) {
    return convertGpsToBaidu(api, browserCenter);
  }

  return DEFAULT_DEVICE_MAP_CENTER;
}

function getPreciseAddress(result: GeocoderResult): string {
  const components = result.addressComponents || {};
  const streetAddress = [
    components.province,
    components.city,
    components.district,
    components.street,
    components.streetNumber,
  ]
    .filter(Boolean)
    .join("");

  if (streetAddress) {
    return streetAddress;
  }

  return (
    result.address ||
    result.surroundingPois?.find((item) => item.title)?.title ||
    result.business ||
    ""
  );
}

function getAddressByPoint(api: BaiduMapApi, point: unknown): Promise<string> {
  if (!api.Geocoder || !point) {
    return Promise.resolve("");
  }

  return new Promise((resolve) => {
    try {
      const geocoder = new api.Geocoder();

      geocoder.getLocation?.(point, (result) => {
        resolve(getPreciseAddress(result));
      });
    } catch {
      resolve("");
    }
  });
}

export function DeviceMapPicker({
  lat,
  lng,
  onChange,
  onOpenChange,
  open,
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<BaiduMapInstance | null>(null);
  const [readyToRenderMap, setReadyToRenderMap] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setReadyToRenderMap(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !readyToRenderMap || !containerRef.current) {
      return;
    }

    let disposed = false;
    let centerTimer: number | null = null;
    setLoading(true);

    loadBaiduMap()
      .then(async (api) => {
        if (disposed || !api || !containerRef.current) {
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();

        if (!rect.width || !rect.height) {
          window.requestAnimationFrame(() => {
            if (!disposed) {
              setReadyToRenderMap(false);
              window.requestAnimationFrame(() => {
                if (!disposed) {
                  setReadyToRenderMap(true);
                }
              });
            }
          });
          return;
        }

        const center = await getInitialMapCenter(api, { lng, lat });

        if (disposed || !containerRef.current) {
          return;
        }

        const map = createMap(containerRef.current, {
          center,
          scrollWheelZoom: true,
          zoom: 15,
        });
        mapRef.current = map;
        createMarker(map, center);

        if (!normalizeLngLat({ lng, lat })) {
          const centerPoint = api.Point
            ? new api.Point(center.lng, center.lat)
            : null;

          getAddressByPoint(api, centerPoint).then((address) => {
            if (!disposed && address) {
              onChange({
                address,
                lat: String(center.lat),
                lng: String(center.lng),
              });
            }
          });
        }

        map.addEventListener?.("click", (event) => {
          const point = (event as { point?: unknown })?.point;
          const nextPoint = normalizeLngLat(point);

          if (!point || !nextPoint) {
            return;
          }

          getAddressByPoint(api, point).then((address) => {
            onChange({
              address,
              lat: String(nextPoint.lat),
              lng: String(nextPoint.lng),
            });
            onOpenChange(false);
          });
        });

        centerTimer = window.setTimeout(() => {
          if (!disposed) {
            setCenter(map, center);
          }
        }, 80);
      })
      .catch(() => {
        message.error("百度地图加载失败");
      })
      .finally(() => {
        if (!disposed) {
          setLoading(false);
        }
      });

    return () => {
      disposed = true;
      if (centerTimer) {
        window.clearTimeout(centerTimer);
      }
      unbindBaiduMapTheme(mapRef.current);
      mapRef.current?.clearOverlays?.();
      mapRef.current = null;
    };
  }, [lat, lng, onChange, onOpenChange, open, readyToRenderMap]);

  return (
    <Modal
      className="react-device-map-modal"
      footer={null}
      open={open}
      title="选择地址"
      width="min(920px, calc(100vw - 64px))"
      onCancel={() => onOpenChange(false)}
      afterOpenChange={(visible) => {
        setReadyToRenderMap(visible);
      }}
    >
      <div className="react-device-map-picker">
        <div className="react-device-map-toolbar">
          <div>
            <Icon icon="ri:map-pin-line" />
            <span>点击地图选择设备安装地址</span>
          </div>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
        <div className="react-device-map-box">
          {loading ? (
            <div className="react-device-map-loading">
              <Spin />
              <span>地图加载中...</span>
            </div>
          ) : null}
          <div ref={containerRef} className="react-device-map-canvas" />
        </div>
      </div>
    </Modal>
  );
}

export function FormSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="react-device-section">
      <div className="react-device-section-header">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function BasicDeviceFields({
  form,
  setField,
}: {
  form: DeviceFormValues;
  setField: (field: keyof DeviceFormValues, value: string) => void;
}) {
  return (
    <div className="react-device-form-grid">
      <Form.Item label="设备编号" required>
        <Input
          placeholder="请输入设备编号"
          value={form.serialnumber}
          onChange={(event) => setField("serialnumber", event.target.value)}
        />
      </Form.Item>
      <Form.Item label="设备类型编号">
        <Input
          placeholder="请输入设备类型编号"
          value={form.devicetypeid}
          onChange={(event) => setField("devicetypeid", event.target.value)}
        />
      </Form.Item>
      <Form.Item label="设备名称">
        <Input
          placeholder="请输入设备名称"
          value={form.name}
          onChange={(event) => setField("name", event.target.value)}
        />
      </Form.Item>
      <Form.Item label="设备 IMEI">
        <Input
          placeholder="请输入设备 IMEI"
          value={form.imei}
          onChange={(event) => setField("imei", event.target.value)}
        />
      </Form.Item>
    </div>
  );
}

export function LoginCapabilityFields({
  form,
  setField,
}: {
  form: DeviceFormValues;
  setField: (field: keyof DeviceFormValues, value: string) => void;
}) {
  return (
    <div className="react-device-switch-grid">
      {[
        ["face", "人脸识别"],
        ["phone", "手机短信验证"],
        ["qrcode", "二维码登录"],
        ["card", "刷卡登录"],
      ].map(([field, label]) => (
        <Form.Item label={label} key={field}>
          <RadioButtons
            options={yesNoOptions}
            value={form[field as keyof DeviceFormValues]}
            onChange={(value) =>
              setField(field as keyof DeviceFormValues, value)
            }
          />
        </Form.Item>
      ))}
    </div>
  );
}
