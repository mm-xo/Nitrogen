import * as React from "react";
import { View, StyleSheet } from "react-native";
// Subtle dark purple/blur blobs to match Create account screen
const ORB_COLORS = {
  orbDarkPurple: "rgba(60, 55, 90, 0.5)",
  orbPurple: "rgba(80, 70, 120, 0.35)",
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
    backgroundColor: ORB_COLORS.orbDarkPurple,
    top: -80,
    right: -100,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: ORB_COLORS.orbPurple,
    top: "40%",
    left: -80,
  },
  orb3: {
    width: 160,
    height: 160,
    backgroundColor: ORB_COLORS.orbDarkPurple,
    bottom: "20%",
    right: -40,
  },
  orb4: {
    width: 120,
    height: 120,
    backgroundColor: ORB_COLORS.orbPurple,
    bottom: -30,
    left: "30%",
  },
});
