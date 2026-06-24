<template>
  <div class="equipment-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>设备增加</h1>
          <p>录入设备基础信息、登录能力、归属位置和状态配置。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/device-add.png" alt="" />
      </div>
    </section>

    <AForm class="equipment-form" :model="form" layout="vertical">
      <section class="form-section">
        <div class="section-header">
          <h2>基本信息</h2>
        </div>
        <div class="form-grid">
          <AFormItem
            field="serialnumber"
            label="设备编号"
            required
            :validate-status="serialError ? 'error' : undefined"
            :help="serialError ? '请填写设备编号' : undefined"
          >
            <AInput v-model="form.serialnumber" placeholder="请输入设备编号" />
          </AFormItem>
          <AFormItem field="devicetypeid" label="类型编号">
            <AInput
              v-model="form.devicetypeid"
              placeholder="请输入设备类型编号"
            />
          </AFormItem>
          <AFormItem field="name" label="设备名称">
            <AInput v-model="form.name" placeholder="请输入设备名称" />
          </AFormItem>
          <AFormItem field="imei" label="设备 IMEI">
            <AInput v-model="form.imei" placeholder="请输入设备 IMEI" />
          </AFormItem>
          <AFormItem class="upload-item" field="pic" label="设备图片">
            <AUpload
              v-model:file-list="pic"
              accept="image/*"
              image-preview
              list-type="picture-card"
              :limit="1"
              :custom-request="uploadDeviceImage"
            />
          </AFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2>登录方式</h2>
        </div>
        <div class="switch-grid">
          <AFormItem label="人脸识别">
            <ARadioGroup v-model="form.face" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="短信验证">
            <ARadioGroup v-model="form.phone" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="二维码登录">
            <ARadioGroup v-model="form.qrcode" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="刷卡登录">
            <ARadioGroup v-model="form.card" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2>人员与时间</h2>
        </div>
        <div class="form-grid">
          <AFormItem field="maintenancestaff" label="维护人员">
            <AInput
              v-model="form.maintenancestaff"
              placeholder="请输入维护人员"
            />
          </AFormItem>
          <AFormItem field="Operators" label="运营人员">
            <AInput v-model="form.Operators" placeholder="请输入运营人员" />
          </AFormItem>
          <AFormItem field="createtime" label="创建时间">
            <ADatePicker
              v-model="form.createtime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择创建时间"
            />
          </AFormItem>
          <AFormItem field="createstaff" label="创建人">
            <AInput v-model="form.createstaff" placeholder="请输入创建人" />
          </AFormItem>
          <AFormItem field="updatetime" label="修改时间">
            <ADatePicker
              v-model="form.updatetime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择修改时间"
            />
          </AFormItem>
          <AFormItem field="updatestaff" label="修改人">
            <AInput v-model="form.updatestaff" placeholder="请输入修改人" />
          </AFormItem>
          <AFormItem field="activationtime" label="激活时间">
            <ADatePicker
              v-model="form.activationtime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择激活时间"
            />
          </AFormItem>
          <AFormItem field="onlinetime" label="最后在线">
            <ADatePicker
              v-model="form.onlinetime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择最后在线时间"
            />
          </AFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2>位置与归属</h2>
        </div>
        <div class="form-grid">
          <AFormItem field="devicearea" label="设备区域">
            <AInput v-model="form.devicearea" placeholder="请输入设备区域" />
          </AFormItem>
          <AFormItem class="full-field" field="address" label="安装地址">
            <div class="address-field">
              <ATextarea
                v-model="addressModel"
                placeholder="请选择或输入设备安装地址"
                :auto-size="{ minRows: 2, maxRows: 4 }"
              />
              <AButton type="outline" class="map-btn" @click="getLnglat">
                <template #icon>
                  <Icon icon="ri:map-pin-line" />
                </template>
                地图选点
              </AButton>
            </div>
          </AFormItem>
          <AFormItem field="lat" label="纬度">
            <AInput v-model="latModel" placeholder="纬度" />
          </AFormItem>
          <AFormItem field="lng" label="经度">
            <AInput v-model="lngModel" placeholder="经度" />
          </AFormItem>
          <AFormItem field="departmentid" label="所属部门">
            <AInput
              v-model="form.departmentid"
              placeholder="请输入设备所属部门"
            />
          </AFormItem>
          <AFormItem field="ruleid" label="规则 ID">
            <AInput v-model="form.ruleid" placeholder="请输入运营规则 ID" />
          </AFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2>状态配置</h2>
        </div>
        <div class="status-layout">
          <AFormItem label="状态">
            <ARadioGroup v-model="form.status" type="button">
              <ARadio
                v-for="item in statusOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="是否激活">
            <ARadioGroup v-model="form.activation" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="是否校准">
            <ARadioGroup v-model="form.correct" type="button">
              <ARadio value="0">是</ARadio>
              <ARadio value="1">否</ARadio>
            </ARadioGroup>
          </AFormItem>
        </div>
      </section>

      <div class="form-actions">
        <AButton @click="closePage">取消</AButton>
        <AButton @click="resetForm">重置</AButton>
        <AButton type="primary" :loading="submitLoading" @click="onSubmit">
          提交
        </AButton>
      </div>
    </AForm>

    <AModal
      v-model:visible="lngLatShow"
      :footer="false"
      modal-class="map-picker-modal"
      title="选择地址"
    >
      <div class="map-popup">
        <div class="map-popup-toolbar">
          <div>
            <img src="../../assets/images/icon-location.png" alt="" />
            <span>点击地图选择设备安装地址</span>
          </div>
          <AButton @click="lngLatShow = false">关闭</AButton>
        </div>
        <BaiduMap
          class="map"
          :center="mapCenter"
          :zoom="15"
          :scroll-wheel-zoom="true"
          @ready="handler"
          @click="getMapInfos"
        >
          <BmMarker
            v-if="mapCenter.lng && mapCenter.lat"
            :position="mapCenter"
          />
        </BaiduMap>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { BaiduMap, BmMarker } from "vue-baidu-map-3x";
import { Message } from "@arco-design/web-vue";
import { addDevice, uploadFile as uploadDeviceFile } from "../../api/device";
import { useAppStore } from "../../store";

const DEFAULT_MAP_CENTER = { lng: 116.404, lat: 39.915 };

const router = useRouter();
const appStore = useAppStore();

const pic = ref([]);
const picImg = ref("");
const serialError = ref(false);
const submitLoading = ref(false);
const lngLatShow = ref(false);
const mapCenter = reactive({ ...DEFAULT_MAP_CENTER });
const baiduMapApi = ref(null);
const baiduMap = ref(null);

const defaultForm = {
  serialnumber: "",
  devicetypeid: "",
  name: "",
  face: "1",
  phone: "1",
  qrcode: "1",
  card: "1",
  maintenancestaff: "",
  Operators: "",
  createtime: "",
  createstaff: "",
  updatetime: "",
  updatestaff: "",
  imei: "",
  activationtime: "",
  onlinetime: "",
  devicearea: "",
  departmentid: "",
  ruleid: "",
  status: "1",
  activation: "1",
  correct: "0",
};

const form = reactive({ ...defaultForm });

const statusOptions = [
  { label: "待使用", value: "1" },
  { label: "使用中", value: "2" },
  { label: "已禁用", value: "3" },
  { label: "故障", value: "4" },
  { label: "已欠费", value: "5" },
  { label: "未激活", value: "6" },
];

onMounted(() => {
  resetLocationState();
});

const addressModel = computed({
  get: () => appStore.address,
  set: (value) => appStore.updateAddress(value),
});

function toInputValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

const latModel = computed({
  get: () => toInputValue(appStore.center.lat),
  set: (value) =>
    appStore.updateCenter({
      lat: value,
      lng: appStore.center.lng,
    }),
});

const lngModel = computed({
  get: () => toInputValue(appStore.center.lng),
  set: (value) =>
    appStore.updateCenter({
      lat: appStore.center.lat,
      lng: value,
    }),
});

function closePage() {
  router.back();
}

function resetLocationState() {
  mapCenter.lng = DEFAULT_MAP_CENTER.lng;
  mapCenter.lat = DEFAULT_MAP_CENTER.lat;
  appStore.updateAddress("");
  appStore.updateCenter({ lat: "", lng: "" });
}

function resetForm() {
  Object.assign(form, defaultForm);
  pic.value = [];
  picImg.value = "";
  serialError.value = false;
  resetLocationState();
  Message.success("表单已重置");
}

function buildSubmitPayload() {
  return {
    ...form,
    pic: picImg.value,
    address: addressModel.value,
    lat: latModel.value,
    lng: lngModel.value,
  };
}

function onSubmit() {
  serialError.value = !form.serialnumber;

  if (serialError.value) {
    Message.warning("请填写设备编号");
    return;
  }

  submitLoading.value = true;
  addDevice(buildSubmitPayload())
    .then((res) => {
      if (res.data === true) {
        Message.success("提交成功");
        window.setTimeout(() => {
          router.back();
        }, 800);
        return;
      }

      Message.error("提交失败，请稍后重试");
    })
    .catch(() => {
      Message.error("提交失败，请稍后重试");
    })
    .finally(() => {
      submitLoading.value = false;
    });
}

function uploadDeviceImage(option) {
  const rawFile = option.fileItem?.file || option.file;

  if (!rawFile) {
    option.onError?.();
    return;
  }

  const formData = new FormData();
  formData.append("fileImage", rawFile);

  uploadDeviceFile(formData, {
    headers: {
      "content-type": "multipart/form-data",
    },
  })
    .then((res) => {
      if (res.status === 200) {
        picImg.value = res.data;
        option.onSuccess?.(res);
        return;
      }

      option.onError?.(res);
    })
    .catch((error) => {
      option.onError?.(error);
    });
}

function getLnglat() {
  lngLatShow.value = true;
}

function handler({ BMap, map }) {
  baiduMapApi.value = BMap;
  baiduMap.value = map;
}

function getMapInfos(event) {
  const BMapCtor = baiduMapApi.value || window.BMap;

  if (!BMapCtor || !event?.point) {
    return;
  }

  const geocoder = new BMapCtor.Geocoder();
  geocoder.getLocation(event.point, (res) => {
    const center = {
      lng: event.point.lng,
      lat: event.point.lat,
    };

    mapCenter.lng = center.lng;
    mapCenter.lat = center.lat;
    appStore.updateAddress(res.address);
    appStore.updateCenter(center);
    lngLatShow.value = false;
  });
}
</script>

<style lang="scss" scoped>
.equipment-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

.page-header {
  padding: 24px 32px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;

  h1 {
    margin: 0;
    color: #202124;
    font-size: 24px;
    line-height: 32px;
    font-weight: 500;
  }

  p {
    margin: 4px 0 0;
    color: #5f6368;
    font-size: 14px;
    line-height: 20px;
  }
}

.back-button {
  flex: none;
  color: #5f6368;
  border-radius: 6px;
  height: 36px;
  padding: 0 12px;

  &:hover {
    background-color: #f1f3f4;
    color: #202124;
  }

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #e8f0fe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.equipment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  padding: 24px 32px 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
  text-align: left;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 24px;
}

.full-field,
.upload-item {
  grid-column: 1 / -1;
}

.address-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 16px;
}

.map-btn {
  height: 32px;
  border-color: #dadce0;
  color: #1a73e8;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d2e3fc;
  }
}

.switch-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 24px;
}

.status-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(180px, 1fr) minmax(180px, 1fr);
  gap: 8px 24px;

  :deep(.arco-radio-group) {
    flex-wrap: wrap;
    gap: 8px 0;
  }
}

.equipment-form {
  :deep(.arco-picker),
  :deep(.arco-input-wrapper),
  :deep(.arco-textarea-wrapper) {
    width: 100%;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f4;
    }

    &.arco-input-focus,
    &.arco-textarea-focus,
    &.arco-picker-focused {
      background-color: #ffffff;
      border-color: #1a73e8;
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
    }
  }

  :deep(.arco-form-item-label-col) {
    margin-bottom: 8px;

    > label {
      color: #5f6368;
      font-size: 13px;
      font-weight: 400;
    }
  }
}

.form-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 16px 24px;
  margin: 0 -24px -24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(241, 243, 244, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid #dadce0;
}

.map-popup {
  height: min(68vh, 560px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-popup-toolbar {
  height: 56px;
  padding-bottom: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: none;

  > div {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #202124;
    font-size: 15px;
    font-weight: 500;
  }

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
}

.map {
  flex: 1;
  min-height: 0;
  border: 1px solid #dadce0;
  border-radius: 8px;
  overflow: hidden;

  :deep(.anchorBL) {
    left: 10px !important;
    bottom: 10px !important;
  }
}

:global(.map-picker-modal .arco-modal) {
  width: min(920px, calc(100vw - 64px));
  border-radius: 8px;
}

:global(.map-picker-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.map-picker-modal .arco-modal-title) {
  color: #202124;
  font-weight: 500;
  font-size: 16px;
}

:global(.map-picker-modal .arco-modal-body) {
  padding: 24px;
}

@media (max-width: 1180px) {
  .form-grid,
  .switch-grid,
  .status-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
