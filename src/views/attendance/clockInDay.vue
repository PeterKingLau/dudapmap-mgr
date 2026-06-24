<template>
  <div class="clock-day-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>{{ titleDay || "-" }} 打卡信息</h1>
          <p>查看指定日期的人员打卡次数与明细记录。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ lists.length }} 条记录</ATag>
        <div class="header-icon">
          <img src="../../assets/images/attendance-day.png" alt="" />
        </div>
      </div>
    </section>

    <div v-if="showLogin" class="loading-panel">
      <ASpin :size="28" />
      <span>正在请求数据，请稍后...</span>
    </div>

    <template v-else>
      <section class="summary-grid">
        <article class="summary-card theme-blue">
          <span>统计日期</span>
          <strong>{{ titleDay || "-" }}</strong>
        </article>
        <article class="summary-card theme-green">
          <span>打卡人数</span>
          <strong>{{ lists.length }}</strong>
        </article>
        <article class="summary-card theme-orange">
          <span>打卡合计</span>
          <strong>{{ clockTotal }}</strong>
        </article>
      </section>

      <section class="record-section">
        <div class="section-title">
          <div>
            <h2>打卡记录</h2>
            <span>{{ titleDay || "-" }} 日统计</span>
          </div>
        </div>

        <div v-if="lists.length" class="record-table">
          <div class="record-row table-head">
            <span>序号</span>
            <span>姓名</span>
            <span>电话号码</span>
            <span>打卡次数</span>
          </div>
          <div
            v-for="(item, index) in lists"
            :key="item.tel || index"
            class="record-row"
          >
            <span>{{ index + 1 }}</span>
            <strong>{{ formatName(item.name) }}</strong>
            <span>{{ item.tel || "-" }}</span>
            <span>
              <ATag color="green">{{ item.clockNumber || 0 }} 次</ATag>
            </span>
          </div>
        </div>

        <div v-else class="empty-panel">
          <Icon icon="ri:file-search-line" />
          <h3>暂无打卡信息</h3>
          <p>当前日期没有可展示的打卡记录。</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchAttendanceByDate } from "../../api/attendance";

const route = useRoute();
const router = useRouter();
const showLogin = ref(false);
const lists = ref([]);
const arrKeys = ref([]);
const titleDay = ref(route.query.day || "");

const clockTotal = computed(() =>
  lists.value.reduce((total, item) => total + Number(item.clockNumber || 0), 0),
);

onMounted(() => {
  gethxdrecordfindByDate(titleDay.value);
});

function closePage() {
  router.back();
}

function formatName(name) {
  return name === "noname" || name === "null" ? "-" : name || "-";
}

function gethxdrecordfindByDate(date) {
  const data = {
    start: date,
    end: date,
  };

  showLogin.value = true;
  fetchAttendanceByDate(data)
    .then((res) => {
      const source = res.data || {};
      arrKeys.value = Object.keys(source);

      if (arrKeys.value.length) {
        lists.value = Object.values(source).map((item, index) => {
          const itemArr = String(item).split("&");

          return {
            name: itemArr[0],
            clockNumber: itemArr[1],
            tel: arrKeys.value[index],
          };
        });
      } else {
        lists.value = [];
      }
    })
    .catch(() => {
      Message.error("打卡信息加载失败，请稍后重试");
    })
    .finally(() => {
      showLogin.value = false;
    });
}
</script>

<style lang="scss" scoped>
.clock-day-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.record-section,
.loading-panel {
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
  flex: none;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #e8f0fe;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  min-height: 112px;
  padding: 20px 24px;
  border: 1px solid #dadce0;
  border-radius: 12px;
  box-sizing: border-box;
  text-align: left;

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

  &.theme-orange {
    background: #fef7e0;
    border-color: #fce8b2;

    strong {
      color: #b06000;
    }
  }
}

.section-title {
  margin-bottom: 20px;
  text-align: left;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  span {
    margin-top: 4px;
    display: block;
    color: #5f6368;
    font-size: 13px;
    line-height: 18px;
  }
}

.record-table {
  border: 1px solid #dadce0;
  border-radius: 8px;
  overflow: hidden;
}

.record-row {
  display: grid;
  grid-template-columns: 80px minmax(120px, 1fr) minmax(160px, 1fr) 120px;
  gap: 16px;
  align-items: center;
  min-height: 56px;
  padding: 12px 18px;
  box-sizing: border-box;
  border-top: 1px solid #f1f3f4;
  color: #3c4043;
  font-size: 14px;
  text-align: left;

  &:first-child {
    border-top: 0;
  }

  > span,
  > strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #202124;
    font-weight: 500;
  }
}

.table-head {
  min-height: 44px;
  background: #f8f9fa;
  color: #5f6368;
  font-size: 13px;
  font-weight: 500;
}

.loading-panel,
.empty-panel {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
}

.empty-panel {
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;

  svg {
    width: 42px;
    height: 42px;
    color: #9aa0a6;
  }

  h3 {
    margin: 0;
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

:global(html[data-theme="dark"] .clock-day-page) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .clock-day-page .page-header),
:global(html[data-theme="dark"] .clock-day-page .record-section),
:global(html[data-theme="dark"] .clock-day-page .loading-panel) {
  border-color: #2d3748;
  background: #111827;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(html[data-theme="dark"] .clock-day-page .header-main h1),
:global(html[data-theme="dark"] .clock-day-page .section-title h2),
:global(html[data-theme="dark"] .clock-day-page .empty-panel h3) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-day-page .header-main p),
:global(html[data-theme="dark"] .clock-day-page .section-title span),
:global(html[data-theme="dark"] .clock-day-page .loading-panel),
:global(html[data-theme="dark"] .clock-day-page .empty-panel p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-day-page .back-button) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-day-page .back-button:hover) {
  color: #f8fafc;
  background: #1f2937;
}

:global(html[data-theme="dark"] .clock-day-page .header-icon) {
  background: rgba(59, 130, 246, 0.14);
}

:global(html[data-theme="dark"] .clock-day-page .summary-card) {
  border-color: #2d3748;
}

:global(html[data-theme="dark"] .clock-day-page .summary-card span) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-day-page .summary-card.theme-blue) {
  background: rgba(37, 99, 235, 0.13);
  border-color: rgba(96, 165, 250, 0.28);
}

:global(html[data-theme="dark"] .clock-day-page .summary-card.theme-blue strong) {
  color: #60a5fa;
}

:global(html[data-theme="dark"] .clock-day-page .summary-card.theme-green) {
  background: rgba(22, 163, 74, 0.13);
  border-color: rgba(74, 222, 128, 0.24);
}

:global(html[data-theme="dark"] .clock-day-page .summary-card.theme-green strong) {
  color: #4ade80;
}

:global(html[data-theme="dark"] .clock-day-page .summary-card.theme-orange) {
  background: rgba(217, 119, 6, 0.13);
  border-color: rgba(251, 191, 36, 0.26);
}

:global(html[data-theme="dark"] .clock-day-page .summary-card.theme-orange strong) {
  color: #fbbf24;
}

:global(html[data-theme="dark"] .clock-day-page .record-table),
:global(html[data-theme="dark"] .clock-day-page .empty-panel) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .clock-day-page .record-row) {
  border-top-color: #1f2937;
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-day-page .record-row strong) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-day-page .table-head) {
  background: #1f2937;
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-day-page .empty-panel svg) {
  color: #64748b;
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .record-row {
    grid-template-columns: 64px minmax(100px, 1fr) minmax(130px, 1fr) 100px;
  }
}
</style>
