export const LIGHT_COLORS = {
  primary: "#1F3A8A",
  danger: "#DC2626",
  warning: "#F59E0B",
  success: "#16A34A",
  background: "#F9FAFB",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
};

export const DARK_COLORS = {
  primary: "#5B8DEF",
  danger: "#EF4444",
  warning: "#FBBF24",
  success: "#22C55E",
  background: "#111827",
  card: "#1F2937",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#374151",
  borderLight: "#374151",
};

export const COLORS = LIGHT_COLORS;

export function getColors(theme) {
  return theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}