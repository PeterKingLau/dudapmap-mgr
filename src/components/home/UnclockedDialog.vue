<template>
  <AModal
    v-model:visible="wdkShowModel"
    :footer="false"
    modal-class="unclocked-modal"
    title="未打卡查询"
  >
    <div class="unclocked-panel">
      <div class="panel-summary">
        <div class="summary-icon">
          <Icon icon="ri:calendar-check-line" />
        </div>
        <div>
          <h3>查询某一天未打卡</h3>
          <p>选择日期后查询当天未打卡的人员信息。</p>
        </div>
      </div>

      <AForm class="query-form" :model="{}" layout="vertical">
        <AFormItem label="选择日期">
          <ADatePicker
            v-model="datePickerModel"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
          />
        </AFormItem>
      </AForm>

      <div class="modal-actions">
        <AButton @click="wdkShowModel = false">取消</AButton>
        <AButton type="primary" @click="handleSearch">查询</AButton>
      </div>
    </div>
  </AModal>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  dayValue: {
    type: String,
    default: "",
  },
  dtDatsShow: Boolean,
  dtDatePickerValue: {
    type: Array,
    default: () => [],
  },
  maxDate: {
    type: Date,
    required: true,
  },
  minDate: {
    type: Date,
    required: true,
  },
  wdkshow: Boolean,
});

const emit = defineEmits([
  "confirm-date",
  "open-date",
  "search",
  "update:dtDatsShow",
  "update:dtDatePickerValue",
  "update:wdkshow",
]);

const wdkShowModel = computed({
  get: () => props.wdkshow,
  set: (value) => emit("update:wdkshow", value),
});

const datePickerModel = computed({
  get: () => {
    if (props.dayValue) {
      return props.dayValue;
    }

    return props.dtDatePickerValue.join("-");
  },
  set: (value) => {
    emit("update:dtDatePickerValue", value ? value.split("-") : []);
    emit("update:dtDatsShow", false);
  },
});

function disabledDate(current) {
  const time = new Date(current).getTime();
  const minTime = new Date(
    props.minDate.getFullYear(),
    props.minDate.getMonth(),
    props.minDate.getDate(),
  ).getTime();
  const maxTime = new Date(
    props.maxDate.getFullYear(),
    props.maxDate.getMonth(),
    props.maxDate.getDate(),
    23,
    59,
    59,
  ).getTime();

  return time < minTime || time > maxTime;
}

function handleSearch() {
  emit("confirm-date");
  emit("search");
}
</script>

<style lang="scss" scoped>
.unclocked-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel-summary {
  padding: 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #f8fafd;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #e8f0fe;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;

  svg {
    width: 24px;
    height: 24px;
  }
}

.panel-summary h3 {
  margin: 0;
  color: #202124;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
}

.panel-summary p {
  margin: 4px 0 0;
  color: #5f6368;
  font-size: 13px;
  line-height: 20px;
}

.query-form {
  :deep(.arco-picker) {
    width: 100%;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:global(.unclocked-modal .arco-modal) {
  width: 440px;
  border-radius: 8px;
}

:global(.unclocked-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.unclocked-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

:global(.unclocked-modal .arco-modal-body) {
  padding: 24px;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-modal) {
  background: #161b22;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.42);
}

:global(html[data-theme="dark"] .unclocked-modal .arco-modal-header) {
  border-bottom-color: #30363d;
  background: #161b22;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-modal-title) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-modal-close-btn) {
  color: #9ca3af;

  &:hover {
    color: #f3f4f6;
    background: #21262d;
  }
}

:global(html[data-theme="dark"] .unclocked-modal .arco-modal-body) {
  background: #161b22;
}

:global(html[data-theme="dark"] .unclocked-modal .panel-summary) {
  border-color: #30363d;
  background: #0d1117;
}

:global(html[data-theme="dark"] .unclocked-modal .summary-icon) {
  background: rgba(56, 139, 253, 0.14);
  color: #58a6ff;
}

:global(html[data-theme="dark"] .unclocked-modal .panel-summary h3) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .unclocked-modal .panel-summary p) {
  color: #9ca3af;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-form-item-label-col > label) {
  color: #d1d5db;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-picker) {
  border-color: #30363d;
  background: #0d1117;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-picker:hover) {
  border-color: #3b82f6;
  background: #111827;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-picker-input input) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .unclocked-modal .arco-picker input::placeholder) {
  color: #6b7280;
}

:global(html[data-theme="dark"] .unclocked-modal .modal-actions .arco-btn:not(.arco-btn-primary)) {
  border-color: #30363d;
  background: #21262d;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .unclocked-modal .modal-actions .arco-btn:not(.arco-btn-primary):hover) {
  border-color: #4b5563;
  background: #30363d;
  color: #f3f4f6;
}
</style>
