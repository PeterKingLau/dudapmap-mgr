import { Modal } from "antd";
import { useMemo, useRef, useState } from "react";

const roleChangeIcon = new URL(
  "../../assets/images/icon-role-change.png",
  import.meta.url,
).href;
const viewIcon = new URL(
  "../../assets/images/icon-view.png",
  import.meta.url,
).href;
const emptyDataIcon = new URL(
  "../../assets/images/empty-data.png",
  import.meta.url,
).href;

export type StaffSheetRow = {
  infoflag?: number | string;
  userdate?: string;
  userphone?: string;
  userrole?: string | null;
  username?: string;
};

type StaffSheetProps = {
  activeRoleIndex?: number;
  findAll?: StaffSheetRow[];
  onActiveRoleIndexChange?: (value: number) => void;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onOpenRole?: (changeName: string, tel: string) => void;
  onSelectTab?: (payload: { name: number; title: string }) => void;
  open: boolean;
  staffListHeight?: number;
  userroleList?: string[];
};

function getUserInitial(item: StaffSheetRow): string {
  const value = item.username || item.userrole || item.userphone || "人";

  return String(value).slice(0, 1);
}

export function StaffSheet({
  activeRoleIndex = 0,
  findAll = [],
  onActiveRoleIndexChange,
  onClose,
  onOpenChange,
  onOpenRole,
  onSelectTab,
  open,
  staffListHeight = 240,
  userroleList = [],
}: StaffSheetProps) {
  const roleTabsRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const listMaxHeight = useMemo(
    () => `${Math.max(staffListHeight, 420)}px`,
    [staffListHeight],
  );

  function selectRole(index: number, title: string) {
    onActiveRoleIndexChange?.(index);
    onSelectTab?.({ name: index, title });
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    const target = roleTabsRef.current;

    if (!target) {
      return;
    }

    event.preventDefault();
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    target.scrollLeft += delta;
  }

  function startDrag(event: React.MouseEvent<HTMLDivElement>) {
    const target = roleTabsRef.current;

    if (!target) {
      return;
    }

    setDragging(true);
    setDragStartX(event.pageX);
    setDragStartScrollLeft(target.scrollLeft);
  }

  function stopDrag() {
    setDragging(false);
  }

  function dragRoleTabs(event: React.MouseEvent<HTMLDivElement>) {
    const target = roleTabsRef.current;

    if (!dragging || !target) {
      return;
    }

    event.preventDefault();
    target.scrollLeft = dragStartScrollLeft - (event.pageX - dragStartX);
  }

  function resetRoleState() {
    const firstRoleName = userroleList[0];

    if (activeRoleIndex !== 0) {
      onActiveRoleIndexChange?.(0);
    }

    if (firstRoleName) {
      onSelectTab?.({ name: 0, title: firstRoleName });
    }
  }

  function handleClose() {
    onOpenChange?.(false);
    resetRoleState();
    onClose?.();
  }

  return (
    <Modal
      centered
      className="react-staff-modal"
      footer={null}
      open={open}
      title="施工人员"
      width="min(1040px, calc(100vw - 64px))"
      onCancel={handleClose}
    >
      <div className="react-staff-panel">
        <div className="react-role-tabs-shell">
          <div
            aria-label="人员角色筛选"
            className="react-role-tabs"
            ref={roleTabsRef}
            role="tablist"
            onMouseDown={startDrag}
            onMouseLeave={stopDrag}
            onMouseMove={dragRoleTabs}
            onMouseUp={stopDrag}
            onWheel={handleWheel}
          >
            {userroleList.map((roleName, index) => (
              <button
                className={
                  activeRoleIndex === index
                    ? "react-role-tab active"
                    : "react-role-tab"
                }
                key={roleName}
                type="button"
                onClick={() => selectRole(index, roleName)}
              >
                {roleName}
              </button>
            ))}
          </div>
        </div>

        <div className="react-staff-list" style={{ maxHeight: listMaxHeight }}>
          {findAll.length ? (
            <div className="react-staff-grid">
              {findAll.map((item, index) => (
                <article
                  className="react-staff-card"
                  key={`${item.userphone || "staff"}-${index}`}
                >
                  {String(item.infoflag) === "2" ? (
                    <img
                      className="react-status-icon"
                      src={roleChangeIcon}
                      alt=""
                    />
                  ) : null}

                  <div className="react-staff-card-header">
                    <span className="react-staff-avatar">
                      {getUserInitial(item)}
                    </span>
                    <div className="react-staff-main">
                      {String(item.infoflag) !== "1" &&
                      String(item.infoflag) !== "3" ? (
                        <button
                          className="react-role-link"
                          type="button"
                          onClick={() =>
                            onOpenRole?.(
                              String(item.userrole || ""),
                              String(item.userphone || ""),
                            )
                          }
                        >
                          <span>{item.userrole || "-"}</span>
                          <img src={viewIcon} alt="" />
                        </button>
                      ) : (
                        <strong>{item.userrole || "-"}</strong>
                      )}
                      <span>{item.userphone || "-"}</span>
                    </div>
                  </div>

                  <dl className="react-staff-meta">
                    <div>
                      <dt>职位</dt>
                      <dd>{item.userrole || "-"}</dd>
                    </div>
                    <div>
                      <dt>电话号码</dt>
                      <dd>{item.userphone || "-"}</dd>
                    </div>
                    <div>
                      <dt>时间</dt>
                      <dd>{item.userdate || "-"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="react-empty-state">
              <img src={emptyDataIcon} alt="" />
              <p>暂无施工人员对应的信息！</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
