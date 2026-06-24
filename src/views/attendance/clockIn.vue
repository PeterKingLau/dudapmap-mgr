<template>
  <div class="clockin-page">
    <section class="page-hero">
      <div class="hero-copy">
        <h1>打卡查询</h1>
        <p>按月份、日期、人员和时长维度查询人员打卡数据。</p>
      </div>
      <div class="hero-icon">
        <img src="../../assets/images/nav-clock-query.png" alt="" />
      </div>
    </section>

    <section class="query-grid">
      <button
        v-for="item in gridItems"
        :key="item.text"
        class="query-card"
        type="button"
        @click="item.action"
      >
        <span class="query-icon">
          <img :src="$asset(item.icon)" alt="" />
        </span>
        <span class="query-info">
          <strong>{{ item.text }}</strong>
          <small>{{ item.description }}</small>
        </span>
        <Icon class="query-arrow" icon="ri:arrow-right-line" />
      </button>
    </section>

    <AModal
      v-model:visible="dyshow"
      :footer="false"
      title="指定月份查询"
      modal-class="query-modal"
    >
      <AForm :model="{}" layout="vertical" class="query-form">
        <AFormItem label="选择月份">
          <ADatePicker
            v-model="monthValue"
            mode="month"
            value-format="YYYY-MM"
            format="YYYY-MM"
            placeholder="请选择月份"
            :disabled-date="disabledDate"
          />
        </AFormItem>
      </AForm>
      <div class="modal-actions">
        <AButton @click="dyshow = false">取消</AButton>
        <AButton type="primary" @click="dySearch">查询</AButton>
      </div>
    </AModal>

    <AModal
      v-model:visible="dtshow"
      :footer="false"
      title="指定日期查询"
      modal-class="query-modal"
    >
      <AForm :model="{}" layout="vertical" class="query-form">
        <AFormItem label="选择日期">
          <ADatePicker
            v-model="dayValue"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
          />
        </AFormItem>
      </AForm>
      <div class="modal-actions">
        <AButton @click="dtshow = false">取消</AButton>
        <AButton type="primary" @click="dtSearch">查询</AButton>
      </div>
    </AModal>

    <AModal
      v-model:visible="drshow"
      :footer="false"
      title="指定人员查询当月"
      modal-class="query-modal"
    >
      <AForm :model="{}" layout="vertical" class="query-form">
        <AFormItem label="电话号码">
          <ASelect
            v-model="monthTel"
            allow-clear
            allow-search
            :loading="phoneLoading"
            placeholder="请选择电话号码"
            @focus="selectAlltell"
          >
            <AOption
              v-for="item in tellAll"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="选择月份">
          <ADatePicker
            v-model="monthPeopledate"
            mode="month"
            value-format="YYYY-MM"
            format="YYYY-MM"
            placeholder="请选择月份"
            :disabled-date="disabledDate"
          />
        </AFormItem>
      </AForm>
      <div class="modal-actions">
        <AButton @click="drshow = false">取消</AButton>
        <AButton type="primary" @click="drMonethSearch">查询</AButton>
      </div>
    </AModal>

    <AModal
      v-model:visible="drdtshow"
      :footer="false"
      title="指定人员查询当天"
      modal-class="query-modal"
    >
      <AForm :model="{}" layout="vertical" class="query-form">
        <AFormItem label="电话号码">
          <ASelect
            v-model="drtelValue"
            allow-clear
            allow-search
            :loading="phoneLoading2"
            placeholder="请选择电话号码"
            @focus="selectAlltell2"
          >
            <AOption
              v-for="item in tellAll2"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="选择日期">
          <ADatePicker
            v-model="drtelValuedate"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
          />
        </AFormItem>
      </AForm>
      <div class="modal-actions">
        <AButton @click="drdtshow = false">取消</AButton>
        <AButton type="primary" @click="dayPeoleSearch">查询</AButton>
      </div>
    </AModal>

    <AModal
      v-model:visible="clockShow"
      :footer="false"
      title="打卡时长查询"
      modal-class="query-modal"
    >
      <AForm :model="{}" layout="vertical" class="query-form">
        <AFormItem label="开始日期">
          <ADatePicker
            v-model="durationStartDate"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择开始日期"
            :disabled-date="disabledDate"
          />
        </AFormItem>
        <AFormItem label="结束日期">
          <ADatePicker
            v-model="durationEndDate"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择结束日期"
            :disabled-date="disabledDate"
          />
        </AFormItem>
      </AForm>
      <div class="modal-actions">
        <AButton @click="clockShow = false">取消</AButton>
        <AButton type="primary" @click="playClockSerach">查询</AButton>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { validatePhoneNumber } from "../../utils/validators";
import { fetchUserPhones } from "../../api/user";

const router = useRouter();
const today = new Date();
const minDate = new Date(2023, 0, 1);

const dyshow = ref(false);
const dtshow = ref(false);
const drshow = ref(false);
const drdtshow = ref(false);
const clockShow = ref(false);
const monthValue = ref("");
const dayValue = ref("");
const monthTel = ref("");
const monthPeopledate = ref("");
const drtelValue = ref("");
const drtelValuedate = ref("");
const tellAll = ref([]);
const tellAll2 = ref([]);
const phoneLoading = ref(false);
const phoneLoading2 = ref(false);
const durationStartDate = ref("");
const durationEndDate = ref("");

const gridItems = computed(() => [
  {
    icon: "attendance-month.png",
    text: "指定月份查询",
    description: "查询某一月打卡的全部信息",
    action: dyclick,
  },
  {
    icon: "attendance-day.png",
    text: "指定日期查询",
    description: "查询某月其中一天的全部信息",
    action: dtclick,
  },
  {
    icon: "attendance-user-month.png",
    text: "指定人员查询当月",
    description: "按人员和月份筛选打卡信息",
    action: drdyclick,
  },
  {
    icon: "attendance-user-day.png",
    text: "指定人员查询当天",
    description: "按人员和日期筛选打卡信息",
    action: drdtdyclick,
  },
  {
    icon: "attendance-duration.png",
    text: "打卡时长",
    description: "按时间段查询打卡时长数据",
    action: playClockIn,
  },
  {
    icon: "attendance-statistics.png",
    text: "打卡信息统计",
    description: "查看打卡数据统计报表",
    action: toClockTotal,
  },
]);

function warning(message) {
  Message.warning(message);
}

function dyclick() {
  dyshow.value = true;
}

function dySearch() {
  if (!monthValue.value) {
    warning("请选择月份进行查询！");
    return;
  }

  router.push({
    path: ROUTE_PATHS.attendance.clockInMonth,
    query: { month: monthValue.value },
  });
}

function dtclick() {
  dtshow.value = true;
}

function dtSearch() {
  if (!dayValue.value) {
    warning("请选择日期进行查询！");
    return;
  }

  router.push({
    path: ROUTE_PATHS.attendance.clockInDay,
    query: { day: dayValue.value },
  });
}

function drdyclick() {
  drshow.value = true;
  loadPhoneOptions(tellAll, phoneLoading);
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\s+/g, "");
}

function getPhoneRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.records)) {
    return data.records;
  }

  return [];
}

function getPhoneOptions(data) {
  const rows = getPhoneRows(data);
  const phones = new Set();

  return rows.reduce((options, item) => {
    const phone = normalizePhone(item.userphone);

    if (!validatePhoneNumber(phone) || phones.has(phone)) {
      return options;
    }

    phones.add(phone);
    const username = item.username || "暂未上传名";
    const area =
      item.useravator && item.useravator !== "1" ? item.useravator : "";

    options.push({
      text: area ? `${username} ${phone} (${area})` : `${username} ${phone}`,
      value: phone,
    });

    return options;
  }, []);
}

function loadPhoneOptions(target, loading) {
  if (target.value.length || loading.value) {
    return;
  }

  loading.value = true;
  fetchUserPhones()
    .then((res) => {
      target.value = getPhoneOptions(res.data);

      if (!target.value.length) {
        warning("暂无可选择的电话号码！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function selectAlltell() {
  loadPhoneOptions(tellAll, phoneLoading);
}

function drMonethSearch() {
  if (!validatePhoneNumber(monthTel.value)) {
    warning("请选择电话号码！");
    return;
  }

  if (!monthPeopledate.value) {
    warning("请选择月份进行查询！");
    return;
  }

  router.push({
    path: ROUTE_PATHS.attendance.clockInMonthPeople,
    query: {
      monthPeopledate: monthPeopledate.value,
      monthTel: monthTel.value,
    },
  });
}

function drdtdyclick() {
  drdtshow.value = true;
  loadPhoneOptions(tellAll2, phoneLoading2);
}

function selectAlltell2() {
  loadPhoneOptions(tellAll2, phoneLoading2);
}

function dayPeoleSearch() {
  if (!validatePhoneNumber(drtelValue.value)) {
    warning("请选择电话号码！");
    return;
  }

  if (!drtelValuedate.value) {
    warning("请选择日期进行查询！");
    return;
  }

  router.push({
    path: ROUTE_PATHS.attendance.clockInDayPeople,
    query: {
      monthPeopledate: drtelValuedate.value,
      monthTel: drtelValue.value,
    },
  });
}

function playClockIn() {
  clockShow.value = true;
  durationStartDate.value = "";
  durationEndDate.value = "";
}

function toClockTotal() {
  router.push({ path: ROUTE_PATHS.attendance.clockTotal });
}

function getDateTimestamp(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function playClockSerach() {
  if (!durationStartDate.value || !durationEndDate.value) {
    warning("请选择时间段进行查询！");
    return;
  }

  if (
    getDateTimestamp(durationStartDate.value) >
    getDateTimestamp(durationEndDate.value)
  ) {
    warning("开始日期不能晚于结束日期！");
    return;
  }

  router.push({
    path: ROUTE_PATHS.attendance.playClockIntime,
    query: {
      start: durationStartDate.value,
      end: durationEndDate.value,
    },
  });
}

function disabledDate(current) {
  const time = new Date(current).getTime();
  const minTime = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    minDate.getDate(),
  ).getTime();
  const maxTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
  ).getTime();

  return time < minTime || time > maxTime;
}
</script>

<style lang="scss" scoped>
.clockin-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-hero {
  min-height: 120px;
  padding: 24px 32px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-copy {
  min-width: 0;
  flex: 1;
  text-align: left;

  h1 {
    margin: 8px 0;
    color: #202124;
    font-size: 24px;
    line-height: 32px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #5f6368;
    font-size: 14px;
    line-height: 20px;
  }
}

.hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #e8f0fe;
  color: #1a73e8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.query-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.query-card {
  min-height: 120px;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 16px;
  color: #202124;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d2e3fc;

    .query-arrow {
      color: #1a73e8;
    }
  }
}

.query-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
}

.query-info {
  min-width: 0;

  strong,
  small {
    display: block;
  }

  strong {
    color: #202124;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  small {
    margin-top: 4px;
    color: #5f6368;
    font-size: 13px;
    line-height: 18px;
  }
}

.query-arrow {
  width: 20px;
  height: 20px;
  color: #9aa0a6;
  transition: color 0.2s ease;
}

.query-form {
  :deep(.arco-picker),
  :deep(.arco-select) {
    width: 100%;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

:global(.query-modal .arco-modal) {
  width: 440px;
  border-radius: 8px;
}

:global(.query-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 20px;
}

:global(.query-modal .arco-modal-title) {
  font-weight: 500;
  color: #202124;
}

:global(.query-modal .arco-modal-body) {
  padding: 20px;
}

:global(html[data-theme="dark"] .clockin-page) {
  background: #111827;
}

:global(html[data-theme="dark"] .clockin-page .page-hero) {
  border-color: #30363d;
  background: #161b22;
}

:global(html[data-theme="dark"] .clockin-page .hero-copy h1) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .clockin-page .hero-copy p) {
  color: #9ca3af;
}

:global(html[data-theme="dark"] .clockin-page .hero-icon),
:global(html[data-theme="dark"] .clockin-page .query-icon) {
  background: rgba(56, 139, 253, 0.14);
}

:global(html[data-theme="dark"] .clockin-page .query-card) {
  border-color: #30363d;
  background: #161b22;
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .clockin-page .query-card:hover) {
  border-color: #3b82f6;
  background: #0d1117;
}

:global(html[data-theme="dark"] .clockin-page .query-info strong) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .clockin-page .query-info small) {
  color: #9ca3af;
}

:global(html[data-theme="dark"] .clockin-page .query-arrow) {
  color: #6b7280;
}

:global(html[data-theme="dark"] .clockin-page .query-card:hover .query-arrow) {
  color: #58a6ff;
}

:global(html[data-theme="dark"] .query-modal .arco-modal) {
  background: #161b22;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.42);
}

:global(html[data-theme="dark"] .query-modal .arco-modal-header) {
  border-bottom-color: #30363d;
  background: #161b22;
}

:global(html[data-theme="dark"] .query-modal .arco-modal-title) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .query-modal .arco-modal-close-btn) {
  color: #9ca3af;

  &:hover {
    color: #f3f4f6;
    background: #21262d;
  }
}

:global(html[data-theme="dark"] .query-modal .arco-modal-body) {
  background: #161b22;
}

:global(html[data-theme="dark"] .query-modal .arco-form-item-label-col > label) {
  color: #d1d5db;
}

:global(html[data-theme="dark"] .query-modal .arco-picker),
:global(html[data-theme="dark"] .query-modal .arco-select-view) {
  border-color: #30363d;
  background: #0d1117;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .query-modal .arco-picker:hover),
:global(html[data-theme="dark"] .query-modal .arco-select-view:hover) {
  border-color: #3b82f6;
  background: #111827;
}

:global(html[data-theme="dark"] .query-modal .arco-picker-input input),
:global(html[data-theme="dark"] .query-modal .arco-select-view-value) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .query-modal .arco-picker input::placeholder),
:global(html[data-theme="dark"] .query-modal .arco-select-view-placeholder) {
  color: #6b7280;
}

:global(html[data-theme="dark"] .query-modal .modal-actions .arco-btn:not(.arco-btn-primary)) {
  border-color: #30363d;
  background: #21262d;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .query-modal .modal-actions .arco-btn:not(.arco-btn-primary):hover) {
  border-color: #4b5563;
  background: #30363d;
  color: #f3f4f6;
}

@media (max-width: 1180px) {
  .query-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
