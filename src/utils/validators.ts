export function validatePhoneNumber(value: unknown): boolean {
  return /^1[3-9]\d{9}$/.test(String(value || ""));
}
