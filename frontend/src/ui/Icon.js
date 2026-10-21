import * as React from "react";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../theme";

export function Icon({ name, size = 20, color = "text", style }) {
  const { colors } = useTheme();
  return <Feather name={name} size={size} color={colors[color] ?? color} style={style} />;
}
