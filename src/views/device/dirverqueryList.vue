<template>
  <div class="device-detail-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="backUrl">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>设备详情</h1>
          <p>查看设备基础信息、登录能力、人员时间、状态与安装位置。</p>
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
      <p>未查询到当前设备详情。</p>
    </section>

    <template v-else>
      <section class="overview-section">
        <div class="device-main">
          <div class="device-avatar">
            <img v-if="device.pic" :src="picUrl" alt="" />
            <Icon v-else icon="ri:base-station-line" />
          </div>
          <div>
            <ATag :color="getDeviceStatus(device.status).color">
              {{ getDeviceStatus(device.status).text }}
            </ATag>
            <h2>{{ formatValue(device.name) }}</h2>
            <p>{{ formatValue(device.serialnumber) }}</p>
          </div>
        </div>

        <div class="overview-grid">
          <article
            v-for="item in overviewItems"
            :key="item.label"
            class="overview-card"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-header">
          <h2>基本信息</h2>
        </div>
        <dl class="detail-grid">
          <InfoItem label="设备编号" :value="device.serialnumber" />
          <InfoItem label="设备类型编号" :value="device.devicetypeid" />
          <InfoItem label="设备名称" :value="device.name" />
          <InfoItem label="设备 IMEI" :value="device.imei" />
          <div v-if="device.pic" class="info-item image-item">
            <dt>设备图片</dt>
            <dd>
              <img :src="picUrl" alt="" />
            </dd>
          </div>
        </dl>
      </section>

      <section class="detail-section">
        <div class="section-header">
          <h2>登录方式</h2>
        </div>
        <div class="capability-grid">
          <CapabilityItem label="人脸识别" :active="device.face === '1'" />
          <CapabilityItem label="手机短信验证" :active="device.phone === '1'" />
          <CapabilityItem label="二维码登录" :active="device.qrcode === '1'" />
          <CapabilityItem label="刷卡登录" :active="device.card === '1'" />
        </div>
      </section>

      <section class="detail-section">
        <div class="section-header">
          <h2>人员与时间</h2>
        </div>
        <dl class="detail-grid">
          <InfoItem label="设备区域" :value="device.devicearea" />
          <InfoItem label="维护人员" :value="device.maintenancestaff" />
          <InfoItem label="运营人员" :value="device.operators" />
          <InfoItem label="创建时间" :value="device.createtime" />
          <InfoItem label="创建人" :value="device.createstaff" />
          <InfoItem label="修改时间" :value="device.upatetime" />
          <InfoItem label="修改人" :value="device.updatestaff" />
          <InfoItem label="激活时间" :value="device.activationtime" />
          <InfoItem label="最后在线时间" :value="device.onlinetime" />
        </dl>
      </section>

      <section class="detail-section">
        <div class="section-header">
          <h2>状态与位置</h2>
        </div>
        <dl class="detail-grid">
          <div class="info-item">
            <dt>状态</dt>
            <dd>
              <ATag :color="getDeviceStatus(device.status).color">
                {{ getDeviceStatus(device.status).text }}
              </ATag>
            </dd>
          </div>
          <div class="info-item">
            <dt>是否激活</dt>
            <dd>
              <ATag :color="device.activation === '1' ? 'green' : 'gray'">
                {{ device.activation === "1" ? "是" : "否" }}
              </ATag>
            </dd>
          </div>
          <div class="info-item">
            <dt>是否校准</dt>
            <dd>
              <ATag :color="device.correct === '0' ? 'green' : 'gray'">
                {{ device.correct === "0" ? "是" : "否" }}
              </ATag>
            </dd>
          </div>
          <InfoItem
            class="full-field"
            label="安装地址"
            :value="device.address"
          />
          <InfoItem label="纬度" :value="device.lat" />
          <InfoItem label="经度" :value="device.lng" />
          <InfoItem label="所属部门" :value="device.departmentid" />
          <InfoItem label="运营规则 ID" :value="device.ruleid" />
        </dl>
      </section>

      <div class="page-actions">
        <AButton type="primary" @click="backUrl">
          <template #icon>
            <Icon icon="ri:arrow-left-line" />
          </template>
          返回
        </AButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, defineComponent, h, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Tag } from "@arco-design/web-vue";
import { fetchDevices, getImageUrl } from "../../api/device";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const device = ref({});
const deviceIndex = computed(() => Number(route.query.arrindex || 0));
const hasDevice = computed(() => Object.keys(device.value).length > 0);
const picUrl = computed(() => getImageUrl(device.value.pic));

const InfoItem = defineComponent({
  name: "InfoItem",
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      default: "",
    },
  },
  setup(props, { attrs }) {
    return () =>
      h("div", { class: ["info-item", attrs.class] }, [
        h("dt", props.label),
        h("dd", formatValue(props.value)),
      ]);
  },
});

const CapabilityItem = defineComponent({
  name: "CapabilityItem",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h("article", { class: ["capability-card", { active: props.active }] }, [
        h("span", props.label),
        h(
          Tag,
          {
            class: "capability-tag",
            color: props.active ? "green" : "gray",
          },
          () => (props.active ? "已开启" : "未开启"),
        ),
      ]);
  },
});

const statusMap = {
  1: { text: "待使用", color: "gray" },
  2: { text: "使用中", color: "green" },
  3: { text: "已禁用", color: "red" },
  4: { text: "故障", color: "orange" },
  5: { text: "已欠费", color: "red" },
  6: { text: "未激活", color: "blue" },
};

const overviewItems = computed(() => [
  { label: "设备类型编号", value: formatValue(device.value.devicetypeid) },
  { label: "设备区域", value: formatValue(device.value.devicearea) },
  { label: "最后在线", value: formatValue(device.value.onlinetime) },
]);

onMounted(() => {
  getFindAll();
});

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "暂无" : value;
}

function getDeviceStatus(status) {
  return (
    statusMap[Number(status)] || {
      text: "未知状态",
      color: "gray",
    }
  );
}

function getFindAll() {
  loading.value = true;
  fetchDevices()
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      device.value = rows[deviceIndex.value] || {};
    })
    .catch(() => {
      device.value = {};
      Message.error("设备信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function backUrl() {
  router.replace({ path: ROUTE_PATHS.device.list });
}
</script>

<style lang="scss" scoped>
.device-detail-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.overview-section,
.detail-section,
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

.overview-section {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 1.4fr);
  align-items: center;
  gap: 24px;
}

.device-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  text-align: left;

  h2 {
    margin: 10px 0 4px;
    color: #202124;
    font-size: 24px;
    line-height: 32px;
    font-weight: 500;
    word-break: break-all;
  }

  p {
    margin: 0;
    color: #5f6368;
    font-size: 14px;
    line-height: 20px;
    word-break: break-all;
  }
}

.device-avatar {
  width: 92px;
  height: 92px;
  border-radius: 12px;
  background: #e8f0fe;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 42px;
    height: 42px;
  }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  min-height: 92px;
  padding: 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #f8f9fa;
  text-align: left;
  box-sizing: border-box;

  span {
    display: block;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    display: block;
    margin-top: 8px;
    color: #202124;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
    word-break: break-all;
  }
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 14px;
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

.detail-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.info-item {
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  background: #f8f9fa;
  box-sizing: border-box;
  text-align: left;

  dt {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  dd {
    margin: 6px 0 0;
    color: #202124;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    word-break: break-all;
  }
}

.full-field {
  grid-column: 1 / -1;
}

.image-item {
  grid-column: 1 / -1;

  img {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #dadce0;
  }
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.capability-card {
  min-height: 72px;
  padding: 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #f8f9fa;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  span {
    min-width: 0;
    color: #5f6368;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    word-break: break-all;
  }

  :deep(.capability-tag) {
    flex: none;
  }

  &.active {
    border-color: #ceead6;
    background: #e6f4ea;
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

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

:global(html[data-theme="dark"] .device-detail-page) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .device-detail-page .page-header),
:global(html[data-theme="dark"] .device-detail-page .overview-section),
:global(html[data-theme="dark"] .device-detail-page .detail-section),
:global(html[data-theme="dark"] .device-detail-page .state-section) {
  border-color: #2d3748;
  background: #111827;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(html[data-theme="dark"] .device-detail-page .header-main h1),
:global(html[data-theme="dark"] .device-detail-page .state-section h3),
:global(html[data-theme="dark"] .device-detail-page .device-main h2),
:global(html[data-theme="dark"] .device-detail-page .section-header h2) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .device-detail-page .header-main p),
:global(html[data-theme="dark"] .device-detail-page .state-section),
:global(html[data-theme="dark"] .device-detail-page .state-section p),
:global(html[data-theme="dark"] .device-detail-page .device-main p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .device-detail-page .back-button) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .device-detail-page .back-button:hover) {
  color: #f8fafc;
  background: #1f2937;
}

:global(html[data-theme="dark"] .device-detail-page .header-icon),
:global(html[data-theme="dark"] .device-detail-page .device-avatar) {
  background: rgba(59, 130, 246, 0.14);
  color: #60a5fa;
}

:global(html[data-theme="dark"] .device-detail-page .state-section > svg) {
  color: #64748b;
}

:global(html[data-theme="dark"] .device-detail-page .overview-card),
:global(html[data-theme="dark"] .device-detail-page .info-item),
:global(html[data-theme="dark"] .device-detail-page .capability-card) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .device-detail-page .overview-card span),
:global(html[data-theme="dark"] .device-detail-page .info-item dt),
:global(html[data-theme="dark"] .device-detail-page .capability-card span) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .device-detail-page .overview-card strong),
:global(html[data-theme="dark"] .device-detail-page .info-item dd) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .device-detail-page .section-header) {
  border-bottom-color: #1f2937;
}

:global(html[data-theme="dark"] .device-detail-page .image-item img) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .device-detail-page .capability-card.active) {
  border-color: rgba(74, 222, 128, 0.26);
  background: rgba(22, 163, 74, 0.13);
}

:global(
  html[data-theme="dark"] .device-detail-page .capability-card.active span
) {
  color: #bbf7d0;
}

:global(html[data-theme="dark"] .device-detail-page .page-actions) {
  border-top-color: #2d3748;
  background: rgba(15, 23, 42, 0.86);
}

@media (max-width: 1280px) {
  .overview-section,
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-grid,
  .capability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .overview-section,
  .overview-grid,
  .detail-grid,
  .capability-grid {
    grid-template-columns: 1fr;
  }
}
</style>
