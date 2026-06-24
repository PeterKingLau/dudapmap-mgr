<template>
  <div class="tags-view">
    <ADropdown
      v-for="tag in tags"
      :key="tag.fullPath"
      class="route-tag-dropdown"
      trigger="contextMenu"
    >
      <ATag
        :closable="canCloseTag(tag)"
        :class="['route-tag', { 'is-active': tag.fullPath === route.fullPath }]"
        @click="openTag(tag)"
        @close="closeTag(tag)"
      >
        <Icon v-if="tag.icon" class="route-tag-icon" :icon="tag.icon" />
        <span>{{ tag.title }}</span>
      </ATag>

      <template #content>
        <ADoption :disabled="!canCloseTag(tag)" @click="closeTag(tag)">
          <span class="tag-menu-option">
            <Icon class="tag-menu-icon" icon="ri:close-circle-line" />
            <span>关闭当前</span>
          </span>
        </ADoption>
        <ADoption :disabled="tags.length <= 1" @click="closeOtherTags(tag)">
          <span class="tag-menu-option">
            <Icon class="tag-menu-icon" icon="ri:close-line" />
            <span>关闭其他</span>
          </span>
        </ADoption>
        <ADoption :disabled="!hasClosableLeft(tag)" @click="closeLeftTags(tag)">
          <span class="tag-menu-option">
            <Icon class="tag-menu-icon" icon="ri:skip-left-line" />
            <span>关闭左侧</span>
          </span>
        </ADoption>
        <ADoption
          :disabled="!hasClosableRight(tag)"
          @click="closeRightTags(tag)"
        >
          <span class="tag-menu-option">
            <Icon class="tag-menu-icon" icon="ri:skip-right-line" />
            <span>关闭右侧</span>
          </span>
        </ADoption>
      </template>
    </ADropdown>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ROUTE_PATHS } from "../../router/paths";
import {
  getRouteIcon,
  getRouteTitle,
  ROUTE_ICONS,
  ROUTE_TITLES,
} from "../menu";

const route = useRoute();
const router = useRouter();
const homePath = ROUTE_PATHS.home.index;
const tags = ref([createStaticTag(homePath)]);

const currentTag = computed(() => ({
  fullPath: route.fullPath,
  icon: getRouteIcon(route),
  path: route.path,
  title: getRouteTitle(route),
}));

watch(
  currentTag,
  (tag) => {
    if (!route.meta.requiresAuth) {
      return;
    }

    if (!tags.value.some((item) => item.fullPath === tag.fullPath)) {
      tags.value.push(tag);
    }
  },
  { immediate: true },
);

function createStaticTag(path) {
  return {
    fullPath: path,
    icon: ROUTE_ICONS[path] || "ri:file-list-line",
    path,
    title: ROUTE_TITLES[path] || "未命名页面",
  };
}

function canCloseTag(tag) {
  return tag.path !== homePath && tags.value.length > 1;
}

function openTag(tag) {
  if (tag.fullPath !== route.fullPath) {
    router.push(tag.fullPath);
  }
}

function closeTag(tag) {
  if (!canCloseTag(tag)) {
    return;
  }

  const index = tags.value.findIndex((item) => item.fullPath === tag.fullPath);

  if (index === -1) {
    return;
  }

  tags.value.splice(index, 1);

  if (tag.fullPath !== route.fullPath) {
    return;
  }

  const nextTag = tags.value[index - 1] ||
    tags.value[index] || {
      fullPath: homePath,
    };
  router.push(nextTag.fullPath);
}

function removeTagByFullPath(fullPath) {
  const index = tags.value.findIndex((item) => item.fullPath === fullPath);

  if (index === -1 || !canCloseTag(tags.value[index])) {
    return;
  }

  tags.value.splice(index, 1);
}

function handleCloseCurrentRouteTag(event) {
  removeTagByFullPath(event.detail?.fullPath || route.fullPath);
}

onMounted(() => {
  window.addEventListener("close-current-route-tag", handleCloseCurrentRouteTag);
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "close-current-route-tag",
    handleCloseCurrentRouteTag,
  );
});

function normalizeTags(nextTags) {
  const homeTag =
    tags.value.find((item) => item.path === homePath) ||
    createStaticTag(homePath);
  const merged = [
    homeTag,
    ...nextTags.filter((item) => item.path !== homePath),
  ];
  const seen = new Set();

  return merged.filter((item) => {
    if (seen.has(item.fullPath)) {
      return false;
    }

    seen.add(item.fullPath);
    return true;
  });
}

function applyTags(nextTags, fallbackTag) {
  tags.value = normalizeTags(nextTags);

  if (!tags.value.some((item) => item.fullPath === route.fullPath)) {
    router.push(fallbackTag?.fullPath || homePath);
  }
}

function closeOtherTags(tag) {
  applyTags([tag], tag);
}

function closeLeftTags(tag) {
  const index = tags.value.findIndex((item) => item.fullPath === tag.fullPath);

  if (index === -1) {
    return;
  }

  applyTags(
    tags.value.filter((item, itemIndex) => itemIndex >= index),
    tag,
  );
}

function closeRightTags(tag) {
  const index = tags.value.findIndex((item) => item.fullPath === tag.fullPath);

  if (index === -1) {
    return;
  }

  applyTags(
    tags.value.filter((item, itemIndex) => itemIndex <= index),
    tag,
  );
}

function hasClosableLeft(tag) {
  const index = tags.value.findIndex((item) => item.fullPath === tag.fullPath);

  return tags.value.some(
    (item, itemIndex) => itemIndex < index && canCloseTag(item),
  );
}

function hasClosableRight(tag) {
  const index = tags.value.findIndex((item) => item.fullPath === tag.fullPath);

  return tags.value.some(
    (item, itemIndex) => itemIndex > index && canCloseTag(item),
  );
}
</script>

<style lang="scss" scoped>
.tags-view {
  height: 44px;
  padding: 8px 12px 0;
  box-sizing: border-box;
  background: #dee1e6;
  border-bottom: 1px solid #ffffff;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
}

.tags-view::-webkit-scrollbar {
  height: 3px;
}

.tags-view::-webkit-scrollbar-thumb {
  background: #c1c5ce;
  border-radius: 2px;
}

.tags-view::-webkit-scrollbar-track {
  background: transparent;
}

.route-tag-dropdown {
  flex: none;
  height: 36px;
}

.route-tag {
  flex: none;
  cursor: pointer;
  user-select: none;
  height: 36px !important;
  line-height: 36px !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 8px 8px 0 0 !important;
  padding: 0 16px !important;
  color: #5f6368 !important;
  transition: all 0.2s ease;
  font-size: 13px;
  display: inline-flex;
  align-items: center;

  &:hover:not(.is-active) {
    background-color: #f1f3f4 !important;
  }

  &.is-active {
    background-color: #ffffff !important;
    color: #1a73e8 !important;
    font-weight: 500;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.04);
    z-index: 1;
  }

  :deep(.arco-tag-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  :deep(.arco-tag-close-btn) {
    color: #5f6368 !important;
    margin-left: 8px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08) !important;
    }
  }

  &.is-active :deep(.arco-tag-close-btn) {
    color: #1a73e8 !important;

    &:hover {
      background-color: rgba(26, 115, 232, 0.1) !important;
    }
  }
}

.route-tag-icon {
  width: 14px;
  height: 14px;
  flex: none;
}

.tag-menu-option {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.tag-menu-icon {
  width: 15px;
  height: 15px;
  flex: none;
}
</style>
