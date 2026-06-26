import { message } from "@/utils/message";
import { Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchDevices, getImageUrl } from "../../../api/device";
import navDeviceQueryIcon from "../../../assets/images/nav-device-query.png";
import { useRouteQueryValue } from "../../../hooks/useRouteQueryValue";
import {
  DeviceHeader,
  DeviceState,
  DeviceStatusTag,
  FormSection,
  InfoItem,
  formatValue,
  getRows,
  type DeviceRow,
} from "../shared";

function CapabilityItem({
  active,
  label,
}: {
  active?: boolean;
  label: string;
}) {
  return (
    <article
      className={
        active
          ? "react-device-capability-card active"
          : "react-device-capability-card"
      }
    >
      <span>{label}</span>
      <Tag color={active ? "green" : "default"}>
        {active ? "已开启" : "未开启"}
      </Tag>
    </article>
  );
}

export function DeviceDetailPage() {
  const [searchParams] = useSearchParams();
  const [device, setDevice] = useState<DeviceRow | null>(null);
  const [loading, setLoading] = useState(false);
  const deviceIndex = Number(
    useRouteQueryValue(searchParams, ["i", "index", "arrindex"]) || 0,
  );

  const picUrl = useMemo(
    () => (device?.pic ? getImageUrl(String(device.pic)) : ""),
    [device?.pic],
  );
  const overviewItems = [
    { label: "设备类型编号", value: formatValue(device?.devicetypeid) },
    { label: "设备区域", value: formatValue(device?.devicearea) },
    { label: "最后在线", value: formatValue(device?.onlinetime) },
  ];

  useEffect(() => {
    setLoading(true);
    fetchDevices()
      .then((res) => {
        const rows = getRows<DeviceRow>(res);
        setDevice(rows[deviceIndex] || null);
      })
      .catch(() => {
        setDevice(null);
        message.error("设备信息加载失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [deviceIndex]);

  if (loading) {
    return (
      <div className="react-device-page">
        <DeviceHeader
          description="查看设备基础信息、登录能力、人员时间、状态与安装位置。"
          icon={navDeviceQueryIcon}
          title="设备详情"
        />
        <DeviceState loading />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="react-device-page">
        <DeviceHeader
          description="查看设备基础信息、登录能力、人员时间、状态与安装位置。"
          icon={navDeviceQueryIcon}
          title="设备详情"
        />
        <DeviceState description="未查询到当前设备详情。" />
      </div>
    );
  }

  return (
    <div className="react-device-page">
      <DeviceHeader
        description="查看设备基础信息、登录能力、人员时间、状态与安装位置。"
        icon={navDeviceQueryIcon}
        title="设备详情"
      />

      <section className="react-device-section react-device-overview">
        <div className="react-device-main">
          <div className="react-device-avatar">
            {picUrl ? (
              <img src={picUrl} alt="" />
            ) : (
              <Icon icon="ri:base-station-line" />
            )}
          </div>
          <div>
            <DeviceStatusTag status={device.status} />
            <h2>{formatValue(device.name)}</h2>
            <p>{formatValue(device.serialnumber)}</p>
          </div>
        </div>

        <div className="react-device-overview-grid">
          {overviewItems.map((item) => (
            <InfoItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <FormSection title="基本信息">
        <dl className="react-device-detail-grid">
          <InfoItem label="设备编号" value={formatValue(device.serialnumber)} />
          <InfoItem label="设备类型编号" value={formatValue(device.devicetypeid)} />
          <InfoItem label="设备名称" value={formatValue(device.name)} />
          <InfoItem label="设备 IMEI" value={formatValue(device.imei)} />
          {picUrl ? (
            <InfoItem
              className="react-device-full-field"
              label="设备图片"
              value={<img className="react-device-image" src={picUrl} alt="" />}
            />
          ) : null}
        </dl>
      </FormSection>

      <FormSection title="登录方式">
        <div className="react-device-capability-grid">
          <CapabilityItem active={device.face === "1"} label="人脸识别" />
          <CapabilityItem active={device.phone === "1"} label="手机短信验证" />
          <CapabilityItem active={device.qrcode === "1"} label="二维码登录" />
          <CapabilityItem active={device.card === "1"} label="刷卡登录" />
        </div>
      </FormSection>

      <FormSection title="人员与时间">
        <dl className="react-device-detail-grid">
          <InfoItem label="设备区域" value={formatValue(device.devicearea)} />
          <InfoItem label="维护人员" value={formatValue(device.maintenancestaff)} />
          <InfoItem label="运营人员" value={formatValue(device.operators)} />
          <InfoItem label="创建时间" value={formatValue(device.createtime)} />
          <InfoItem label="创建人" value={formatValue(device.createstaff)} />
          <InfoItem label="修改时间" value={formatValue(device.upatetime)} />
          <InfoItem label="修改人" value={formatValue(device.updatestaff)} />
          <InfoItem label="激活时间" value={formatValue(device.activationtime)} />
          <InfoItem label="最后在线时间" value={formatValue(device.onlinetime)} />
        </dl>
      </FormSection>

      <FormSection title="状态与位置">
        <dl className="react-device-detail-grid">
          <InfoItem label="状态" value={<DeviceStatusTag status={device.status} />} />
          <InfoItem
            label="是否激活"
            value={
              <Tag color={device.activation === "1" ? "green" : "default"}>
                {device.activation === "1" ? "是" : "否"}
              </Tag>
            }
          />
          <InfoItem
            label="是否校准"
            value={
              <Tag color={device.correct === "0" ? "green" : "default"}>
                {device.correct === "0" ? "是" : "否"}
              </Tag>
            }
          />
          <InfoItem
            className="react-device-full-field"
            label="安装地址"
            value={formatValue(device.address)}
          />
          <InfoItem label="经度" value={formatValue(device.lng)} />
          <InfoItem label="纬度" value={formatValue(device.lat)} />
          <InfoItem label="所属部门" value={formatValue(device.departmentid)} />
          <InfoItem label="运营规则 ID" value={formatValue(device.ruleid)} />
        </dl>
      </FormSection>

    </div>
  );
}
