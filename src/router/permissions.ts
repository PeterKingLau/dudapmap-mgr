export const ADMIN_ROLE = "管理员";

export type PermissionMode = "all" | "any";

export interface PermissionUserInfo {
  recvcode?: string;
  userrole?: string;
}

export interface PermissionMeta {
  adminOnly?: boolean;
  allowAdmin?: boolean;
  permissionMode?: PermissionMode;
  permissions?: readonly string[];
  roles?: readonly string[];
}

export const PERMISSION_CODES = {
  clockTimeRange: "10001",
  clockTimes: "10002",
  clockScope: "10003",
  clockTips: "10004",
  userEdit: "10005",
} as const;

export const ROUTE_PERMISSION_META = {
  clockOpt: {
    allowAdmin: true,
    permissions: [
      PERMISSION_CODES.clockTimeRange,
      PERMISSION_CODES.clockTimes,
      PERMISSION_CODES.clockScope,
      PERMISSION_CODES.clockTips,
    ],
    permissionMode: "any",
  },
  userMgr: {
    allowAdmin: true,
    permissions: [PERMISSION_CODES.userEdit],
    permissionMode: "any",
  },
  leaveMgr: {
    roles: [ADMIN_ROLE],
  },
} satisfies Record<string, PermissionMeta>;

export function getPermissionList(userInfo: PermissionUserInfo = {}): string[] {
  return String(userInfo.recvcode || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isAdminUser(userInfo: PermissionUserInfo = {}): boolean {
  return userInfo.userrole === ADMIN_ROLE;
}

export function hasPermission(
  userInfo: PermissionUserInfo = {},
  code: string,
): boolean {
  return getPermissionList(userInfo).includes(code);
}

export function hasAnyPermission(
  userInfo: PermissionUserInfo = {},
  codes: readonly string[] = [],
): boolean {
  return codes.some((code) => hasPermission(userInfo, code));
}

export function hasAllPermissions(
  userInfo: PermissionUserInfo = {},
  codes: readonly string[] = [],
): boolean {
  return codes.every((code) => hasPermission(userInfo, code));
}

export function canAccessRoute(
  userInfo: PermissionUserInfo = {},
  meta: PermissionMeta = {},
): boolean {
  if (!meta.roles?.length && !meta.permissions?.length && !meta.adminOnly) {
    return true;
  }

  if ((meta.allowAdmin || meta.adminOnly) && isAdminUser(userInfo)) {
    return true;
  }

  if (meta.roles?.length && !meta.roles.includes(userInfo.userrole)) {
    return false;
  }

  if (!meta.permissions?.length) {
    return !meta.adminOnly;
  }

  return meta.permissionMode === "all"
    ? hasAllPermissions(userInfo, meta.permissions)
    : hasAnyPermission(userInfo, meta.permissions);
}
