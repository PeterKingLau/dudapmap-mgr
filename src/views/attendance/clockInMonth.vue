<template>
  <div class="clock-month-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>{{ titleMonth || "-" }} 打卡信息</h1>
          <p>查看指定月份的打卡统计明细，并支持导出 Excel 表。</p>
        </div>
      </div>
      <div class="header-side">
        <ATag color="blue">{{ lists.length }} 条记录</ATag>
        <div class="header-icon">
          <img src="../../assets/images/attendance-month.png" alt="" />
        </div>
      </div>
    </section>

    <div v-if="showLogin" class="loading-panel">
      <ASpin :size="28" />
      <span>正在请求数据，请稍后...</span>
    </div>

    <template v-else>
      <section class="summary-grid">
        <article class="summary-card theme-blue">
          <span>统计月份</span>
          <strong>{{ titleMonth || "-" }}</strong>
        </article>
        <article class="summary-card theme-green">
          <span>记录数量</span>
          <strong>{{ lists.length }}</strong>
        </article>
        <article class="summary-card theme-red">
          <span>缺卡合计</span>
          <strong>{{ lostClockTotal }}</strong>
        </article>
      </section>

      <section class="record-section">
        <div class="section-title">
          <div>
            <h2>打卡记录</h2>
            <span>{{ titleMonth || "-" }} 月度汇总</span>
          </div>
          <AButton type="primary" @click="openExportPopup">
            <template #icon>
              <Icon icon="ri:file-excel-2-line" />
            </template>
            导出 Excel
          </AButton>
        </div>

        <div v-if="lists.length" class="record-table">
          <div class="record-row table-head">
            <span>序号</span>
            <span>姓名</span>
            <span>电话号码</span>
            <span>总在线时长</span>
            <span>缺卡次数</span>
          </div>
          <div
            v-for="(item, index) in lists"
            :key="item.tel || index"
            class="record-row"
          >
            <span>{{ index + 1 }}</span>
            <strong>{{ formatName(item.name) }}</strong>
            <span>{{ item.tel || "-" }}</span>
            <span>{{ item.clockNumber || "-" }}</span>
            <span>
              <ATag :color="Number(item.lostClock) > 0 ? 'red' : 'green'">
                {{ item.lostClock || 0 }} 次
              </ATag>
            </span>
          </div>
        </div>

        <div v-else class="empty-panel">
          <Icon icon="ri:file-search-line" />
          <h3>暂无打卡信息</h3>
          <p>当前月份没有可展示的打卡记录。</p>
        </div>
      </section>
    </template>

    <AModal
      v-model:visible="excelShow"
      :footer="false"
      modal-class="export-modal"
      title="导出 Excel"
    >
      <div class="export-panel">
        <div class="export-icon">
          <img src="../../assets/images/attendance-statistics.png" alt="" />
        </div>
        <h3>确认导出</h3>
        <p>
          是否要把
          <span>{{ exportFileName }}</span>
          导出为 Excel 表？
        </p>
        <ATag color="blue">{{ lists.length }} 条记录</ATag>
        <div class="export-actions">
          <AButton @click="excelShow = false">取消</AButton>
          <download-excel
            class="export-excel-wrapper"
            :data="exportRows"
            :header="exportFileName"
            :fields="excelFields"
            :name="exportFileName"
            :before-generate="startDownload"
          >
            <AButton type="primary">导出</AButton>
          </download-excel>
        </div>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { fetchAttendanceByDate } from "../../api/attendance";

const route = useRoute();
const router = useRouter();
const showLogin = ref(false);
const lists = ref([]);
const arrKeys = ref([]);
const titleMonth = ref(route.query.month || "");
const excelShow = ref(false);

const excelFields = {
  序号: "ID",
  名字: "name",
  电话号码: "tel",
  总在线时长: "clockNumber",
  缺卡次数: "lostClock",
};

const exportFileName = computed(() => `${titleMonth.value}全部打卡信息`);
const exportRows = computed(() =>
  lists.value.map((item, index) => ({
    ...item,
    ID: index + 1,
    name: formatName(item.name),
  })),
);
const lostClockTotal = computed(() =>
  lists.value.reduce((total, item) => total + Number(item.lostClock || 0), 0),
);

onMounted(() => {
  gethxdrecordfindByDate(titleMonth.value);
});

function closePage() {
  router.back();
}

function formatName(name) {
  return name === "noname" || name === "null" ? "-" : name || "-";
}

function openExportPopup() {
  if (!lists.value.length) {
    Message.warning("暂无可导出的打卡信息！");
    return;
  }

  excelShow.value = true;
}

async function startDownload() {
  excelShow.value = false;

  window.setTimeout(() => {
    Message.success(`${exportFileName.value}导出成功`);
  }, 800);
}

function gethxdrecordfindByDate(date) {
  const startTime = dayjs(date).startOf("month").format("YYYY-MM-DD");
  const endTime = dayjs(date).endOf("month").format("YYYY-MM-DD");
  const data = {
    start: startTime,
    end: endTime,
  };

  showLogin.value = true;
  fetchAttendanceByDate(data)
    .then((res) => {
      const source = res.data || {};
      arrKeys.value = Object.keys(source);

      if (arrKeys.value.length) {
        lists.value = Object.values(source).map((item, index) => {
          const itemArr = String(item).split("&");

          return {
            name: itemArr[0],
            clockNumber: itemArr[1],
            lostClock: itemArr[2],
            tel: arrKeys.value[index],
          };
        });
      } else {
        lists.value = [];
      }
    })
    .catch(() => {
      Message.error("打卡信息加载失败，请稍后重试");
    })
    .finally(() => {
      showLogin.value = false;
    });
}
</script>

<style lang="scss" scoped>
.clock-month-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.record-section,
.loading-panel {
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
  flex: none;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #e8f0fe;
  display: inline-flex;
  align-items: center;
  justify-content: center;

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
  box-sizing: border-box;
  text-align: left;

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
    font-size: 32px;
    line-height: 40px;
    font-weight: 600;
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
    }
  }

  &.theme-red {
    background: #fce8e6;
    border-color: #fad2cf;

    strong {
      color: #c5221f;
    }
  }
}

.section-title {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  span {
    margin-top: 4px;
    display: block;
    color: #5f6368;
    font-size: 13px;
    line-height: 18px;
  }

  :deep(.arco-btn-content) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.record-table {
  border: 1px solid #dadce0;
  border-radius: 8px;
  overflow: hidden;
}

.record-row {
  display: grid;
  grid-template-columns:
    80px minmax(120px, 1fr) minmax(150px, 1fr) minmax(140px, 1fr)
    110px;
  gap: 16px;
  align-items: center;
  min-height: 56px;
  padding: 12px 18px;
  box-sizing: border-box;
  border-top: 1px solid #f1f3f4;
  color: #3c4043;
  font-size: 14px;
  text-align: left;

  &:first-child {
    border-top: 0;
  }

  > span,
  > strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #202124;
    font-weight: 500;
  }
}

.table-head {
  min-height: 44px;
  background: #f8f9fa;
  color: #5f6368;
  font-size: 13px;
  font-weight: 500;
}

.loading-panel,
.empty-panel {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #5f6368;
}

.empty-panel {
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;

  svg {
    width: 42px;
    height: 42px;
    color: #9aa0a6;
  }

  h3 {
    margin: 0;
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

.export-panel {
  text-align: center;

  h3 {
    margin: 16px 0 8px;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  }

  p {
    margin: 0 0 16px;
    color: #5f6368;
    font-size: 14px;
    line-height: 22px;

    span {
      color: #1a73e8;
      font-weight: 500;
    }
  }
}

.export-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 12px;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.export-excel-wrapper {
  display: contents;
}

:global(.export-modal .arco-modal) {
  width: 480px;
  border-radius: 8px;
}

:global(.export-modal .arco-modal-header) {
  border-bottom: 1px solid #dadce0;
  padding: 16px 24px;
}

:global(.export-modal .arco-modal-title) {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}

:global(.export-modal .arco-modal-body) {
  padding: 24px;
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .record-row {
    grid-template-columns: 64px minmax(100px, 1fr) minmax(130px, 1fr) 110px;

    > span:nth-child(4) {
      display: none;
    }
  }
}
</style>
