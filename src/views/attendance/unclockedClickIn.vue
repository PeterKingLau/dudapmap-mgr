<template>
  <div class="unclocked-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="router.back()">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>{{ titleDay || "-" }} 未打卡</h1>
          <p>查看指定日期未完成打卡的人员名单。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="red">{{ lists.length }} 人未打卡</ATag>
        <div class="header-icon">
          <Icon icon="ri:calendar-close-line" />
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading-panel">
      <ASpin :size="28" />
      <span>正在请求数据，请稍后...</span>
    </div>

    <template v-else>
      <section class="summary-grid">
        <article class="summary-card theme-red">
          <span>未打卡人员</span>
          <strong>{{ lists.length }}</strong>
        </article>
        <article class="summary-card theme-blue">
          <span>查询日期</span>
          <strong>{{ titleDay || "-" }}</strong>
        </article>
      </section>

      <section class="record-section">
        <div class="section-title">
          <div>
            <h2>未打卡名单</h2>
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
            <strong>{{ item.name || "-" }}</strong>
            <span>{{ item.tel || "-" }}</span>
            <span>
              <ATag color="red">{{ item.clockNumber || 0 }} 次</ATag>
            </span>
          </div>
        </div>

        <div v-else class="empty-panel">
          <Icon icon="ri:file-search-line" />
          <h3>暂无未打卡信息</h3>
          <p>当前日期没有未打卡人员记录。</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchUnclockedByDate } from "../../api/attendance";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const lists = ref([]);
const titleDay = computed(() => route.query.day || "");

onMounted(() => {
  getUnclockedRecords(titleDay.value);
});

function normalizeRecordRows(data) {
  const rows = data && typeof data === "object" ? data : {};
  const phones = Object.keys(rows);
  const values = Object.values(rows);

  return values.map((item, index) => ({
    name: item == null || item === "" ? "暂未上传名" : String(item),
    clockNumber: 0,
    tel: phones[index],
  }));
}

function getUnclockedRecords(date) {
  if (!date) {
    lists.value = [];
    return;
  }

  loading.value = true;
  fetchUnclockedByDate({ date })
    .then((res) => {
      lists.value = normalizeRecordRows(res.data);
    })
    .catch(() => {
      Message.error("未打卡信息加载失败，请稍后重试");
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.unclocked-page {
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
  background: #fce8e6;
  color: #c5221f;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 32px;
    height: 32px;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

  &.theme-red {
    background: #fce8e6;
    border-color: #fad2cf;

    strong {
      color: #c5221f;
    }
  }

  &.theme-blue {
    background: #f0f4f9;
    border-color: #d2e3fc;

    strong {
      color: #1a73e8;
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

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .record-row {
    grid-template-columns: 64px minmax(100px, 1fr) minmax(130px, 1fr) 100px;
  }
}
</style>
