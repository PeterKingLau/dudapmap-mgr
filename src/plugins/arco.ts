import type { App, Component } from "vue";
import {
  Button,
  Avatar,
  Breadcrumb,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Dropdown,
  Doption,
  Form,
  Input,
  InputNumber,
  InputPassword,
  Layout,
  LayoutContent,
  LayoutSider,
  Menu,
  MenuItem,
  SubMenu,
  Modal,
  Option,
  Radio,
  RadioGroup,
  Select,
  Spin,
  Tag,
  Textarea,
  TimePicker,
  Tooltip,
  Upload,
} from "@arco-design/web-vue";
import "@arco-design/web-vue/es/avatar/style/css.js";
import "@arco-design/web-vue/es/breadcrumb/style/css.js";
import "@arco-design/web-vue/es/button/style/css.js";
import "@arco-design/web-vue/es/checkbox/style/css.js";
import "@arco-design/web-vue/es/date-picker/style/css.js";
import "@arco-design/web-vue/es/dropdown/style/css.js";
import "@arco-design/web-vue/es/form/style/css.js";
import "@arco-design/web-vue/es/input/style/css.js";
import "@arco-design/web-vue/es/input-number/style/css.js";
import "@arco-design/web-vue/es/layout/style/css.js";
import "@arco-design/web-vue/es/menu/style/css.js";
import "@arco-design/web-vue/es/message/style/css.js";
import "@arco-design/web-vue/es/modal/style/css.js";
import "@arco-design/web-vue/es/radio/style/css.js";
import "@arco-design/web-vue/es/select/style/css.js";
import "@arco-design/web-vue/es/spin/style/css.js";
import "@arco-design/web-vue/es/tag/style/css.js";
import "@arco-design/web-vue/es/textarea/style/css.js";
import "@arco-design/web-vue/es/time-picker/style/css.js";
import "@arco-design/web-vue/es/tooltip/style/css.js";
import "@arco-design/web-vue/es/upload/style/css.js";

const aliases: Record<string, Component> = {
  AAvatar: Avatar,
  ABreadcrumb: Breadcrumb,
  ABreadcrumbItem: Breadcrumb.Item,
  AButton: Button,
  ACheckbox: Checkbox,
  ACheckboxGroup: CheckboxGroup,
  ADatePicker: DatePicker,
  ADoption: Doption,
  ADropdown: Dropdown,
  AForm: Form,
  AFormItem: Form.Item,
  AInput: Input,
  AInputNumber: InputNumber,
  AInputPassword: InputPassword,
  ALayout: Layout,
  ALayoutContent: LayoutContent,
  ALayoutSider: LayoutSider,
  AMenu: Menu,
  AMenuItem: MenuItem,
  ASubMenu: SubMenu,
  AModal: Modal,
  AOption: Option,
  ARadio: Radio,
  ARadioGroup: RadioGroup,
  ASelect: Select,
  ASpin: Spin,
  ATag: Tag,
  ATextarea: Textarea,
  ATimePicker: TimePicker,
  ATooltip: Tooltip,
  AUpload: Upload,
};

export function setupArco(app: App): void {
  Object.entries(aliases).forEach(([name, component]) => {
    if (component && !app.component(name)) {
      app.component(name, component);
    }
  });
}
