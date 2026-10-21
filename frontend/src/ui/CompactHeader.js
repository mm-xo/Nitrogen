import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { glassBlur, makeStyles } from "../theme";
import { Text } from "./Text";

const BAR_HEIGHT = 48;

export function useScrollY() {
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  return { y, onScroll };
}

// Small frosted title bar that fades in once the large title has scrolled away.
export function CompactHeader({ title, scrollY, threshold = 48 }) {
  const s = useStyles();
  const insets = useSafeAreaInsets();

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [threshold - 12, threshold + 12], [0, 1], "clamp"),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [threshold - 12, threshold + 12], [8, 0], "clamp") }],
  }));

  return (
    <Animated.View style={[s.bar, { paddingTop: insets.top, height: insets.top + BAR_HEIGHT }, barStyle]}>
      <Animated.View style={titleStyle}>
        <Text variant="headline">{title}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  bar: {
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.glass,
    ...glassBlur,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    zIndex: 10,
  },
}));
