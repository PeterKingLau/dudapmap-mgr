<template>
  <div class="rider-page">
    <BaiduMap
      class="rider-map"
      :center="oneself"
      :zoom="15"
      :scroll-wheel-zoom="true"
      @ready="handleMapReady"
    >
      <BmMarker
        v-for="(item, index) in center2"
        :key="`${item.lng}-${item.lat}-${index}`"
        :position="{ lng: item.lng, lat: item.lat }"
        :icon="markerIcon"
      >
        <telOvcerlay
          :position="item"
          :offset="item.overlayOffset"
          :text="markerText"
          :number="index + 1"
          :tel="tel[index]"
        />
      </BmMarker>
    </BaiduMap>

    <section class="map-toolbar">
      <div class="toolbar-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div class="toolbar-title">
          <div class="title-icon">
            <img src="../../assets/images/nav-coordinate.png" alt="" />
          </div>
          <div>
            <h1>骑手实时位置</h1>
            <p>查看在线人员位置、坐标与任务分布。</p>
          </div>
        </div>
      </div>

      <div class="toolbar-actions">
        <div class="online-card">
          <span>当前骑手在线数量</span>
          <strong>{{ riderNumber || 0 }}</strong>
          <em>人</em>
        </div>
        <AButton @click="lookCk">
          <template #icon>
            <Icon icon="ri:map-pin-user-line" />
          </template>
          人员坐标
        </AButton>
        <AButton type="primary" @click="riderPopup">
          <template #icon>
            <Icon icon="ri:task-line" />
          </template>
          全部任务
        </AButton>
      </div>
    </section>

    <section class="map-legend">
      <div>
        <span class="legend-dot"></span>
        <strong>{{ center2.length }}</strong>
        <span>个实时坐标</span>
      </div>
      <div>
        <Icon icon="ri:refresh-line" />
        <span>3 秒自动刷新</span>
      </div>
    </section>

    <aside v-if="showTask" class="side-panel">
      <div class="panel-header">
        <div>
          <h2>全部任务</h2>
          <p>{{ taskLis.length }} 条任务记录</p>
        </div>
        <AButton shape="circle" @click="showTask = false">
          <template #icon>
            <Icon icon="ri:close-line" />
          </template>
        </AButton>
      </div>

      <div v-if="taskLoading" class="panel-state">
        <ASpin :size="28" />
        <span>加载中...</span>
      </div>

      <div v-else-if="!newtasKLis.length" class="panel-state">
        <Icon icon="ri:file-search-line" />
        <h3>暂无详细信息</h3>
        <p>当前没有任务记录。</p>
      </div>

      <div v-else class="task-list">
        <article
          v-for="(item, index) in newtasKLis"
          :key="item.id || index"
          class="task-card"
          @click="findAllUrl(index)"
        >
          <div class="task-card-header">
            <div>
              <span>任务 {{ index + 1 }}</span>
              <strong>{{ formatValue(item.userphone) }}</strong>
            </div>
            <div class="task-card-actions">
              <ATag :color="getTaskStatus(item.infoflag).color">
                {{ getTaskStatus(item.infoflag).text }}
              </ATag>
              <AButton
                shape="circle"
                status="danger"
                @click.stop="del(item.id, index)"
              >
                <template #icon>
                  <Icon icon="ri:delete-bin-6-line" />
                </template>
              </AButton>
            </div>
          </div>
          <dl class="task-meta">
            <div>
              <dt>地址</dt>
              <dd>{{ formatValue(item.adress) }}</dd>
            </div>
            <div>
              <dt>日期</dt>
              <dd>{{ formatValue(item.taskdate) }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </aside>

    <aside v-if="showPropleZb" class="side-panel">
      <div class="panel-header">
        <div>
          <h2>人员坐标</h2>
          <p>{{ properLists.length }} 个在线坐标</p>
        </div>
        <AButton shape="circle" @click="showPropleZb = false">
          <template #icon>
            <Icon icon="ri:close-line" />
          </template>
        </AButton>
      </div>

      <div v-if="!properLists.length" class="panel-state">
        <Icon icon="ri:map-pin-line" />
        <h3>暂无人员坐标信息</h3>
        <p>当前没有可查看的在线坐标。</p>
      </div>

      <div v-else class="people-list">
        <button
          v-for="(item, index) in properLists"
          :key="item.phone || index"
          class="people-card"
          type="button"
          @click="jumpCoordinate(item.lng, item.lat)"
        >
          <div class="people-main">
            <span>人员 {{ index + 1 }} 号</span>
            <strong>{{ formatValue(item.phone) }}</strong>
          </div>
          <p>{{ formatValue(item.adress) }}</p>
          <Icon icon="ri:map-pin-line" />
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { BaiduMap, BmMarker } from "vue-baidu-map-3x";
import { Message, Modal } from "@arco-design/web-vue";
import telOvcerlay from "../../comm/telOvcerlay.vue";
import { fetchRealLocations } from "../../api/location";
import { deleteTaskById, fetchTasks } from "../../api/task";
import { fetchOnlineUserCount } from "../../api/user";
import {
  isValidLat,
  isValidLng,
  normalizeLngLat,
} from "../../utils/baiduMapAdapter";

const DEFAULT_MAP_CENTER = { lng: 104.648323, lat: 31.525121 };
const TASK_DETAIL_CACHE_KEY = "taskDetail";
const NEARBY_COORDINATE_THRESHOLD = 0.0002;
const OVERLAY_SPREAD_X = 72;
const OVERLAY_SPREAD_Y = 28;

const router = useRouter();
const oneself = reactive({ ...DEFAULT_MAP_CENTER });
const center2 = ref([]);
const tel = ref([]);
const showTask = ref(false);
const taskLis = ref([]);
const newtasKLis = ref([]);
const riderNumber = ref(0);
const showPropleZb = ref(false);
const properLists = ref([]);
const taskLoading = ref(false);
const refreshTimer = ref(null);
const realLocationLoading = ref(false);
const mapReady = ref(false);
const hasInitialCentered = ref(false);
const lastRealLocationSignature = ref("");
const pendingMapCenter = ref(null);
const pendingMapPoints = ref([]);
const markerText = { name: "人员" };

const markerIcon = computed(() => ({
  url: new URL("../../assets/images/marker-rider.png", import.meta.url).href,
  size: { width: 35, height: 35 },
}));

const statusMap = {
  1: { text: "已经派发", color: "blue" },
  2: { text: "接受任务", color: "green" },
  3: { text: "拒绝任务", color: "red" },
  4: { text: "完成任务", color: "arcoblue" },
  5: { text: "未派单", color: "gray" },
};

onMounted(() => {
  getRealLocation({ force: true });
  riderOnline();
  getFindAll();
  document.addEventListener("visibilitychange", handleVisibilityChange);
  startRefreshTimer();
});

onBeforeUnmount(() => {
  stopRefreshTimer();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "暂无" : value;
}

function getTaskStatus(infoflag) {
  return statusMap[Number(infoflag)] || { text: "未知状态", color: "gray" };
}

function normalizeTask(item) {
  const addressParts = (item.useraddress || "").split("&");

  return {
    ...item,
    adress: item.adress || addressParts[0] || "",
    lng: item.lng || addressParts[1] || "",
    lat: item.lat || addressParts[2] || "",
  };
}

function getFindAll() {
  taskLoading.value = true;
  fetchTasks()
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      taskLis.value = rows.map(normalizeTask);
      newtasKLis.value = [...taskLis.value];
    })
    .catch(() => {
      taskLis.value = [];
      newtasKLis.value = [];
      Message.error("任务信息加载失败");
    })
    .finally(() => {
      taskLoading.value = false;
    });
}

function riderPopup() {
  showPropleZb.value = false;
  showTask.value = true;
}

function lookCk() {
  showTask.value = false;
  showPropleZb.value = true;
}

function closePage() {
  router.back();
}

function del(delid, index) {
  if (!delid) {
    Message.warning("缺少任务编号，无法删除");
    return;
  }

  Modal.confirm({
    title: "删除确认",
    content: "确定删除这个任务吗？",
    okText: "删除",
    cancelText: "取消",
    okButtonProps: {
      status: "danger",
    },
    onOk: () =>
      deleteTaskById(delid).then(() => {
        const taskId = newtasKLis.value[index]?.id || delid;
        taskLis.value = taskLis.value.filter(
          (item) => String(item.id) !== String(delid),
        );
        newtasKLis.value.splice(index, 1);
        sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${taskId}`);
        Message.success("删除成功");
      }),
  });
}

function findAllUrl(index) {
  const task = newtasKLis.value[index];

  if (!task?.id) {
    return;
  }

  sessionStorage.setItem(
    `${TASK_DETAIL_CACHE_KEY}:${task.id}`,
    JSON.stringify(task),
  );
  router.push({
    path: ROUTE_PATHS.task.detail,
    query: {
      taskId: task.id,
      distinctionId: 2,
    },
  });
}

function riderOnline() {
  fetchOnlineUserCount()
    .then((res) => {
      riderNumber.value = res.data || 0;
    })
    .catch(() => {
      riderNumber.value = 0;
    });
}

function refreshRealTimeData() {
  if (document.hidden) {
    return;
  }

  getRealLocation();
  riderOnline();
}

function startRefreshTimer() {
  if (refreshTimer.value || document.hidden) {
    return;
  }

  refreshTimer.value = window.setInterval(refreshRealTimeData, 3000);
}

function stopRefreshTimer() {
  if (!refreshTimer.value) {
    return;
  }

  window.clearInterval(refreshTimer.value);
  refreshTimer.value = null;
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopRefreshTimer();
    return;
  }

  refreshRealTimeData();
  startRefreshTimer();
}

function applyMapCenter(center) {
  oneself.lng = center.lng;
  oneself.lat = center.lat;
}

function setMapCenter(lng, lat) {
  const nextCenter = {
    lng: Number(lng),
    lat: Number(lat),
  };

  if (!isValidLng(nextCenter.lng) || !isValidLat(nextCenter.lat)) {
    return;
  }

  if (!mapReady.value) {
    pendingMapCenter.value = nextCenter;
    return;
  }

  applyMapCenter(nextCenter);
}

function setMapPoints(points) {
  if (!mapReady.value) {
    pendingMapPoints.value = points;
    return;
  }

  center2.value = points;
}

function handleMapReady() {
  mapReady.value = true;

  if (pendingMapPoints.value.length) {
    center2.value = pendingMapPoints.value;
    pendingMapPoints.value = [];
  }

  if (pendingMapCenter.value) {
    applyMapCenter(pendingMapCenter.value);
    pendingMapCenter.value = null;
  }
}

function normalizeCoordinatePair(values) {
  return normalizeLngLat(values, "latLng");
}

function parseLocationRow(row, phone) {
  const coordinate =
    normalizeCoordinatePair([row[1], row[2]]) ||
    normalizeCoordinatePair(row.slice(-2));

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

function areNearbyCoordinates(first, second) {
  return (
    Math.abs(first.lng - second.lng) <= NEARBY_COORDINATE_THRESHOLD &&
    Math.abs(first.lat - second.lat) <= NEARBY_COORDINATE_THRESHOLD
  );
}

function createMapPoints(items) {
  const groups = [];

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
      return [
        {
          lng: group[0].lng,
          lat: group[0].lat,
          overlayOffset: { x: 0, y: 0 },
        },
      ];
    }

    return group.map((item, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      const layer = Math.floor(index / 2) + 1;

      return {
        lng: item.lng,
        lat: item.lat,
        overlayOffset: {
          x: direction * OVERLAY_SPREAD_X * layer,
          y: OVERLAY_SPREAD_Y * (layer - 1),
        },
      };
    });
  });
}

function createRealLocationSignature(locationMap) {
  return JSON.stringify(
    Object.keys(locationMap)
      .sort()
      .map((phone) => [phone, locationMap[phone]]),
  );
}

function getRealLocation({ force = false } = {}) {
  if (realLocationLoading.value) {
    return Promise.resolve();
  }

  realLocationLoading.value = true;

  return fetchRealLocations()
    .then((res) => {
      const locationMap = res.data || {};
      const signature = createRealLocationSignature(locationMap);

      if (!force && signature === lastRealLocationSignature.value) {
        return;
      }

      lastRealLocationSignature.value = signature;
      const phones = Object.keys(locationMap);
      const coordinates = Object.values(locationMap);
      const locationRows = coordinates.map((item) => String(item).split("&"));
      const locationItems = locationRows
        .map((row, index) => parseLocationRow(row, phones[index]))
        .filter(Boolean);
      const points = createMapPoints(locationItems);

      tel.value = locationItems.map((item) => item.phone);
      setMapPoints(points);

      if (!hasInitialCentered.value && locationItems[0]) {
        setMapCenter(locationItems[0].lng, locationItems[0].lat);
        hasInitialCentered.value = true;
      }

      properLists.value = locationItems;
    })
    .finally(() => {
      realLocationLoading.value = false;
    });
}

function jumpCoordinate(lng, lat) {
  if (!lng || !lat) {
    return;
  }

  setMapCenter(lng, lat);
  showPropleZb.value = false;
}
</script>

<style lang="scss" scoped>
.rider-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.rider-map {
  width: 100%;
  height: 100%;

  :deep(.anchorBL) {
    left: 16px !important;
    bottom: 16px !important;
  }
}

.map-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  min-height: 80px;
  padding: 16px 20px;
  border: 1px solid rgba(218, 220, 224, 0.82);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 32px rgba(31, 45, 61, 0.12);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-sizing: border-box;
}

.toolbar-main,
.toolbar-title,
.toolbar-actions {
  display: flex;
  align-items: center;
}

.toolbar-main {
  min-width: 0;
  gap: 18px;
}

.toolbar-title {
  min-width: 0;
  gap: 14px;
  text-align: left;

  h1 {
    margin: 0;
    color: #202124;
    font-size: 22px;
    line-height: 30px;
    font-weight: 500;
  }

  p {
    margin: 2px 0 0;
    color: #5f6368;
    font-size: 13px;
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
  }
}

.title-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #e8f0fe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }
}

.toolbar-actions {
  flex: none;
  gap: 10px;

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.online-card {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #d2e3fc;
  border-radius: 8px;
  background: #f0f4f9;
  color: #5f6368;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 13px;
  }

  strong {
    color: #1a73e8;
    font-size: 24px;
    line-height: 1;
    font-weight: 600;
  }

  em {
    color: #202124;
    font-size: 13px;
    font-style: normal;
  }
}

.map-legend {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 10;
  padding: 12px 16px;
  border: 1px solid rgba(218, 220, 224, 0.82);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(31, 45, 61, 0.1);
  display: flex;
  align-items: center;
  gap: 18px;

  > div {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #5f6368;
    font-size: 13px;
  }

  strong {
    color: #1a73e8;
    font-size: 18px;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #1a73e8;
  }
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1a73e8;
  box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.16);
}

.side-panel {
  position: absolute;
  top: 100px;
  right: 16px;
  bottom: 16px;
  z-index: 11;
  width: min(460px, calc(100vw - 40px));
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 42px rgba(31, 45, 61, 0.16);
  backdrop-filter: blur(14px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.panel-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  flex: none;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  }

  p {
    margin: 2px 0 0;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }
}

.panel-state {
  flex: 1;
  min-height: 0;
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

.task-list,
.people-list {
  min-height: 0;
  margin-top: 16px;
  padding-right: 4px;
  display: grid;
  gap: 12px;
  overflow-y: auto;
}

.task-card {
  padding: 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #d2e3fc;
    background: #f8fbff;
  }
}

.task-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

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
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    word-break: break-all;
  }
}

.task-card-actions {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.task-meta {
  margin: 14px 0 0;
  display: grid;
  gap: 10px;

  > div {
    min-width: 0;
    padding: 12px 14px;
    border: 1px solid #f1f3f4;
    border-radius: 8px;
    background: #f8f9fa;
  }

  dt {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  dd {
    margin: 4px 0 0;
    color: #202124;
    font-size: 14px;
    line-height: 22px;
    word-break: break-all;
  }
}

.people-card {
  position: relative;
  width: 100%;
  padding: 16px 46px 16px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #d2e3fc;
    background: #f8fbff;
  }

  > svg {
    position: absolute;
    top: 18px;
    right: 16px;
    width: 20px;
    height: 20px;
    color: #1a73e8;
  }

  p {
    margin: 10px 0 0;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
    word-break: break-all;
  }
}

.people-main {
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
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    word-break: break-all;
  }
}

:deep(.BMap_noprint) {
  transition: all 2s !important;
  background: url("../../assets/images/marker-rider-active.png") no-repeat !important;
  background-size: cover !important;
}

:deep(.sample) {
  transition: all 2s !important;
}

@media (max-width: 1180px) {
  .map-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .side-panel {
    top: 154px;
  }
}
</style>
