import type { CSSProperties } from "react";
import type {
  BaiduMapApi,
  BaiduMapInstance,
  LngLat,
} from "../../utils/baiduMapAdapter";
import { BaiduCustomOverlay } from "./BaiduCustomOverlay";
import "./mapOverlays.css";

type MyOverlayProps = {
  active?: boolean;
  api?: BaiduMapApi | null;
  map?: BaiduMapInstance | null;
  position: LngLat;
  text?: string | Record<string, unknown>;
};

export function MyOverlay({
  active = false,
  api,
  map,
  position,
}: MyOverlayProps) {
  return (
    <BaiduCustomOverlay
      api={api}
      className={`react-map-ripple-overlay${active ? " is-active" : ""}`}
      map={map}
      offset={{ x: -8, y: -8 }}
      position={position}
      style={{ "--react-overlay-color": "red" } as CSSProperties}
    >
      <div className="react-map-ripple-inner">
        <span className="react-map-ripple" />
        <span className="react-map-ripple" />
        <span className="react-map-ripple" />
      </div>
    </BaiduCustomOverlay>
  );
}
