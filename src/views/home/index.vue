<template>
  <div class="home-page">
    <header class="home-toolbar">
      <div class="toolbar-title">
        <h1>地图工作台</h1>
        <p>{{ equipmentAdress || "点击地图可查看并新增坐标点" }}</p>
      </div>
      <div class="toolbar-actions">
        <AButton type="primary" @click="show = true">施工人员</AButton>
        <AButton @click="openUserSearch">查询</AButton>
        <AButton @click="router.push({ path: ROUTE_PATHS.device.equipment })">
          增加设备
        </AButton>
        <AButton @click="toDayWdk">未打卡查询</AButton>
      </div>
      <div class="toolbar-meta">
        <span class="status-pill" :class="{ ready: mapReady && !mapBusy }">
          {{ mapReady && !mapBusy ? "地图已就绪" : "地图加载中" }}
        </span>
        <span class="coordinate-pill">
          经度：{{ longitude || center.lng }}，纬度：{{
            latitude || center.lat
          }}
        </span>
      </div>
    </header>

    <section class="map-workspace">
      <HomeMap
        v-model:active="active"
        :add-coord="addCoord"
        :add-coord-show="addCoordShow"
        :center="center"
        :embrace="embrace"
        :exceed-arry="exceedArry"
        :hours="hours"
        :map-busy="mapBusy"
        :map-visible="mapVisible"
        :minute="minute"
        :polygon-path="polygonPath"
        :radius="radius"
        :scope-circle="scopeCircle"
        :should-render-map-overlays="shouldRenderMapOverlays"
        :show-dq="showDq"
        :stoptime="stoptime"
        :zoom="zoom"
        @interaction-end="handleMapInteractionEnd"
        @interaction-start="handleMapInteractionStart"
        @loaded="handleMapLoaded"
        @map-click="getMapInfos"
        @ready="handler"
      />
    </section>

    <StaffSheet
      v-model:active-role-index="activeRoleIndex"
      v-model:show="show"
      :find-all="findAll"
      :screen-height="screenHeight"
      :staff-list-height="staffListHeight"
      :userrole-list="userroleList"
      @close="clearVirtualStaff"
      @open-role="forRoleUrl"
      @select-tab="tabsSelectTab"
    />

    <UserSearchDialog
      v-model:phone-show="phoneShow"
      v-model:user-dats-show="userDatsShow"
      v-model:user-date-picker-value="userDatePickerValue"
      v-model:user-popup="userPopup"
      :dats-show="datsShow"
      :max-date="maxDate"
      :min-date="minDate"
      :phone-lis="phoneLis"
      :tel-show="telShow"
      :user-dats="userDats"
      :user-tel="userTel"
      @close-date="closeDatspopup"
      @phone-bottom="phoneBottom"
      @search="searchUserInfo"
      @select-date-open="selectDaspopup"
      @select-dats="selectDats"
      @select-phone="onSelect"
    />

    <CurrentPositionDialog
      v-model:show="createShow"
      :latitude="latitude"
      :longitude="longitude"
      :propaddress="propaddress"
      @add="addCoordClick"
      @reset="anew"
    />

    <AModal
      v-model:visible="dwShow"
      :footer="false"
      :closable="false"
      :mask-closable="false"
      modal-class="route-loading-modal"
    >
      <div class="route-loading">
        <ASpin :size="28" />
        <span>正在请求定位路线，请稍等！</span>
      </div>
    </AModal>

    <UnclockedDialog
      v-model:dt-dats-show="dtDatsShow"
      v-model:dt-date-picker-value="dtDatePickerValue"
      v-model:wdkshow="wdkshow"
      :day-value="dayValue"
      :max-date="maxDate"
      :min-date="minDate"
      @confirm-date="dtConfirm"
      @open-date="dtDatesClick"
      @search="dtSearch"
    />
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { formatDay } from "../../utils/date";
import {
  deleteVirtualStaff,
  fetchAllUsers,
  fetchUserLocations,
  fetchUsersByRole,
} from "../../api/home";
import CurrentPositionDialog from "../../components/home/CurrentPositionDialog.vue";
import HomeMap from "../../components/home/HomeMap.vue";
import StaffSheet from "../../components/home/StaffSheet.vue";
import UnclockedDialog from "../../components/home/UnclockedDialog.vue";
import UserSearchDialog from "../../components/home/UserSearchDialog.vue";
import { Message, Modal as AModal } from "@arco-design/web-vue";
import { useAppStore } from "../../store";

const toPickerValue = (date) => formatDay(date).split("-");
const toDateString = (values) => values.join("-");
const DEFAULT_MAP_CENTER = { lng: 104.648323, lat: 31.525121 };
const MAP_LOADING_TIMEOUT = 6000;

const router = useRouter();
const appStore = useAppStore();
const today = new Date();
const todayPickerValue = toPickerValue(today);

const wdkshow = ref(false);
const dayValue = ref("");
const dtDatsShow = ref(false);
const dtDatePickerValue = ref([...todayPickerValue]);
const loading = ref(false);
const finished = ref(false);
const mapVisible = ref(false);
const mapReady = ref(false);
const mapBusy = ref(true);
const mapInteracting = ref(false);
const mapIdleTimer = ref(null);
const resizeHandler = ref(null);
const timerIds = ref([]);
const isUnmounted = ref(false);
const baiduMap = ref(null);
const baiduMapApi = ref(null);
const geocoder = ref(null);
const showDq = ref(false);
const polygonPath = ref([]);
const screenHeight = ref(0);
const show = ref(false);
const selectGz = ref("");
const userPopup = ref(false);
const center = reactive({ ...DEFAULT_MAP_CENTER });
const zoom = ref(15);
const longitude = ref(0);
const latitude = ref(0);
const propaddress = ref("");
const findAll = ref([]);
const userroleList = [
  "全部",
  "项目经理",
  "技术负责人",
  "资料员",
  "施工员",
  "驾驶员",
  "车辆",
  "班主负责人",
];
const userDatsShow = ref(false);
const userDats = ref("");
const userTel = ref("");
const telShow = ref(false);
const datsShow = ref(false);
const userDatePickerValue = ref([...todayPickerValue]);
const minDate = new Date(2020, 0, 1);
const maxDate = today;
const createShow = ref(false);
const addCoordShow = ref(false);
const addCoord = reactive({ lng: 0, lat: 0 });
const radius = ref(100);
const active = ref(false);
const exceedArry = ref([]);
const scopeCircle = reactive({ lng: 0, lat: 0 });
const embrace = ref(false);
const hours = ref(0);
const minute = ref(0);
const stoptime = ref(false);
const equipmentAdress = ref("");
const dwShow = ref(false);
const phoneShow = ref(false);
const phoneLis = ref([]);
const activeRoleIndex = ref(0);

const staffListHeight = computed(() => Math.max(screenHeight.value - 278, 240));
const shouldRenderMapOverlays = computed(
  () => mapReady.value && !mapInteracting.value,
);

watch(
  center,
  (newVal) => {
    appStore.updateCenter(newVal);
  },
  { deep: true },
);

watch(
  equipmentAdress,
  (newVal) => {
    appStore.updateAddress(newVal);
  },
  { deep: true },
);

onMounted(() => {
  isUnmounted.value = false;
  updateScreenHeight();
  resizeHandler.value = () => {
    updateScreenHeight();
  };
  window.addEventListener("resize", resizeHandler.value, { passive: true });
  setSafeTimeout(() => {
    mapVisible.value = true;
  }, 80);
  setSafeTimeout(() => {
    if (!mapBusy.value) {
      return;
    }

    mapBusy.value = false;

    if (!mapReady.value && window.BMap) {
      mapReady.value = true;
      useDefaultMapCenter();
    }
  }, MAP_LOADING_TIMEOUT);

  getFillAll();
  clearVirtualStaff();
  getUserPhone();
});

onBeforeUnmount(() => {
  isUnmounted.value = true;
  if (resizeHandler.value) {
    window.removeEventListener("resize", resizeHandler.value);
    resizeHandler.value = null;
  }
  clearTimers();
  if (baiduMap.value?.clearOverlays) {
    baiduMap.value.clearOverlays();
  }
  baiduMap.value = null;
  baiduMapApi.value = null;
  geocoder.value = null;
});

function updateScreenHeight() {
  screenHeight.value = Math.max(
    document.documentElement.clientHeight - 50,
    240,
  );
}

function setSafeTimeout(callback, delay) {
  const timerId = window.setTimeout(() => {
    timerIds.value = timerIds.value.filter((item) => item !== timerId);
    if (!isUnmounted.value) {
      callback();
    }
  }, delay);
  timerIds.value.push(timerId);
  return timerId;
}

function clearTimers() {
  timerIds.value.forEach((timerId) => {
    window.clearTimeout(timerId);
  });
  timerIds.value = [];

  if (mapIdleTimer.value) {
    window.clearTimeout(mapIdleTimer.value);
    mapIdleTimer.value = null;
  }
}

function handleMapLoaded() {
  mapReady.value = true;
  mapBusy.value = false;
}

function handleMapInteractionStart() {
  if (!mapReady.value) {
    return;
  }

  mapInteracting.value = true;

  if (mapIdleTimer.value) {
    window.clearTimeout(mapIdleTimer.value);
    mapIdleTimer.value = null;
  }
}

function handleMapInteractionEnd() {
  if (mapIdleTimer.value) {
    window.clearTimeout(mapIdleTimer.value);
  }

  mapIdleTimer.value = window.setTimeout(() => {
    if (!isUnmounted.value) {
      mapInteracting.value = false;
    }
    mapIdleTimer.value = null;
  }, 160);
}

function notify(type, message) {
  const method = type === "error" ? "error" : type;

  if (typeof Message[method] === "function") {
    Message[method](message);
    return;
  }

  Message.info(message);
}

function getUserPhone() {
  fetchAllUsers().then((res) => {
    phoneLis.value = (res.data || []).map((item) => ({
      name: item.userphone,
    }));
  });
}

function phoneBottom() {
  if (!phoneLis.value.length) {
    notify("warning", "暂无可选择的电话号码！");
    return;
  }

  phoneShow.value = true;
}

function onSelect(item) {
  userTel.value = item.name;
  phoneShow.value = false;
}

function setMapLocation({ lng, lat, address = "", showMarker = true }) {
  if (!lng || !lat) {
    return;
  }

  center.lng = Number(lng);
  center.lat = Number(lat);
  longitude.value = Number(lng);
  latitude.value = Number(lat);
  equipmentAdress.value = address;
  showDq.value = showMarker;
}

function useDefaultMapCenter() {
  setMapLocation({
    ...DEFAULT_MAP_CENTER,
    showMarker: false,
  });
}

async function handler({ BMap, map }) {
  baiduMap.value = map;
  baiduMapApi.value = BMap;
  mapReady.value = true;
  mapBusy.value = false;
  if (!longitude.value || !latitude.value) {
    useDefaultMapCenter();
  }
}

function getMapInfos(e) {
  if (!mapReady.value || mapInteracting.value || !e?.point) {
    return;
  }

  longitude.value = e.point.lng;
  latitude.value = e.point.lat;
  const BMapCtor = baiduMapApi.value || window.BMap;
  if (!BMapCtor) {
    return;
  }
  const currentGeocoder = geocoder.value || new BMapCtor.Geocoder();
  geocoder.value = currentGeocoder;
  currentGeocoder.getLocation(e.point, (res) => {
    if (isUnmounted.value) {
      return;
    }

    propaddress.value = res.address;
    longitude.value = e.point.lng;
    latitude.value = e.point.lat;
    createShow.value = true;
    addCoordShow.value = false;
  });
}

function addCoordClick() {
  addCoord.lng = longitude.value;
  addCoord.lat = latitude.value;
  addCoordShow.value = true;
  createShow.value = false;
  stoptime.value = false;
  embrace.value = false;
}

function anew() {
  addCoord.lng = 0;
  addCoord.lat = 0;
  addCoordShow.value = false;
  createShow.value = false;
}

function openUserSearch() {
  userPopup.value = true;
  userDats.value = "";
  userTel.value = "";
  telShow.value = false;
  datsShow.value = false;
  embrace.value = false;
  stoptime.value = false;
}

function trajectory() {
  router.push({ path: ROUTE_PATHS.map.trajectory });
}

function clockIn() {
  router.push({ path: ROUTE_PATHS.attendance.clockIn });
}

function toDayWdk() {
  wdkshow.value = true;
}

function dtDatesClick() {
  dtDatsShow.value = true;
}

function dtConfirm() {
  dtDatsShow.value = false;
  dayValue.value = toDateString(dtDatePickerValue.value);
}

function dtSearch() {
  if (dayValue.value === "") {
    notify("warning", "请选择日期进行查询！");
  } else {
    router.push({
      path: ROUTE_PATHS.attendance.unclockedClickIn,
      query: { day: dayValue.value },
    });
  }
}

function ruHose() {
  router.push({ path: ROUTE_PATHS.indoor.list });
}

function subscribe() {
  router.push({ path: ROUTE_PATHS.appointment.list });
}

function rider() {
  router.push({ path: ROUTE_PATHS.map.rider });
}

function taskAll() {
  router.push({ path: ROUTE_PATHS.task.list });
}

function driverquery() {
  router.push({ path: ROUTE_PATHS.device.list });
}

function journal() {
  router.push({ path: ROUTE_PATHS.system.journal });
}

function clockOpt() {
  router.push({ path: ROUTE_PATHS.attendance.clockOpt });
}

function userInfo() {
  router.push({ path: ROUTE_PATHS.admin.userMgr });
}

function aksForLeave() {
  router.push({ path: ROUTE_PATHS.admin.leaveMgr });
}

function tabsSelectTab({ name, title }) {
  tabsSelect(name, title);
}

function tabsSelect(name, title) {
  activeRoleIndex.value = name;
  selectGz.value = title;

  if (title === "全部") {
    getFillAll();
    loading.value = false;
    return;
  }

  getAnZuser(title);
  loading.value = true;
  finished.value = false;
}

function normalizeUserRole(item) {
  switch (item.userrole) {
    case null:
      item.userrole = "人员-人员";
      item.infoflag = 2;
      break;
    case "null-小工":
      item.userrole = "小工-小工";
      break;
    case "null-大工":
      item.userrole = "大工-大工";
      break;
    case "null-宣传员":
      item.userrole = "宣传员-宣传员";
      break;
    case "null-人员":
      item.userrole = "人员-人员";
      break;
    case "null-安装员":
      item.userrole = "安装员-安装员";
      break;
    case "null-配送员":
      item.userrole = "配送员-配送员";
      break;
  }

  return item;
}

function getFillAll() {
  fetchAllUsers().then((res) => {
    findAll.value = (res.data || []).map(normalizeUserRole);
  });
}

function clearVirtualStaff() {
  deleteVirtualStaff().then(() => {
    getFillAll();
  });
}

function forRoleUrl(changeName, tel) {
  router.push({
    path: ROUTE_PATHS.admin.forRole,
    query: { changeName, tel },
  });
}

function getAnZuser(userAnz) {
  fetchUsersByRole(userAnz).then((res) => {
    findAll.value = res.data?.length ? res.data : [];
  });
}

function selectDaspopup() {
  userDatsShow.value = true;
}

function selectDats() {
  userDats.value = toDateString(userDatePickerValue.value);
  userDatsShow.value = false;
}

function closeDatspopup() {
  userDatsShow.value = false;
}

async function searchUserInfo() {
  if (userTel.value.length > 11 || userTel.value.length < 11) {
    telShow.value = true;
    return;
  } else {
    telShow.value = false;
  }

  if (userDats.value == "") {
    datsShow.value = true;
    return;
  } else {
    datsShow.value = false;
  }

  const data = {
    phone: userTel.value,
    dats: userDats.value,
  };
  dwShow.value = true;
  userPopup.value = false;
  fetchUserLocations(data).then((res) => {
    if (res.data.length == 0) {
      setSafeTimeout(() => {
        dwShow.value = false;
      }, 2000);
      setSafeTimeout(() => {
        notify("warning", "暂无员工的定位信息！");
        embrace.value = false;
      }, 2500);
    } else {
      gerUserPos(res);
      userPopup.value = false;
      addCoordShow.value = false;
      embrace.value = true;
      zoom.value = 18;
    }
  });
}

function gerUserPos(res) {
  if (!res.data.length) {
    return;
  }

  dwShow.value = false;

  const coordinates = res.data;
  const lat = coordinates.map((item) => {
    const str = item.locationinfo;
    return str.split("&");
  });
  const latArray = lat.map((item) => {
    const arr = item.slice(-2);
    return { lat: arr[0], lng: arr[1] };
  });
  polygonPath.value = latArray;
  center.lng = polygonPath.value[0].lng;
  center.lat = polygonPath.value[0].lat;

  scopeCircle.lng = polygonPath.value[0].lng;
  scopeCircle.lat = polygonPath.value[0].lat;

  const exceed = coordinates.filter((item) => item.infoflag == "2");
  const exceedCc = exceed.map((item) => {
    const str = item.locationinfo;
    return str.split("-").slice(-2);
  });

  exceedArry.value = exceedCc.map((item) => ({
    lat: item[0],
    lng: item[1],
  }));

  let timeValue;
  if (exceedArry.value.length == 0) {
    timeValue = 0;
    stoptime.value = false;
  } else {
    timeValue = (exceedArry.value.length - 1) * 6;
    stoptime.value = true;
  }

  formatTime(timeValue);
}

function formatTime(num) {
  let h = Math.floor(num / 3600);
  let m = Math.floor((num - h * 3600) / 60);
  let s = Math.floor(num - h * 3600 - m * 60);

  if (h < 10) h = h;
  if (m < 10) m = m;
  if (s < 10) s = s;

  hours.value = m;
  minute.value = s;
}
</script>

<style lang="scss" scoped>
.contentbox {
  background: #f5f7fa; /* 更为干净的底色 */
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vanGrid {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f5f7fa;
}

.vanGridTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  margin-bottom: 12px;
}

.vanGridTitleMain {
  display: flex;
  align-items: center;

  img {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }

  span {
    color: #1f2d3d;
    font-size: 18px;
    font-weight: 700;
  }
}

.more-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #a8b0bd;
  font-size: 30px;
  line-height: 34px;
  text-align: center;
  padding: 0;

  &:active {
    background: #edf0f3;
  }
}

.more-nav-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 16px;
}

.more-nav-card {
  min-height: 108px;
  padding: 16px 10px;
  border: 1px solid #edf0f3;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(31, 45, 61, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(31, 45, 61, 0.04);
  }
}

.more-nav-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
  border-radius: 14px;
  background: #f7f9fb;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }
}

.more-nav-text {
  color: #303133;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}

.contentPadding {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.mapBox {
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  .minute {
    position: absolute;
    top: -200px;
    left: 5%;
    width: 90%;
    height: 48px;
    z-index: 999;
    background: #ffffff;
    border: 1px solid #ebedf0;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    margin-top: 12px;
    animation: stopAnim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

    > img {
      display: inline-block;
      width: 22px;
      height: 22px;
    }

    > span {
      font-size: 15px;
      margin-left: 8px;
      font-weight: 600;

      &.tsTitle {
        color: #5ecef6;
      }

      &.tsRed {
        color: #ff4d4f;
      }
    }
  }
}

.map-loading {
  position: absolute;
  inset: 5px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  pointer-events: none;
}

@keyframes stopAnim {
  from {
    top: -200px;
    opacity: 0;
  }
  to {
    top: 0;
    opacity: 1;
  }
}

.map {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  height: 100%;

  :deep(.anchorBL) {
    left: 10px !important;
    bottom: 10px !important;
  }

  :deep(.BMap_cpyCtrl) {
    bottom: 10px !important;
  }
}

.installer {
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #ebedf0;
  margin: 12px auto 0 auto;
  padding: 10px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  > ul {
    display: flex;
    justify-content: space-around;
    align-items: center;

    > li {
      padding: 6px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.92);
        opacity: 0.8;
      }

      img {
        width: 26px;
        height: 26px;
        margin-bottom: 4px;
      }

      p {
        font-size: 12px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
  //ull
}
//installer

.staff-sheet {
  overflow: hidden;
}

.staff-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.sheet-handle {
  width: 38px;
  height: 4px;
  margin: 10px auto 8px;
  border-radius: 999px;
  background: #d8dee6;
}

.findAll {
  width: 100%;
  padding: 2px 16px 0;
  box-sizing: border-box;
  overflow-y: auto;

  ul {
    padding-bottom: 20px;

    > li.staff-card {
      margin-top: 14px;
      background: #fff;
      position: relative;
      padding: 16px 18px;
      border: 1px solid #edf0f3;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(31, 45, 61, 0.05);
      text-align: left;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .status-icon {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 45px;
      }

      > .staff-row {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        min-height: 26px;
        padding: 3px 0;

        & + .staff-row {
          margin-top: 5px;
        }

        .info-label {
          width: 72px;
          flex-shrink: 0;
          color: #8f98a8;
          font-size: 14px;
          font-weight: 400;
          line-height: 22px;
          letter-spacing: 0;
          text-align: left;
        }

        .info-value {
          flex: 1;
          min-width: 0;
          color: #303133;
          font-size: 15px;
          font-weight: 500;
          line-height: 22px;
          display: flex;
          align-items: center;
          word-break: break-all;

          &.role-clickable {
            flex: none;
            max-width: calc(100% - 72px);
            color: #5ecef6;
            cursor: pointer;
            padding: 2px 8px;
            border-radius: 999px;
            background: rgba(94, 206, 246, 0.1);
            font-size: 14px;

            > img {
              width: 16px;
              height: 16px;
              margin-left: 6px;
            }
          }
        }
      }

      > .staff-row:first-child {
        .info-value {
          color: #1f2d3d;
          font-weight: 600;
        }
      }
    }
    //lo
  }
  //ul
}
//findAll

.userContent {
  width: 100%;
  padding: 26px 24px 22px;
  box-sizing: border-box;

  > h4 {
    text-align: left;
    font-size: 18px;
    color: #303133;
    display: flex;
    align-items: center;
    margin: 0 0 22px;

    > img {
      width: 22px;
      height: 22px;
      margin-right: 8px;
    }
  }

  .searchUser {
    .searchUserLi {
      min-height: 72px;
      border: 1px solid #ebedf0;
      border-radius: 12px;
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      padding: 12px 16px;
      background: #f7f9fb;
      box-sizing: border-box;
      transition: all 0.3s;

      &.error {
        border-color: #ff4d4f;
        background: #fff8f8;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.08);
      }

      .search-label {
        display: block;
        font-size: 13px;
        color: #7a8594;
        line-height: 18px;
        margin-bottom: 8px;
        text-align: left;
        width: auto;
        height: auto;
      }

      .search-input {
        display: block;
        font-size: 15px;
        color: #303133;
        background: transparent;
        border: none;
        outline: none;
        text-align: left;
        line-height: 22px;
        width: 100%;
        height: 22px;
        padding: 0;

        &::placeholder {
          color: #b4bcc8;
        }
      }
    }
    //searchUserLi

    .telTs {
      font-size: 12px;
      color: #ff4d4f;
      text-align: left;
      padding: 6px 2px 0;
    }

    .searchUserbutton {
      margin-top: 26px;

      :deep(.arco-btn) {
        height: 44px;
        font-size: 15px;
        font-weight: 600;
        box-shadow: 0 8px 18px rgba(94, 206, 246, 0.24);
      }
    }
  }
  //searchUser
}

.inforTs {
  padding: 20% 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  > img {
    width: 60px;
    height: 60px;
    margin-bottom: 12px;
    opacity: 0.8;
  }

  > p {
    font-size: 14px;
    color: #909399;
  }
}

.currentPostion {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  ul {
    > li {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      margin-bottom: 12px;
      text-align: left; /* 左对齐 */

      &:last-child {
        margin-bottom: 0;
      }

      span {
        font-size: 14px;
        color: #909399;
        width: 75px;
        flex-shrink: 0;
        line-height: 1.5;
      }

      > p {
        font-size: 15px;
        color: #303133;
        font-weight: 500;
        line-height: 1.5;
        margin: 0;
        flex: 1;
      }
    }
  }
}
//currentPostion

.addLocation {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  > button {
    flex: 1;
    height: 40px;
    font-size: 15px;
    outline: none;
    border-radius: 20px;
    color: #fff;
    font-weight: 500;
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
    }

    &:nth-child(1) {
      background: linear-gradient(135deg, #5ecef6 0%, #3db9ec 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(94, 206, 246, 0.3);
    }

    &:nth-child(2) {
      background: #f0f2f5;
      border: none;
      color: #606266;
    }
  }
}
//addLocation

.wdk-content {
  padding: 0 24px;

  .title {
    font-size: 18px;
    color: #303133;
    text-align: center;
    line-height: 25px;
    margin: 12px 34px 22px;
  }

  .selecttime {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    background: #f8f9fa;
    border: 1px solid #ebedf0;
    border-radius: 12px;
    padding: 13px 16px;
    margin-bottom: 24px;

    span {
      font-size: 14px;
      color: #606266;
      width: auto;
      line-height: 20px;
      text-align: left;
    }

    input {
      width: 100%;
      min-height: 24px;
      padding: 0;
      border: none;
      background: transparent;
      text-align: left;
      font-size: 15px;
      color: #303133;
      outline: none;
      line-height: 24px;

      &::placeholder {
        color: #c0c4cc;
      }
    }
  }
}

.radar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ff4d4f;
}

.moreTs {
  padding: 16px 0;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.home-page {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contentbox {
  width: 100vw;
  height: 100vh;
  min-width: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background: #eef3f5;
}

.home-sidebar {
  min-width: 0;
  height: 100%;
  padding: 22px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #102d36;
  color: #fff;
  overflow: hidden;

  :deep(.arco-layout-sider-children) {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 0 8px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  img {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  strong,
  span {
    display: block;
    text-align: left;
  }

  strong {
    font-size: 18px;
    line-height: 24px;
  }

  span {
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    line-height: 18px;
  }
}

.sidebar-group {
  padding-top: 20px;
}

.sidebar-menu {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.sidebar-label {
  margin: 0 8px 8px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 12px;
  line-height: 18px;
  text-align: left;
}

.sidebar-action {
  width: 100%;
  height: 42px;
  margin-bottom: 6px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
  transition:
    background 0.18s ease,
    color 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  :deep(.arco-btn-content) {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
  }

  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
    flex: none;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.home-main {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  padding: 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-toolbar {
  min-height: 76px;
  padding: 0 16px;
  margin-bottom: 14px;
  border: 1px solid #e4eaed;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-shadow: 0 6px 20px rgba(16, 45, 54, 0.05);
}

.toolbar-title {
  min-width: 0;
  text-align: left;

  h1 {
    margin: 0;
    color: #152f38;
    font-size: 22px;
    line-height: 30px;
    font-weight: 700;
  }

  p {
    margin: 4px 0 0;
    color: #74848a;
    font-size: 13px;
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.toolbar-meta {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-pill,
.coordinate-pill {
  height: 30px;
  padding: 0 12px;
  border: 1px solid #e4eaed;
  border-radius: 999px;
  color: #617279;
  background: #f7fafb;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 30px;
}

.status-pill.ready {
  color: #0f9f82;
  border-color: rgba(19, 185, 150, 0.22);
  background: rgba(19, 185, 150, 0.08);
}

.map-workspace {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e4eaed;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 8px 26px rgba(16, 45, 54, 0.06);

  :deep(.mapBox) {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.map) {
    border-radius: 0;
  }

  :deep(.map-loading) {
    inset: 0;
    border-radius: 0;
  }
}

:global(.route-loading-modal .arco-modal) {
  width: 300px;
  border-radius: 8px;
}

:global(.route-loading-modal .arco-modal-body) {
  padding: 28px;
}

.route-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1f2d3d;
  font-size: 14px;
  line-height: 20px;
}

:global(html[data-theme="dark"] .home-page) {
  background: #111827;
}

:global(html[data-theme="dark"] .home-toolbar) {
  border-color: #30363d;
  background: #161b22;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
}

:global(html[data-theme="dark"] .toolbar-title h1) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .toolbar-title p) {
  color: #9ca3af;
}

:global(
  html[data-theme="dark"] .toolbar-actions .arco-btn:not(.arco-btn-primary)
) {
  border-color: #30363d;
  background: #0d1117;
  color: #d1d5db;
}

:global(
  html[data-theme="dark"]
    .toolbar-actions
    .arco-btn:not(.arco-btn-primary):hover
) {
  border-color: #3b82f6;
  background: #111827;
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .toolbar-actions .arco-btn-primary) {
  color: #ffffff;
}

:global(html[data-theme="dark"] .status-pill),
:global(html[data-theme="dark"] .coordinate-pill) {
  border-color: #30363d;
  background: #0d1117;
  color: #9ca3af;
}

:global(html[data-theme="dark"] .status-pill.ready) {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
}

:global(html[data-theme="dark"] .map-workspace) {
  border-color: #30363d;
  background: #161b22;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
}

:global(html[data-theme="dark"] .map-workspace .map-loading) {
  background: rgba(17, 24, 39, 0.82);
  color: #d1d5db;
}

:global(html[data-theme="dark"] .route-loading-modal .arco-modal),
:global(html[data-theme="dark"] .route-loading-modal .arco-modal-body) {
  background: #161b22;
}

:global(html[data-theme="dark"] .route-loading) {
  color: #d1d5db;
}
</style>
