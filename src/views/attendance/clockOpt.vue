<template>
  <div class="clock-opt-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="router.back()">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>打卡配置</h1>
          <p>配置打卡时段、打卡次数、范围和提示规则。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/nav-clock-config.png" alt="" />
      </div>
    </section>

    <div v-if="pageLoading" class="loading-panel">
      <ASpin :size="28" />
      <span>正在加载配置...</span>
    </div>

    <AForm v-else class="config-form" :model="clockFormModel" layout="vertical">
      <section v-if="hasRule('10001')" class="form-section">
        <div class="section-header">
          <h2>打卡时段</h2>
          <span>最多支持 4 个时段</span>
        </div>
        <div class="time-grid">
          <AFormItem
            v-for="item in timeFields"
            :key="item.key"
            :label="item.label"
          >
            <ATimePicker
              v-model="timeConfig[item.key]"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择时间"
            />
          </AFormItem>
        </div>
      </section>

      <section
        v-if="hasRule('10002') || hasRule('10003') || hasRule('10004')"
        class="form-section"
      >
        <div class="section-header">
          <h2>基础配置</h2>
        </div>
        <div class="base-grid">
          <AFormItem v-if="hasRule('10002')" label="打卡次数">
            <AInputNumber
              v-model="metainfo1"
              :min="0"
              :max="999"
              :precision="0"
              placeholder="请输入打卡次数"
            />
          </AFormItem>
          <AFormItem v-if="hasRule('10003')" label="打卡范围">
            <AInputNumber
              v-model="metainfo2"
              :min="0"
              :max="999999"
              :precision="0"
              placeholder="请输入打卡范围"
            >
              <template #suffix>米</template>
            </AInputNumber>
          </AFormItem>
          <AFormItem v-if="hasRule('10004')" label="开启提示">
            <ARadioGroup v-model="metainfo3" type="button">
              <ARadio value="1">是</ARadio>
              <ARadio value="0">否</ARadio>
            </ARadioGroup>
          </AFormItem>
        </div>
      </section>

      <section v-if="!hasVisibleConfig" class="empty-panel">
        <Icon icon="ri:file-search-line" />
        <h3>暂无可配置项</h3>
        <p>当前账号没有可维护的打卡配置权限。</p>
      </section>

      <div v-if="hasVisibleConfig" class="form-actions">
        <AButton @click="router.back()">取消</AButton>
        <AButton type="primary" :loading="submitLoading" @click="onSubmit">
          提交配置
        </AButton>
      </div>
    </AForm>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import {
  fetchClockLimits,
  fetchClockMeta,
  fetchClockRulesByUser,
  matchCurrentDisname,
  saveClockLimit,
  saveClockMeta,
} from "../../api/clockConfig";
import { getCurrentDisname } from "../../api/request";

const router = useRouter();
const clockFormModel = reactive({});
const rules = ref([]);
const limitinInfo = ref({});
const metaInfo = ref({});
const metainfo1 = ref(undefined);
const metainfo2 = ref(undefined);
const metainfo3 = ref("0");
const pageLoading = ref(false);
const submitLoading = ref(false);

const timeConfig = reactive({
  start1: "",
  end1: "",
  start2: "",
  end2: "",
  start3: "",
  end3: "",
  start4: "",
  end4: "",
});

const timeFields = [
  { key: "start1", label: "时段一开始" },
  { key: "end1", label: "时段一结束" },
  { key: "start2", label: "时段二开始" },
  { key: "end2", label: "时段二结束" },
  { key: "start3", label: "时段三开始" },
  { key: "end3", label: "时段三结束" },
  { key: "start4", label: "时段四开始" },
  { key: "end4", label: "时段四结束" },
];

const hasVisibleConfig = computed(() =>
  ["10001", "10002", "10003", "10004"].some(hasRule),
);

onMounted(() => {
  loadPageData();
});

function hasRule(code) {
  return rules.value.includes(code);
}

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  } catch (error) {
    return {};
  }
}

function getDisname() {
  return getCurrentDisname() || undefined;
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}

async function loadPageData() {
  pageLoading.value = true;

  try {
    await Promise.all([
      getUserInfo(),
      fetchhxdlimmitFindAll(),
      fetchhxdmetaFindAll(),
    ]);
  } catch (error) {
    Message.error("配置加载失败，请稍后重试");
  } finally {
    pageLoading.value = false;
  }
}

async function getUserInfo() {
  const sessionUser = getSessionUser();

  if (!sessionUser.userphone) {
    rules.value = [];
    return;
  }

  const res = await fetchClockRulesByUser(sessionUser.userphone);

  rules.value = String(res.data?.recvcode || "")
    .split(",")
    .filter(Boolean);
}

async function fetchhxdmetaFindAll() {
  const res = await fetchClockMeta();
  const rows = Array.isArray(res.data) ? res.data : [];
  const currentMetaInfo = rows.find(matchCurrentDisname);

  if (!currentMetaInfo) {
    metaInfo.value = {};
    return;
  }

  metaInfo.value = currentMetaInfo;
  metainfo1.value = normalizeNumber(currentMetaInfo.metainfo1);
  metainfo2.value = normalizeNumber(currentMetaInfo.metainfo2);
  metainfo3.value = currentMetaInfo.metainfo3 || "0";
}

async function fetchhxdlimmitFindAll() {
  const res = await fetchClockLimits();
  const rows = Array.isArray(res.data) ? res.data : [];
  const currentLimitInfo = rows.find(matchCurrentDisname);

  if (!currentLimitInfo) {
    limitinInfo.value = {};
    return;
  }

  limitinInfo.value = currentLimitInfo;
  timeFields.forEach((item) => {
    timeConfig[item.key] = currentLimitInfo[item.key] || "";
  });
}

async function onSubmit() {
  submitLoading.value = true;

  try {
    const timerParams = {
      ...timeConfig,
      disname: getDisname(),
      id: limitinInfo.value.id || undefined,
    };
    const limitRes = await saveClockLimit(
      timerParams,
      Boolean(limitinInfo.value.id),
    );

    if (limitRes.data !== true) {
      Message.error("打卡时段提交失败");
      return;
    }

    const metaParams = {
      metainfo1: metainfo1.value ?? "",
      metainfo2: metainfo2.value ?? "",
      metainfo3: metainfo3.value,
      id: metaInfo.value.id || undefined,
      disname: getDisname(),
    };
    const metaRes = await saveClockMeta(metaParams, Boolean(metaInfo.value.id));

    if (metaRes.data !== true) {
      Message.error("基础配置提交失败");
      return;
    }

    Message.success("提交成功");
    window.setTimeout(() => {
      router.back();
    }, 800);
  } catch (error) {
    Message.error("提交失败，请稍后重试");
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.clock-opt-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header,
.form-section,
.empty-panel {
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

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
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
  }
}

.time-grid,
.base-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 24px;
}

.base-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-section {
  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-picker),
  :deep(.arco-input-number) {
    width: 100%;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f4;
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

.loading-panel,
.empty-panel {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
}

.empty-panel {
  svg {
    width: 40px;
    height: 40px;
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

.form-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 16px 24px;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(241, 243, 244, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid #dadce0;
}

:global(html[data-theme="dark"] .clock-opt-page) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .clock-opt-page .page-header),
:global(html[data-theme="dark"] .clock-opt-page .form-section),
:global(html[data-theme="dark"] .clock-opt-page .empty-panel),
:global(html[data-theme="dark"] .clock-opt-page .loading-panel) {
  border-color: #2d3748;
  background: #111827;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(html[data-theme="dark"] .clock-opt-page .header-main h1),
:global(html[data-theme="dark"] .clock-opt-page .section-header h2),
:global(html[data-theme="dark"] .clock-opt-page .empty-panel h3) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-opt-page .header-main p),
:global(html[data-theme="dark"] .clock-opt-page .section-header span),
:global(html[data-theme="dark"] .clock-opt-page .loading-panel),
:global(html[data-theme="dark"] .clock-opt-page .empty-panel p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-opt-page .back-button) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-opt-page .back-button:hover) {
  color: #f8fafc;
  background: #1f2937;
}

:global(html[data-theme="dark"] .clock-opt-page .header-icon) {
  background: rgba(59, 130, 246, 0.14);
}

:global(html[data-theme="dark"] .clock-opt-page .section-header) {
  border-bottom-color: #1f2937;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-form-item-label-col > label) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-picker),
:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-input-number) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-picker:hover),
:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-input-number:hover) {
  background: #1f2937;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-picker-focused),
:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-input-number-focus) {
  border-color: #3b82f6;
  background: #0b1220;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.24);
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-picker-input input),
:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-input-number .arco-input) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-picker-input input::placeholder),
:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-input-number .arco-input::placeholder) {
  color: #64748b;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-input-number-suffix),
:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-picker-suffix-icon) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-radio-group-button) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-radio-button) {
  color: #cbd5e1;
  background: transparent;
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-radio-button:hover) {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.1);
}

:global(html[data-theme="dark"] .clock-opt-page .form-section .arco-radio-checked) {
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.2);
}

:global(html[data-theme="dark"] .clock-opt-page .empty-panel svg) {
  color: #64748b;
}

:global(html[data-theme="dark"] .clock-opt-page .form-actions) {
  border-top-color: #2d3748;
  background: rgba(15, 23, 42, 0.86);
}

:global(html[data-theme="dark"] .clock-opt-page .form-actions .arco-btn:not(.arco-btn-primary)) {
  border-color: #2d3748;
  background: #1f2937;
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .clock-opt-page .form-actions .arco-btn:not(.arco-btn-primary):hover) {
  background: #273244;
  color: #f8fafc;
}

@media (max-width: 1280px) {
  .time-grid,
  .base-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
