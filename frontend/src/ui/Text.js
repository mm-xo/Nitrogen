import * as React from "react";
import { Text as RNText } from "react-native";

import { type, useTheme } from "../theme";

// <Text variant="title" color="textMuted">…</Text> — color is a palette key or any CSS colour.
export function Text({ variant = "body", color = "text", center, style, ...rest }) {
  const { colors } = useTheme();
  return (
    <RNText
      {...rest}
      style={[type[variant], { color: colors[color] ?? color }, center && { textAlign: "center" }, style]}
    />
  );
}
