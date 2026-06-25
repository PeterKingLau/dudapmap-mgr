import type {
  BaiduMapApi,
  BaiduMapInstance,
  LngLat,
  PixelOffset,
} from "../../utils/baiduMapAdapter";
import { BaiduCustomOverlay } from "./BaiduCustomOverlay";
import "./mapOverlays.css";

const nameIcon = new URL(
  "../../assets/images/overlay-name.png",
  import.meta.url,
).href;
const phoneIcon = new URL(
  "../../assets/images/overlay-phone.png",
  import.meta.url,
).href;

type TelOverlayProps = {
  active?: boolean;
  api?: BaiduMapApi | null;
  map?: BaiduMapInstance | null;
  number?: number | string;
  offset?: PixelOffset;
  position: LngLat;
  tel?: number | string;
  text?: {
    name?: string;
  };
};

export function TelOverlay({
  active = false,
  api,
  map,
  number = "",
  offset = {},
  position,
  tel = "",
  text = { name: "人员" },
}: TelOverlayProps) {
  return (
    <BaiduCustomOverlay
      api={api}
      className={`react-map-tel-overlay${active ? " is-active" : ""}`}
      map={map}
      offset={{
        x: -65 + Number(offset.x || 0),
        y: -100 + Number(offset.y || 0),
      }}
      position={position}
    >
      <div className="react-map-tel-row">
        <img src={nameIcon} alt="" />
        <span>
          {text.name || "人员"}
          {number}号
        </span>
      </div>
      <div className="react-map-tel-row">
        <img src={phoneIcon} alt="" />
        <span>{tel}</span>
      </div>
      <span className="react-map-tel-arrow" />
    </BaiduCustomOverlay>
  );
}
