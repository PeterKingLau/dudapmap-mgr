<template>
  <div class="appointment-search-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="router.back()">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>预约查询</h1>
          <p>通过 11 位电话号码查询预约时间、地址和坐标信息。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/nav-appointment.png" alt="" />
      </div>
    </section>

    <section class="search-section">
      <AForm class="search-form" :model="{}" layout="vertical" @submit="onSearch">
        <AFormItem label="电话号码">
          <AInput
            v-model.trim="phone"
            allow-clear
            placeholder="请输入11位电话号码"
            :max-length="11"
            @input="resetResult"
            @press-enter="onSearch"
          >
            <template #prefix>
              <Icon icon="ri:phone-line" />
            </template>
          </AInput>
        </AFormItem>
        <AFormItem label="操作">
          <AButton type="primary" :loading="loading" @click="onSearch">
            <template #icon>
              <Icon icon="ri:search-line" />
            </template>
            搜索
          </AButton>
        </AFormItem>
      </AForm>
    </section>

    <section class="result-section">
      <div v-if="loading" class="state-panel">
        <ASpin :size="28" />
        <span>正在搜索...</span>
      </div>

      <div v-else-if="searched && !hasResult" class="state-panel">
        <Icon icon="ri:file-search-line" />
        <h3>暂无详细信息</h3>
        <p>未查询到该电话号码对应的预约信息。</p>
      </div>

      <article v-else-if="hasResult" class="appointment-card">
        <div class="card-header">
          <div>
            <span>预约信息</span>
            <strong>{{ formatValue(searchResult.userphone) }}</strong>
          </div>
          <ATag color="blue">已查询</ATag>
        </div>

        <dl class="info-grid">
          <div>
            <dt>联系方式</dt>
            <dd>{{ formatValue(searchResult.userphone) }}</dd>
          </div>
          <div>
            <dt>开始时间</dt>
            <dd>{{ formatValue(searchResult.from) }}</dd>
          </div>
          <div>
            <dt>结束时间</dt>
            <dd>{{ formatValue(searchResult.to) }}</dd>
          </div>
          <div class="full-field">
            <dt>详细地址</dt>
            <dd>{{ formatValue(searchResult.location) }}</dd>
          </div>
          <div>
            <dt>经度</dt>
            <dd>{{ formatValue(searchResult.lo) }}</dd>
          </div>
          <div>
            <dt>纬度</dt>
            <dd>{{ formatValue(searchResult.la) }}</dd>
          </div>
        </dl>
      </article>

      <div v-else class="state-panel muted">
        <Icon icon="ri:search-eye-line" />
        <h3>输入手机号开始查询</h3>
        <p>查询结果会显示在这里。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { validatePhoneNumber } from "../../utils/validators";
import { fetchAppointmentsByPhone } from "../../api/appointment";

const router = useRouter();
const phone = ref("");
const searchResult = ref({});
const searched = ref(false);
const loading = ref(false);

const hasResult = computed(
  () =>
    searchResult.value &&
    typeof searchResult.value === "object" &&
    Object.keys(searchResult.value).length > 0,
);

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "暂无" : value;
}

function resetResult() {
  searched.value = false;
  searchResult.value = {};
}

function warning(message) {
  Message.warning(message);
}

function onSearch() {
  const targetPhone = phone.value.trim();

  if (!validatePhoneNumber(targetPhone)) {
    warning("请输入正确的11位电话号码！");
    return;
  }

  getSearch(targetPhone);
}

function getSearch(targetPhone) {
  loading.value = true;
  searched.value = true;
  searchResult.value = {};

  fetchAppointmentsByPhone({ phone: targetPhone })
    .then((res) => {
      const data = res.data || {};

      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        searchResult.value = data;
        return;
      }

      searchResult.value = {};
    })
    .catch(() => {
      Message.error("搜索失败，请稍后重试");
      searchResult.value = {};
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.appointment-search-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.search-section,
.result-section {
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

.search-form {
  display: grid;
  grid-template-columns: minmax(280px, 520px) auto;
  align-items: end;
  gap: 16px 24px;

  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-input-wrapper) {
    width: 100%;
    background-color: #f8f9fa;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f4;
    }

    &.arco-input-focus {
      background-color: #ffffff;
      border-color: #1a73e8;
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
    }
  }

  :deep(.arco-form-item-label-col) {
    margin-bottom: 8px;

    > label {
      color: #5f6368;
      font-size: 13px;
      font-weight: 400;
    }
  }

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.result-section {
  min-height: 360px;
}

.state-panel {
  min-height: 300px;
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

  &.muted {
    background: #f8f9fa;
    border: 1px dashed #dadce0;
    border-radius: 8px;
  }
}

.appointment-card {
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  text-align: left;

  span {
    display: block;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
    word-break: break-all;
  }
}

.info-grid {
  margin: 0;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 24px;

  > div {
    min-width: 0;
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

@media (max-width: 1180px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-form,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
