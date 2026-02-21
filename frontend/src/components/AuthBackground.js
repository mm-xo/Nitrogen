import * as React from "react";
import { View, StyleSheet } from "react-native";

const COLORS = {
  bg: "#0f172a",
  orbPink: "rgba(236, 72, 153, 0.15)",
  orbPurple: "rgba(139, 92, 246, 0.12)",
  orbBlue: "rgba(59, 130, 246, 0.08)",
};

export function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />
      <View style={[styles.orb, styles.orb4]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  orb1: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.orbPink,
    top: -80,
    right: -100,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.orbPurple,
    top: "40%",
    left: -80,
  },
  orb3: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.orbBlue,
    bottom: "20%",
    right: -40,
  },
  orb4: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.orbPurple,
    bottom: -30,
    left: "30%",
  },
});
