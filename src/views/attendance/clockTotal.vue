<template>
  <div class="clock-total-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="router.back()">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>打卡统计</h1>
          <p>按人员、日期或月份查看考勤统计，并导出 Excel 报表。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/attendance-statistics.png" alt="" />
      </div>
    </section>

    <section class="filter-section">
      <AForm class="filter-form" :model="filterFormModel" layout="vertical">
        <AFormItem label="被统计人">
          <ASelect
            v-model="userPhone"
            allow-clear
            allow-search
            placeholder="请选择被统计人"
            @change="onUserChange"
          >
            <AOption
              v-for="item in userOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </AFormItem>

        <AFormItem label="统计周期">
          <ASelect v-model="period" placeholder="请选择统计周期">
            <AOption
              v-for="item in dateOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </AFormItem>

        <AFormItem v-if="period === '月'" label="年份">
          <ASelect
            v-model="year"
            placeholder="请选择年份"
            @change="onYearChange"
          >
            <AOption
              v-for="item in yearOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </AFormItem>

        <AFormItem v-if="period === '日'" label="日期">
          <ADatePicker
            v-model="selectedDay"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
            @change="selectDay"
          />
        </AFormItem>

        <AFormItem label="操作">
          <AButton class="reset-button" @click="resetFilters">
            <template #icon>
              <Icon icon="ri:refresh-line" />
            </template>
            重置
          </AButton>
        </AFormItem>
      </AForm>
    </section>

    <section v-if="period === '月'" class="month-section">
      <div class="section-title">
        <h2>月份选择</h2>
        <span>{{ year }} 年</span>
      </div>
      <div class="month-tabs">
        <button
          v-for="index in 12"
          :key="index"
          class="month-tab"
          :class="{ active: activeTab === index - 1 }"
          type="button"
          @click="monthChange(index - 1)"
        >
          {{ index }}月
        </button>
      </div>
    </section>

    <section v-if="period === '月'" class="stats-grid">
      <article
        v-for="item in monthStats"
        :key="item.label"
        :class="['stat-card', `theme-${item.theme}`]"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section class="export-section">
      <div class="section-title">
        <h2>数据导出</h2>
        <span>{{ period === "月" ? `${activeTab + 1}月` : "日统计" }}</span>
      </div>
      <div class="export-actions">
        <AButton type="primary" @click="exportSingleRecord">
          <template #icon>
            <Icon icon="ri:download-2-line" />
          </template>
          导出单个员工考勤
        </AButton>
        <AButton @click="exportAllRecord">
          <template #icon>
            <Icon icon="ri:file-excel-2-line" />
          </template>
          导出所有员工考勤信息
        </AButton>
      </div>
    </section>

    <AModal
      v-model:visible="showDayDk"
      :footer="false"
      modal-class="day-record-modal"
      title="日统计"
    >
      <div class="day-panel">
        <div class="modal-summary">
          <Icon icon="ri:calendar-check-line" />
          <span>{{ selectedDay || "所选日期" }} 打卡记录</span>
        </div>
        <div class="record-list">
          <div
            v-for="(item, index) in dayDkData"
            :key="item.id || item.recorddate || index"
            class="record-row"
          >
            <span>第 {{ index + 1 }} 次打卡时间</span>
            <strong>{{ item.recorddate || "-" }}</strong>
          </div>
        </div>
      </div>
    </AModal>

    <AModal
      v-model:visible="excelShow"
      :footer="false"
      modal-class="export-modal"
      title="导出 Excel"
    >
      <div class="export-panel">
        <div class="export-icon">
          <img src="../../assets/images/attendance-statistics.png" alt="" />
        </div>
        <h3>确认导出</h3>
        <p>
          是否要把
          <span>{{ excelName }}</span>
          导出为 Excel 表？
        </p>
        <ATag color="blue">{{ lists.length }} 条记录</ATag>
        <div class="excel-footer">
          <AButton @click="excelShow = false">取消</AButton>
          <download-excel
            class="export-excel-wrapper"
            :data="exportRows"
            :header="excelName"
            :fields="fields"
            :name="excelName"
            :before-generate="startDownload"
          >
            <AButton type="primary">导出</AButton>
          </download-excel>
        </div>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import {
  exportAttendanceByDisnameDate,
  exportAttendanceByPhone,
  fetchAttendanceByPhone,
  fetchAttendanceSummaryByPhone,
} from "../../api/attendance";
import { fetchAllUsers } from "../../api/user";

const router = useRouter();
const filterFormModel = {};
const excelName = ref("");
const fields = ref({});
const excelShow = ref(false);
const dayDkData = ref([]);
const showDayDk = ref(false);
const activeTab = ref(0);
const minDate = new Date(2010, 0, 1);
const maxDate = new Date(2030, 0, 31);
const year = ref(new Date().getFullYear());
const username = ref("");
const userlists = ref([]);
const yearlists = ref([]);
const period = ref("月");
const datelist = ["日", "月"];
const totalData = ref([]);
const userPhone = ref(undefined);
const lists = ref([]);
const selectedDay = ref("");

const yearOptions = computed(() =>
  yearlists.value.map((item) => ({
    text: String(item),
    value: item,
  })),
);
const userOptions = computed(() =>
  userlists.value.map((item) => ({
    ...item,
    text: item.username
      ? `${item.username}（${item.userphone || "-"}）`
      : item.userphone,
    value: item.userphone,
  })),
);
const dateOptions = computed(() =>
  datelist.map((item) => ({
    text: item,
    value: item,
  })),
);
const monthStats = computed(() => [
  { label: "总工时", value: totalData.value[1] || 0, theme: "blue" },
  { label: "缺卡次数", value: totalData.value[2] || 0, theme: "red" },
  { label: "早退次数", value: totalData.value[3] || 0, theme: "orange" },
  { label: "出勤天数", value: totalData.value[4] || 0, theme: "green" },
]);
const exportRows = computed(() =>
  lists.value.map((item, index) => ({
    ...item,
    ID: index + 1,
  })),
);

onMounted(() => {
  getFindAll();
  initTime();
});

function warning(message) {
  Message.warning(message);
}

function disabledDate(current) {
  const time = new Date(current).getTime();
  return time < minDate.getTime() || time > maxDate.getTime();
}

function getMonthStart() {
  return dayjs(new Date(`${year.value}-${activeTab.value + 1}`).getTime())
    .startOf("month")
    .format("YYYY-MM-DD");
}

function getMonthEnd() {
  return dayjs(new Date(`${year.value}-${activeTab.value + 1}`).getTime())
    .endOf("month")
    .format("YYYY-MM-DD");
}

function initTime() {
  const currentYear = new Date().getFullYear();
  yearlists.value = Array.from(
    { length: currentYear - 1980 + 1 },
    (_item, index) => currentYear - index,
  );
  activeTab.value = new Date().getMonth();
}

function resetFilters() {
  year.value = new Date().getFullYear();
  activeTab.value = new Date().getMonth();
  username.value = "";
  period.value = "月";
  totalData.value = [];
  userPhone.value = undefined;
  lists.value = [];
  selectedDay.value = "";
  dayDkData.value = [];
  showDayDk.value = false;
  excelShow.value = false;
  excelName.value = "";
  fields.value = {};
  Message.success("筛选条件已重置");
}

function onYearChange() {
  if (!userPhone.value) {
    warning("请选择被统计人！");
    return;
  }

  getDkData();
}

function onUserChange(phone) {
  const row = userlists.value.find((item) => item.userphone === phone);
  username.value = row?.username || "";

  if (period.value === "月") {
    monthChange(activeTab.value);
  } else if (selectedDay.value) {
    selectDay(selectedDay.value);
  }
}

function getFindAll(type) {
  fetchAllUsers().then((res) => {
    const rows = Array.isArray(res.data) ? res.data : [];
    userlists.value = type
      ? rows.filter((item) => item.userrole === type)
      : rows;
  });
}

function monthChange(monthIndex = activeTab.value) {
  activeTab.value = monthIndex;

  if (!userPhone.value) {
    warning("请选择被统计人！");
    return;
  }

  getDkData();
}

function selectDay(day) {
  if (!day) {
    return;
  }

  if (!userPhone.value) {
    warning("请选择被统计人！");
    return;
  }

  const targetDay = dayjs(day).format("YYYY-MM-DD");
  selectedDay.value = targetDay;
  getDkMonthData(targetDay);
}

function getDkMonthData(date) {
  const params = {
    phone: userPhone.value,
    dates: date,
  };

  fetchAttendanceByPhone(params).then((res) => {
    dayDkData.value = Array.isArray(res.data) ? res.data : [];

    if (!dayDkData.value.length) {
      warning("当日无打卡信息！");
      return;
    }

    showDayDk.value = true;
  });
}

function getDkData() {
  const startDay = getMonthStart();
  const endDay = getMonthEnd();
  const params = {
    phone: userPhone.value,
    start: startDay,
    end: endDay,
  };

  fetchAttendanceSummaryByPhone(params).then((res) => {
    const row = res.data?.[userPhone.value];
    totalData.value = row ? String(row).split("&") : [];
  });
}

function buildExportData(source) {
  const summaryLabels = [
    "总工时",
    "缺卡次数",
    "迟到次数",
    "早退次数",
    "出勤天数",
    "严重迟到次数",
    "严重早退次数",
    "迟到时长",
    "早退时长",
    "严重迟到时长",
    "严重早退时长",
  ];
  const exportFields = {};
  const exportList = [];
  let index = 0;

  Object.keys(source || {}).forEach((phone) => {
    const itemArr = String(source[phone] || "").split("&");
    const row = {
      name: itemArr[0],
      phone,
    };

    if (index === 0) {
      exportFields["序号"] = "ID";
      exportFields["姓名"] = "name";
      exportFields["电话"] = "phone";
    }

    for (let i = 1; i < itemArr.length; i += 1) {
      const key = `d${i}`;
      row[key] = itemArr[i];

      if (index === 0) {
        exportFields[summaryLabels[i - 1] || `统计项${i}`] = key;
      }
    }

    exportList.push(row);
    index += 1;
  });

  fields.value = exportFields;
  lists.value = exportList;
}

function openExportDialog(name) {
  if (!lists.value.length) {
    Message.error("暂无可导出的考勤信息");
    return;
  }

  excelName.value = name;
  excelShow.value = true;
}

function exportSingleRecord() {
  if (!userPhone.value) {
    warning("请选择统计人");
    return;
  }

  const params = {
    phone: userPhone.value,
    start: getMonthStart(),
    end: getMonthEnd(),
  };

  exportAttendanceByPhone(params).then((res) => {
    buildExportData(res.data || {});
    openExportDialog(
      `${username.value || userPhone.value}${activeTab.value + 1}月考勤信息`,
    );
  });
}

function exportAllRecord() {
  const params = {
    start: getMonthStart(),
    end: getMonthEnd(),
  };

  exportAttendanceByDisnameDate(params).then((res) => {
    buildExportData(res.data || {});
    openExportDialog(`${activeTab.value + 1}月全员考勤信息`);
  });
}

async function startDownload() {
  excelShow.value = false;

  window.setTimeout(() => {
    Message.success(`${excelName.value}导出成功`);
  }, 800);
}
</script>

<style lang="scss" scoped>
.clock-total-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

.page-header,
.filter-section,
.month-section,
.export-section {
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

.filter-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 24px;

  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-select),
  :deep(.arco-picker) {
    width: 100%;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f4;
    }

    &.arco-select-focus,
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

.reset-button {
  width: 100%;
  background-color: #f1f3f4;
  color: #5f6368;
  border: 1px solid transparent;

  &:hover {
    background-color: #e8eaed;
    color: #202124;
  }

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.section-title {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  span {
    color: #5f6368;
    font-size: 13px;
    background-color: #f1f3f4;
    padding: 2px 8px;
    border-radius: 4px;
  }
}

.month-tabs {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 8px;
}

.month-tab {
  height: 36px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  background: #ffffff;
  color: #5f6368;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d2e3fc;
    background: #f8fbff;
    color: #1a73e8;
  }

  &.active {
    border-color: #1a73e8;
    background: #e8f0fe;
    color: #1a73e8;
    font-weight: 500;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
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

  &.theme-green {
    background: #e6f4ea;
    border-color: #ceead6;
    strong {
      color: #137333;
    }
  }
}

.export-actions {
  display: flex;
  gap: 12px;

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.modal-summary {
  padding: 14px 16px;
  border: 1px solid #d2e3fc;
  border-radius: 8px;
  background: #e8f0fe;
  color: #1a73e8;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;

  svg {
    width: 20px;
    height: 20px;
  }
}

.record-list {
  margin-top: 16px;
  display: grid;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.record-row {
  padding: 14px 16px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  span {
    color: #5f6368;
    font-size: 13px;
  }

  strong {
    color: #202124;
    font-size: 15px;
    font-weight: 500;
    word-break: break-all;
  }
}

.export-panel {
  text-align: center;

  h3 {
    margin: 16px 0 8px;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  }

  p {
    margin: 0 0 16px;
    color: #5f6368;
    font-size: 14px;
    line-height: 22px;

    span {
      color: #1a73e8;
      font-weight: 500;
    }
  }
}

.export-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 12px;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.excel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.export-excel-wrapper {
  display: contents;
}

:global(.day-record-modal .arco-modal),
:global(.export-modal .arco-modal) {
  width: 480px;
  border-radius: 8px;
}

:global(.day-record-modal .arco-modal-header),
:global(.export-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.day-record-modal .arco-modal-title),
:global(.export-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

:global(.day-record-modal .arco-modal-body),
:global(.export-modal .arco-modal-body) {
  padding: 24px;
}

:global(html[data-theme="dark"] .clock-total-page) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .clock-total-page .page-header),
:global(html[data-theme="dark"] .clock-total-page .filter-section),
:global(html[data-theme="dark"] .clock-total-page .month-section),
:global(html[data-theme="dark"] .clock-total-page .export-section) {
  border-color: #2d3748;
  background: #111827;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(html[data-theme="dark"] .clock-total-page .header-main h1),
:global(html[data-theme="dark"] .clock-total-page .section-title h2) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-total-page .header-main p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-total-page .back-button) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-total-page .back-button:hover) {
  color: #f8fafc;
  background: #1f2937;
}

:global(html[data-theme="dark"] .clock-total-page .header-icon),
:global(html[data-theme="dark"] .clock-total-page .export-icon) {
  background: rgba(59, 130, 246, 0.14);
}

:global(
  html[data-theme="dark"]
    .clock-total-page
    .filter-form
    .arco-form-item-label-col
    > label
) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-total-page .filter-form .arco-select),
:global(html[data-theme="dark"] .clock-total-page .filter-form .arco-picker) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(
  html[data-theme="dark"] .clock-total-page .filter-form .arco-select:hover
),
:global(
  html[data-theme="dark"] .clock-total-page .filter-form .arco-picker:hover
) {
  background: #1f2937;
}

:global(
  html[data-theme="dark"] .clock-total-page .filter-form .arco-select-focus
),
:global(
  html[data-theme="dark"] .clock-total-page .filter-form .arco-picker-focused
) {
  border-color: #3b82f6;
  background: #0b1220;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.24);
}

:global(
  html[data-theme="dark"] .clock-total-page .filter-form .arco-select-view-value
),
:global(
  html[data-theme="dark"]
    .clock-total-page
    .filter-form
    .arco-picker-input
    input
) {
  color: #f8fafc;
}

:global(
  html[data-theme="dark"]
    .clock-total-page
    .filter-form
    .arco-select-view-placeholder
),
:global(
  html[data-theme="dark"]
    .clock-total-page
    .filter-form
    .arco-picker-input
    input::placeholder
) {
  color: #64748b;
}

:global(html[data-theme="dark"] .clock-total-page .reset-button) {
  border-color: #2d3748;
  background: #1f2937;
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-total-page .reset-button:hover) {
  background: #273244;
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-total-page .section-title span) {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.14);
}

:global(html[data-theme="dark"] .clock-total-page .month-tab) {
  border-color: #2d3748;
  background: #0f172a;
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-total-page .month-tab:hover) {
  border-color: rgba(96, 165, 250, 0.45);
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
}

:global(html[data-theme="dark"] .clock-total-page .month-tab.active) {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
  color: #bfdbfe;
}

:global(html[data-theme="dark"] .clock-total-page .stat-card) {
  border-color: #2d3748;
}

:global(html[data-theme="dark"] .clock-total-page .stat-card span) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-total-page .stat-card.theme-blue) {
  background: rgba(37, 99, 235, 0.13);
  border-color: rgba(96, 165, 250, 0.28);
}

:global(
  html[data-theme="dark"] .clock-total-page .stat-card.theme-blue strong
) {
  color: #60a5fa;
}

:global(html[data-theme="dark"] .clock-total-page .stat-card.theme-red) {
  background: rgba(220, 38, 38, 0.13);
  border-color: rgba(248, 113, 113, 0.26);
}

:global(html[data-theme="dark"] .clock-total-page .stat-card.theme-red strong) {
  color: #f87171;
}

:global(html[data-theme="dark"] .clock-total-page .stat-card.theme-orange) {
  background: rgba(217, 119, 6, 0.13);
  border-color: rgba(251, 191, 36, 0.26);
}

:global(
  html[data-theme="dark"] .clock-total-page .stat-card.theme-orange strong
) {
  color: #fbbf24;
}

:global(html[data-theme="dark"] .clock-total-page .stat-card.theme-green) {
  background: rgba(22, 163, 74, 0.13);
  border-color: rgba(74, 222, 128, 0.24);
}

:global(
  html[data-theme="dark"] .clock-total-page .stat-card.theme-green strong
) {
  color: #4ade80;
}

:global(
  html[data-theme="dark"]
    .clock-total-page
    .export-actions
    .arco-btn:not(.arco-btn-primary)
) {
  border-color: #2d3748;
  background: #1f2937;
  color: #cbd5e1;
}

:global(
  html[data-theme="dark"]
    .clock-total-page
    .export-actions
    .arco-btn:not(.arco-btn-primary):hover
) {
  background: #273244;
  color: #f8fafc;
}

:global(html[data-theme="dark"] .day-record-modal .arco-modal),
:global(html[data-theme="dark"] .export-modal .arco-modal) {
  background: #111827;
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .day-record-modal .arco-modal-header),
:global(html[data-theme="dark"] .export-modal .arco-modal-header) {
  border-bottom-color: #2d3748;
}

:global(html[data-theme="dark"] .day-record-modal .arco-modal-title),
:global(html[data-theme="dark"] .export-modal .arco-modal-title),
:global(html[data-theme="dark"] .export-modal .export-panel h3) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .day-record-modal .arco-modal-close-btn),
:global(html[data-theme="dark"] .export-modal .arco-modal-close-btn) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .day-record-modal .modal-summary) {
  border-color: rgba(96, 165, 250, 0.28);
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
}

:global(
  html[data-theme="dark"]
    .day-record-modal
    .record-list::-webkit-scrollbar-thumb
) {
  background: #334155;
}

:global(html[data-theme="dark"] .day-record-modal .record-row) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .day-record-modal .record-row span),
:global(html[data-theme="dark"] .export-modal .export-panel p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .day-record-modal .record-row strong) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .export-modal .export-panel p span) {
  color: #93c5fd;
}

:global(
  html[data-theme="dark"]
    .export-modal
    .excel-footer
    .arco-btn:not(.arco-btn-primary)
) {
  border-color: #2d3748;
  background: #1f2937;
  color: #cbd5e1;
}

:global(
  html[data-theme="dark"]
    .export-modal
    .excel-footer
    .arco-btn:not(.arco-btn-primary):hover
) {
  background: #273244;
  color: #f8fafc;
}

@media (max-width: 1280px) {
  .filter-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .month-tabs {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
