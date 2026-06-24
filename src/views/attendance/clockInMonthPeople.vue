<template>
  <div class="clock-people-month-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>指定人员当月打卡</h1>
          <p>查看指定员工在某一月份的打卡次数。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/attendance-user-month.png" alt="" />
      </div>
    </section>

    <div v-if="showLogin" class="loading-panel">
      <ASpin :size="28" />
      <span>正在请求数据，请稍后...</span>
    </div>

    <template v-else>
      <section class="summary-grid">
        <article class="summary-card theme-blue">
          <span>查询月份</span>
          <strong>{{ titleMonth || "-" }}</strong>
        </article>
        <article class="summary-card theme-green">
          <span>电话号码</span>
          <strong>{{ phone || "-" }}</strong>
        </article>
        <article class="summary-card theme-orange">
          <span>打卡次数</span>
          <strong>{{ result.clockInNumber || 0 }}</strong>
        </article>
      </section>

      <section class="result-section">
        <div class="section-title">
          <div>
            <h2>查询结果</h2>
            <span>{{ titleMonth || "-" }} 月统计</span>
          </div>
          <ATag v-if="hasResult" color="green">已查询</ATag>
        </div>

        <div v-if="hasResult" class="result-card">
          <div class="result-row">
            <span>电话号码</span>
            <strong>{{ result.tel || "-" }}</strong>
          </div>
          <div class="result-row">
            <span>打卡次数</span>
            <strong>{{ result.clockInNumber || 0 }} 次</strong>
          </div>
        </div>

        <div v-else class="empty-panel">
          <Icon icon="ri:file-search-line" />
          <h3>暂无打卡信息</h3>
          <p>当前员工在所选月份没有打卡记录。</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchAttendanceByPhone } from "../../api/attendance";

const route = useRoute();
const router = useRouter();
const showLogin = ref(false);
const result = ref({});
const titleMonth = ref(route.query.monthPeopledate || "");
const phone = ref(route.query.monthTel || "");

const hasResult = computed(() => Object.keys(result.value).length > 0);

onMounted(() => {
  gethxdrecordfindByDate(titleMonth.value, phone.value);
});

function closePage() {
  router.back();
}

function gethxdrecordfindByDate(date, targetPhone) {
  const data = {
    dates: date,
    phone: targetPhone,
  };

  showLogin.value = true;
  fetchAttendanceByPhone(data)
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];

      if (rows.length) {
        result.value = {
          clockInNumber: rows.length,
          tel: rows[0].userphone || targetPhone,
        };
      } else {
        result.value = {};
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
.clock-people-month-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.result-section,
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

.result-card {
  border: 1px solid #dadce0;
  border-radius: 8px;
  overflow: hidden;
}

.result-row {
  min-height: 56px;
  padding: 12px 18px;
  border-top: 1px solid #f1f3f4;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  text-align: left;

  &:first-child {
    border-top: 0;
  }

  span {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    min-width: 0;
    color: #202124;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    word-break: break-all;
  }
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

:global(html[data-theme="dark"] .clock-people-month-page) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .clock-people-month-page .page-header),
:global(html[data-theme="dark"] .clock-people-month-page .result-section),
:global(html[data-theme="dark"] .clock-people-month-page .loading-panel) {
  border-color: #2d3748;
  background: #111827;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(html[data-theme="dark"] .clock-people-month-page .header-main h1),
:global(html[data-theme="dark"] .clock-people-month-page .section-title h2),
:global(html[data-theme="dark"] .clock-people-month-page .empty-panel h3) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-people-month-page .header-main p),
:global(html[data-theme="dark"] .clock-people-month-page .section-title span),
:global(html[data-theme="dark"] .clock-people-month-page .loading-panel),
:global(html[data-theme="dark"] .clock-people-month-page .empty-panel p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-people-month-page .back-button) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-people-month-page .back-button:hover) {
  color: #f8fafc;
  background: #1f2937;
}

:global(html[data-theme="dark"] .clock-people-month-page .header-icon) {
  background: rgba(59, 130, 246, 0.14);
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card) {
  border-color: #2d3748;
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card span) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card.theme-blue) {
  background: rgba(37, 99, 235, 0.13);
  border-color: rgba(96, 165, 250, 0.28);
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card.theme-blue strong) {
  color: #60a5fa;
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card.theme-green) {
  background: rgba(22, 163, 74, 0.13);
  border-color: rgba(74, 222, 128, 0.24);
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card.theme-green strong) {
  color: #4ade80;
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card.theme-orange) {
  background: rgba(217, 119, 6, 0.13);
  border-color: rgba(251, 191, 36, 0.26);
}

:global(html[data-theme="dark"] .clock-people-month-page .summary-card.theme-orange strong) {
  color: #fbbf24;
}

:global(html[data-theme="dark"] .clock-people-month-page .result-card),
:global(html[data-theme="dark"] .clock-people-month-page .empty-panel) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .clock-people-month-page .result-row) {
  border-top-color: #1f2937;
}

:global(html[data-theme="dark"] .clock-people-month-page .result-row span) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-people-month-page .result-row strong) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-people-month-page .empty-panel svg) {
  color: #64748b;
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
