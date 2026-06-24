<template>
  <div class="user-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>人员管理</h1>
          <p>查看人员信息、筛选角色，并维护人员基础资料与权限。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ userList.length }} 人</ATag>
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

    <section class="filter-section">
      <AForm class="filter-form" :model="{}" layout="vertical">
        <AFormItem label="人员类型">
          <ASelect
            v-model="userType"
            allow-clear
            placeholder="全部"
            @change="onUserTypeChange"
          >
            <AOption
              v-for="item in userTypeOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            >
              {{ item.label }}
            </AOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="操作">
          <AButton
            v-if="canEditUser"
            class="add-button"
            type="primary"
            @click="openAddUser"
          >
            <template #icon>
              <Icon icon="ri:add-line" />
            </template>
            新增人员
          </AButton>
          <AButton v-else class="add-button" disabled>
            <template #icon>
              <Icon icon="ri:lock-line" />
            </template>
            仅可查看
          </AButton>
        </AFormItem>
      </AForm>
    </section>

    <section class="list-section">
      <div v-if="loading" class="loading-panel">
        <ASpin :size="28" />
        <span>加载中...</span>
      </div>

      <div v-else-if="userList.length" class="user-grid">
        <article
          v-for="(item, index) in userList"
          :key="item.id || item.userphone || index"
          class="user-card"
          @click="openEditUser(item)"
        >
          <div class="user-card-header">
            <div class="user-avatar">
              {{ getUserInitial(item) }}
            </div>
            <div class="user-main">
              <strong>{{ formatValue(item.username) }}</strong>
              <span>{{ formatValue(item.userphone) }}</span>
            </div>
            <AButton
              v-if="canEditUser"
              class="delete-button"
              shape="circle"
              status="danger"
              type="text"
              @click.stop="del(item.id)"
            >
              <template #icon>
                <Icon icon="ri:delete-bin-line" />
              </template>
            </AButton>
          </div>

          <dl class="user-meta">
            <div>
              <dt>电话</dt>
              <dd>{{ formatValue(item.userphone) }}</dd>
            </div>
            <div>
              <dt>角色</dt>
              <dd>{{ formatRole(item.userrole) }}</dd>
            </div>
            <div>
              <dt>区域</dt>
              <dd>{{ formatArea(item.useravator) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div v-else class="empty-panel">
        <Icon icon="ri:user-search-line" />
        <h3>暂无人员信息</h3>
        <p>当前筛选下没有人员记录。</p>
      </div>
    </section>

    <AModal
      v-model:visible="showEditUser"
      :footer="false"
      :title="editTitle"
      :width="1080"
      modal-class="user-form-modal"
      @close="clearIpt"
    >
      <div class="modal-summary">
        <Icon :icon="canEditUser ? 'ri:user-settings-line' : 'ri:eye-line'" />
        <span>{{
          canEditUser ? "完善人员信息与权限" : "仅可查看人员信息"
        }}</span>
      </div>

      <AForm class="user-form" :model="{}" layout="vertical">
        <section class="form-section">
          <div class="section-header">
            <h2>基本信息</h2>
          </div>
          <div class="form-grid">
            <AFormItem label="人员角色">
              <ASelect
                v-model="userrole"
                :disabled="!canEditUser"
                placeholder="请选择人员角色"
              >
                <AOption
                  v-for="item in roleOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                >
                  {{ item.label }}
                </AOption>
              </ASelect>
            </AFormItem>
            <AFormItem label="电话号码" required>
              <AInput
                v-model.trim="userphone"
                :max-length="11"
                :readonly="!canEditUser"
                placeholder="请输入电话号码"
              />
            </AFormItem>
            <AFormItem label="人员姓名" required>
              <AInput
                v-model.trim="username"
                :readonly="!canEditUser"
                placeholder="请输入人员姓名"
              />
            </AFormItem>
          </div>
        </section>

        <section class="form-section">
          <div class="section-header">
            <h2>权限管理</h2>
          </div>
          <ACheckboxGroup
            v-model="result"
            class="permission-grid"
            :disabled="!canEditUser"
          >
            <div
              v-for="item in permissionList"
              :key="item.value"
              class="permission-card"
              :class="{ selected: result.includes(item.value) }"
            >
              <ACheckbox :value="item.value" :disabled="!canEditUser">
                {{ item.name }}
              </ACheckbox>
            </div>
          </ACheckboxGroup>
        </section>
      </AForm>

      <div v-if="canEditUser" class="modal-actions">
        <AButton @click="showEditUser = false">取消</AButton>
        <AButton type="primary" :loading="submitting" @click="onConfirmAddUser">
          保存
        </AButton>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message, Modal } from "@arco-design/web-vue";
import {
  deleteUserById,
  fetchAllUsers,
  fetchUserByPhone,
  saveUser,
} from "../../api/user";
import { getCurrentDisname } from "../../api/request";

const router = useRouter();

const roleColumns = ["管理员", "人员"];
const userTypeColumns = ["管理员", "人员", "小工"];
const permissionList = [
  { name: "可分配二级权限子功能", value: "10000" },
  { name: "可设置打卡时间段", value: "10001" },
  { name: "可设置打卡次数", value: "10002" },
  { name: "可打卡范围", value: "10003" },
  { name: "可开启提示信息", value: "10004" },
  { name: "可编辑人员信息", value: "10005" },
];

const showEditUser = ref(false);
const userList = ref([]);
const useravator = ref("");
const userphone = ref("");
const username = ref("");
const userrole = ref("");
const editTitle = ref("新增人员信息");
const result = ref([]);
const userType = ref("");
const selectId = ref("");
const rules = ref([]);
const loading = ref(false);
const submitting = ref(false);

const canEditUser = computed(() => rules.value.includes("10005"));

const roleOptions = computed(() =>
  roleColumns.map((item) => ({ label: item, value: item })),
);

const userTypeOptions = computed(() => [
  { label: "全部", value: "" },
  ...userTypeColumns.map((item) => ({ label: item, value: item })),
]);

const adminCount = computed(
  () => userList.value.filter((item) => item.userrole === "管理员").length,
);

const supervisorCount = computed(
  () => userList.value.filter((item) => item.userrole === "人员").length,
);

const workerCount = computed(
  () => userList.value.filter((item) => item.userrole === "小工").length,
);

const summaryItems = computed(() => [
  { label: "当前人员", value: userList.value.length, theme: "blue" },
  { label: "管理员", value: adminCount.value, theme: "green" },
  { label: "人员", value: supervisorCount.value, theme: "orange" },
  { label: "小工", value: workerCount.value, theme: "red" },
]);

onMounted(() => {
  getFindAll();
  getUserInfo();
});

function closePage() {
  router.back();
}

function notify(type, message) {
  const handler = Message[type] || Message.info;
  handler(message);
}

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "-" : value;
}

function formatRole(value) {
  return value === "1" ? "-" : formatValue(value);
}

function formatArea(value) {
  return value === "1" ? "-" : formatValue(value);
}

function getUserInitial(item) {
  const value = item.username || item.userrole || item.userphone || "人";
  return String(value).slice(0, 1);
}

function getSessionUserInfo() {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  } catch (error) {
    return {};
  }
}

function getUserInfo() {
  const userInfo = getSessionUserInfo();

  if (!userInfo.userphone) {
    return;
  }

  fetchUserByPhone(userInfo.userphone)
    .then((res) => {
      rules.value = res?.data?.recvcode ? res.data.recvcode.split(",") : [];
    })
    .catch(() => {
      rules.value = [];
    });
}

function onUserTypeChange(type = "") {
  userType.value = type || "";
  getFindAll(userType.value);
}

function clearIpt() {
  useravator.value = "";
  userphone.value = "";
  username.value = "";
  userrole.value = "";
  result.value = [];
  selectId.value = "";
}

function openAddUser() {
  clearIpt();
  editTitle.value = "新增人员信息";
  showEditUser.value = true;
}

function openEditUser(row) {
  useravator.value = row.useravator || "";
  userphone.value = row.userphone || "";
  username.value = row.username || "";
  userrole.value = row.userrole || "";
  selectId.value = row.id || "";
  result.value = row.recvcode ? row.recvcode.split(",") : [];
  editTitle.value = canEditUser.value ? "修改人员信息" : "查看人员信息";
  showEditUser.value = true;
}

function validateUserForm() {
  if (!userphone.value) {
    notify("warning", "请输入电话号码");
    return false;
  }

  if (!username.value) {
    notify("warning", "请输入人员姓名");
    return false;
  }

  return true;
}

function onConfirmAddUser() {
  if (!canEditUser.value || !validateUserForm()) {
    return;
  }

  const params = {
    userrole: userrole.value,
    userphone: userphone.value,
    username: username.value,
    recvcode: result.value.join(","),
    id: selectId.value || undefined,
    useravator: getCurrentDisname() || undefined,
  };
  const isEdit = Boolean(selectId.value);

  submitting.value = true;
  saveUser(params, isEdit)
    .then((res) => {
      if (!res) {
        notify("warning", "保存失败");
        return;
      }

      notify("success", "保存成功");
      showEditUser.value = false;
      getFindAll(userType.value);
    })
    .catch(() => {
      notify("error", "保存失败，请稍后重试");
    })
    .finally(() => {
      submitting.value = false;
    });
}

function getFindAll(type = "") {
  loading.value = true;
  fetchAllUsers()
    .then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      userList.value = type
        ? rows.filter((item) => item.userrole === type)
        : rows;
    })
    .catch(() => {
      userList.value = [];
      notify("error", "人员信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function del(delid) {
  Modal.confirm({
    title: "删除确认",
    content: "确定删除这个人员吗？",
    okText: "删除",
    cancelText: "取消",
    okButtonProps: {
      status: "danger",
    },
    onOk: () =>
      deleteUserById(delid).then(() => {
        notify("success", "删除成功");
        getFindAll(userType.value);
      }),
  });
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.filter-section,
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

  &.theme-red {
    background: #fce8e6;
    border-color: #fad2cf;

    strong {
      color: #c5221f;
    }
  }
}

.filter-form {
  display: grid;
  grid-template-columns: minmax(220px, 320px) auto;
  align-items: end;
  gap: 16px 24px;

  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-select) {
    width: 100%;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f4;
    }

    &.arco-select-focus {
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

.add-button {
  min-width: 118px;

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.loading-panel,
.empty-panel {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
}

.empty-panel {
  svg {
    width: 42px;
    height: 42px;
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

.user-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.user-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d2e3fc;
  }
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #e8f0fe;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-size: 17px;
  font-weight: 500;
}

.user-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong,
  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  span {
    color: #5f6368;
    font-size: 13px;
    line-height: 18px;
  }
}

.delete-button {
  flex: none;
}

.user-meta {
  margin: 16px 0 0;
  padding: 16px 0 0;
  border-top: 1px solid #f1f3f4;
  display: grid;
  gap: 10px;

  > div {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
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

.modal-summary {
  margin-bottom: 20px;
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

.form-section {
  & + .form-section {
    margin-top: 24px;
  }
}

.section-header {
  margin-bottom: 18px;
  padding-bottom: 12px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 20px;
}

.user-form {
  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-select),
  :deep(.arco-input-wrapper) {
    width: 100%;
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

.permission-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.permission-card {
  min-height: 72px;
  padding: 14px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  color: #202124;
  display: flex;
  align-items: center;
  text-align: left;
  transition: all 0.2s ease;

  :deep(.arco-checkbox) {
    width: 100%;
    align-items: center;
    color: #202124;
    font-size: 14px;
    line-height: 20px;
  }

  :deep(.arco-checkbox-icon) {
    flex: none;
  }

  :deep(.arco-checkbox-label) {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    min-height: 20px;
    line-height: 20px;
    white-space: normal;
    word-break: break-all;
  }

  &:hover {
    border-color: #d2e3fc;
    background: #f8fbff;
  }

  &.selected {
    border-color: #1a73e8;
    background: #e8f0fe;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

:global(.arco-modal.user-form-modal) {
  width: min(1080px, calc(100vw - 64px)) !important;
  border-radius: 8px;
}

:global(.arco-modal.user-form-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.arco-modal.user-form-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

:global(.arco-modal.user-form-modal .arco-modal-body) {
  padding: 24px;
}

@media (max-width: 1280px) {
  .summary-grid,
  .user-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid {
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
  .user-grid,
  .filter-form,
  .form-grid,
  .permission-grid {
    grid-template-columns: 1fr;
  }
}
</style>
