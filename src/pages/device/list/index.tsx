import { message } from "@/utils/message";
import { Button, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDevices } from "../../../api/device";
import navDeviceQueryIcon from "../../../assets/images/nav-device-query.png";
import { useSafeAsync } from "../../../hooks/useSafeAsync";
import { createRouteQuery } from "../../../utils/routeQuery";
import {
  DeviceHeader,
  DeviceState,
  DeviceStatusTag,
  formatValue,
  getDeviceStatus,
  getRows,
  type DeviceRow,
} from "../shared";

export function DeviceListPage() {
  const navigate = useNavigate();
  const { run } = useSafeAsync();
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const summaryItems = useMemo(() => {
    const usingCount = rows.filter((item) => Number(item.status) === 2).length;
    const disabledCount = rows.filter((item) =>
      [3, 5].includes(Number(item.status)),
    ).length;
    const inactiveCount = rows.filter((item) => Number(item.status) === 6).length;

    return [
      { label: "设备总数", theme: "blue", value: rows.length },
      { label: "使用中", theme: "green", value: usingCount },
      { label: "异常/禁用", theme: "red", value: disabledCount },
      { label: "未激活", theme: "orange", value: inactiveCount },
    ];
  }, [rows]);

  useEffect(() => {
    setLoading(true);
    run((signal) => fetchDevices({ signal }), {
      onSuccess: (res) => {
        setRows(getRows<DeviceRow>(res));
      },
      onError: () => {
        setRows([]);
        message.error("设备信息加载失败");
      },
      onFinally: () => setLoading(false),
    });
  }, [run]);

  function openDeviceDetail(index: number) {
    navigate(`/devices/detail${createRouteQuery({ i: index })}`);
  }

  function openDeviceUpdate(index: number) {
    navigate(`/devices/update${createRouteQuery({ i: index })}`);
  }

  return (
    <div className="react-device-page">
      <DeviceHeader
        description="查看设备列表，进入详情或修改设备信息。"
        extra={<Tag color="blue">{rows.length} 台</Tag>}
        icon={navDeviceQueryIcon}
        title="查看设备"
      />

      <section className="react-device-summary-grid">
        {summaryItems.map((item) => (
          <article
            className={`react-device-summary-card theme-${item.theme}`}
            key={item.label}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="react-device-panel">
        {loading ? (
          <DeviceState loading />
        ) : rows.length ? (
          <div className="react-device-grid">
            {rows.map((item, index) => (
              <article
                className="react-device-card"
                key={String(item.id || item.serialnumber || index)}
              >
                <div className="react-device-card-header">
                  <div>
                    <span>设备编号</span>
                    <strong>{formatValue(item.serialnumber, "-")}</strong>
                  </div>
                  <DeviceStatusTag status={item.status} />
                </div>

                <dl className="react-device-meta">
                  <div className="react-device-info-item react-device-full-field">
                    <dt>地址</dt>
                    <dd>{formatValue(item.address, "-")}</dd>
                  </div>
                  <div className="react-device-info-item">
                    <dt>设备名称</dt>
                    <dd>{formatValue(item.name, "-")}</dd>
                  </div>
                  <div className="react-device-info-item">
                    <dt>设备状态</dt>
                    <dd>{getDeviceStatus(item.status).label}</dd>
                  </div>
                </dl>

                <div className="react-device-card-actions">
                  <Button
                    type="primary"
                    onClick={() => openDeviceDetail(index)}
                  >
                    <Icon icon="ri:file-list-3-line" />
                    详情
                  </Button>
                  <Button
                    color="green"
                    variant="solid"
                    onClick={() => openDeviceUpdate(index)}
                  >
                    <Icon icon="ri:edit-line" />
                    修改
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <DeviceState
            description="当前还没有设备记录。"
            title="暂无设备信息"
          />
        )}
      </section>
    </div>
  );
}
