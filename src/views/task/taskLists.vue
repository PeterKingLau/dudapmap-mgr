<template>
  <div class="task-list-page">
    <section class="page-header">
      <div class="header-main">
        <div class="header-icon">
          <img src="../../assets/images/nav-task.png" alt="" />
        </div>
        <div>
          <h1>全部任务</h1>
          <p>查看任务派发、接受、拒绝与完成情况。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ taskLis.length }} 条</ATag>
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

      <div v-else-if="!newtasKLis.length" class="state-panel">
        <Icon icon="ri:file-search-line" />
        <h3>暂无详细信息</h3>
        <p>当前没有任务记录。</p>
      </div>

      <template v-else>
        <div class="task-grid">
          <article
            v-for="(item, index) in newtasKLis"
            :key="item.id || index"
            class="task-card"
            @click="findAllUrl(index)"
          >
            <div class="card-header">
              <div>
                <span>任务 {{ index + 1 }}</span>
                <strong>{{ formatValue(item.userphone) }}</strong>
              </div>
              <div class="card-actions">
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

        <div class="load-more">
          <AButton
            v-if="!finished"
            type="primary"
            :loading="listLoading"
            @click="loadMore"
          >
            加载更多
          </AButton>
          <span v-else>没有更多了</span>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message, Modal } from "@arco-design/web-vue";
import { deleteTaskById, fetchTasks } from "../../api/task";

const router = useRouter();
const loading = ref(false);
const listLoading = ref(false);
const finished = ref(false);
const taskLis = ref([]);
const newtasKLis = ref([]);
const TASK_DETAIL_CACHE_KEY = "taskDetail";
const PAGE_SIZE = 10;
const loadedCount = ref(0);

const statusMap = {
  1: { text: "已经派发", color: "blue" },
  2: { text: "接受任务", color: "green" },
  3: { text: "拒绝任务", color: "red" },
  4: { text: "完成任务", color: "arcoblue" },
  5: { text: "未派单", color: "gray" },
};

const pendingCount = computed(
  () => taskLis.value.filter((item) => Number(item.infoflag) === 5).length,
);
const acceptedCount = computed(
  () => taskLis.value.filter((item) => Number(item.infoflag) === 2).length,
);
const completedCount = computed(
  () => taskLis.value.filter((item) => Number(item.infoflag) === 4).length,
);
const summaryItems = computed(() => [
  { label: "任务总数", value: taskLis.value.length, theme: "blue" },
  { label: "待派单", value: pendingCount.value, theme: "orange" },
  { label: "已接受", value: acceptedCount.value, theme: "green" },
  { label: "已完成", value: completedCount.value, theme: "cyan" },
]);

onMounted(() => {
  getFindAll();
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
    adress: addressParts[0] || "",
    lng: addressParts[1] || "",
    lat: addressParts[2] || "",
  };
}

function getFindAll() {
  loading.value = true;
  finished.value = false;
  loadedCount.value = 0;
  newtasKLis.value = [];
  fetchTasks()
    .then((res) => {
      const resLists = Array.isArray(res.data) ? res.data : [];
      taskLis.value = resLists.map(normalizeTask);
      loadMore();
    })
    .catch(() => {
      taskLis.value = [];
      newtasKLis.value = [];
      Message.error("任务列表加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function loadMore() {
  if (finished.value) {
    listLoading.value = false;
    return;
  }

  listLoading.value = true;
  const nextItems = taskLis.value.slice(
    loadedCount.value,
    loadedCount.value + PAGE_SIZE,
  );

  newtasKLis.value.push(...nextItems);
  loadedCount.value += nextItems.length;
  listLoading.value = false;

  if (loadedCount.value >= taskLis.value.length) {
    finished.value = true;
  }
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
      distinctionId: 1,
    },
  });
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
        loadedCount.value = newtasKLis.value.length;
        sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${taskId}`);

        if (!finished.value) {
          loadMore();
        } else if (!newtasKLis.value.length) {
          finished.value = true;
        }

        Message.success("任务已删除");
      }),
  });
}
</script>

<style lang="scss" scoped>
.task-list-page {
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

.header-side {
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

  &.theme-cyan {
    background: #e6f7f8;
    border-color: #b7e5e8;
    strong {
      color: #067179;
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

.task-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.task-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #d2e3fc;
    background: #f8fbff;
  }
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

.card-actions {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.task-meta {
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

.load-more {
  min-height: 54px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    color: #9aa0a6;
    font-size: 13px;
  }
}

@media (max-width: 1280px) {
  .summary-grid,
  .task-grid {
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
  .task-grid,
  .task-meta {
    grid-template-columns: 1fr;
  }
}
</style>
