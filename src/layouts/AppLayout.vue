<template>
  <ALayout class="app-layout" :class="{ 'theme-dark': isDarkMode }">
    <ALayoutSider
      class="app-sider"
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="232"
      collapsible
      hide-trigger
    >
      <div class="layout-brand" :class="{ collapsed }">
        <img src="../assets/images/brand-logo.png" alt="" />
        <div v-if="!collapsed">
          <strong>华信达</strong>
          <span>管理工作台</span>
        </div>
      </div>

      <div class="layout-menu" :class="{ collapsed }">
        <AMenu
          v-model:open-keys="openMenuKeys"
          :selected-keys="[activeMenu]"
          :collapsed="collapsed"
          class="layout-menu-main"
          theme="dark"
          auto-open-selected
        >
          <ASubMenu
            v-for="section in visibleMenuSections"
            :key="getMenuSectionKey(section)"
            :title="section.title"
          >
            <template #icon>
              <Icon class="menu-section-icon" :icon="section.icon" />
            </template>
            <AMenuItem
              v-for="item in section.items"
              :key="item.path"
              :title="item.title"
              @click="goRoute(item.path)"
            >
              <template v-if="item.icon" #icon>
                <Icon class="menu-item-icon" :icon="item.icon" />
              </template>
              <span v-if="!collapsed">{{ item.title }}</span>
            </AMenuItem>
          </ASubMenu>
        </AMenu>
      </div>
    </ALayoutSider>

    <ALayout class="app-body">
      <header class="app-header">
        <div class="header-left">
          <AButton
            class="collapse-button"
            type="text"
            size="small"
            @click="collapsed = !collapsed"
          >
            <Icon
              class="collapse-icon"
              :icon="collapsed ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'"
            />
            {{ collapsed ? "展开" : "收起" }}
          </AButton>
          <AppBreadcrumb />
        </div>

        <div class="header-right">
          <AButton
            class="theme-toggle-button"
            shape="circle"
            type="text"
            :title="isDarkMode ? '切换浅色模式' : '切换暗黑模式'"
            @click="toggleTheme"
          >
            <Icon
              :icon="isDarkMode ? 'ri:sun-line' : 'ri:moon-clear-line'"
            />
          </AButton>
          <div class="user-region" title="区域">
            <Icon class="region-icon" icon="ri:map-pin-2-line" />
            <span>{{ currentUser.useravator || "-" }}</span>
          </div>
          <ADropdown trigger="click">
            <button class="user-button" type="button">
              <AAvatar :size="32" class="user-avatar">{{
                userInitial
              }}</AAvatar>
              <span>{{ currentUser.username || currentUser.userphone }}</span>
              <Icon class="user-arrow" icon="ri:arrow-down-s-line" />
            </button>
            <template #content>
              <ADoption @click="logout">
                <Icon
                  class="dropdown-option-icon"
                  icon="ri:logout-box-r-line"
                />
                退出登录
              </ADoption>
            </template>
          </ADropdown>
        </div>
      </header>

      <TagsView />

      <main class="layout-content">
        <slot />
      </main>
    </ALayout>
  </ALayout>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal as AModal } from "@arco-design/web-vue";
import { useAppStore } from "../store";
import { ROUTE_PATHS } from "../router/paths";
import { canAccessRoute } from "../router/permissions";
import AppBreadcrumb from "./components/AppBreadcrumb.vue";
import TagsView from "./components/TagsView.vue";
import { MENU_SECTIONS, getRouteMenuPath } from "./menu";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const collapsed = ref(false);
const openMenuKeys = ref([]);
const THEME_STORAGE_KEY = "app-theme";
const isDarkMode = ref(getInitialDarkMode());

const currentUser = computed(() => appStore.getLogin || {});
const userInitial = computed(() => {
  const name =
    currentUser.value.username || currentUser.value.userphone || "用";

  return String(name).slice(0, 1);
});

const visibleMenuSections = computed(() =>
  MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.access || canAccessRoute(currentUser.value, item.access),
    ),
  })).filter((section) => section.items.length),
);

const activeMenu = computed(() => {
  const items = visibleMenuSections.value.flatMap((section) => section.items);
  const menuPath = getRouteMenuPath(route.path);
  const matched =
    items.find((item) => item.path === menuPath) ||
    items.find((item) => item.path === route.path) ||
    items.find((item) => route.path.startsWith(item.path) && item.path !== "/");

  return matched?.path || ROUTE_PATHS.home.index;
});

const activeSectionKey = computed(
  () =>
    visibleMenuSections.value.find((section) =>
      section.items.some((item) => item.path === activeMenu.value),
    )?.title || "",
);

watch(
  isDarkMode,
  (value) => {
    document.documentElement.dataset.theme = value ? "dark" : "light";
    document.body.setAttribute("arco-theme", value ? "dark" : "light");
    localStorage.setItem(THEME_STORAGE_KEY, value ? "dark" : "light");
  },
  { immediate: true },
);

function getInitialDarkMode() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  } catch (error) {
    return false;
  }
}

watch(
  [visibleMenuSections, activeSectionKey],
  ([sections, sectionKey]) => {
    const validKeys = new Set(sections.map(getMenuSectionKey));
    const nextKeys = openMenuKeys.value.filter((key) => validKeys.has(key));

    if (sectionKey && !nextKeys.includes(sectionKey)) {
      nextKeys.push(sectionKey);
    }

    openMenuKeys.value = nextKeys;
  },
  { immediate: true },
);

function getMenuSectionKey(section) {
  return section.title;
}

function goRoute(path) {
  if (path !== route.path) {
    router.push(path);
  }
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
}

function clearTaskDetailCache() {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("taskDetail:")) {
      sessionStorage.removeItem(key);
    }
  });
}

function logout() {
  AModal.confirm({
    title: "退出登录",
    content: "确定退出当前账号吗？",
    okText: "退出",
    cancelText: "取消",
    onOk: () => {
      appStore.clearLogin();
      sessionStorage.removeItem("userInfo");
      sessionStorage.removeItem("useravator");
      clearTaskDetailCache();
      Message.success("已退出登录");
      router.replace({ path: ROUTE_PATHS.auth.login });
    },
  });
}
</script>

<style lang="scss" scoped>
.app-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f1f3f4;
}

.app-sider {
  background: #202124;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  z-index: 10;

  :deep(.arco-layout-sider-children) {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden !important;
  }

  :deep(.arco-menu-dark) {
    background: transparent;
  }

  :deep(.arco-menu-item) {
    height: 40px;
    line-height: 40px;
    margin: 4px 12px 4px 20px;
    border-radius: 8px;
    color: #9aa0a6;
    transition: all 0.2s ease;

    &:hover {
      color: #e8eaed;
      background: rgba(255, 255, 255, 0.04);
    }
  }

  :deep(.arco-menu-item.arco-menu-selected) {
    color: #8ab4f8;
    background: rgba(138, 180, 248, 0.12);
    font-weight: 500;

    &:hover {
      background: rgba(138, 180, 248, 0.16);
    }
  }

  :deep(.arco-menu-inline-header.arco-menu-selected) {
    color: #d8dee6;
    background: transparent;
    font-weight: 500;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  :deep(.arco-menu-inline-header) {
    height: 42px;
    line-height: 42px;
    margin: 8px 12px 4px;
    border-radius: 8px;
    color: #d8dee6;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  :deep(.arco-menu-inline-content) {
    padding: 2px 0 4px;
  }

  :deep(.arco-menu-icon-suffix) {
    color: #7d8793;
  }
}

.layout-brand {
  height: 64px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &.collapsed {
    justify-content: center;
    padding: 0;
  }

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex: none;
  }

  strong,
  span {
    display: block;
    text-align: left;
  }

  strong {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: 0.5px;
  }

  span {
    margin-top: 2px;
    color: #9aa0a6;
    font-size: 12px;
    line-height: 16px;
  }
}

.layout-menu {
  flex: 1;
  min-height: 0;
  padding: 12px 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &.collapsed {
    padding-top: 12px;
    overflow-x: hidden;
    overflow-y: auto;

    :deep(.layout-menu-main),
    :deep(.arco-menu),
    :deep(.arco-menu-inner) {
      width: 64px;
      min-width: 64px;
      overflow: hidden !important;
      scrollbar-width: none;
    }

    :deep(.layout-menu-main::-webkit-scrollbar),
    :deep(.arco-menu::-webkit-scrollbar),
    :deep(.arco-menu-inner::-webkit-scrollbar) {
      display: none;
    }

    :deep(.arco-menu-inline-header),
    :deep(.arco-menu-item) {
      width: 40px;
      height: 40px;
      margin: 8px auto;
      padding: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    :deep(.arco-menu-collapsed),
    :deep(.arco-menu-collapsed .arco-menu-inner) {
      width: 64px;
      padding: 0;
    }

    :deep(.arco-menu-indent-list),
    :deep(.arco-menu-title),
    :deep(.arco-menu-icon-suffix) {
      display: none !important;
    }

    :deep(.arco-menu-inline-content) {
      display: none;
    }

    :deep(.arco-menu-icon) {
      width: 40px;
      height: 40px;
      margin: 0 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
    }

    :deep(.arco-menu-inline-header .arco-icon),
    :deep(.arco-menu-item .arco-icon),
    :deep(.arco-menu-icon svg) {
      margin: 0 !important;
    }

    :deep(.menu-section-icon),
    :deep(.menu-item-icon) {
      display: block;
      margin: 0 auto;
    }
  }
}

.layout-menu-main {
  width: 100%;
}

.menu-section-icon,
.menu-item-icon {
  width: 18px;
  height: 18px;
  flex: none;
}

.app-body {
  min-width: 0;
  height: 100%;
  background: #f1f3f4;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 58px;
  padding: 0 16px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: none;
}

.header-left,
.header-right {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-button {
  color: #5f6368;
  border-radius: 6px;
  height: 32px;
  padding: 0 10px;
  font-size: 13px;

  &:hover {
    background-color: #f1f3f4;
    color: #202124;
  }

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.collapse-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.theme-toggle-button {
  width: 34px;
  height: 34px;
  color: #5f6368;
  border-radius: 50%;

  &:hover {
    color: #202124;
    background-color: #f1f3f4;
  }

  :deep(.arco-btn-content) {
    line-height: 0;
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.user-region {
  height: 26px;
  max-width: 180px;
  padding: 0 12px 0 10px;
  border-radius: 13px;
  background: #e8f0fe;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  line-height: 26px;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.region-icon {
  width: 15px;
  height: 15px;
  flex: none;
}

.user-button {
  height: 40px;
  padding: 4px 12px 4px 4px;
  border: 0;
  border-radius: 20px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #3c4043;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f1f3f4;
  }

  .user-avatar {
    background-color: #1a73e8;
    color: #ffffff;
    font-size: 14px;
  }

  span {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.user-arrow {
  width: 16px;
  height: 16px;
  color: #5f6368;
  flex: none;
}

.dropdown-option-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  color: #5f6368;
  vertical-align: -3px;
}

.app-layout.theme-dark {
  color-scheme: dark;
  background: #111827;

  .app-body,
  .layout-content {
    background: #111827;
  }

  .app-header {
    background: #161b22;
    border-bottom: 1px solid #30363d;
  }

  .collapse-button,
  .theme-toggle-button {
    color: #9ca3af;

    &:hover {
      color: #f3f4f6;
      background-color: #21262d;
    }
  }

  .user-region {
    background: rgba(56, 139, 253, 0.16);
    color: #58a6ff;
  }

  .user-button {
    color: #e5e7eb;

    &:hover {
      background: #21262d;
    }
  }

  .user-arrow,
  .dropdown-option-icon {
    color: #9ca3af;
  }

  :deep(.tags-view) {
    background: #111827;
    border-bottom-color: #30363d;
  }

  :deep(.route-tag) {
    color: #9ca3af !important;

    &:hover:not(.is-active) {
      background-color: #21262d !important;
    }

    &.is-active {
      color: #58a6ff !important;
      background-color: #161b22 !important;
      box-shadow: none;
    }
  }

  :deep(.page-header),
  :deep(.filter-section),
  :deep(.list-section),
  :deep(.detail-section),
  :deep(.form-section),
  :deep(.summary-card),
  :deep(.user-card),
  :deep(.task-card),
  :deep(.journal-card),
  :deep(.detail-card),
  :deep(.appointment-card),
  :deep(.device-card),
  :deep(.stat-card) {
    border-color: #30363d;
    background: #161b22;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(strong),
  :deep(dd) {
    color: #f3f4f6;
  }

  :deep(p),
  :deep(span),
  :deep(dt),
  :deep(label) {
    color: #9ca3af;
  }

  :deep(.arco-input-wrapper),
  :deep(.arco-select-view),
  :deep(.arco-picker),
  :deep(.arco-textarea-wrapper) {
    border-color: #30363d;
    background-color: #0d1117;
    color: #e5e7eb;
  }

  :deep(.arco-input),
  :deep(.arco-select-view-value),
  :deep(.arco-picker-input input),
  :deep(.arco-textarea) {
    color: #e5e7eb;
  }
}

:global(html[data-theme="dark"] body) {
  background: #111827;
}

.layout-content {
  height: calc(100vh - 102px);
  min-height: 0;
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
}
</style>
