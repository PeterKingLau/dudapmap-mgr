<template>
  <div class="trajectory-page">
    <BaiduMap
      class="trajectory-map"
      :center="center"
      :zoom="15"
      :scroll-wheel-zoom="true"
    >
      <BmMarker
        v-for="item in displayAreaListsPoint"
        :key="`${item.userphone}-${item.originalIndex}`"
        :position="{ lng: item.displayLng, lat: item.displayLat }"
        :dragging="false"
        @click="infoWindowOpen(item)"
      >
        <BmLabel
          :content="item.userphone"
          :label-style="labelStyle"
          :offset="item.labelOffset"
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
            <img src="../../assets/images/nav-trajectory.png" alt="" />
          </div>
          <div>
            <h1>点位查询</h1>
            <p>按日期和地区查询人员历史点位。</p>
          </div>
        </div>
      </div>

      <div class="toolbar-count">
        <ATag color="blue">{{ areaListsPoint.length }} 个点位</ATag>
      </div>
    </section>

    <section class="query-panel">
      <AForm class="query-form" :model="{}" layout="vertical">
        <AFormItem label="日期">
          <ADatePicker
            v-model="dates"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
          />
        </AFormItem>

        <AFormItem label="地区">
          <ASelect v-model="area" allow-clear placeholder="请选择地区">
            <AOption
              v-for="item in areaOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </AFormItem>

        <AFormItem label="操作">
          <div class="query-actions">
            <AButton
              type="primary"
              :loading="searchLoading"
              @click="searchArea"
            >
              <template #icon>
                <Icon icon="ri:search-line" />
              </template>
              查找
            </AButton>
            <AButton @click="clearSearch">
              <template #icon>
                <Icon icon="ri:refresh-line" />
              </template>
              清空
            </AButton>
          </div>
        </AFormItem>
      </AForm>
    </section>

    <section class="map-legend">
      <div>
        <span class="legend-dot"></span>
        <strong>{{ areaListsPoint.length }}</strong>
        <span>个点位</span>
      </div>
      <div>
        <Icon icon="ri:map-pin-line" />
        <span>{{ area || "未选择地区" }}</span>
      </div>
    </section>

    <AModal
      v-model:visible="ddyAreaShow"
      :footer="false"
      modal-class="point-info-modal"
      title="点位信息"
    >
      <div class="point-panel">
        <div class="point-summary">
          <div class="point-icon">
            <img src="../../assets/images/icon-location.png" alt="" />
          </div>
          <div>
            <strong>{{ telXs || "-" }}</strong>
            <span>{{ adressXs || "-" }}</span>
          </div>
        </div>
        <dl class="point-info">
          <div>
            <dt>电话号码</dt>
            <dd>{{ telXs || "-" }}</dd>
          </div>
          <div>
            <dt>所在地址</dt>
            <dd>{{ adressXs || "-" }}</dd>
          </div>
        </dl>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { BaiduMap, BmLabel, BmMarker } from "vue-baidu-map-3x";
import { Message } from "@arco-design/web-vue";
import { fetchLocationsByDateAndDistrict } from "../../api/location";

const DEFAULT_CENTER = { lng: 104.648323, lat: 31.525121 };
const NEARBY_POINT_THRESHOLD = 0.00015;
const POINT_SPREAD_RADIUS = 0.00006;
const DEFAULT_LABEL_OFFSET = { width: -46, height: -28 };

const router = useRouter();
const minDate = new Date(2020, 0, 1);
const maxDate = new Date();
const areaOptions = ["绵阳", "安州", "广汉", "射洪", "成华"].map((item) => ({
  text: item,
  value: item,
}));
const labelStyle = {
  color: "#202124",
  fontSize: "13px",
  border: "0",
  borderRadius: "999px",
  padding: "3px 8px",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(31, 45, 61, 0.12)",
};

const center = ref({ ...DEFAULT_CENTER });
const dates = ref("");
const area = ref("");
const areaListsPoint = ref([]);
const ddyAreaShow = ref(false);
const searchLoading = ref(false);
const telXs = ref("");
const adressXs = ref("");
const displayAreaListsPoint = computed(() =>
  createDisplayPoints(areaListsPoint.value),
);

function disabledDate(current) {
  const time = new Date(current).getTime();

  return time < minDate.getTime() || time > maxDate.getTime();
}

function searchArea() {
  if (!dates.value) {
    Message.warning("请选择日期进行查询！");
    return;
  }

  if (!area.value) {
    Message.warning("请选择地区进行查询！");
    return;
  }

  getAreas(dates.value, area.value);
}

function clearSearch() {
  dates.value = "";
  area.value = "";
  areaListsPoint.value = [];
  center.value = { ...DEFAULT_CENTER };
}

function closePage() {
  router.back();
}

function normalizePoint(item) {
  const location = String(item.locationinfo || "").split("&");

  return {
    locationdate: item.locationdate,
    userphone: item.userphone,
    adress: location[0] || "",
    lat: Number(location[1]),
    lng: Number(location[2]),
  };
}

function isNearbyPoint(point, target) {
  return (
    Math.abs(point.lng - target.lng) <= NEARBY_POINT_THRESHOLD &&
    Math.abs(point.lat - target.lat) <= NEARBY_POINT_THRESHOLD
  );
}

function groupNearbyPoints(points) {
  return points.reduce((groups, point, index) => {
    const sourcePoint = { ...point, originalIndex: index };
    const targetGroup = groups.find((group) =>
      group.some((item) => isNearbyPoint(sourcePoint, item)),
    );

    if (targetGroup) {
      targetGroup.push(sourcePoint);
      return groups;
    }

    groups.push([sourcePoint]);
    return groups;
  }, []);
}

function createSpreadPoint(point, index, total) {
  if (total <= 1) {
    return {
      ...point,
      displayLng: point.lng,
      displayLat: point.lat,
      labelOffset: DEFAULT_LABEL_OFFSET,
    };
  }

  const angle = total === 2 ? index * Math.PI : (Math.PI * 2 * index) / total;
  const lngRadius =
    POINT_SPREAD_RADIUS / Math.max(Math.cos((point.lat * Math.PI) / 180), 0.2);

  return {
    ...point,
    displayLng: point.lng + Math.cos(angle) * lngRadius,
    displayLat: point.lat + Math.sin(angle) * POINT_SPREAD_RADIUS,
    labelOffset: {
      width: Math.round(DEFAULT_LABEL_OFFSET.width + Math.cos(angle) * 52),
      height: Math.round(DEFAULT_LABEL_OFFSET.height + Math.sin(angle) * 38),
    },
  };
}

function createDisplayPoints(points) {
  return groupNearbyPoints(points).flatMap((group) =>
    group.map((point, index) => createSpreadPoint(point, index, group.length)),
  );
}

function getAreas(date, district) {
  const params = {
    date,
    dis: district,
  };

  searchLoading.value = true;
  fetchLocationsByDateAndDistrict(params)
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      const points = rows
        .map(normalizePoint)
        .filter((item) => item.lng && item.lat);

      if (points.length) {
        center.value = {
          lng: points[0].lng,
          lat: points[0].lat,
        };
        areaListsPoint.value = points;
        return;
      }

      areaListsPoint.value = [];
      Message.warning(`${date}暂无点位信息`);
    })
    .catch(() => {
      areaListsPoint.value = [];
      Message.error("点位信息查询失败");
    })
    .finally(() => {
      searchLoading.value = false;
    });
}

function infoWindowOpen(item) {
  telXs.value = item.userphone;
  adressXs.value = item.adress;
  ddyAreaShow.value = true;
}
</script>

<style lang="scss" scoped>
.trajectory-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.trajectory-map {
  width: 100%;
  height: 100%;

  :deep(.anchorBL) {
    left: 16px !important;
    bottom: 16px !important;
  }

  :deep(.BMap_cpyCtrl) {
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
.toolbar-title {
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

.toolbar-count {
  flex: none;
}

.query-panel {
  position: absolute;
  top: 100px;
  left: 16px;
  z-index: 10;
  width: min(420px, calc(100% - 32px));
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 42px rgba(31, 45, 61, 0.16);
  backdrop-filter: blur(14px);
  box-sizing: border-box;
}

.query-form {
  display: grid;
  gap: 16px;

  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-picker),
  :deep(.arco-select) {
    width: 100%;
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

.query-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

.point-panel {
  text-align: left;
}

.point-summary {
  min-width: 0;
  padding: 18px;
  border: 1px solid #d2e3fc;
  border-radius: 8px;
  background: #f0f6ff;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 14px;

  strong {
    display: block;
    color: #202124;
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    word-break: break-all;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.point-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;

  img {
    width: 30px;
    height: 30px;
    object-fit: contain;
  }
}

.point-info {
  margin: 18px 0 0;
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
  text-align: left;

  > div {
    min-width: 0;
    padding: 16px 18px;
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
    margin: 8px 0 0;
    color: #202124;
    font-size: 15px;
    line-height: 24px;
    word-break: break-all;
  }

  > div:last-child {
    grid-column: 1 / -1;
  }
}

:global(.point-info-modal .arco-modal) {
  width: min(640px, calc(100vw - 48px));
  border-radius: 8px;
  overflow: hidden;
}

:global(.point-info-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.point-info-modal .arco-modal-body) {
  padding: 24px 28px 28px;
}

:global(.point-info-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 960px) {
  .map-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .query-panel {
    top: 154px;
  }

  .point-info {
    grid-template-columns: 1fr;
  }
}
</style>
