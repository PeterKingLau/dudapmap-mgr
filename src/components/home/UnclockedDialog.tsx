import { Button, DatePicker, Form, Modal } from "antd";
import { Icon } from "@iconify/react";
import dayjs, { type Dayjs } from "dayjs";

type UnclockedDialogProps = {
  dayValue?: string;
  maxDate: Dayjs;
  minDate: Dayjs;
  onDayValueChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onSearch: () => void;
  open: boolean;
};

function getDateString(value: Dayjs | null): string {
  return value ? value.format("YYYY-MM-DD") : "";
}

export function UnclockedDialog({
  dayValue = "",
  maxDate,
  minDate,
  onDayValueChange,
  onOpenChange,
  onSearch,
  open,
}: UnclockedDialogProps) {
  return (
    <Modal
      centered
      className="react-unclocked-modal"
      footer={null}
      open={open}
      title="未打卡查询"
      width={440}
      onCancel={() => onOpenChange?.(false)}
    >
      <div className="react-user-search-panel">
        <div className="react-panel-summary">
          <span>
            <Icon icon="ri:calendar-check-line" />
          </span>
          <div>
            <h3>查询某一天未打卡</h3>
            <p>选择日期后查询当天未打卡的人员信息。</p>
          </div>
        </div>

        <Form layout="vertical">
          <Form.Item label="选择日期" required>
            <DatePicker
              disabledDate={(current) =>
                Boolean(current && (current < minDate || current > maxDate))
              }
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              value={dayValue ? dayjs(dayValue) : null}
              onChange={(value) => onDayValueChange(getDateString(value))}
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
