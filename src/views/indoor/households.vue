<template>
  <div class="households-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>照片信息</h1>
          <p>查看照片记录、现场图片、地址、联系人电话和记录时间。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ records.length }} 条</ATag>
        <div class="header-icon">
          <img src="../../assets/images/nav-indoor.png" alt="" />
        </div>
      </div>
    </section>

    <section class="summary-section">
      <article class="summary-card">
        <span>照片记录</span>
        <strong>{{ records.length }}</strong>
      </article>
    </section>

    <section class="list-section">
      <div v-if="loading" class="state-panel">
        <ASpin :size="28" />
        <span>加载中...</span>
      </div>

      <div v-else-if="!records.length" class="state-panel">
        <Icon icon="ri:home-search-line" />
        <h3>暂无照片信息</h3>
        <p>当前还没有照片记录。</p>
      </div>

      <div v-else class="household-grid">
        <router-link
          v-for="item in records"
          :key="item.id || item.recordimg"
          class="household-card"
          :to="{
            path: ROUTE_PATHS.indoor.detail,
            query: {
              recorddate: item.recorddate,
              userphone: item.userphone,
              lookupPhone: item.__lookupPhone || item.userphone,
              lookupDate: item.__lookupDate || item.recorddate,
            },
          }"
        >
          <div class="record-image">
            <img
              v-if="item.recordimg && !isImageFailed(item)"
              :src="getImageUrl(item.recordimg)"
              alt=""
              @error="markImageFailed(item)"
            />
            <div v-else class="image-fallback">
              <Icon icon="ri:image-line" />
              <span>{{ item.recordimg ? "图片加载失败" : "暂无图片" }}</span>
            </div>
          </div>

          <div class="record-content">
            <div class="record-header">
              <span>拍摄地址</span>
              <Icon icon="ri:arrow-right-line" />
            </div>
            <h2>{{ item.recordaddr || "暂无地址" }}</h2>

            <dl class="record-meta">
              <div>
                <dt>电话</dt>
                <dd>{{ item.userphone || "-" }}</dd>
              </div>
              <div>
                <dt>时间</dt>
                <dd>{{ item.recorddate || "-" }}</dd>
              </div>
            </dl>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchIndoorRecords } from "../../api/indoor";

const router = useRouter();
const records = ref([]);
const loading = ref(false);
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
const imageErrors = ref({});

onMounted(() => {
  getUserInfo();
});

function closePage() {
  router.back();
}

function isImageName(value) {
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(String(value || ""));
}

function isPhoneNumber(value) {
  return /^1[3-9]\d{9}$/.test(String(value || ""));
}

function isDateText(value) {
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(value || ""));
}

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  const imagePath = String(image);

  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("/")) {
    return imagePath;
  }

  const baseUrl = String(imageBaseUrl || "");

  return `${baseUrl.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
}

function getImageKey(item) {
  return String(item?.id || item?.recordimg || "");
}

function isImageFailed(item) {
  return Boolean(imageErrors.value[getImageKey(item)]);
}

function markImageFailed(item) {
  imageErrors.value = {
    ...imageErrors.value,
    [getImageKey(item)]: true,
  };
}

function normalizeIndoorRecord(item) {
  const normalized = {
    ...item,
    __lookupPhone: item?.userphone || "",
    __lookupDate: item?.recorddate || "",
  };

  if (
    isImageName(item?.userphone) &&
    isDateText(item?.recordaddr)
  ) {
    return {
      ...normalized,
      recordaddr: item.recordimg || "",
      recordimg: item.userphone,
      userphone: isPhoneNumber(item.recorddate) ? item.recorddate : "",
      recorddate: item.recordaddr,
    };
  }

  return normalized;
}

function getUserInfo() {
  loading.value = true;
  imageErrors.value = {};
  fetchIndoorRecords()
    .then((res) => {
      records.value = Array.isArray(res.data)
        ? res.data.map(normalizeIndoorRecord)
        : [];
    })
    .catch(() => {
      records.value = [];
      Message.error("照片信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.households-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.summary-section,
.list-section {
  padding: 24px 32px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
}

.page-header,
.summary-section {
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

.summary-card {
  min-width: 220px;
  min-height: 112px;
  padding: 20px 24px;
  border: 1px solid #d2e3fc;
  border-radius: 12px;
  background: #f0f4f9;
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
    color: #1a73e8;
    font-size: 32px;
    line-height: 40px;
    font-weight: 600;
  }
}

.state-panel {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
  text-align: center;

  > svg {
    width: 44px;
    height: 44px;
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

.household-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.household-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 18px;
  color: inherit;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d2e3fc;

    .record-header svg {
      color: #1a73e8;
    }
  }
}

.record-image {
  width: 132px;
  height: 132px;
  border-radius: 8px;
  background: #e8f0fe;
  color: #1a73e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 36px;
    height: 36px;
  }
}

.image-fallback {
  height: 100%;
  color: #5f6368;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;

  svg {
    color: #9aa0a6;
  }
}

.record-content {
  min-width: 0;
  text-align: left;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  span {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  svg {
    width: 18px;
    height: 18px;
    color: #9aa0a6;
    flex: none;
  }
}

.record-content h2 {
  margin: 6px 0 16px;
  color: #202124;
  font-size: 18px;
  line-height: 26px;
  font-weight: 500;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.record-meta {
  margin: 0;
  display: grid;
  gap: 10px;

  > div {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
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

@media (max-width: 1280px) {
  .household-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .page-header,
  .summary-section {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-side {
    align-self: flex-end;
  }

  .summary-card {
    width: 100%;
  }

  .household-card {
    grid-template-columns: 1fr;
  }

  .record-image {
    width: 100%;
    height: 220px;
  }
}
</style>
