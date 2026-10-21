import * as React from "react";
import { Platform, TextInput, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { fonts, makeStyles, motion, radius, space, useTheme } from "../theme";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";

export const TextField = React.forwardRef(function TextField(
  {
    label,
    hint,
    error,
    icon,
    maxLength,
    showCount = false,
    multiline = false,
    secure = false,
    value,
    style,
    inputStyle,
    onFocus,
    onBlur,
    editable = true,
    ...rest
  },
  ref
) {
  const s = useStyles();
  const { colors } = useTheme();
  const focus = useSharedValue(0);
  const [hidden, setHidden] = React.useState(secure);

  const frameStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.danger
      : interpolateColor(focus.value, [0, 1], [colors.surfaceAlt, colors.accent]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [colors.surfaceAlt, colors.surface]),
  }));

  const count = value?.length ?? 0;

  return (
    <View style={[s.wrap, style]}>
      {label || (showCount && maxLength) ? (
        <View style={s.labelRow}>
          {label ? (
            <Text variant="callout" color="textMuted">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showCount && maxLength ? (
            <Text variant="caption" color={count > maxLength * 0.9 ? "warning" : "textSubtle"}>
              {count}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Animated.View style={[s.frame, multiline && s.frameMultiline, frameStyle, !editable && s.disabled]}>
        {icon ? <Icon name={icon} size={18} color="textSubtle" style={s.leadingIcon} /> : null}
        <TextInput
          ref={ref}
          value={value}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          onFocus={(e) => {
            focus.value = withTiming(1, { duration: motion.fast });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.value = withTiming(0, { duration: motion.base });
            onBlur?.(e);
          }}
          style={[s.input, multiline && s.inputMultiline, inputStyle]}
          {...rest}
        />
        {secure ? (
          <PressableScale
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            style={s.trailing}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Icon name={hidden ? "eye" : "eye-off"} size={18} color="textSubtle" />
          </PressableScale>
        ) : null}
      </Animated.View>

      {error ? (
        <Animated.View entering={FadeIn.duration(motion.fast)} exiting={FadeOut.duration(motion.fast)}>
          <Text variant="caption" color="danger" style={s.message}>
            {error}
          </Text>
        </Animated.View>
      ) : hint ? (
        <Text variant="caption" color="textSubtle" style={s.message}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((c) => ({
  wrap: {
    marginBottom: space.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: space.sm,
  },
  frame: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: space.lg,
  },
  frameMultiline: {
    alignItems: "flex-start",
    paddingVertical: space.md,
  },
  disabled: {
    opacity: 0.6,
  },
  leadingIcon: {
    marginRight: space.md,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: c.text,
    paddingVertical: space.md,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : null),
  },
  inputMultiline: {
    minHeight: 96,
    paddingVertical: 0,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  trailing: {
    marginLeft: space.sm,
    padding: space.xs,
  },
  message: {
    marginTop: space.xs + 2,
    marginLeft: space.xxs,
  },
}));
