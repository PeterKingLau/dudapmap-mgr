<template>
  <div class="task-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="backUrl">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>任务详情</h1>
          <p>查看施工任务的人员、联系方式、地址、坐标和派单状态。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag :color="taskStatus.color">{{ taskStatus.text }}</ATag>
        <div class="header-icon">
          <img src="../../assets/images/nav-task.png" alt="" />
        </div>
      </div>
    </section>

    <section class="detail-section">
      <div class="section-header">
        <h2>基础信息</h2>
      </div>

      <dl class="detail-grid">
        <div v-for="item in detailRows" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
        <div>
          <dt>派单状态</dt>
          <dd>
            <ATag :color="taskStatus.color">{{ taskStatus.text }}</ATag>
          </dd>
        </div>
      </dl>
    </section>

    <section v-if="isPendingTask" class="detail-section">
      <div class="section-header">
        <h2>任务处理</h2>
      </div>
      <div class="handle-row">
        <span>接受派单</span>
        <ARadioGroup v-model="radio" type="button">
          <ARadio value="1">接受</ARadio>
          <ARadio value="2">拒绝</ARadio>
        </ARadioGroup>
      </div>
    </section>

    <div class="task-actions">
      <AButton @click="backUrl">返回</AButton>
      <AButton
        v-if="isPendingTask"
        type="primary"
        :loading="submitting"
        @click="taskSubmit"
      >
        确定
      </AButton>
    </div>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal } from "@arco-design/web-vue";
import { acceptTask, denyTask, fetchTasks } from "../../api/task";

const route = useRoute();
const router = useRouter();
const radio = ref("1");
const submitting = ref(false);
const lists = ref({});
const TASK_DETAIL_CACHE_KEY = "taskDetail";

onMounted(() => {
  loadTaskDetail();
});

function parseLegacyTaskQuery() {
  if (!route.query.lists) {
    return null;
  }

  try {
    return JSON.parse(route.query.lists);
  } catch (error) {
    return null;
  }
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

function loadTaskDetail() {
  const legacyTask = parseLegacyTaskQuery();

  if (legacyTask) {
    lists.value = normalizeTask(legacyTask);
    return;
  }

  const taskId = route.query.taskId;

  if (!taskId) {
    return;
  }

  const cachedTask = sessionStorage.getItem(
    `${TASK_DETAIL_CACHE_KEY}:${taskId}`,
  );

  if (cachedTask) {
    try {
      lists.value = normalizeTask(JSON.parse(cachedTask));
      return;
    } catch (error) {
      sessionStorage.removeItem(`${TASK_DETAIL_CACHE_KEY}:${taskId}`);
    }
  }

  fetchTasks().then((res) => {
    const task = (Array.isArray(res.data) ? res.data : []).find(
      (item) => String(item.id) === String(taskId),
    );

    if (task) {
      lists.value = normalizeTask(task);
    }
  });
}

const distinctionId = computed(() => route.query.distinctionId);
const isPendingTask = computed(() => Number(lists.value.infoflag) === 5);

const statusMap = {
  1: { text: "已经派发", color: "blue" },
  2: { text: "接受任务", color: "green" },
  3: { text: "拒绝任务", color: "red" },
  4: { text: "完成任务", color: "arcoblue" },
  5: { text: "未派单", color: "gray" },
};

const taskStatus = computed(
  () => statusMap[Number(lists.value.infoflag)] || { text: "未知状态", color: "gray" },
);

const detailRows = computed(() => [
  {
    label: "施工员",
    value: formatValue(lists.value.worker, "暂无名字显示"),
  },
  {
    label: "电话",
    value: formatValue(lists.value.userphone, "暂无电话号码显示"),
  },
  {
    label: "地址",
    value: formatValue(lists.value.adress, "暂无地址信息显示"),
  },
  {
    label: "经度",
    value: formatValue(lists.value.lng, "暂无经度信息显示"),
  },
  {
    label: "纬度",
    value: formatValue(lists.value.lat, "暂无纬度信息显示"),
  },
  {
    label: "时间",
    value: formatValue(lists.value.taskdate, "暂无时间信息显示"),
  },
]);

function formatValue(value, fallback) {
  return value === "" || value === null || value === undefined
    ? fallback
    : value;
}

function taskSubmit() {
  const id = lists.value.id;

  if (!id) {
    Message.warning("任务信息异常，无法提交");
    return;
  }

  if (radio.value === "1") {
    submitTask({
      confirmMessage: "确定接受任务吗？",
      successMessage: "已接受任务，正在返回上一页",
      request: acceptTask,
      id,
    });
    return;
  }

  submitTask({
    confirmMessage: "确定拒绝任务吗？",
    successMessage: "已拒绝任务，正在返回上一页",
    request: denyTask,
    id,
  });
}

function backUrl() {
  router.replace({
    path:
      distinctionId.value == 1 ? ROUTE_PATHS.task.list : ROUTE_PATHS.map.rider,
  });
}

function submitTask({ confirmMessage, successMessage, request, id }) {
  Modal.confirm({
    title: "任务确认",
    content: confirmMessage,
    okText: "确定",
    cancelText: "取消",
    onOk: () => {
      submitting.value = true;
      return request(id)
        .then((res) => {
          if (res.data == true) {
            Message.success(successMessage);
            window.setTimeout(backUrl, 800);
          }
        })
        .finally(() => {
          submitting.value = false;
        });
    },
  });
}
</script>

<style lang="scss" scoped>
.task-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.detail-section {
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

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
  text-align: left;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
}

.detail-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.detail-grid > div {
  min-width: 0;
  padding: 16px 18px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  background: #f8f9fa;
  box-sizing: border-box;
  text-align: left;
}

.detail-grid dt {
  color: #5f6368;
  font-size: 13px;
  line-height: 20px;
}

.detail-grid dd {
  margin: 8px 0 0;
  color: #202124;
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  word-break: break-all;
}

.handle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;

  span {
    color: #5f6368;
    font-size: 14px;
    line-height: 22px;
  }
}

.task-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 16px 24px;
  margin: 0 -24px -24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(241, 243, 244, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid #dadce0;
}

@media (max-width: 1280px) {
  .detail-grid {
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

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
