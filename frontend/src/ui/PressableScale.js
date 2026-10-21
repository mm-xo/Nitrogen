import * as React from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { motion } from "../theme";
import { haptics } from "../utils/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Pressable that eases down to `scaleTo` while held and springs back on release.
export function PressableScale({
  scaleTo = 0.97,
  haptic = false,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  style,
  children,
  ...rest
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, motion.press);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motion.press);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) haptics.tap();
        onPress?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
