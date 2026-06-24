<template>
  <AModal
    v-model:visible="showModel"
    :footer="false"
    modal-class="staff-modal"
    title="施工人员"
    @cancel="handleClose"
  >
    <div class="staff-panel">
      <div class="role-tabs-shell">
        <button
          class="role-scroll-button"
          type="button"
          aria-label="向左滑动"
          @click="scrollRoleTabs(-1)"
        >
          <Icon icon="ri:arrow-left-s-line" />
        </button>

        <div
          ref="roleTabsRef"
          class="role-tabs"
          role="tablist"
          aria-label="人员角色筛选"
          @mousedown="startDrag"
          @mouseleave="stopDrag"
          @mouseup="stopDrag"
          @mousemove="dragRoleTabs"
          @wheel.prevent="handleWheel"
        >
          <button
            v-for="(roleName, index) in userroleList"
            :key="roleName"
            class="role-tab"
            :class="{ active: activeModel === index }"
            type="button"
            @click="selectRole(index, roleName)"
          >
            {{ roleName }}
          </button>
        </div>

        <button
          class="role-scroll-button"
          type="button"
          aria-label="向右滑动"
          @click="scrollRoleTabs(1)"
        >
          <Icon icon="ri:arrow-right-s-line" />
        </button>
      </div>

      <div class="staff-list" :style="{ maxHeight: listMaxHeight }">
        <div v-if="findAll.length" class="staff-grid">
          <article
            v-for="item in findAll"
            :key="item.userphone"
            class="staff-card"
          >
            <img
              v-if="item.infoflag == 2"
              class="status-icon"
              src="../../assets/images/icon-role-change.png"
              alt=""
            />

            <div class="staff-card-header">
              <span class="staff-avatar">
                {{ getUserInitial(item) }}
              </span>
              <div class="staff-main">
                <button
                  v-if="item.infoflag != 1 && item.infoflag != 3"
                  class="role-link"
                  type="button"
                  @click="$emit('open-role', item.userrole, item.userphone)"
                >
                  <span>{{ item.userrole || "-" }}</span>
                  <img src="../../assets/images/icon-view.png" alt="" />
                </button>
                <strong v-else>{{ item.userrole || "-" }}</strong>
                <span>{{ item.userphone || "-" }}</span>
              </div>
            </div>

            <dl class="staff-meta">
              <div>
                <dt>职位</dt>
                <dd>{{ item.userrole || "-" }}</dd>
              </div>
              <div>
                <dt>电话号码</dt>
                <dd>{{ item.userphone || "-" }}</dd>
              </div>
              <div>
                <dt>时间</dt>
                <dd>{{ item.userdate || "-" }}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div v-else class="empty-state">
          <img src="../../assets/images/empty-data.png" alt="" />
          <p>暂无施工人员对应的信息！</p>
        </div>
      </div>
    </div>
  </AModal>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  activeRoleIndex: {
    type: Number,
    default: 0,
  },
  findAll: {
    type: Array,
    default: () => [],
  },
  screenHeight: {
    type: Number,
    default: 0,
  },
  show: Boolean,
  staffListHeight: {
    type: Number,
    default: 240,
  },
  userroleList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "close",
  "open-role",
  "select-tab",
  "update:activeRoleIndex",
  "update:show",
]);

const showModel = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value),
});

const activeModel = computed({
  get: () => props.activeRoleIndex,
  set: (value) => emit("update:activeRoleIndex", value),
});

const listMaxHeight = computed(
  () => `${Math.max(props.staffListHeight, 420)}px`,
);
const roleTabsRef = ref(null);
const dragging = ref(false);
const dragStartX = ref(0);
const dragStartScrollLeft = ref(0);

function selectRole(index, title) {
  activeModel.value = index;
  emit("select-tab", { name: index, title });
}

function scrollRoleTabs(direction) {
  roleTabsRef.value?.scrollBy({
    left: direction * 180,
    behavior: "smooth",
  });
}

function handleWheel(event) {
  const target = roleTabsRef.value;

  if (!target) {
    return;
  }

  const delta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

  target.scrollLeft += delta;
}

function startDrag(event) {
  const target = roleTabsRef.value;

  if (!target) {
    return;
  }

  dragging.value = true;
  dragStartX.value = event.pageX;
  dragStartScrollLeft.value = target.scrollLeft;
}

function stopDrag() {
  dragging.value = false;
}

function dragRoleTabs(event) {
  const target = roleTabsRef.value;

  if (!dragging.value || !target) {
    return;
  }

  event.preventDefault();
  target.scrollLeft =
    dragStartScrollLeft.value - (event.pageX - dragStartX.value);
}

function resetRoleState() {
  const firstRoleName = props.userroleList[0];

  if (props.activeRoleIndex !== 0) {
    emit("update:activeRoleIndex", 0);
  }

  if (firstRoleName) {
    emit("select-tab", { name: 0, title: firstRoleName });
  }
}

function handleClose() {
  resetRoleState();
  emit("close");
}

function getUserInitial(item) {
  const value = item.username || item.userrole || item.userphone || "人";

  return String(value).slice(0, 1);
}
</script>

<style lang="scss" scoped>
.staff-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.role-tabs-shell {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 32px;
  align-items: center;
  gap: 8px;
}

.role-scroll-button {
  width: 32px;
  height: 32px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  background: #ffffff;
  color: #5f6368;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: #1a73e8;
    border-color: #d2e3fc;
    background: #f8fbff;
  }
}

.role-tabs {
  min-width: 0;
  padding: 8px;
  border-radius: 8px;
  background: #f1f3f4;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

.role-tab {
  flex: 0 0 auto;
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #5f6368;
  font-size: 14px;
  line-height: 36px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(.active) {
    background: rgba(0, 0, 0, 0.04);
    color: #202124;
  }

  &.active {
    color: #1a73e8;
    background: #ffffff;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.staff-list {
  min-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.staff-list::-webkit-scrollbar {
  width: 4px;
}

.staff-list::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 2px;
}

.staff-list::-webkit-scrollbar-track {
  background: transparent;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.staff-card {
  position: relative;
  min-width: 0;
  padding: 24px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  overflow: hidden;
  text-align: left;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d2e3fc;
  }
}

.status-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 46px;
  height: 52px;
  object-fit: contain;
}

.staff-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.staff-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e8f0fe;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-size: 18px;
  font-weight: 500;
}

.staff-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  strong,
  > span {
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

  > span {
    color: #5f6368;
    font-size: 14px;
    line-height: 20px;
  }
}

.role-link {
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex: none;
  }

  &:hover span {
    text-decoration: underline;
  }
}

.staff-meta {
  margin: 20px 0 0;
  padding: 18px 0 0;
  border-top: 1px solid #f1f3f4;
  display: grid;
  gap: 12px;

  > div {
    display: grid;
    grid-template-columns: 86px minmax(0, 1fr);
    gap: 16px;
  }

  dt {
    color: #5f6368;
    font-size: 14px;
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

.empty-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5f6368;

  img {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    object-fit: contain;
    opacity: 0.9;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
  }
}

:global(.staff-modal .arco-modal) {
  width: min(1040px, calc(100vw - 64px));
  border-radius: 8px;
}

:global(.staff-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.staff-modal .arco-modal-title) {
  color: #202124;
  font-weight: 500;
  font-size: 16px;
}

:global(.staff-modal .arco-modal-body) {
  padding: 28px 32px 32px;
}
</style>
