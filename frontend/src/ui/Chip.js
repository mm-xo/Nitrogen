import * as React from "react";
import { View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

import { makeStyles, motion, radius, space, useTheme } from "../theme";
import { withAlpha } from "../constants/categories";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { Icon } from "./Icon";

// Pill toggle. With `color`, the selected state is tinted with it; otherwise it inverts.
export function Chip({ label, selected = false, onPress, icon, color, size = "md", style }) {
  const s = useStyles();
  const { colors } = useTheme();
  const progress = useDerivedValue(() => withTiming(selected ? 1 : 0, { duration: motion.fast }));

  const on = color
    ? { bg: withAlpha(color, 0.14), border: color, fg: colors.text, icon: color }
    : { bg: colors.inverse, border: colors.inverse, fg: colors.onInverse, icon: colors.onInverse };

  const frame = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, on.bg]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, on.border]),
  }));

  return (
    <PressableScale
      onPress={onPress}
      haptic
      scaleTo={0.95}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={style}
    >
      <Animated.View style={[s.chip, size === "sm" && s.chipSm, frame]}>
        {color && !icon ? <View style={[s.dot, { backgroundColor: color }]} /> : null}
        {icon ? <Icon name={icon} size={size === "sm" ? 14 : 16} color={selected ? on.icon : color ?? "textMuted"} /> : null}
        <Text variant={size === "sm" ? "caption" : "callout"} color={selected ? on.fg : "textMuted"}>
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

const useStyles = makeStyles(() => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm - 2,
    height: 36,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipSm: {
    height: 30,
    paddingHorizontal: space.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
}));
