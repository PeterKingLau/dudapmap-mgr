import { Button, Modal, Pagination, Spin, Tag, message } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  deleteIndoorRecord,
  fetchIndoorRecordsByPhone,
} from "../../../api/indoor";
import { getImageUrl } from "../../../api/request";
import "../shared.css";

type IndoorRecord = {
  __lookupDate?: string;
  __lookupPhone?: string;
  id?: number | string;
  recordaddr?: string;
  recorddate?: string;
  recordimg?: string;
  recordla?: number | string;
  recordlo?: number | string;
  recordtoken?: number | string;
  userphone?: string;
};

type PreviewItem = {
  sourceIndex: number;
  src: string;
};

const PAGE_SIZE = 12;
const indoorIcon = new URL(
  "../../../assets/images/nav-indoor.png",
  import.meta.url,
).href;

function getRows<T>(value: unknown): T[] {
  const data = (value as { data?: unknown })?.data;

  return Array.isArray(data) ? (data as T[]) : [];
}

function formatValue(value: unknown) {
  return value === "" || value === null || value === undefined
    ? "-"
    : String(value);
}

function isImageName(value: unknown) {
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(String(value || ""));
}

function isPhoneNumber(value: unknown) {
  return /^1[3-9]\d{9}$/.test(String(value || ""));
}

function isDateText(value: unknown) {
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(value || ""));
}

function normalizeIndoorRecord(item: IndoorRecord): IndoorRecord {
  const normalized = {
    ...item,
    __lookupDate: item?.recorddate || "",
    __lookupPhone: item?.userphone || "",
  };

  if (isImageName(item?.userphone) && isDateText(item?.recordaddr)) {
    return {
      ...normalized,
      recordaddr: item.recordimg || "",
      recorddate: item.recordaddr,
      recordimg: item.userphone,
      userphone: isPhoneNumber(item.recorddate) ? item.recorddate : "",
    };
  }

  return normalized;
}

function resolveImageUrl(image: unknown) {
  const value = String(image || "");

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return getImageUrl(value);
}

function getImageKey(item: IndoorRecord, index: number) {
  return String(item.id || item.recordimg || index);
}

export function IndoorDetailPage() {
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState<IndoorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [queryDate, setQueryDate] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageRecords = useMemo(
    () =>
      records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, records],
  );
  const imageList = useMemo<PreviewItem[]>(
    () =>
      records
        .map((item, index) => ({
          sourceIndex: index,
          src: resolveImageUrl(item.recordimg),
        }))
        .filter((item) => item.src && !imageErrors[getImageKey(records[item.sourceIndex], item.sourceIndex)]),
    [imageErrors, records],
  );
  const currentPreviewImage = imageList[previewIndex]?.src || "";

  useEffect(() => {
    const routeDate = String(searchParams.get("recorddate") || "").split(
      " ",
    )[0];
    const routePhone = String(
      searchParams.get("userphone") || searchParams.get("phone") || "",
    );
    const lookupPhone = String(searchParams.get("lookupPhone") || "");
    const lookupDate = String(searchParams.get("lookupDate") || "");
    const shiftedQuery = isPhoneNumber(routeDate) && isImageName(routePhone);
    const nextQueryDate = shiftedQuery ? "" : routeDate;
    const nextQueryPhone = shiftedQuery ? routeDate : routePhone;

    setQueryDate(nextQueryDate);
    setQueryPhone(nextQueryPhone);
    loadRecords(
      lookupPhone || (shiftedQuery ? routePhone : nextQueryPhone),
      lookupDate || (shiftedQuery ? routeDate : nextQueryDate),
    );
  }, [searchParams]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, records.length]);

  function loadRecords(userphone: string, recorddate: string) {
    setLoading(true);
    setCurrentPage(1);
    setImageErrors({});
    fetchIndoorRecordsByPhone({
      dates: recorddate,
      phone: userphone,
    })
      .then((res) => {
        const nextRecords = getRows<IndoorRecord>(res).map(
          normalizeIndoorRecord,
        );
        const firstRecord = nextRecords[0];

        setRecords(nextRecords);

        if (firstRecord) {
          setQueryDate(firstRecord.recorddate || recorddate);
          setQueryPhone(firstRecord.userphone || userphone);
        }
      })
      .catch(() => {
        setRecords([]);
        message.error("照片详情加载失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function previewImage(sourceIndex: number) {
    const targetIndex = imageList.findIndex(
      (item) => item.sourceIndex === sourceIndex,
    );

    if (targetIndex === -1) {
      message.warning("暂无可预览图片");
      return;
    }

    setPreviewIndex(targetIndex);
    setPreviewOpen(true);
  }

  function removeRecord(sourceIndex: number, id: IndoorRecord["id"]) {
    if (!id) {
      message.warning("缺少记录编号，无法删除");
      return;
    }

    Modal.confirm({
      cancelText: "取消",
      content: "确定删除这条照片信息吗？",
      okButtonProps: {
        danger: true,
      },
      okText: "删除",
      title: "删除确认",
      onOk: () =>
        deleteIndoorRecord(id)
          .then(() => {
            setRecords((items) =>
              items.filter((_item, index) => index !== sourceIndex),
            );
            message.success("删除成功");
          })
          .catch(() => {
            message.error("删除失败，请稍后重试");
          }),
    });
  }

  return (
    <div className="react-indoor-page">
      <section className="react-indoor-header">
        <div className="react-indoor-header-main">
          <h1>照片详情</h1>
          <p>查看照片记录图片、地址、楼栋号、坐标和记录时间。</p>
        </div>
        <div className="react-indoor-header-side">
          <Tag color="blue">{records.length} 条</Tag>
          <div className="react-indoor-header-icon">
            <img src={indoorIcon} alt="" />
          </div>
        </div>
      </section>

      <section className="react-indoor-summary">
        <article className="react-indoor-summary-card theme-blue">
          <span>记录数量</span>
          <strong>{records.length}</strong>
        </article>
        <article className="react-indoor-summary-card theme-green">
          <span>查询日期</span>
          <strong>{queryDate || "-"}</strong>
        </article>
        <article className="react-indoor-summary-card theme-orange">
          <span>联系电话</span>
          <strong>{queryPhone || "-"}</strong>
        </article>
      </section>

      <section className="react-indoor-section">
        {loading ? (
          <div className="react-indoor-state">
            <Spin size="large" />
            <span>加载中...</span>
          </div>
        ) : records.length ? (
          <>
            <div className="react-indoor-detail-grid">
              {pageRecords.map((item, index) => {
                const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;
                const imageKey = getImageKey(item, absoluteIndex);
                const imageUrl = resolveImageUrl(item.recordimg);
                const failed = Boolean(imageErrors[imageKey]);

                return (
                  <article
                    className="react-indoor-card react-indoor-detail-card"
                    key={imageKey}
                  >
                    <Button
                      className="react-indoor-delete-button"
                      icon={<Icon icon="ri:delete-bin-6-line" />}
                      shape="circle"
                      onClick={() => removeRecord(absoluteIndex, item.id)}
                    />

                    <div className="react-indoor-image">
                      <button
                        className="react-indoor-image-button"
                        type="button"
                        onClick={() => previewImage(absoluteIndex)}
                      >
                        {imageUrl && !failed ? (
                          <img
                            src={imageUrl}
                            alt=""
                            onError={() =>
                              setImageErrors((errors) => ({
                                ...errors,
                                [imageKey]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="react-indoor-image-fallback">
                            <Icon icon="ri:image-line" />
                            <span>
                              {imageUrl ? "图片加载失败" : "暂无图片"}
                            </span>
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="react-indoor-content">
                      <div className="react-indoor-card-title">
                        <span>拍摄地址</span>
                        <h2>{item.recordaddr || "暂无地址"}</h2>
                      </div>

                      <dl className="react-indoor-info-grid">
                        <div>
                          <dt>电话</dt>
                          <dd>{formatValue(item.userphone)}</dd>
                        </div>
                        <div>
                          <dt>楼栋号</dt>
                          <dd>{formatValue(item.recordtoken)}</dd>
                        </div>
                        <div>
                          <dt>经度</dt>
                          <dd>{formatValue(item.recordlo)}</dd>
                        </div>
                        <div>
                          <dt>纬度</dt>
                          <dd>{formatValue(item.recordla)}</dd>
                        </div>
                        <div className="full-field">
                          <dt>拍摄时间</dt>
                          <dd>{formatValue(item.recorddate)}</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                );
              })}
            </div>

            {records.length > PAGE_SIZE ? (
              <div className="react-indoor-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  showSizeChanger={false}
                  total={records.length}
                  onChange={setCurrentPage}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="react-indoor-state">
            <Icon icon="ri:file-search-line" />
            <h3>暂无详细信息</h3>
            <p>当前查询条件下没有照片详情记录。</p>
          </div>
        )}
      </section>

      <Modal
        className="react-indoor-preview-modal"
        footer={null}
        open={previewOpen}
        title="图片预览"
        width={920}
        onCancel={() => setPreviewOpen(false)}
      >
        <div className="react-indoor-preview-panel">
          <button
            className="react-indoor-preview-nav"
            disabled={previewIndex <= 0}
            type="button"
            onClick={() => setPreviewIndex((value) => Math.max(0, value - 1))}
          >
            <Icon icon="ri:arrow-left-s-line" />
          </button>
          <div className="react-indoor-preview-image">
            {currentPreviewImage ? (
              <img src={currentPreviewImage} alt="" />
            ) : (
              <Icon icon="ri:image-line" />
            )}
          </div>
          <button
            className="react-indoor-preview-nav"
            disabled={previewIndex >= imageList.length - 1}
            type="button"
            onClick={() =>
              setPreviewIndex((value) =>
                Math.min(imageList.length - 1, value + 1),
              )
            }
          >
            <Icon icon="ri:arrow-right-s-line" />
          </button>
        </div>
      </Modal>
    </div>
  );
}
