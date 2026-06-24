<template>
  <div class="journal-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>错误日志</h1>
          <p>查看设备或账号产生的错误记录、错误码和处理状态。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ lists.length }} 条</ATag>
        <div class="header-icon">
          <img src="../../assets/images/nav-error-log.png" alt="" />
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
        <Icon icon="ri:file-search-line" />
        <h3>暂无错误日志</h3>
        <p>当前没有错误日志记录。</p>
      </div>

      <div v-else class="journal-grid">
        <article v-for="item in lists" :key="item.id" class="journal-card">
          <div class="card-header">
            <div>
              <span>错误码</span>
              <strong>{{ formatValue(item.errorinfo) }}</strong>
            </div>
            <ATag :color="getStatusMeta(item.infoflag).color">
              {{ getStatusText(item.infoflag) }}
            </ATag>
          </div>

          <dl class="journal-meta">
            <div>
              <dt>设备/账号</dt>
              <dd>{{ formatValue(item.errormodel) }}</dd>
            </div>
            <div>
              <dt>发生时间</dt>
              <dd>{{ formatValue(item.errordate) }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchErrorLogs } from "../../api/journal";

const router = useRouter();
const lists = ref([]);
const loading = ref(false);

const activeCount = computed(
  () => lists.value.filter((item) => String(item.infoflag) === "1").length,
);
const handledCount = computed(() => lists.value.length - activeCount.value);
const summaryItems = computed(() => [
  { label: "日志总数", value: lists.value.length, theme: "blue" },
  { label: "有效日志", value: activeCount.value, theme: "orange" },
  { label: "已处理", value: handledCount.value, theme: "green" },
]);

onMounted(() => {
  getLog();
});

function closePage() {
  router.back();
}

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "-" : value;
}

function getStatusText(infoflag) {
  return String(infoflag) === "1" ? "有效" : "已处理";
}

function getStatusMeta(infoflag) {
  if (String(infoflag) === "1") {
    return { color: "orange" };
  }

  return { color: "green" };
}

function getLog() {
  loading.value = true;
  fetchErrorLogs()
    .then((res) => {
      lists.value = Array.isArray(res.data) ? res.data : [];
    })
    .catch(() => {
      lists.value = [];
      Message.error("错误日志加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.journal-page {
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.journal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.journal-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  text-align: left;
}

.card-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

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

.journal-meta {
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
    word-break: break-all;
  }
}

@media (max-width: 1280px) {
  .summary-grid,
  .journal-grid,
  .journal-meta {
    grid-template-columns: 1fr;
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
}
</style>
