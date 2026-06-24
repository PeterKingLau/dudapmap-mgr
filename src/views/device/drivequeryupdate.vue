<template>
  <div class="device-update-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="backUrl">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>修改设备</h1>
          <p>维护设备基础信息、登录方式、人员时间、状态与安装位置。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/nav-device-query.png" alt="" />
      </div>
    </section>

    <section v-if="loading" class="state-section">
      <ASpin :size="28" />
      <span>加载中...</span>
    </section>

    <section v-else-if="!hasDevice" class="state-section">
      <Icon icon="ri:device-line" />
      <h3>暂无设备信息</h3>
      <p>未查询到可修改的设备信息。</p>
    </section>

    <AForm v-else class="device-form" :model="device" layout="vertical">
      <section class="form-section">
        <div class="section-header">
          <h2>基本信息</h2>
        </div>
        <div class="form-grid">
          <AFormItem field="serialnumber" label="设备编号">
            <AInput
              v-model="device.serialnumber"
              placeholder="请输入设备编号"
            />
          </AFormItem>
          <AFormItem field="devicetypeid" label="设备类型编号">
            <AInput
              v-model="device.devicetypeid"
              placeholder="请输入设备类型编号"
            />
          </AFormItem>
          <AFormItem field="name" label="设备名称">
            <AInput v-model="device.name" placeholder="请输入设备名称" />
          </AFormItem>
          <AFormItem field="imei" label="设备 IMEI">
            <AInput v-model="device.imei" placeholder="请输入设备 IMEI" />
          </AFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2>登录方式</h2>
        </div>
        <div class="switch-grid">
          <AFormItem label="人脸识别">
            <ARadioGroup v-model="device.face" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="短信验证">
            <ARadioGroup v-model="device.phone" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="二维码登录">
            <ARadioGroup v-model="device.qrcode" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="刷卡登录">
            <ARadioGroup v-model="device.card" type="button">
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
          <AFormItem field="devicearea" label="设备区域">
            <AInput v-model="device.devicearea" placeholder="请输入设备区域" />
          </AFormItem>
          <AFormItem field="maintenancestaff" label="维护人员">
            <AInput
              v-model="device.maintenancestaff"
              placeholder="请输入维护人员"
            />
          </AFormItem>
          <AFormItem field="operators" label="运营人员">
            <AInput v-model="device.operators" placeholder="请输入运营人员" />
          </AFormItem>
          <AFormItem field="createtime" label="创建时间">
            <ADatePicker
              v-model="device.createtime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择创建时间"
            />
          </AFormItem>
          <AFormItem field="createstaff" label="创建人">
            <AInput v-model="device.createstaff" placeholder="请输入创建人" />
          </AFormItem>
          <AFormItem field="upatetime" label="修改时间">
            <ADatePicker
              v-model="device.upatetime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择修改时间"
            />
          </AFormItem>
          <AFormItem field="updatestaff" label="修改人">
            <AInput v-model="device.updatestaff" placeholder="请输入修改人" />
          </AFormItem>
          <AFormItem field="activationtime" label="激活时间">
            <ADatePicker
              v-model="device.activationtime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择激活时间"
            />
          </AFormItem>
          <AFormItem field="onlinetime" label="最后在线">
            <ADatePicker
              v-model="device.onlinetime"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择最后在线时间"
            />
          </AFormItem>
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2>状态与位置</h2>
        </div>
        <div class="status-layout">
          <AFormItem label="状态">
            <ARadioGroup v-model="device.status" type="button">
              <ARadio
                v-for="item in statusOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.text }}
              </ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="是否激活">
            <ARadioGroup v-model="device.activation" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="2">否</ARadio>
            </ARadioGroup>
          </AFormItem>
          <AFormItem label="是否校准">
            <ARadioGroup v-model="device.correct" type="button">
              <ARadio value="0">是</ARadio>
              <ARadio value="1">否</ARadio>
            </ARadioGroup>
          </AFormItem>
        </div>

        <div class="form-grid location-grid">
          <AFormItem class="full-field" field="address" label="安装地址">
            <ATextarea
              v-model="device.address"
              placeholder="请输入设备安装地址"
              :auto-size="{ minRows: 2, maxRows: 4 }"
            />
          </AFormItem>
          <AFormItem field="lat" label="纬度">
            <AInput v-model="device.lat" placeholder="请输入纬度" />
          </AFormItem>
          <AFormItem field="lng" label="经度">
            <AInput v-model="device.lng" placeholder="请输入经度" />
          </AFormItem>
          <AFormItem field="departmentid" label="所属部门">
            <AInput
              v-model="device.departmentid"
              placeholder="请输入设备所属部门"
            />
          </AFormItem>
          <AFormItem field="ruleid" label="运营规则 ID">
            <AInput v-model="device.ruleid" placeholder="请输入运营规则 ID" />
          </AFormItem>
        </div>
      </section>

      <div class="page-actions">
        <AButton @click="backUrl">返回</AButton>
        <AButton type="primary" :loading="submitLoading" @click="onSubmit">
          修改
        </AButton>
      </div>
    </AForm>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchDevices, updateDevice } from "../../api/device";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const submitLoading = ref(false);
const device = ref({});
const picImgUplate = ref("");
const undateImg = ref(false);
const deviceIndex = computed(() => Number(route.query.arrindex || 0));
const hasDevice = computed(() => Object.keys(device.value).length > 0);

const statusOptions = [
  { text: "待使用", value: "1" },
  { text: "使用中", value: "2" },
  { text: "已禁用", value: "3" },
  { text: "故障", value: "4" },
  { text: "已欠费", value: "5" },
  { text: "未激活", value: "6" },
];

onMounted(() => {
  getFindAll();
});

function getFindAll() {
  loading.value = true;
  fetchDevices()
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      const row = { ...(rows[deviceIndex.value] || {}) };
      device.value = {
        ...row,
        lat: toInputValue(row.lat),
        lng: toInputValue(row.lng),
      };
    })
    .catch(() => {
      device.value = {};
      Message.error("设备信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function toInputValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

function backUrl() {
  router.replace({ path: ROUTE_PATHS.device.list });
}

function onSubmit() {
  submitLoading.value = true;

  const payload = {
    ...device.value,
    id: device.value.id,
    pic: undateImg.value ? picImgUplate.value : device.value.pic,
  };

  updateDevice(payload)
    .then((res) => {
      if (res.data === true) {
        Message.success("修改成功");
        window.setTimeout(() => {
          backUrl();
        }, 800);
        return;
      }

      Message.error("修改失败，请稍后重试");
    })
    .catch(() => {
      Message.error("修改失败，请稍后重试");
    })
    .finally(() => {
      submitLoading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.device-update-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.form-section,
.state-section {
  padding: 24px 32px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
}

.page-header {
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

.state-section {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
  text-align: center;

  > svg {
    width: 44px;
    height: 44px;
    color: #9aa0a6;
  }

  h3 {
    margin: 4px 0 0;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #5f6368;
    font-size: 14px;
    line-height: 22px;
  }
}

.device-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.full-field {
  grid-column: 1 / -1;
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
  margin-bottom: 24px;

  :deep(.arco-radio-group) {
    flex-wrap: wrap;
    gap: 8px 0;
  }
}

.location-grid {
  padding-top: 24px;
  border-top: 1px solid #f1f3f4;
}

.device-form {
  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

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

.page-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(241, 243, 244, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid #dadce0;
}

@media (max-width: 1280px) {
  .form-grid,
  .switch-grid,
  .status-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid,
  .switch-grid,
  .status-layout {
    grid-template-columns: 1fr;
  }
}
</style>
