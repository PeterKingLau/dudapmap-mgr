import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  getBaiduMapApi,
  pointToOverlayPixel,
  type BaiduMapApi,
  type BaiduMapInstance,
  type BaiduOverlay,
  type LngLat,
  type PixelOffset,
} from "../../utils/baiduMapAdapter";

type CustomOverlayConstructor = new () => BaiduOverlay;
type ReactOverlayInstance = BaiduOverlay & {
  _element?: HTMLElement;
  _map?: BaiduMapInstance;
  draw?: () => void;
  initialize?: (targetMap: BaiduMapInstance) => HTMLElement;
};
type ReactOverlayFactory = {
  new (): ReactOverlayInstance;
  prototype: ReactOverlayInstance;
};

type BaiduCustomOverlayProps = {
  api?: BaiduMapApi | null;
  children: ReactNode;
  className?: string;
  map?: BaiduMapInstance | null;
  offset?: PixelOffset;
  pane?: string;
  position: LngLat;
  style?: CSSProperties;
};

function applyElementStyle(
  element: HTMLElement,
  className: string | undefined,
  style: CSSProperties | undefined,
) {
  element.className = className || "";
  Object.entries(style || {}).forEach(([key, value]) => {
    element.style.setProperty(key, String(value));
  });
}

export function BaiduCustomOverlay({
  api,
  children,
  className,
  map,
  offset = {},
  pane = "labelPane",
  position,
  style,
}: BaiduCustomOverlayProps) {
  const childrenRef = useRef(children);
  const classNameRef = useRef(className);
  const elementRef = useRef<HTMLElement | null>(null);
  const offsetRef = useRef(offset);
  const overlayRef = useRef<BaiduOverlay | null>(null);
  const positionRef = useRef(position);
  const rootRef = useRef<Root | null>(null);
  const styleRef = useRef<CSSProperties | undefined>(style);

  childrenRef.current = children;
  classNameRef.current = className;
  offsetRef.current = offset;
  positionRef.current = position;
  styleRef.current = style;

  useEffect(() => {
    const baiduApi = getBaiduMapApi(api);
    const OverlayCtor = baiduApi?.Overlay as
      | CustomOverlayConstructor
      | undefined;

    if (!map || !baiduApi || !OverlayCtor) {
      return undefined;
    }

    function ReactOverlay(this: ReactOverlayInstance) {}

    const ReactOverlayCtor = ReactOverlay as unknown as ReactOverlayFactory;

    ReactOverlayCtor.prototype = new OverlayCtor() as ReactOverlayInstance;
    ReactOverlayCtor.prototype.initialize = function initialize(
      targetMap: BaiduMapInstance,
    ) {
      this._map = targetMap;

      const element = document.createElement("div");
      element.style.position = "absolute";
      applyElementStyle(element, classNameRef.current, styleRef.current);

      const panes = targetMap.getPanes?.();
      const targetPane = panes?.[pane] || panes?.labelPane;
      targetPane?.appendChild(element);

      this._element = element;
      elementRef.current = element;
      rootRef.current = createRoot(element);
      rootRef.current.render(childrenRef.current);

      return element;
    };
    ReactOverlayCtor.prototype.draw = function draw() {
      const pixel = pointToOverlayPixel(
        { BMap: baiduApi, map: this._map },
        positionRef.current,
        offsetRef.current,
      );

      if (!pixel || !this._element) {
        return;
      }

      this._element.style.left = `${pixel.x}px`;
      this._element.style.top = `${pixel.y}px`;
    };

    const overlay = new ReactOverlayCtor();
    overlayRef.current = overlay;
    map.addOverlay?.(overlay);

    return () => {
      map.removeOverlay?.(overlay);
      rootRef.current?.unmount();
      rootRef.current = null;
      elementRef.current?.remove();
      elementRef.current = null;
      overlayRef.current = null;
    };
  }, [api, map, pane]);

  useEffect(() => {
    if (elementRef.current) {
      applyElementStyle(elementRef.current, className, style);
    }

    rootRef.current?.render(children);

    const overlayWithDraw = overlayRef.current as
      | (BaiduOverlay & { draw?: () => void })
      | null;
    overlayWithDraw?.draw?.();
  }, [children, className, offset, position, style]);

  return null;
}
