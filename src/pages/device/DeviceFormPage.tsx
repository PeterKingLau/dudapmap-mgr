import { message } from "@/utils/message";
import { Button, Form, Input, Upload } from "antd";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  addDevice,
  fetchDevices,
  updateDevice,
  uploadFile,
} from "../../api/device";
import deviceAddIcon from "../../assets/images/device-add.png";
import navDeviceQueryIcon from "../../assets/images/nav-device-query.png";
import { useRouteQueryValue } from "../../hooks/useRouteQueryValue";
import {
  BasicDeviceFields,
  DateField,
  DeviceHeader,
  DeviceMapPicker,
  DeviceState,
  FormSection,
  LoginCapabilityFields,
  RadioButtons,
  correctOptions,
  defaultDeviceForm,
  getRows,
  normalizeDeviceForm,
  statusOptions,
  yesNoOptions,
  type DeviceFormValues,
  type DeviceRow,
} from "./shared";

const { TextArea } = Input;

type DeviceFormPageProps = {
  mode: "create" | "update";
};

function getInitialForm() {
  return { ...defaultDeviceForm };
}

export function DeviceFormPage({ mode }: DeviceFormPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<DeviceFormValues>(getInitialForm);
  const [sourceDevice, setSourceDevice] = useState<DeviceRow | null>(null);
  const [loading, setLoading] = useState(mode === "update");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigateTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const deviceIndex = Number(
    useRouteQueryValue(searchParams, ["i", "index", "arrindex"]) || 0,
  );
  const isCreate = mode === "create";

  const setField = useCallback(
    (field: keyof DeviceFormValues, value: string) => {
      if (!mountedRef.current) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  useEffect(
    () => () => {
      mountedRef.current = false;

      if (navigateTimerRef.current) {
        window.clearTimeout(navigateTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (isCreate) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDevices()
      .then((res) => {
        if (!mountedRef.current) {
          return;
        }

        const rows = getRows<DeviceRow>(res);
        const row = rows[deviceIndex] || null;

        setSourceDevice(row);
        setForm(normalizeDeviceForm(row || {}));
      })
      .catch(() => {
        if (!mountedRef.current) {
          return;
        }

        setSourceDevice(null);
        message.error("设备信息加载失败");
      })
      .finally(() => {
        if (mountedRef.current) {
          setLoading(false);
        }
      });
  }, [deviceIndex, isCreate]);

  function resetForm() {
    setForm(getInitialForm());
    setSourceDevice(null);
    message.success("表单已重置");
  }

  function buildPayload() {
    return {
      ...(sourceDevice || {}),
      ...form,
      Operators: form.operators,
      operators: form.operators,
      upatetime: form.updatetime,
    };
  }

  function submit() {
    if (!form.serialnumber.trim()) {
      message.warning("请填写设备编号");
      return;
    }

    setSubmitLoading(true);
    const request = isCreate ? addDevice : updateDevice;

    request(buildPayload())
      .then((res) => {
        if ((res as { data?: unknown })?.data === true) {
          message.success(isCreate ? "提交成功" : "修改成功");
          navigateTimerRef.current = window.setTimeout(
            () => navigate("/devices"),
            800,
          );
          return;
        }

        message.error(isCreate ? "提交失败，请稍后重试" : "修改失败，请稍后重试");
      })
      .catch(() => {
        message.error(isCreate ? "提交失败，请稍后重试" : "修改失败，请稍后重试");
      })
      .finally(() => {
        if (mountedRef.current) {
          setSubmitLoading(false);
        }
      });
  }

  function uploadDeviceImage(option: {
    file?: File;
    onError?: (error?: unknown) => void;
    onSuccess?: (response?: unknown) => void;
  }) {
    const rawFile = option.file;

    if (!rawFile) {
      option.onError?.();
      return;
    }

    const formData = new FormData();
    formData.append("fileImage", rawFile);
    setUploading(true);

    uploadFile(formData, {
      headers: {
        "content-type": "multipart/form-data",
      },
    })
      .then((res) => {
        if ((res as { status?: number })?.status === 200) {
          const fileName = String((res as { data?: unknown }).data || "");
          setField("pic", fileName);
          option.onSuccess?.(res);
          return;
        }

        option.onError?.(res);
      })
      .catch((error) => {
        option.onError?.(error);
      })
      .finally(() => {
        if (mountedRef.current) {
          setUploading(false);
        }
      });
  }

  if (loading) {
    return (
      <div className="react-device-page">
        <DeviceHeader
          description="维护设备基础信息、登录方式、人员时间、状态与安装位置。"
          icon={isCreate ? deviceAddIcon : navDeviceQueryIcon}
          title={isCreate ? "设备增加" : "修改设备"}
        />
        <DeviceState loading />
      </div>
    );
  }

  if (!isCreate && !sourceDevice) {
    return (
      <div className="react-device-page">
        <DeviceHeader
          description="维护设备基础信息、登录方式、人员时间、状态与安装位置。"
          icon={navDeviceQueryIcon}
          title="修改设备"
        />
        <DeviceState description="未查询到可修改的设备信息。" />
      </div>
    );
  }

  return (
    <div className="react-device-page">
      <DeviceHeader
        description={
          isCreate
            ? "录入设备基础信息、登录能力、归属位置和状态配置。"
            : "维护设备基础信息、登录方式、人员时间、状态与安装位置。"
        }
        icon={isCreate ? deviceAddIcon : navDeviceQueryIcon}
        title={isCreate ? "设备增加" : "修改设备"}
      />

      <Form className="react-device-form" layout="vertical">
        <FormSection title="基本信息">
          <BasicDeviceFields form={form} setField={setField} />
          {isCreate ? (
            <Form.Item className="react-device-full-field" label="设备图片">
              <Upload
                accept="image/*"
                customRequest={(option) =>
                  uploadDeviceImage(option as unknown as { file?: File })
                }
                listType="picture-card"
                maxCount={1}
                showUploadList
              >
                {form.pic ? null : (
                  <div>
                    <Icon icon="ri:upload-cloud-2-line" />
                    <div style={{ marginTop: 8 }}>
                      {uploading ? "上传中" : "上传"}
                    </div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          ) : null}
        </FormSection>

        <FormSection title="登录方式">
          <LoginCapabilityFields form={form} setField={setField} />
        </FormSection>

        <FormSection title="人员与时间">
          <div className="react-device-form-grid">
            <Form.Item label="设备区域">
              <Input
                placeholder="请输入设备区域"
                value={form.devicearea}
                onChange={(event) => setField("devicearea", event.target.value)}
              />
            </Form.Item>
            <Form.Item label="维护人员">
              <Input
                placeholder="请输入维护人员"
                value={form.maintenancestaff}
                onChange={(event) =>
                  setField("maintenancestaff", event.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="运营人员">
              <Input
                placeholder="请输入运营人员"
                value={form.operators}
                onChange={(event) => setField("operators", event.target.value)}
              />
            </Form.Item>
            <Form.Item label="创建时间">
              <DateField
                value={form.createtime}
                onChange={(value) => setField("createtime", value)}
              />
            </Form.Item>
            <Form.Item label="创建人">
              <Input
                placeholder="请输入创建人"
                value={form.createstaff}
                onChange={(event) => setField("createstaff", event.target.value)}
              />
            </Form.Item>
            <Form.Item label="修改时间">
              <DateField
                value={form.updatetime}
                onChange={(value) => setField("updatetime", value)}
              />
            </Form.Item>
            <Form.Item label="修改人">
              <Input
                placeholder="请输入修改人"
                value={form.updatestaff}
                onChange={(event) => setField("updatestaff", event.target.value)}
              />
            </Form.Item>
            <Form.Item label="激活时间">
              <DateField
                value={form.activationtime}
                onChange={(value) => setField("activationtime", value)}
              />
            </Form.Item>
            <Form.Item label="最后在线时间">
              <DateField
                value={form.onlinetime}
                onChange={(value) => setField("onlinetime", value)}
              />
            </Form.Item>
          </div>
        </FormSection>

        <FormSection title="位置与归属">
          <div className="react-device-form-grid">
            <Form.Item className="react-device-full-field" label="安装地址">
              <div className="react-device-address-field">
                <TextArea
                  autoSize={{ maxRows: 4, minRows: 2 }}
                  placeholder="请选择或输入设备安装地址"
                  value={form.address}
                  onChange={(event) => setField("address", event.target.value)}
                />
                <Button onClick={() => setMapOpen(true)}>
                  <Icon icon="ri:map-pin-line" />
                  地图选点
                </Button>
              </div>
            </Form.Item>
            <Form.Item label="经度">
              <Input
                placeholder="经度"
                value={form.lng}
                onChange={(event) => setField("lng", event.target.value)}
              />
            </Form.Item>
            <Form.Item label="纬度">
              <Input
                placeholder="纬度"
                value={form.lat}
                onChange={(event) => setField("lat", event.target.value)}
              />
            </Form.Item>
            <Form.Item label="所属部门">
              <Input
                placeholder="请输入所属部门"
                value={form.departmentid}
                onChange={(event) =>
                  setField("departmentid", event.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="运营规则 ID">
              <Input
                placeholder="请输入运营规则 ID"
                value={form.ruleid}
                onChange={(event) => setField("ruleid", event.target.value)}
              />
            </Form.Item>
          </div>
        </FormSection>

        <FormSection title="状态配置">
          <div className="react-device-status-grid">
            <Form.Item label="状态">
              <RadioButtons
                options={statusOptions}
                value={form.status}
                onChange={(value) => setField("status", value)}
              />
            </Form.Item>
            <Form.Item label="是否激活">
              <RadioButtons
                options={yesNoOptions}
                value={form.activation}
                onChange={(value) => setField("activation", value)}
              />
            </Form.Item>
            <Form.Item label="是否校准">
              <RadioButtons
                options={correctOptions}
                value={form.correct}
                onChange={(value) => setField("correct", value)}
              />
            </Form.Item>
          </div>
        </FormSection>

        <div className="react-device-bottom-actions">
          <Button onClick={() => navigate("/devices")}>取消</Button>
          {isCreate ? <Button onClick={resetForm}>重置</Button> : null}
          <Button loading={submitLoading} type="primary" onClick={submit}>
            {isCreate ? "提交" : "修改"}
          </Button>
        </div>
      </Form>

      <DeviceMapPicker
        lat={form.lat}
        lng={form.lng}
        open={mapOpen}
        onChange={({ address, lat, lng }) => {
          setForm((prev) => ({
            ...prev,
            address,
            lat,
            lng,
          }));
        }}
        onOpenChange={setMapOpen}
      />
    </div>
  );
}
