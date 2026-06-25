import { create } from "zustand";

export type ReactLoginUser = Record<string, unknown> & {
  useravator?: string;
  userphone?: string;
  username?: string;
  userrole?: string;
};

type Center = {
  lat: number;
  lng: number;
};

interface AppState {
  address: string;
  center: Center;
  disname: string;
  login: false | ReactLoginUser;
  clearLogin: () => void;
  updateAddress: (address?: string) => void;
  updateCenter: (center?: Partial<Center>) => void;
  updateDisname: (disname?: string) => void;
  updateLogin: (userInfo?: ReactLoginUser | null) => void;
}

const DEFAULT_CENTER: Center = {
  lat: 0,
  lng: 0,
};

function getSessionUserInfo(): ReactLoginUser {
  try {
    const value = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

    return value && typeof value === "object" ? value : {};
  } catch (error) {
    return {};
  }
}

function getSessionDisname(): string {
  return (
    getSessionUserInfo().useravator ||
    sessionStorage.getItem("useravator") ||
    ""
  );
}

export const useAppStore = create<AppState>((set) => ({
  address: "",
  center: { ...DEFAULT_CENTER },
  disname: getSessionDisname(),
  login: Object.keys(getSessionUserInfo()).length
    ? getSessionUserInfo()
    : false,
  clearLogin: () => {
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("useravator");
    set({
      disname: "",
      login: false,
    });
  },
  updateAddress: (address = "") => {
    set({ address });
  },
  updateCenter: ({ lat = 0, lng = 0 } = {}) => {
    set({
      center: {
        lat,
        lng,
      },
    });
  },
  updateDisname: (disname = "") => {
    if (disname) {
      sessionStorage.setItem("useravator", disname);
    } else {
      sessionStorage.removeItem("useravator");
    }

    set({ disname });
  },
  updateLogin: (userInfo) => {
    const login = userInfo || false;
    const disname = userInfo?.useravator || "";

    if (userInfo) {
      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
    }

    if (disname) {
      sessionStorage.setItem("useravator", disname);
    }

    set({
      disname,
      login,
    });
  },
}));
