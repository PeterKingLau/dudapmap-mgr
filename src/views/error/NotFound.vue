<template>
  <div class="not-found-page">
    <section class="not-found-panel">
      <div class="illustration">
        <img
          v-if="showImage"
          :src="errorImage"
          alt=""
          @error="showImage = false"
        />
        <div v-else class="fallback-illustration">
          <Icon icon="ri:road-map-line" />
          <span>404</span>
        </div>
      </div>

      <div class="content">
        <ATag color="arcoblue" class="status-tag">页面不存在</ATag>
        <h1>找不到这个页面</h1>
        <p>当前地址可能已经失效，或这个页面不是可直接访问的功能入口。</p>
        <div class="path-line">
          <span class="label">访问路径</span>
          <strong class="path">{{ route.fullPath }}</strong>
        </div>
        <div class="actions">
          <AButton type="primary" size="large" shape="round" @click="goHome">
            <template #icon>
              <Icon icon="ri:dashboard-3-line" />
            </template>
            回到工作台
          </AButton>
          <AButton size="large" shape="round" @click="goBack">
            <template #icon>
              <Icon icon="ri:arrow-left-line" />
            </template>
            返回上一页
          </AButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import errorImage from "../../assets/images/error-404.png";
import { ROUTE_PATHS } from "../../router/paths";

const route = useRoute();
const router = useRouter();
const showImage = ref(true);

function closeCurrentTag() {
  window.dispatchEvent(
    new CustomEvent("close-current-route-tag", {
      detail: {
        fullPath: route.fullPath,
      },
    }),
  );
}

function goHome() {
  closeCurrentTag();
  router.replace(ROUTE_PATHS.home.index);
}

function goBack() {
  closeCurrentTag();
  router.back();
}
</script>

<style lang="scss" scoped>
.not-found-page {
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f6fdb3 0%, #f9f9fbb3 100%);
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.not-found-panel {
  width: min(1000px, 100%);
  height: 100%;
  min-height: 0;
  max-height: 100%;
  padding: 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  box-shadow:
    0 24px 48px -12px rgba(16, 24, 40, 0.08),
    0 0 1px rgba(16, 24, 40, 0.12);
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 64px;
  box-sizing: border-box;
  overflow: hidden;
}

.illustration {
  height: 100%;
  min-height: 0;
  border-radius: 20px;
  background: linear-gradient(180deg, #f8f9fc 0%, #f1f4f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    max-height: 340px;
    object-fit: contain;
  }
}

.fallback-illustration {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ebf2ff 0%, #e1ebfa 100%);
  color: #165dff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-shadow: inset 0 0 0 8px rgba(255, 255, 255, 0.5);

  svg {
    width: 72px;
    height: 72px;
    opacity: 0.9;
  }

  span {
    color: #1d2129;
    font-size: 56px;
    line-height: 1;
    font-weight: 800;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
      Arial, sans-serif;
    background: linear-gradient(90deg, #165dff, #14c9c9);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.content {
  min-width: 0;
  text-align: left;
  padding-right: 24px;

  .status-tag {
    font-weight: 500;
    padding: 0 12px;
    height: 28px;
    border-radius: 6px;
  }

  h1 {
    margin: 24px 0 16px;
    color: #1d2129;
    font-size: 36px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  p {
    max-width: 480px;
    margin: 0;
    color: #4e5969;
    font-size: 16px;
    line-height: 1.6;
  }
}

.path-line {
  margin-top: 32px;
  padding: 16px 20px;
  border-radius: 12px;
  background: #f7f8fa;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  border: 1px solid rgba(229, 230, 235, 0.5);

  .label {
    color: #86909c;
    font-size: 14px;
    font-weight: 500;
  }

  .path {
    color: #1d2129;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
}

.actions {
  margin-top: 40px;
  display: flex;
  gap: 16px;

  :deep(.arco-btn) {
    font-weight: 500;
    padding: 0 24px;
  }

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;

    svg {
      font-size: 18px;
    }
  }
}

@media (max-width: 1180px) {
  .not-found-panel {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(160px, 0.8fr) auto;
    gap: 28px;
    padding: 32px;
  }

  .illustration {
    min-height: 0;
  }

  .content {
    padding-right: 0;
    text-align: center;

    p {
      margin: 0 auto;
    }

    .path-line {
      text-align: left;
    }

    .actions {
      justify-content: center;
    }
  }
}

@media (max-width: 640px) {
  .not-found-page {
    padding: 16px;
  }

  .not-found-panel {
    padding: 24px;
  }

  .content h1 {
    font-size: 28px;
  }

  .actions {
    flex-direction: column;

    :deep(.arco-btn) {
      width: 100%;
    }
  }
}
</style>
