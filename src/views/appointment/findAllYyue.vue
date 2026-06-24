<template>
  <div class="appointment-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="router.back()">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>预约信息</h1>
          <p>查看全部预约记录，并按需进入电话号码查询。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/nav-appointment.png" alt="" />
      </div>
    </section>

    <section class="summary-section">
      <article class="summary-card">
        <span>预约记录</span>
        <strong>{{ subscribeAry.length }}</strong>
      </article>
      <div class="summary-actions">
        <AButton type="primary" @click="searchUrl">
          <template #icon>
            <Icon icon="ri:search-line" />
          </template>
          查询
        </AButton>
      </div>
    </section>

    <section class="list-section">
      <div v-if="loading" class="state-panel">
        <ASpin :size="28" />
        <span>加载中...</span>
      </div>

      <div v-else-if="!subscribeAry.length" class="state-panel">
        <Icon icon="ri:file-search-line" />
        <h3>暂无详细信息</h3>
        <p>当前还没有预约记录。</p>
      </div>

      <div v-else class="appointment-grid">
        <article
          v-for="(item, index) in subscribeAry"
          :key="item.id || item.from || index"
          class="appointment-card"
        >
          <div class="card-header">
            <div>
              <span>预约 {{ index + 1 }}</span>
              <strong>{{ formatValue(item.userphone) }}</strong>
            </div>
            <AButton
              shape="circle"
              status="danger"
              type="text"
              @click="del(index, item.id)"
            >
              <template #icon>
                <Icon icon="ri:delete-bin-line" />
              </template>
            </AButton>
          </div>

          <dl class="info-grid">
            <div>
              <dt>开始时间</dt>
              <dd>{{ formatValue(item.from) }}</dd>
            </div>
            <div>
              <dt>结束时间</dt>
              <dd>{{ formatValue(item.to) }}</dd>
            </div>
            <div>
              <dt>对应手机号</dt>
              <dd>{{ formatValue(item.location) }}</dd>
            </div>
            <div>
              <dt>经度</dt>
              <dd>{{ formatValue(item.lo) }}</dd>
            </div>
            <div class="full-field">
              <dt>详细地址</dt>
              <dd>{{ formatValue(item.la) }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Message, Modal } from "@arco-design/web-vue";
import { deleteAppointment, fetchAppointments } from "../../api/appointment";

const router = useRouter();
const subscribeAry = ref([]);
const loading = ref(false);

onMounted(() => {
  getFindAll();
});

function formatValue(value) {
  return value === "" || value === null || value === undefined ? "暂无" : value;
}

function getFindAll() {
  loading.value = true;
  fetchAppointments()
    .then((res) => {
      subscribeAry.value = Array.isArray(res.data) ? res.data : [];
    })
    .catch(() => {
      subscribeAry.value = [];
      Message.error("预约信息加载失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function searchUrl() {
  router.push({ path: ROUTE_PATHS.appointment.search });
}

function del(index, id) {
  if (!id) {
    return;
  }

  Modal.confirm({
    title: "删除确认",
    content: "确定删除这条预约信息吗？",
    okText: "删除",
    cancelText: "取消",
    okButtonProps: {
      status: "danger",
    },
    onOk: () =>
      deleteAppointment(id).then(() => {
        subscribeAry.value.splice(index, 1);
        Message.success("删除成功");
      }),
  });
}
</script>

<style lang="scss" scoped>
.appointment-page {
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

.summary-actions {
  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

.appointment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.appointment-card {
  min-width: 0;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 18px 20px;
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
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  text-align: left;

  > div {
    min-width: 0;
    padding: 14px 16px;
    border: 1px solid #f1f3f4;
    border-radius: 8px;
    background: #f8f9fa;
    box-sizing: border-box;
  }

  dt {
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
    font-weight: 400;
  }

  dd {
    margin: 6px 0 0;
    color: #202124;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    word-break: break-all;
  }
}

.full-field {
  grid-column: 1 / -1;
}

@media (max-width: 1180px) {
  .appointment-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .page-header,
  .summary-section {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-card {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
