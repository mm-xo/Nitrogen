// Neutral, low-chroma surfaces with a single blue accent. Category colours carry the rest.
export const palettes = {
  light: {
    bg: "#F7F7F8",
    surface: "#FFFFFF",
    surfaceAlt: "#F0F0F2",
    border: "#E7E7EB",
    borderStrong: "#D5D5DB",
    text: "#0E0E11",
    textMuted: "#5F5F6B",
    textSubtle: "#9898A2",
    accent: "#3B5BFD",
    accentSoft: "rgba(59, 91, 253, 0.10)",
    onAccent: "#FFFFFF",
    danger: "#E5484D",
    dangerSoft: "rgba(229, 72, 77, 0.10)",
    success: "#2E9E6A",
    successSoft: "rgba(46, 158, 106, 0.12)",
    warning: "#C9771F",
    warningSoft: "rgba(217, 130, 43, 0.12)",
    inverse: "#0E0E11",
    onInverse: "#FFFFFF",
    overlay: "rgba(10, 10, 12, 0.35)",
    skeleton: "#EAEAEE",
    glass: "rgba(255, 255, 255, 0.94)",
  },
  dark: {
    bg: "#09090B",
    surface: "#131316",
    surfaceAlt: "#1C1C20",
    border: "#232328",
    borderStrong: "#303037",
    text: "#F5F5F7",
    textMuted: "#A1A1AB",
    textSubtle: "#6B6B76",
    accent: "#6680FF",
    accentSoft: "rgba(102, 128, 255, 0.16)",
    onAccent: "#FFFFFF",
    danger: "#FF6369",
    dangerSoft: "rgba(255, 99, 105, 0.14)",
    success: "#3DD68C",
    successSoft: "rgba(61, 214, 140, 0.14)",
    warning: "#F1A10D",
    warningSoft: "rgba(241, 161, 13, 0.14)",
    inverse: "#F5F5F7",
    onInverse: "#09090B",
    overlay: "rgba(0, 0, 0, 0.55)",
    skeleton: "#1C1C21",
    glass: "rgba(22, 22, 26, 0.94)",
  },
};

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  title: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  headline: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  callout: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  footnote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
};

export const motion = {
  press: { damping: 20, stiffness: 400, mass: 0.6 },
  spring: { damping: 20, stiffness: 220, mass: 0.9 },
  gentle: { damping: 24, stiffness: 140, mass: 1 },
  fast: 160,
  base: 240,
  slow: 380,
};

// boxShadow works on the new architecture (iOS/Android) and on web.
export const shadows = {
  light: {
    sm: { boxShadow: "0px 1px 2px rgba(14, 14, 17, 0.06)" },
    md: { boxShadow: "0px 6px 20px rgba(14, 14, 17, 0.08), 0px 1px 3px rgba(14, 14, 17, 0.06)" },
    lg: { boxShadow: "0px 16px 40px rgba(14, 14, 17, 0.14), 0px 2px 6px rgba(14, 14, 17, 0.06)" },
  },
  dark: {
    sm: { boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)" },
    md: { boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.45)" },
    lg: { boxShadow: "0px 18px 44px rgba(0, 0, 0, 0.6)" },
  },
};
