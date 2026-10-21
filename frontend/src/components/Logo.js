import * as React from "react";
import { View } from "react-native";

import { makeStyles, space } from "../theme";
import { Text } from "../ui";

// Wordmark: a rounded tile with an accent "ping" dot, then the name in lowercase.
export function Logo({ size = "md", showWord = true }) {
  const s = useStyles();
  const tile = size === "lg" ? 40 : size === "sm" ? 22 : 30;
  return (
    <View style={s.row} accessibilityRole="image" accessibilityLabel="Nitrogen">
      <View style={[s.tile, { width: tile, height: tile, borderRadius: tile * 0.32 }]}>
        <View style={[s.ping, { width: tile * 0.3, height: tile * 0.3, borderRadius: tile }]} />
      </View>
      {showWord ? (
        <Text
          variant={size === "lg" ? "title" : size === "sm" ? "callout" : "headline"}
          style={[s.word, size === "lg" && s.wordLg]}
        >
          nitrogen
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm + 2,
  },
  tile: {
    backgroundColor: c.inverse,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: "16%",
  },
  ping: {
    backgroundColor: c.accent,
  },
  word: {
    letterSpacing: -0.6,
  },
  wordLg: {
    fontSize: 26,
    letterSpacing: -1,
  },
}));
