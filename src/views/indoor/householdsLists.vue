<template>
  <div class="household-detail-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>照片详情</h1>
          <p>查看照片记录图片、地址、楼栋号、坐标和记录时间。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ lists.length }} 条</ATag>
        <div class="header-icon">
          <img src="../../assets/images/nav-indoor.png" alt="" />
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card theme-blue">
        <span>记录数量</span>
        <strong>{{ lists.length }}</strong>
      </article>
      <article class="summary-card theme-green">
        <span>查询日期</span>
        <strong>{{ queryDate || "-" }}</strong>
      </article>
      <article class="summary-card theme-orange">
        <span>联系电话</span>
        <strong>{{ queryPhone || "-" }}</strong>
      </article>
    </section>

    <section class="list-section">
      <div v-if="loading" class="state-panel">
        <ASpin :size="28" />
        <span>加载中...</span>
      </div>

      <div v-else-if="!lists.length" class="state-panel">
        <Icon icon="ri:file-search-line" />
        <h3>暂无详细信息</h3>
        <p>当前查询条件下没有照片详情记录。</p>
      </div>

      <div v-else class="detail-grid">
        <article
          v-for="(item, index) in lists"
          :key="item.id || item.recordimg || index"
          class="detail-card"
        >
          <AButton
            class="delete-button"
            shape="circle"
            status="danger"
            @click="del(index, item.id)"
          >
            <template #icon>
              <Icon icon="ri:delete-bin-6-line" />
            </template>
          </AButton>
          <div class="image-panel">
            <button
              class="image-button"
              type="button"
              @click="previewImages(index)"
            >
              <img
                v-if="item.recordimg && !isImageFailed(item, index)"
                :src="getImageUrl(item.recordimg)"
                alt=""
                @error="markImageFailed(item, index)"
              />
              <div v-else class="image-fallback">
                <Icon icon="ri:image-line" />
                <span>{{ item.recordimg ? "图片加载失败" : "暂无图片" }}</span>
              </div>
            </button>
          </div>

          <div class="card-info">
            <div class="card-title">
              <span>拍摄地址</span>
              <h2>{{ item.recordaddr || "暂无地址" }}</h2>
            </div>

            <dl class="info-grid">
              <div>
                <dt>电话</dt>
                <dd>{{ formatValue(item.userphone) }}</dd>
              </div>
              <div>
                <dt>楼栋号</dt>
                <dd>{{ formatValue(item.recordtoken) }}</dd>
              </div>
              <div>
                <dt>经度</dt>
                <dd>{{ formatValue(item.recordlo) }}</dd>
              </div>
              <div>
                <dt>纬度</dt>
                <dd>{{ formatValue(item.recordla) }}</dd>
              </div>
              <div class="full-field">
                <dt>拍摄时间</dt>
                <dd>{{ formatValue(item.recorddate) }}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </section>

    <AModal
      v-model:visible="previewVisible"
      :footer="false"
      modal-class="indoor-preview-modal"
      title="图片预览"
    >
      <div class="preview-panel">
        <button
          class="preview-nav"
          type="button"
          :disabled="!canPrev"
          @click="changePreview(-1)"
        >
          <Icon icon="ri:arrow-left-s-line" />
        </button>
        <div class="preview-image">
          <img v-if="currentPreviewImage" :src="currentPreviewImage" alt="" />
          <Icon v-else icon="ri:image-line" />
        </div>
        <button
          class="preview-nav"
          type="button"
          :disabled="!canNext"
          @click="changePreview(1)"
        >
          <Icon icon="ri:arrow-right-s-line" />
        </button>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal } from "@arco-design/web-vue";
import {
  deleteIndoorRecord,
  fetchIndoorRecordsByPhone,
} from "../../api/indoor";

const route = useRoute();
const router = useRouter();
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
const lists = ref([]);
const loading = ref(false);
const previewVisible = ref(false);
const previewIndex = ref(0);
const queryDate = ref("");
const queryPhone = ref("");
const imageErrors = ref({});

const imageList = computed(() =>
  lists.value
    .filter((item, index) => !isImageFailed(item, index))
    .map((item) => getImageUrl(item.recordimg))
    .filter(Boolean),
);
const currentPreviewImage = computed(
  () => imageList.value[previewIndex.value] || "",
);
const canPrev = computed(() => previewIndex.value > 0);
const canNext = computed(() => previewIndex.value < imageList.value.length - 1);

onMounted(() => {
  const routeDate = String(route.query.recorddate || "").split(" ")[0];
  const routePhone = String(route.query.userphone || route.query.phone || "");
  const lookupPhone = String(route.query.lookupPhone || "");
  const lookupDate = String(route.query.lookupDate || "");
  const isShiftedQuery = isPhoneNumber(routeDate) && isImageName(routePhone);

  queryDate.value = isShiftedQuery ? "" : routeDate;
  queryPhone.value = isShiftedQuery ? routeDate : routePhone;

  getLists(
    lookupPhone || (isShiftedQuery ? routePhone : queryPhone.value),
    lookupDate || (isShiftedQuery ? routeDate : queryDate.value),
  );
});

function closePage() {
  router.back();
}

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "-" : value;
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

function getImageKey(item, index) {
  return String(item?.id || item?.recordimg || index);
}

function isImageFailed(item, index) {
  return Boolean(imageErrors.value[getImageKey(item, index)]);
}

function markImageFailed(item, index) {
  imageErrors.value = {
    ...imageErrors.value,
    [getImageKey(item, index)]: true,
  };
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

function normalizeIndoorRecord(item) {
  const normalized = {
    ...item,
    __lookupPhone: item?.userphone || "",
    __lookupDate: item?.recorddate || "",
  };

  if (isImageName(item?.userphone) && isDateText(item?.recordaddr)) {
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

function previewImages(index) {
  const targetImage = getImageUrl(lists.value[index]?.recordimg);

  if (!targetImage || isImageFailed(lists.value[index], index)) {
    Message.warning("暂无可预览图片");
    return;
  }

  previewIndex.value = imageList.value.indexOf(targetImage);
  previewVisible.value = true;
}

function changePreview(step) {
  const nextIndex = previewIndex.value + step;

  if (nextIndex < 0 || nextIndex >= imageList.value.length) {
    return;
  }

  previewIndex.value = nextIndex;
}

function del(index, delId) {
  if (!delId) {
    Message.warning("缺少记录编号，无法删除");
    return;
  }

  Modal.confirm({
    title: "删除确认",
    content: "确定删除这条照片信息吗？",
    okText: "删除",
    cancelText: "取消",
    okButtonProps: {
      status: "danger",
    },
    onOk: () => confirmQr(index, delId),
  });
}

function confirmQr(index, delId) {
  return deleteIndoorRecord(delId)
    .then(() => {
      lists.value.splice(index, 1);
      Message.success("删除成功");
    })
    .catch(() => {
      Message.error("删除失败，请稍后重试");
    });
}

function getLists(userphone, recorddate) {
  const data = {
    phone: userphone,
    dates: recorddate,
  };

  loading.value = true;
  imageErrors.value = {};
  fetchIndoorRecordsByPhone(data)
    .then((res) => {
      lists.value = Array.isArray(res.data)
        ? res.data.map(normalizeIndoorRecord)
        : [];

      const firstRecord = lists.value[0];
      if (firstRecord) {
        queryDate.value = firstRecord.recorddate || queryDate.value;
        queryPhone.value = firstRecord.userphone || queryPhone.value;
      }
    })
    .catch(() => {
      lists.value = [];
      Message.error("详情加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.household-detail-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.list-section {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  min-height: 112px;
  padding: 20px 24px;
  border: 1px solid #dadce0;
  border-radius: 12px;
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
    font-size: 30px;
    line-height: 40px;
    font-weight: 600;
    word-break: break-all;
  }

  &.theme-blue {
    background: #f0f4f9;
    border-color: #d2e3fc;

    strong {
      color: #1a73e8;
    }
  }

  &.theme-green {
    background: #e6f4ea;
    border-color: #ceead6;

    strong {
      color: #137333;
      font-size: 26px;
    }
  }

  &.theme-orange {
    background: #fef7e0;
    border-color: #fce8b2;

    strong {
      color: #b06000;
      font-size: 26px;
    }
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-card {
  position: relative;
  min-width: 0;
  padding: 18px 56px 18px 18px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
  box-sizing: border-box;
  text-align: left;
}

.image-panel {
  min-width: 0;
}

.image-button {
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 0;
  border-radius: 8px;
  background: #e8f0fe;
  color: #1a73e8;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 42px;
    height: 42px;
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

.delete-button {
  position: absolute;
  top: 18px;
  right: 18px;
  box-shadow: 0 4px 12px rgba(31, 45, 61, 0.16);
  z-index: 2;
}

.card-info {
  min-width: 0;
}

.card-title {
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;

  span {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  h2 {
    margin: 6px 0 0;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
    word-break: break-all;
  }
}

.info-grid {
  margin: 16px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  > div {
    min-width: 0;
    padding: 12px 14px;
    border: 1px solid #f1f3f4;
    border-radius: 8px;
    background: #f8f9fa;
    box-sizing: border-box;
  }

  dt {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  dd {
    margin: 6px 0 0;
    color: #202124;
    font-size: 14px;
    line-height: 22px;
    word-break: break-all;
  }
}

.full-field {
  grid-column: 1 / -1;
}

.preview-panel {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 12px;
}

.preview-image {
  height: min(68vh, 620px);
  border-radius: 8px;
  background: #f1f3f4;
  color: #9aa0a6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  svg {
    width: 48px;
    height: 48px;
  }
}

.preview-nav {
  width: 40px;
  height: 40px;
  border: 1px solid #dadce0;
  border-radius: 50%;
  background: #ffffff;
  color: #5f6368;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    color: #bdc1c6;
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

:global(.indoor-preview-modal .arco-modal) {
  width: min(920px, calc(100vw - 64px));
  border-radius: 8px;
}

:global(.indoor-preview-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.indoor-preview-modal .arco-modal-body) {
  padding: 24px;
}

@media (max-width: 1280px) {
  .summary-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-side {
    align-self: flex-end;
  }

  .detail-card,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    grid-template-columns: 32px minmax(0, 1fr) 32px;
  }
}
</style>
