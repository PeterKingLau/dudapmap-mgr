import { Button, DatePicker, Form, Modal, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";

const navStaffIcon = new URL(
  "../../assets/images/nav-staff.png",
  import.meta.url,
).href;

type UserSearchDialogProps = {
  datsShow?: boolean;
  maxDate: Dayjs;
  minDate: Dayjs;
  onOpenChange?: (open: boolean) => void;
  onPhoneFocus?: () => void;
  onSearch: () => void;
  onUserDateChange: (value: string) => void;
  onUserTelChange: (value: string) => void;
  open: boolean;
  phoneLis?: Array<{ label?: string; name?: string; value?: string }>;
  telShow?: boolean;
  userDate?: string;
  userTel?: string;
};

function getDateString(value: Dayjs | null): string {
  return value ? value.format("YYYY-MM-DD") : "";
}

export function UserSearchDialog({
  datsShow = false,
  maxDate,
  minDate,
  onOpenChange,
  onPhoneFocus,
  onSearch,
  onUserDateChange,
  onUserTelChange,
  open,
  phoneLis = [],
  telShow = false,
  userDate = "",
  userTel = "",
}: UserSearchDialogProps) {
  const phoneOptions = phoneLis.map((item) => {
    const value = item.value || item.name || "";

    return {
      label: item.label || item.name || value,
      name: item.name || "",
      value,
    };
  });
  const selectedUser = phoneOptions.find((item) => item.value === userTel);
  const selectedUserName = selectedUser?.name || "";

  return (
    <Modal
      centered
      className="react-user-search-modal"
      footer={null}
      open={open}
      title="指定员工查询"
      width={480}
      onCancel={() => onOpenChange?.(false)}
    >
      <div className="react-user-search-panel">
        <div className="react-panel-summary">
          <span>
            <img src={navStaffIcon} alt="" />
          </span>
          <div>
            <h3>指定员工查询</h3>
            <p>选择员工电话和日期后，查询当天定位路线信息。</p>
          </div>
        </div>

        <Form layout="vertical">
          <Form.Item
            help={telShow ? "请输入正确的手机号码！" : undefined}
            label="员工电话"
            required
            validateStatus={telShow ? "error" : undefined}
          >
            <Select
              allowClear
              showSearch
              options={phoneOptions}
              optionFilterProp="label"
              placeholder="请选择员工电话"
              value={userTel || undefined}
              onChange={(value) => onUserTelChange(value || "")}
              onFocus={onPhoneFocus}
            />
            {selectedUserName ? (
              <div className="react-selected-user">
                <span>员工姓名</span>
                <strong>{selectedUserName}</strong>
              </div>
            ) : null}
          </Form.Item>
          <Form.Item
            help={datsShow ? "请选择日期！" : undefined}
            label="选择日期"
            required
            validateStatus={datsShow ? "error" : undefined}
          >
            <DatePicker
              disabledDate={(current) =>
                Boolean(current && (current < minDate || current > maxDate))
              }
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              value={userDate ? dayjs(userDate) : null}
              onChange={(value) => onUserDateChange(getDateString(value))}
            />
          </Form.Item>
        </Form>

        <div className="react-modal-actions">
          <Button onClick={() => onOpenChange?.(false)}>取消</Button>
          <Button type="primary" onClick={onSearch}>
            查询
          </Button>
        </div>
      </div>
    </Modal>
  );
}
