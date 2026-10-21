import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { makeStyles, motion, radius, space } from "../theme";
import { haptics } from "../utils/haptics";
import { Text } from "./Text";
import { Icon } from "./Icon";

// options: [{ value, label, icon? }]
export function SegmentedControl({ options, value, onChange, style }) {
  const s = useStyles();
  const [width, setWidth] = React.useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width ? (width - 4) / options.length : 0;
  const x = useSharedValue(0);

  React.useEffect(() => {
    x.value = withSpring(index * segment, motion.spring);
  }, [index, segment, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={[s.track, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      {segment ? <Animated.View style={[s.thumb, { width: segment }, thumbStyle]} /> : null}
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={s.option}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              haptics.tap();
              onChange(o.value);
            }}
          >
            {o.icon ? <Icon name={o.icon} size={15} color={active ? "text" : "textMuted"} /> : null}
            <Text variant="callout" color={active ? "text" : "textMuted"}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c, t) => ({
  track: {
    flexDirection: "row",
    padding: 2,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: c.surfaceAlt,
  },
  thumb: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    borderRadius: radius.md - 2,
    backgroundColor: t.isDark ? c.borderStrong : c.surface,
    ...t.shadow.sm,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs + 2,
  },
}));
