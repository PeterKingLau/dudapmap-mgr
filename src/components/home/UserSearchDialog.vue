<template>
  <AModal
    v-model:visible="userPopupModel"
    :footer="false"
    modal-class="user-search-modal"
    title="指定员工查询"
  >
    <div class="user-search-panel">
      <div class="panel-summary">
        <div class="summary-icon">
          <img src="../../assets/images/nav-staff.png" alt="" />
        </div>
        <div>
          <h3>指定员工查询</h3>
          <p>选择员工电话和日期后，查询当天定位路线信息。</p>
        </div>
      </div>

      <AForm class="search-form" :model="{}" layout="vertical">
        <AFormItem
          label="员工电话"
          :validate-status="telShow ? 'error' : undefined"
          :help="telShow ? '请输入正确的手机号码！' : undefined"
        >
          <ASelect
            :model-value="userTel"
            allow-clear
            allow-search
            placeholder="请选择员工电话"
            @change="selectPhone"
            @focus="$emit('phone-bottom')"
          >
            <AOption
              v-for="item in phoneLis"
              :key="item.name"
              :value="item.name"
              :label="item.name"
            >
              {{ item.name }}
            </AOption>
          </ASelect>
        </AFormItem>

        <AFormItem
          label="选择日期"
          :validate-status="datsShow ? 'error' : undefined"
          :help="datsShow ? '请选择日期！' : undefined"
        >
          <ADatePicker
            v-model="datePickerModel"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
            @focus="$emit('select-date-open')"
          />
        </AFormItem>
      </AForm>

      <div class="modal-actions">
        <AButton @click="userPopupModel = false">取消</AButton>
        <AButton type="primary" @click="$emit('search')">查询</AButton>
      </div>
    </div>
  </AModal>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  datsShow: Boolean,
  maxDate: {
    type: Date,
    required: true,
  },
  minDate: {
    type: Date,
    required: true,
  },
  phoneLis: {
    type: Array,
    default: () => [],
  },
  phoneShow: Boolean,
  telShow: Boolean,
  userDats: {
    type: String,
    default: "",
  },
  userDatsShow: Boolean,
  userDatePickerValue: {
    type: Array,
    default: () => [],
  },
  userPopup: Boolean,
  userTel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "close-date",
  "phone-bottom",
  "search",
  "select-date-open",
  "select-dats",
  "select-phone",
  "update:phoneShow",
  "update:userDatsShow",
  "update:userDatePickerValue",
  "update:userPopup",
]);

const userPopupModel = computed({
  get: () => props.userPopup,
  set: (value) => emit("update:userPopup", value),
});

const datePickerModel = computed({
  get: () => {
    if (props.userDats) {
      return props.userDats;
    }

    return props.userDatePickerValue.join("-");
  },
  set: (value) => {
    emit("update:userDatePickerValue", value ? value.split("-") : []);
    emit("update:userDatsShow", false);
    emit("select-dats");
  },
});

function selectPhone(value) {
  emit("update:phoneShow", false);
  emit("select-phone", { name: value || "" });
}

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
</script>

<style lang="scss" scoped>
.user-search-panel {
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
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

.search-form {
  :deep(.arco-select),
  :deep(.arco-picker) {
    width: 100%;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:global(.user-search-modal .arco-modal) {
  width: 480px;
  border-radius: 8px;
}

:global(.user-search-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.user-search-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

:global(.user-search-modal .arco-modal-body) {
  padding: 24px;
}

:global(html[data-theme="dark"] .user-search-modal .arco-modal) {
  background: #161b22;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.42);
}

:global(html[data-theme="dark"] .user-search-modal .arco-modal-header) {
  border-bottom-color: #30363d;
  background: #161b22;
}

:global(html[data-theme="dark"] .user-search-modal .arco-modal-title) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .user-search-modal .arco-modal-close-btn) {
  color: #9ca3af;

  &:hover {
    color: #f3f4f6;
    background: #21262d;
  }
}

:global(html[data-theme="dark"] .user-search-modal .arco-modal-body) {
  background: #161b22;
}

:global(html[data-theme="dark"] .user-search-modal .panel-summary) {
  border-color: #30363d;
  background: #0d1117;
}

:global(html[data-theme="dark"] .user-search-modal .summary-icon) {
  background: rgba(56, 139, 253, 0.14);
}

:global(html[data-theme="dark"] .user-search-modal .panel-summary h3) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .user-search-modal .panel-summary p) {
  color: #9ca3af;
}

:global(html[data-theme="dark"] .user-search-modal .arco-form-item-label-col > label) {
  color: #d1d5db;
}

:global(html[data-theme="dark"] .user-search-modal .arco-select-view),
:global(html[data-theme="dark"] .user-search-modal .arco-picker) {
  border-color: #30363d;
  background: #0d1117;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .user-search-modal .arco-select-view:hover),
:global(html[data-theme="dark"] .user-search-modal .arco-picker:hover) {
  border-color: #3b82f6;
  background: #111827;
}

:global(html[data-theme="dark"] .user-search-modal .arco-select-view-value),
:global(html[data-theme="dark"] .user-search-modal .arco-picker-input input) {
  color: #e5e7eb;
}

:global(html[data-theme="dark"] .user-search-modal .arco-select-view-placeholder),
:global(html[data-theme="dark"] .user-search-modal .arco-picker input::placeholder) {
  color: #6b7280;
}

:global(html[data-theme="dark"] .user-search-modal .modal-actions .arco-btn:not(.arco-btn-primary)) {
  border-color: #30363d;
  background: #21262d;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .user-search-modal .modal-actions .arco-btn:not(.arco-btn-primary):hover) {
  border-color: #4b5563;
  background: #30363d;
  color: #f3f4f6;
}
</style>
