import { Alert, Platform, Share } from "react-native";

// react-native-web's Alert is a no-op, so fall back to the browser's own dialog there.
export function confirm({ title, message, confirmLabel = "OK", destructive = false }) {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm([title, message].filter(Boolean).join("\n\n")));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}

// Resolves "shared", "copied" or "dismissed".
export async function shareText({ title, message }) {
  if (Platform.OS === "web") {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: message });
        return "shared";
      } catch {
        return "dismissed";
      }
    }
    await navigator.clipboard?.writeText(message);
    return "copied";
  }
  const result = await Share.share({ title, message });
  return result.action === Share.sharedAction ? "shared" : "dismissed";
}
