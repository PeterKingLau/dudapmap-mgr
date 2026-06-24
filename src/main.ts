import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import { Icon } from "@iconify/vue";
import { setupArco } from "./plugins/arco";
import { setupBaiduMap } from "./plugins/baiduMap";
import "../static/base.css";
import "../static/primary.css";
import { showPrimaryConfirmDialog } from "./utils/dialog";

import DownloadExcel from "./components/DownloadExcelCompat.vue";

const imageModules = import.meta.glob<string>("./assets/images/*", {
  eager: true,
  import: "default",
});
const getAssetUrl = (name: string): string =>
  imageModules[`./assets/images/${name}`] || "";

globalThis.$asset = getAssetUrl;

const app = createApp(App);

app.use(pinia);
app.use(router);
setupArco(app);

router.beforeEach(async (to) => {
  if (to.meta.requiresBaiduMap) {
    await setupBaiduMap(app);
  }

  return true;
});

app.config.globalProperties.$asset = getAssetUrl;
app.config.globalProperties.$confirmDialog = showPrimaryConfirmDialog;
app.component("downloadExcel", DownloadExcel);
app.component("Icon", Icon);

app.mount("#app");
