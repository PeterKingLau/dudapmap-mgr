<template>
  <ABreadcrumb class="app-breadcrumb">
    <ABreadcrumbItem v-for="item in breadcrumbItems" :key="item.title">
      <span class="breadcrumb-item">
        <Icon v-if="item.icon" class="breadcrumb-icon" :icon="item.icon" />
        <span>{{ item.title }}</span>
      </span>
    </ABreadcrumbItem>
  </ABreadcrumb>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getRouteBreadcrumb } from "../menu";

const route = useRoute();
const breadcrumbItems = computed(() => getRouteBreadcrumb(route));
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  min-width: 0;
  display: flex;
  align-items: center;

  :deep(.arco-breadcrumb-item) {
    color: #5f6368;
    font-size: 13px;
    transition: color 0.2s ease;
  }

  :deep(.arco-breadcrumb-item:not(:last-child):hover) {
    color: #1a73e8;
  }

  :deep(.arco-breadcrumb-item:last-child) {
    color: #202124;
    font-weight: 500;
  }

  :deep(.arco-breadcrumb-item-separator) {
    color: #9aa0a6;
    font-size: 12px;
    margin: 0 8px;
  }
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-icon {
  width: 14px;
  height: 14px;
  flex: none;
}
</style>
