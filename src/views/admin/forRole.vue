<template>
  <div class="role-page">
    <section class="page-header">
      <div class="header-main">
        <AButton class="back-button" type="text" @click="closePage">
          <Icon icon="ri:arrow-left-line" />
          返回
        </AButton>
        <div>
          <h1>职位变更审核</h1>
          <p>核对施工人员职位变更申请，并提交审核结果。</p>
        </div>
      </div>
      <div class="header-icon">
        <img src="../../assets/images/nav-coordinate.png" alt="" />
      </div>
    </section>

    <section class="form-section">
      <div class="section-header">
        <h2>申请信息</h2>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span>原职位</span>
          <strong>{{ oldJob || "-" }}</strong>
        </div>
        <div class="info-item">
          <span>电话号码</span>
          <strong>{{ tel || "-" }}</strong>
        </div>
        <div class="info-item">
          <span>变更职位</span>
          <strong>{{ newJob || "-" }}</strong>
        </div>
      </div>
    </section>

    <section class="form-section">
      <div class="section-header">
        <h2>审核结果</h2>
      </div>
      <AForm class="review-form" :model="{}" layout="vertical">
        <AFormItem label="处理意见">
          <ARadioGroup v-model="radio" type="button">
            <ARadio value="1">同意</ARadio>
            <ARadio value="2">不同意</ARadio>
          </ARadioGroup>
        </AFormItem>
      </AForm>
    </section>

    <div class="form-actions">
      <AButton @click="closePage">取消</AButton>
      <AButton type="primary" :loading="submitting" @click="onSubmit">
        提交
      </AButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { reviewRoleChange } from "../../api/user";

const route = useRoute();
const router = useRouter();

const oldJob = ref("");
const tel = ref("");
const newJob = ref("");
const radio = ref("1");
const submitting = ref(false);

onMounted(() => {
  const changeName = String(route.query.changeName || "");
  const [oldRole = "", newRole = ""] = changeName.split("-");

  oldJob.value = oldRole;
  newJob.value = newRole;
  tel.value = String(route.query.tel || "");
});

function closePage() {
  router.back();
}

function onSubmit() {
  const data = {
    userphone: tel.value,
    userrole: String(route.query.changeName || ""),
  };

  submitRoleChange(radio.value === "1", data);
}

function submitRoleChange(approved, data) {
  submitting.value = true;

  reviewRoleChange(data, approved)
    .then(() => {
      Message.success("提交成功");
      window.setTimeout(() => {
        router.back();
      }, 600);
    })
    .catch(() => {
      Message.error("提交失败，请稍后重试");
    })
    .finally(() => {
      submitting.value = false;
    });
}
</script>

<style lang="scss" scoped>
.role-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
  box-sizing: border-box;
}

.page-header,
.form-section {
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

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
  text-align: left;

  h2 {
    margin: 0;
    color: #202124;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.info-item {
  min-height: 96px;
  padding: 18px 20px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #f8f9fa;
  box-sizing: border-box;
  text-align: left;

  span {
    display: block;
    color: #5f6368;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    display: block;
    margin-top: 10px;
    color: #202124;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
    word-break: break-all;
  }
}

.review-form {
  :deep(.arco-form-item) {
    margin-bottom: 0;
  }

  :deep(.arco-form-item-label-col) {
    margin-bottom: 10px;

    > label {
      color: #5f6368;
      font-size: 13px;
      font-weight: 400;
    }
  }
}

.form-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(241, 243, 244, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid #dadce0;
}

@media (max-width: 1180px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
