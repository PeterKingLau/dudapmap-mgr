import { message } from "@/utils/message";
import { Pagination, Spin, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchIndoorRecords } from "../../../api/indoor";
import { getImageUrl } from "../../../api/request";
import { createRouteQuery } from "../../../utils/routeQuery";
import "../shared.css";

type IndoorRecord = {
  id?: number | string;
  infoflag?: string;
  recordaddr?: string;
  recorddate?: string;
  recordimg?: string;
  recordla?: string;
  recordlo?: string;
  recordtoken?: string;
  userphone?: string;
};

const PAGE_SIZE = 20;
const indoorIcon = new URL(
  "../../../assets/images/nav-indoor.png",
  import.meta.url,
).href;

function getRows<T>(value: unknown): T[] {
  const data = (value as { data?: unknown })?.data;

  return Array.isArray(data) ? (data as T[]) : [];
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

function getDetailSearch(item: IndoorRecord) {
  return createRouteQuery({
    d: item.recorddate,
    p: item.userphone,
  });
}

export function IndoorListPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<IndoorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageRecords = useMemo(
    () => records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, records],
  );

  useEffect(() => {
    setLoading(true);
    setImageErrors({});
    fetchIndoorRecords()
      .then((res) => {
        setRecords(getRows<IndoorRecord>(res));
      })
      .catch(() => {
        setRecords([]);
        message.error("照片信息加载失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, records.length]);

  function openDetail(item: IndoorRecord) {
    navigate(`/business/photos/detail${getDetailSearch(item)}`);
  }

  return (
    <div className="react-indoor-page">
      <section className="react-indoor-header">
        <div className="react-indoor-header-main">
          <h1>照片信息</h1>
          <p>查看照片记录、现场图片、地址、联系人电话和记录时间。</p>
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
          <span>照片记录</span>
          <strong>{records.length}</strong>
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
            <div className="react-indoor-grid">
              {pageRecords.map((item, index) => {
                const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;
                const imageKey = getImageKey(item, absoluteIndex);
                const imageUrl = resolveImageUrl(item.recordimg);
                const failed = Boolean(imageErrors[imageKey]);

                return (
                  <button
                    className="react-indoor-card"
                    key={imageKey}
                    type="button"
                    onClick={() => openDetail(item)}
                  >
                    <div className="react-indoor-image">
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
                          <span>{imageUrl ? "图片加载失败" : "暂无图片"}</span>
                        </div>
                      )}
                    </div>

                    <div className="react-indoor-content">
                      <div className="react-indoor-record-header">
                        <span>拍摄地址</span>
                        <Icon icon="ri:arrow-right-line" />
                      </div>
                      <h2>{item.recordaddr || "暂无地址"}</h2>

                      <dl className="react-indoor-info-grid">
                        <div>
                          <dt>电话</dt>
                          <dd>{item.userphone || "-"}</dd>
                        </div>
                        <div>
                          <dt>时间</dt>
                          <dd>{item.recorddate || "-"}</dd>
                        </div>
                      </dl>
                    </div>
                  </button>
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
            <Icon icon="ri:home-search-line" />
            <h3>暂无照片信息</h3>
            <p>当前还没有照片记录。</p>
          </div>
        )}
      </section>
    </div>
  );
}
