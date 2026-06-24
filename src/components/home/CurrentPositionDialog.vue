<template>
  <AModal
    v-model:visible="showModel"
    :footer="false"
    modal-class="position-modal"
    title="当前位置"
  >
    <div class="position-panel">
      <div class="position-summary">
        <span class="position-icon">
          <img src="../../assets/images/icon-location.png" alt="" />
        </span>
        <div>
          <strong>当前定位信息</strong>
          <p>确认坐标后可添加为新的地图位置点。</p>
        </div>
      </div>

      <dl class="position-detail">
        <div>
          <dt>当前位置</dt>
          <dd>{{ propaddress || "-" }}</dd>
        </div>
        <div>
          <dt>当前经度</dt>
          <dd>{{ longitude || "-" }}</dd>
        </div>
        <div>
          <dt>当前纬度</dt>
          <dd>{{ latitude || "-" }}</dd>
        </div>
      </dl>

      <div class="position-actions">
        <AButton @click="$emit('reset')">重新添加</AButton>
        <AButton type="primary" @click="$emit('add')">添加位置</AButton>
      </div>
    </div>
  </AModal>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  latitude: {
    type: Number,
    default: 0,
  },
  longitude: {
    type: Number,
    default: 0,
  },
  propaddress: {
    type: String,
    default: "",
  },
  show: Boolean,
});

const emit = defineEmits(["add", "reset", "update:show"]);

const showModel = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value),
});
</script>

<style lang="scss" scoped>
.position-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.position-summary {
  padding: 16px;
  border: 1px solid #e5e8ef;
  border-radius: 8px;
  background: #f8fbff;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;

  strong {
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }
}

.position-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }
}

.position-detail {
  margin: 0;
  border: 1px solid #e5e8ef;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  > div {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 16px;
    padding: 13px 16px;
    border-bottom: 1px solid #eef1f6;
    text-align: left;

    &:last-child {
      border-bottom: 0;
    }
  }

  dt {
    color: #5f6368;
    font-size: 13px;
    line-height: 22px;
  }

  dd {
    margin: 0;
    color: #202124;
    font-size: 14px;
    line-height: 22px;
    word-break: break-all;
  }
}

.position-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:global(.position-modal .arco-modal) {
  width: 520px;
  border-radius: 8px;
}

:global(.position-modal .arco-modal-header) {
  border-bottom: 1px solid #eef1f6;
}

:global(.position-modal .arco-modal-title) {
  color: #202124;
  font-weight: 600;
}

:global(html[data-theme="dark"] .position-modal .arco-modal) {
  background: #161b22;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.42);
}

:global(html[data-theme="dark"] .position-modal .arco-modal-header) {
  border-bottom-color: #30363d;
  background: #161b22;
}

:global(html[data-theme="dark"] .position-modal .arco-modal-title) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .position-modal .arco-modal-close-btn) {
  color: #9ca3af;

  &:hover {
    color: #f3f4f6;
    background: #21262d;
  }
}

:global(html[data-theme="dark"] .position-modal .arco-modal-body) {
  background: #161b22;
}

:global(html[data-theme="dark"] .position-modal .position-summary) {
  border-color: #30363d;
  background: #0d1117;
}

:global(html[data-theme="dark"] .position-modal .position-summary strong) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .position-modal .position-summary p) {
  color: #9ca3af;
}

:global(html[data-theme="dark"] .position-modal .position-icon) {
  background: rgba(56, 139, 253, 0.14);
}

:global(html[data-theme="dark"] .position-modal .position-detail) {
  border-color: #30363d;
  background: #0d1117;
}

:global(html[data-theme="dark"] .position-modal .position-detail > div) {
  border-bottom-color: #30363d;
}

:global(html[data-theme="dark"] .position-modal .position-detail dt) {
  color: #9ca3af;
}

:global(html[data-theme="dark"] .position-modal .position-detail dd) {
  color: #f3f4f6;
}

:global(html[data-theme="dark"] .position-modal .position-actions .arco-btn:not(.arco-btn-primary)) {
  border-color: #30363d;
  background: #21262d;
  color: #d1d5db;
}

:global(html[data-theme="dark"] .position-modal .position-actions .arco-btn:not(.arco-btn-primary):hover) {
  border-color: #4b5563;
  background: #30363d;
  color: #f3f4f6;
}
</style>
