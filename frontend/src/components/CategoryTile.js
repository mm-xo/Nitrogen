import * as React from "react";
import { View } from "react-native";

import { getCategory, withAlpha } from "../constants/categories";
import { radius } from "../theme";
import { Icon } from "../ui";

export function CategoryTile({ category, size = 40 }) {
  const cat = getCategory(category);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size > 32 ? radius.md : radius.sm,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: withAlpha(cat.color, 0.13),
      }}
    >
      <Icon name={cat.icon} size={Math.round(size * 0.45)} color={cat.color} />
    </View>
  );
}
