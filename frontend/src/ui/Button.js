import * as React from "react";
import { ActivityIndicator, View } from "react-native";

import { makeStyles, radius, space, useTheme } from "../theme";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { Icon } from "./Icon";

const HEIGHT = { sm: 36, md: 44, lg: 52 };

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  iconRight,
  loading = false,
  disabled = false,
  full = true,
  style,
  accessibilityLabel,
}) {
  const s = useStyles();
  const { colors } = useTheme();

  const palette = {
    primary: { bg: colors.accent, fg: colors.onAccent },
    inverse: { bg: colors.inverse, fg: colors.onInverse },
    secondary: { bg: colors.surfaceAlt, fg: colors.text },
    ghost: { bg: "transparent", fg: colors.accent },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[variant];

  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        s.base,
        {
          height: HEIGHT[size],
          backgroundColor: palette.bg,
          borderRadius: size === "lg" ? radius.lg : radius.md,
          paddingHorizontal: size === "sm" ? space.md : space.xl,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: disabled && !loading ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={s.content}>
          {icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} color={palette.fg} /> : null}
          <Text variant={size === "sm" ? "callout" : "headline"} color={palette.fg}>
            {title}
          </Text>
          {iconRight ? <Icon name={iconRight} size={18} color={palette.fg} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const useStyles = makeStyles(() => ({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
}));
