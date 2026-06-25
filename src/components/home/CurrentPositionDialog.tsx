import { Button, Modal } from "antd";

const locationIcon = new URL(
  "../../assets/images/icon-location.png",
  import.meta.url,
).href;

type CurrentPositionDialogProps = {
  latitude?: number;
  longitude?: number;
  onAdd: () => void;
  onOpenChange?: (open: boolean) => void;
  onReset: () => void;
  open: boolean;
  propaddress?: string;
};

export function CurrentPositionDialog({
  latitude = 0,
  longitude = 0,
  onAdd,
  onOpenChange,
  onReset,
  open,
  propaddress = "",
}: CurrentPositionDialogProps) {
  return (
    <Modal
      centered
      className="react-position-modal"
      footer={null}
      open={open}
      title="当前位置"
      width={520}
      onCancel={() => onOpenChange?.(false)}
    >
      <div className="react-position-panel">
        <div className="react-panel-summary">
          <span>
            <img src={locationIcon} alt="" />
          </span>
          <div>
            <h3>当前定位信息</h3>
            <p>确认坐标后可添加为新的地图位置点。</p>
          </div>
        </div>

        <dl className="react-position-detail">
          <div>
            <dt>当前位置</dt>
            <dd>{propaddress || "-"}</dd>
          </div>
          <div>
            <dt>当前经度</dt>
            <dd>{longitude || "-"}</dd>
          </div>
          <div>
            <dt>当前纬度</dt>
            <dd>{latitude || "-"}</dd>
          </div>
        </dl>

        <div className="react-modal-actions">
          <Button onClick={onReset}>重新添加</Button>
          <Button type="primary" onClick={onAdd}>
            添加位置
          </Button>
        </div>
      </div>
    </Modal>
  );
}
