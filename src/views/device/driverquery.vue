<template>
  <div class="device-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>查看设备</h1>
          <p>查看设备列表，进入详情或修改设备信息。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ lists.length }} 台</ATag>
        <div class="header-icon">
          <img src="../../assets/images/nav-device-query.png" alt="" />
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article
        v-for="item in summaryItems"
        :key="item.label"
        :class="['summary-card', `theme-${item.theme}`]"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section class="list-section">
      <div v-if="loading" class="state-panel">
        <ASpin :size="28" />
        <span>加载中...</span>
      </div>

      <div v-else-if="!lists.length" class="state-panel">
        <Icon icon="ri:device-line" />
        <h3>暂无设备信息</h3>
        <p>当前还没有设备记录。</p>
      </div>

      <div v-else class="device-grid">
        <article
          v-for="(item, index) in lists"
          :key="item.id || index"
          class="device-card"
        >
          <div class="card-header">
            <div>
              <span>设备编号</span>
              <strong>{{ formatValue(item.serialnumber) }}</strong>
            </div>
            <ATag :color="getDeviceStatusMeta(item.status).color">
              {{ getDeviceStatusMeta(item.status).text }}
            </ATag>
          </div>

          <dl class="device-meta">
            <div class="full-field">
              <dt>地址</dt>
              <dd>{{ formatValue(item.address) }}</dd>
            </div>
            <div>
              <dt>设备名称</dt>
              <dd>{{ formatValue(item.name) }}</dd>
            </div>
            <div>
              <dt>设备状态</dt>
              <dd>{{ getDeviceStatusMeta(item.status).text }}</dd>
            </div>
          </dl>

          <div class="card-actions">
            <AButton type="primary" @click="dirverquery(index)">
              <template #icon>
                <Icon icon="ri:file-list-3-line" />
              </template>
              详情
            </AButton>
            <AButton status="success" @click="uplateDirverquery(index)">
              <template #icon>
                <Icon icon="ri:edit-line" />
              </template>
              修改
            </AButton>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchDevices } from "../../api/device";

const router = useRouter();
const lists = ref([]);
const loading = ref(false);

const statusMap = {
  1: { text: "待使用", color: "gray" },
  2: { text: "使用中", color: "green" },
  3: { text: "已禁用", color: "red" },
  4: { text: "故障", color: "orange" },
  5: { text: "已欠费", color: "red" },
  6: { text: "未激活", color: "blue" },
};

const usingCount = computed(
  () => lists.value.filter((item) => Number(item.status) === 2).length,
);

const disabledCount = computed(
  () =>
    lists.value.filter((item) => [3, 5].includes(Number(item.status))).length,
);

const inactiveCount = computed(
  () => lists.value.filter((item) => Number(item.status) === 6).length,
);

const summaryItems = computed(() => [
  { label: "设备总数", value: lists.value.length, theme: "blue" },
  { label: "使用中", value: usingCount.value, theme: "green" },
  { label: "异常/禁用", value: disabledCount.value, theme: "red" },
  { label: "未激活", value: inactiveCount.value, theme: "orange" },
]);

onMounted(() => {
  getFindAll();
});

function closePage() {
  router.back();
}

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "-" : value;
}

function getDeviceStatusMeta(status) {
  return statusMap[Number(status)] || { text: "-", color: "gray" };
}

function getFindAll() {
  loading.value = true;
  fetchDevices()
    .then((res) => {
      lists.value = Array.isArray(res.data) ? res.data : [];
    })
    .catch(() => {
      lists.value = [];
      Message.error("设备信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function dirverquery(index) {
  router.push({
    path: ROUTE_PATHS.device.detail,
    query: { arrindex: index },
  });
}

function uplateDirverquery(index) {
  router.push({
    path: ROUTE_PATHS.device.update,
    query: { arrindex: index },
  });
}
</script>

<style lang="scss" scoped>
.device-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.list-section {
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

.header-side {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex: none;
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  min-height: 112px;
  padding: 20px 24px;
  border: 1px solid #dadce0;
  border-radius: 12px;
  text-align: left;
  box-sizing: border-box;

  span {
    display: block;
    color: #5f6368;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
  }

  strong {
    display: block;
    margin-top: 12px;
    font-size: 32px;
    line-height: 40px;
    font-weight: 600;
  }

  &.theme-blue {
    background: #f0f4f9;
    border-color: #d2e3fc;

    strong {
      color: #1a73e8;
    }
  }

  &.theme-green {
    background: #e6f4ea;
    border-color: #ceead6;

    strong {
      color: #137333;
    }
  }

  &.theme-red {
    background: #fce8e6;
    border-color: #fad2cf;

    strong {
      color: #c5221f;
    }
  }

  &.theme-orange {
    background: #fef7e0;
    border-color: #fce8b2;

    strong {
      color: #b06000;
    }
  }
}

.state-panel {
  min-height: 320px;
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

.device-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.device-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  text-align: left;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;

  span {
    display: block;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
    word-break: break-all;
  }
}

.device-meta {
  margin: 16px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  > div {
    min-width: 0;
    padding: 14px 16px;
    border: 1px solid #f1f3f4;
    border-radius: 8px;
    background: #f8f9fa;
    box-sizing: border-box;
  }

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

.card-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

@media (max-width: 1280px) {
  .summary-grid,
  .device-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-side {
    align-self: flex-end;
  }

  .summary-grid,
  .device-grid,
  .device-meta {
    grid-template-columns: 1fr;
  }
}
</style>
