import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { makeStyles, radius, space } from "../theme";

export function Skeleton({ width = "100%", height = 14, round = radius.sm, style }) {
  const s = useStyles();
  const pulse = useSharedValue(0.55);

  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);

  const animated = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.View style={[s.block, { width, height, borderRadius: round }, animated, style]} />;
}

// Placeholder shaped like an AlertCard.
export function AlertCardSkeleton() {
  const s = useStyles();
  return (
    <View style={s.card}>
      <Skeleton width={40} height={40} round={radius.md} />
      <View style={s.lines}>
        <Skeleton width="38%" height={10} />
        <Skeleton width="82%" height={14} />
        <Skeleton width="64%" height={12} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  block: {
    backgroundColor: c.skeleton,
  },
  card: {
    flexDirection: "row",
    gap: space.md,
    padding: space.lg,
    marginBottom: space.md,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  lines: {
    flex: 1,
    gap: space.sm + 2,
    paddingTop: 2,
  },
}));
