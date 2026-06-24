<template>
  <div class="leave-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>请假管理</h1>
          <p>维护个人请假申请，处理待审批的请假记录。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ taskLis.length }} 条</ATag>
        <div class="header-icon">
          <img src="../../assets/images/nav-user-admin.png" alt="" />
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

    <section class="toolbar-section">
      <div class="tab-switch" role="tablist" aria-label="请假列表筛选">
        <button
          v-for="item in tabItems"
          :key="item.value"
          class="tab-button"
          :class="{ active: activeLeaveList === item.value }"
          type="button"
          @click="activeLeaveList = item.value"
        >
          <Icon :icon="item.icon" />
          {{ item.label }}
          <span>{{ item.count }}</span>
        </button>
      </div>
      <AButton type="primary" @click="openAddLeave">
        <template #icon>
          <Icon icon="ri:add-line" />
        </template>
        我要请假
      </AButton>
    </section>

    <section class="list-section">
      <div v-if="visibleRecords.length" class="leave-grid">
        <article
          v-for="item in visibleRecords"
          :key="item.id"
          class="leave-card"
        >
          <div class="record-header">
            <div>
              <span>开始时间</span>
              <strong>{{ item.startime || "-" }}</strong>
            </div>
            <ATag :color="getStatusMeta(item.infoflag).color">
              {{ getStatusMeta(item.infoflag).text }}
            </ATag>
          </div>

          <dl class="record-meta">
            <div>
              <dt>请假时间</dt>
              <dd>{{ formatLeaveRange(item) }}</dd>
            </div>
            <div v-if="activeLeaveList === 0">
              <dt>审批人</dt>
              <dd>{{ item.manager || "-" }}</dd>
            </div>
            <div v-else>
              <dt>申请人电话</dt>
              <dd>{{ item.userphone || "-" }}</dd>
            </div>
            <div>
              <dt>请假原因</dt>
              <dd>{{ item.reason || "-" }}</dd>
            </div>
            <div v-if="item.remake">
              <dt>驳回理由</dt>
              <dd>{{ item.remake }}</dd>
            </div>
          </dl>

          <div class="card-actions">
            <template v-if="activeLeaveList === 0">
              <AButton size="small" @click="editLeave(item)">修改</AButton>
              <AButton
                v-if="!item.infoflag"
                size="small"
                status="danger"
                @click="removeLeave(item)"
              >
                撤销
              </AButton>
            </template>
            <template v-else>
              <AButton
                size="small"
                type="primary"
                status="success"
                @click="resolveApprove(item)"
              >
                通过
              </AButton>
              <AButton
                size="small"
                status="danger"
                @click="rejectApprove(item)"
              >
                驳回
              </AButton>
            </template>
          </div>
        </article>
      </div>

      <div v-else class="empty-panel">
        <Icon icon="ri:file-list-3-line" />
        <h3>{{ activeLeaveList === 0 ? "暂无请假记录" : "暂无待审批信息" }}</h3>
        <p>当前筛选下没有需要展示的请假信息。</p>
      </div>
    </section>

    <AModal
      v-model:visible="showLeaveForm"
      :footer="false"
      :title="editType === 'add' ? '新增请假申请' : '修改请假申请'"
      modal-class="leave-form-modal"
      @close="resetLeaveForm"
    >
      <AForm class="leave-form" :model="{}" layout="vertical">
        <div class="form-grid">
          <AFormItem label="审批人" required>
            <ASelect
              v-model="manager"
              allow-clear
              allow-search
              placeholder="请选择审批人"
              @change="onManagerChange"
            >
              <AOption
                v-for="item in userOptions"
                :key="item.value"
                :value="item.label"
                :label="item.label"
              >
                {{ item.label }}
              </AOption>
            </ASelect>
          </AFormItem>
          <AFormItem label="开始时间" required>
            <ADatePicker
              v-model="startime"
              show-time
              value-format="YYYY-MM-DD HH:mm"
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择开始时间"
              :disabled-date="disabledDate"
            />
          </AFormItem>
          <AFormItem label="结束时间" required>
            <ADatePicker
              v-model="endtime"
              show-time
              value-format="YYYY-MM-DD HH:mm"
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择结束时间"
              :disabled-date="disabledDate"
            />
          </AFormItem>
          <AFormItem class="full-field" label="请假原因" required>
            <ATextarea
              v-model="reason"
              :max-length="1000"
              :auto-size="{ minRows: 4, maxRows: 6 }"
              show-word-limit
              placeholder="请输入请假原因"
            />
          </AFormItem>
        </div>
      </AForm>
      <div class="modal-actions">
        <AButton @click="showLeaveForm = false">取消</AButton>
        <AButton type="primary" @click="submitLeaveForm">保存</AButton>
      </div>
    </AModal>

    <AModal
      v-model:visible="rejectShow"
      :footer="false"
      title="驳回请假信息"
      modal-class="reject-modal"
      @close="cancelReject"
    >
      <AForm :model="{}" layout="vertical">
        <AFormItem label="驳回原因">
          <ATextarea
            v-model="remake"
            :max-length="1000"
            :auto-size="{ minRows: 4, maxRows: 6 }"
            show-word-limit
            placeholder="请输入驳回原因"
          />
        </AFormItem>
      </AForm>
      <div class="modal-actions">
        <AButton @click="rejectShow = false">取消</AButton>
        <AButton status="danger" @click="confirmReject">确认驳回</AButton>
      </div>
    </AModal>

    <div v-if="loading" class="loading-cover">
      <ASpin :size="28" />
      <span>正在请求数据，请稍后...</span>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message, Modal } from "@arco-design/web-vue";
import {
  deleteLeaveById,
  fetchLeaves,
  saveLeave,
  updateLeave,
} from "../../api/leave";
import { fetchAllUsers } from "../../api/user";

const router = useRouter();
const activeLeaveList = ref(0);
const showLeaveForm = ref(false);
const taskLis = ref([]);
const userlist = ref([]);
const manager = ref("");
const userphone = ref("");
const startime = ref("");
const endtime = ref("");
const reason = ref("");
const chooseRow = ref({});
const rejectShow = ref(false);
const remake = ref("");
const editType = ref("add");
const loading = ref(false);
const pickerMinDate = new Date(2020, 0, 1);
const pickerMaxDate = new Date(2030, 11, 31, 23, 59);

const pendingApprovals = computed(() =>
  taskLis.value.filter((item) => !item.infoflag),
);

const approvedCount = computed(
  () => taskLis.value.filter((item) => item.infoflag === "通过").length,
);

const rejectedCount = computed(
  () => taskLis.value.filter((item) => item.infoflag === "驳回").length,
);

const visibleRecords = computed(() =>
  activeLeaveList.value === 0 ? taskLis.value : pendingApprovals.value,
);

const userOptions = computed(() =>
  userlist.value.map((item) => {
    const label = item.username || item.userphone || "未命名人员";

    return {
      ...item,
      label,
      value: item.userphone || label,
    };
  }),
);

const tabItems = computed(() => [
  {
    label: "请假记录",
    value: 0,
    icon: "ri:file-list-3-line",
    count: taskLis.value.length,
  },
  {
    label: "去审批",
    value: 1,
    icon: "ri:shield-check-line",
    count: pendingApprovals.value.length,
  },
]);

const summaryItems = computed(() => [
  { label: "全部记录", value: taskLis.value.length, theme: "blue" },
  { label: "待审批", value: pendingApprovals.value.length, theme: "orange" },
  { label: "已通过", value: approvedCount.value, theme: "green" },
  { label: "已驳回", value: rejectedCount.value, theme: "red" },
]);

onMounted(() => {
  getFindAll();
  getFindAllUser("管理员");
});

function closePage() {
  router.back();
}

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  } catch (error) {
    return {};
  }
}

function disabledDate(current) {
  const time = new Date(current).getTime();
  return time < pickerMinDate.getTime() || time > pickerMaxDate.getTime();
}

function notify(type, message) {
  const handler = Message[type] || Message.info;
  handler(message);
}

function confirmAction(content, okText = "确定") {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "操作确认",
      content,
      okText,
      cancelText: "取消",
      onOk: resolve,
      onCancel: reject,
    });
  });
}

function getStatusMeta(status) {
  if (status === "通过") {
    return { text: "通过", color: "green" };
  }

  if (status === "驳回") {
    return { text: "驳回", color: "red" };
  }

  return { text: "待审核", color: "orange" };
}

function formatLeaveRange(item) {
  return `${item.startime || "-"} ~ ${item.endtime || "-"}`;
}

function openAddLeave() {
  editType.value = "add";
  chooseRow.value = {};
  showLeaveForm.value = true;
}

function resetLeaveForm() {
  manager.value = "";
  userphone.value = "";
  startime.value = "";
  endtime.value = "";
  reason.value = "";
  chooseRow.value = {};
  editType.value = "add";
}

function cancelReject() {
  remake.value = "";
  chooseRow.value = {};
}

function onManagerChange(value) {
  manager.value = value || "";
  userphone.value = getSessionUser().userphone || userphone.value;
}

function updateLeaveStatus({ item, infoflag, remakeValue = "" }) {
  const params = {
    infoflag,
    id: item.id,
    remake: remakeValue || undefined,
    userphone: item.userphone,
  };

  loading.value = true;
  updateLeave(params)
    .then((res) => {
      if (res) {
        notify("success", "保存成功");
        rejectShow.value = false;
        getFindAll();
      }
    })
    .catch(() => {
      notify("error", "保存失败，请稍后重试");
    })
    .finally(() => {
      loading.value = false;
    });
}

function confirmReject() {
  confirmAction("确定驳回该条审批信息？", "确认驳回")
    .then(() => {
      updateLeaveStatus({
        item: chooseRow.value,
        infoflag: "驳回",
        remakeValue: remake.value,
      });
    })
    .catch(() => {});
}

function resolveApprove(item) {
  confirmAction("确定通过该条审批信息？", "通过")
    .then(() => {
      updateLeaveStatus({ item, infoflag: "通过" });
    })
    .catch(() => {});
}

function rejectApprove(item) {
  chooseRow.value = item;
  rejectShow.value = true;
}

function editLeave(row) {
  editType.value = "edit";
  chooseRow.value = row;
  manager.value = row.manager || "";
  userphone.value = row.userphone || "";
  startime.value = formatDateTime(row.startime);
  endtime.value = formatDateTime(row.endtime);
  reason.value = row.reason || "";
  showLeaveForm.value = true;
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm") : String(value);
}

function validateLeaveForm() {
  if (!manager.value) {
    notify("warning", "请选择审批人");
    return false;
  }

  if (!startime.value) {
    notify("warning", "请选择请假开始时间");
    return false;
  }

  if (!endtime.value) {
    notify("warning", "请选择请假结束时间");
    return false;
  }

  if (!reason.value.trim()) {
    notify("warning", "请填写请假原因");
    return false;
  }

  if (dayjs(endtime.value).diff(dayjs(startime.value), "minute") < 30) {
    notify("warning", "结束时间需晚于开始时间至少 30 分钟");
    return false;
  }

  return true;
}

function submitLeaveForm() {
  if (!validateLeaveForm()) {
    return;
  }

  const params = {
    manager: manager.value,
    userphone: userphone.value || getSessionUser().userphone,
    startime: startime.value,
    endtime: endtime.value,
    reason: reason.value,
    id: editType.value === "edit" ? chooseRow.value.id : undefined,
  };

  loading.value = true;
  saveLeave(params, editType.value !== "add")
    .then((res) => {
      if (res) {
        notify("success", "保存成功");
        showLeaveForm.value = false;
        activeLeaveList.value = 0;
        getFindAll();
        return;
      }

      notify("warning", "保存失败");
    })
    .catch(() => {
      notify("error", "保存失败，请稍后重试");
    })
    .finally(() => {
      loading.value = false;
    });
}

function getFindAll() {
  loading.value = true;
  fetchLeaves()
    .then((res) => {
      taskLis.value = Array.isArray(res.data) ? res.data : [];
    })
    .catch(() => {
      notify("error", "请假信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function getFindAllUser(type) {
  fetchAllUsers()
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      userlist.value = type
        ? rows.filter((item) => item.userrole === type)
        : rows;
    })
    .catch(() => {
      notify("error", "审批人加载失败");
    });
}

function removeLeave(row) {
  confirmAction("确定撤销该请假信息吗？", "撤销")
    .then(() => {
      loading.value = true;
      return deleteLeaveById(row.id);
    })
    .then((res) => {
      if (res) {
        notify("success", "保存成功");
        getFindAll();
      }
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.leave-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
  position: relative;
}

.page-header,
.toolbar-section,
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

  &.theme-red {
    background: #fce8e6;
    border-color: #fad2cf;

    strong {
      color: #c5221f;
    }
  }
}

.toolbar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tab-switch {
  min-width: 0;
  padding: 4px;
  border-radius: 8px;
  background: #f1f3f4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tab-button {
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #5f6368;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  line-height: 34px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  span {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.06);
    color: inherit;
    font-size: 12px;
    line-height: 20px;
  }

  &:hover:not(.active) {
    background: rgba(0, 0, 0, 0.04);
    color: #202124;
  }

  &.active {
    color: #1a73e8;
    background: #ffffff;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    span {
      background: #e8f0fe;
    }
  }
}

.leave-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.leave-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  text-align: left;
}

.record-header {
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
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    word-break: break-all;
  }
}

.record-meta {
  margin: 16px 0 0;
  display: grid;
  gap: 12px;

  > div {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr);
    gap: 12px;
  }

  dt {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  dd {
    margin: 0;
    color: #202124;
    font-size: 13px;
    line-height: 20px;
    word-break: break-all;
  }
}

.card-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-panel {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5f6368;

  svg {
    width: 42px;
    height: 42px;
    color: #9aa0a6;
  }

  h3 {
    margin: 16px 0 6px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;
}

.full-field {
  grid-column: 1 / -1;
}

.leave-form,
.reject-modal {
  :deep(.arco-select),
  :deep(.arco-picker),
  :deep(.arco-textarea-wrapper) {
    width: 100%;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.loading-cover {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(255, 255, 255, 0.62);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
  font-size: 14px;
}

:global(.leave-form-modal .arco-modal) {
  width: min(760px, calc(100vw - 48px));
  border-radius: 8px;
}

:global(.reject-modal .arco-modal) {
  width: min(520px, calc(100vw - 48px));
  border-radius: 8px;
}

:global(.leave-form-modal .arco-modal-header),
:global(.reject-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.leave-form-modal .arco-modal-title),
:global(.reject-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

:global(.leave-form-modal .arco-modal-body),
:global(.reject-modal .arco-modal-body) {
  padding: 24px;
}

@media (max-width: 1280px) {
  .summary-grid,
  .leave-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .toolbar-section,
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-side {
    align-self: flex-end;
  }

  .form-grid,
  .leave-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
