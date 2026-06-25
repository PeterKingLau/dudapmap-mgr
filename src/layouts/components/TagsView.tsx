import { Dropdown } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getActiveMenuPath,
  routeIcons,
  routeTitles,
} from "../menu";

type RouteTag = {
  fullPath: string;
  icon: string;
  path: string;
  title: string;
};

const homePath = "/dashboard";

function createRouteTag(fullPath: string, pathname: string): RouteTag {
  const path = getActiveMenuPath(pathname);

  return {
    fullPath,
    icon: routeIcons[path] || "ri:file-list-line",
    path,
    title: routeTitles[path] || "未命名页面",
  };
}

function createHomeTag(): RouteTag {
  return createRouteTag(homePath, homePath);
}

function normalizeTags(tags: RouteTag[]): RouteTag[] {
  const homeTag = tags.find((item) => item.path === homePath) || createHomeTag();
  const seen = new Set<string>();

  return [homeTag, ...tags.filter((item) => item.path !== homePath)].filter(
    (item) => {
      if (seen.has(item.fullPath)) {
        return false;
      }

      seen.add(item.fullPath);
      return true;
    },
  );
}

export function TagsView() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeFullPath = `${location.pathname}${location.search}${location.hash}`;
  const currentTag = useMemo(
    () => createRouteTag(activeFullPath, location.pathname),
    [activeFullPath, location.pathname],
  );
  const [tags, setTags] = useState<RouteTag[]>([createHomeTag()]);

  function canCloseTag(tag: RouteTag, tagList = tags): boolean {
    return tag.path !== homePath && tagList.length > 1;
  }

  function applyTags(nextTags: RouteTag[], fallbackTag?: RouteTag) {
    const normalized = normalizeTags(nextTags);

    setTags(normalized);

    if (!normalized.some((item) => item.fullPath === activeFullPath)) {
      navigate(fallbackTag?.fullPath || homePath);
    }
  }

  function closeTag(tag: RouteTag) {
    if (!canCloseTag(tag)) {
      return;
    }

    const index = tags.findIndex((item) => item.fullPath === tag.fullPath);

    if (index === -1) {
      return;
    }

    const nextTags = tags.filter((item) => item.fullPath !== tag.fullPath);
    setTags(nextTags);

    if (tag.fullPath !== activeFullPath) {
      return;
    }

    const nextTag = nextTags[index - 1] || nextTags[index] || createHomeTag();
    navigate(nextTag.fullPath);
  }

  function closeOtherTags(tag: RouteTag) {
    applyTags([tag], tag);
  }

  function closeLeftTags(tag: RouteTag) {
    const index = tags.findIndex((item) => item.fullPath === tag.fullPath);

    if (index === -1) {
      return;
    }

    applyTags(
      tags.filter((item, itemIndex) => itemIndex >= index),
      tag,
    );
  }

  function closeRightTags(tag: RouteTag) {
    const index = tags.findIndex((item) => item.fullPath === tag.fullPath);

    if (index === -1) {
      return;
    }

    applyTags(
      tags.filter((item, itemIndex) => itemIndex <= index),
      tag,
    );
  }

  function hasClosableLeft(tag: RouteTag): boolean {
    const index = tags.findIndex((item) => item.fullPath === tag.fullPath);

    return tags.some(
      (item, itemIndex) => itemIndex < index && canCloseTag(item),
    );
  }

  function hasClosableRight(tag: RouteTag): boolean {
    const index = tags.findIndex((item) => item.fullPath === tag.fullPath);

    return tags.some(
      (item, itemIndex) => itemIndex > index && canCloseTag(item),
    );
  }

  useEffect(() => {
    setTags((tagList) =>
      tagList.some((item) => item.fullPath === currentTag.fullPath)
        ? tagList
        : [...tagList, currentTag],
    );
  }, [currentTag]);

  useEffect(() => {
    function handleCloseCurrentRouteTag(event: Event) {
      const detail = (event as CustomEvent<{ fullPath?: string }>).detail;
      const targetFullPath = detail?.fullPath || activeFullPath;

      setTags((tagList) => {
        const index = tagList.findIndex(
          (item) => item.fullPath === targetFullPath,
        );
        const tag = tagList[index];

        if (!tag || !canCloseTag(tag, tagList)) {
          return tagList;
        }

        const nextTags = tagList.filter(
          (item) => item.fullPath !== targetFullPath,
        );

        if (targetFullPath === activeFullPath) {
          const nextTag = nextTags[index - 1] || nextTags[index] || createHomeTag();
          navigate(nextTag.fullPath);
        }

        return nextTags;
      });
    }

    window.addEventListener("close-current-route-tag", handleCloseCurrentRouteTag);

    return () => {
      window.removeEventListener(
        "close-current-route-tag",
        handleCloseCurrentRouteTag,
      );
    };
  }, [activeFullPath, navigate]);

  return (
    <div className="react-tags-view">
      {tags.map((tag) => (
        <Dropdown
          key={tag.fullPath}
          menu={{
            items: [
              {
                disabled: !canCloseTag(tag),
                icon: <Icon icon="ri:close-circle-line" />,
                key: "close",
                label: "关闭当前",
              },
              {
                disabled: tags.length <= 1,
                icon: <Icon icon="ri:close-line" />,
                key: "closeOther",
                label: "关闭其他",
              },
              {
                disabled: !hasClosableLeft(tag),
                icon: <Icon icon="ri:skip-left-line" />,
                key: "closeLeft",
                label: "关闭左侧",
              },
              {
                disabled: !hasClosableRight(tag),
                icon: <Icon icon="ri:skip-right-line" />,
                key: "closeRight",
                label: "关闭右侧",
              },
            ],
            onClick: ({ key }) => {
              if (key === "close") {
                closeTag(tag);
              }

              if (key === "closeOther") {
                closeOtherTags(tag);
              }

              if (key === "closeLeft") {
                closeLeftTags(tag);
              }

              if (key === "closeRight") {
                closeRightTags(tag);
              }
            },
          }}
          trigger={["contextMenu"]}
        >
          <span
            className={
              tag.fullPath === activeFullPath
                ? "react-route-tag active"
                : "react-route-tag"
            }
          >
            <Link to={tag.fullPath}>
              <Icon className="react-route-tag-icon" icon={tag.icon} />
              <span>{tag.title}</span>
            </Link>
            {canCloseTag(tag) ? (
              <button
                aria-label="关闭标签"
                className="react-route-tag-close"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  closeTag(tag);
                }}
              >
                <Icon icon="ri:close-line" />
              </button>
            ) : null}
          </span>
        </Dropdown>
      ))}
    </div>
  );
}
