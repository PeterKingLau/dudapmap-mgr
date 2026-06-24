import { createPinia, defineStore } from "pinia";

const STORAGE_KEY = "electronic_fence_store";
type Center = {
  lat: number;
  lng: number;
};

export type LoginUserInfo = Record<string, unknown> & {
  useravator?: string;
  userphone?: string;
  username?: string;
  userrole?: string;
};

type LoginState = false | LoginUserInfo;

type AppState = {
  address: string;
  center: Center;
  disname: string;
  login: LoginState;
};

const DEFAULT_CENTER = {
  lat: 0,
  lng: 0,
} satisfies Center;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function getSessionUserInfo(): LoginUserInfo {
  try {
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

    return isRecord(userInfo) ? userInfo : {};
  } catch (error) {
    return {};
  }
}

function getSessionUseravator(): string {
  return (
    getSessionUserInfo().useravator ||
    sessionStorage.getItem("useravator") ||
    ""
  );
}

function getDefaultState(): AppState {
  return {
    center: { ...DEFAULT_CENTER },
    address: "",
    login: false,
    disname: getSessionUseravator(),
  };
}

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function normalizePersistedState(state: unknown): Partial<AppState> {
  if (!isRecord(state)) {
    return {};
  }

  const center = isRecord(state.center) ? state.center : {};
  const login =
    state.login && typeof state.login === "object"
      ? (state.login as LoginUserInfo)
      : false;
  const loginDisname = login ? login.useravator : "";

  return {
    center: {
      ...DEFAULT_CENTER,
      ...(typeof center.lat === "number" ? { lat: center.lat } : {}),
      ...(typeof center.lng === "number" ? { lng: center.lng } : {}),
    },
    address: typeof state.address === "string" ? state.address : "",
    login,
    disname:
      loginDisname ||
      getSessionUseravator() ||
      (typeof state.disname === "string" ? state.disname : ""),
  };
}

function getPersistedState(): Partial<AppState> {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    return normalizePersistedState(
      JSON.parse(storage.getItem(STORAGE_KEY) || "{}"),
    );
  } catch (error) {
    return {};
  }
}

function persistState(state: AppState): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist app store:", error);
  }
}

export const pinia = createPinia();

export const useAppStore = defineStore("app", {
  state: () => ({
    ...getDefaultState(),
    ...getPersistedState(),
  }),
  getters: {
    getCenter: (state) => state.center,
    getAddress: (state) => state.address,
    getLogin: (state) => state.login,
    getDisname: (state) => state.disname,
  },
  actions: {
    updateCenter({ lat = 0, lng = 0 }: Partial<Center> = {}) {
      this.center = { lat, lng };
    },
    updateAddress(address = "") {
      this.address = address;
    },
    updateLogin(userInfo?: LoginUserInfo | null) {
      this.login = userInfo || false;

      if (userInfo?.useravator) {
        this.updateDisname(userInfo.useravator);
      }
    },
    updateDisname(disname = "") {
      this.disname = disname;

      if (disname) {
        sessionStorage.setItem("useravator", disname);
      } else {
        sessionStorage.removeItem("useravator");
      }
    },
    clearLogin() {
      this.login = false;
      this.updateDisname("");
    },
  },
});

pinia.use(({ store }) => {
  if (store.$id !== "app") {
    return;
  }

  store.$subscribe(
    (_mutation, state) => {
      persistState(state as AppState);
    },
    { detached: true },
  );
});

export default pinia;
