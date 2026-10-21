import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const enabled = Platform.OS === "ios" || Platform.OS === "android";
const run = (fn) => {
  if (!enabled) return;
  fn().catch(() => {});
};

export const haptics = {
  tap: () => run(() => Haptics.selectionAsync()),
  soft: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  firm: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
