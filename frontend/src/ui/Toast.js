import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";

import { makeStyles, motion, radius, space } from "../theme";
import { Text } from "./Text";
import { Icon } from "./Icon";

const ToastContext = React.createContext(null);

const TONES = {
  success: { icon: "check-circle", color: "success" },
  error: { icon: "alert-circle", color: "danger" },
  info: { icon: "info", color: "accent" },
};

export function ToastProvider({ children }) {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = React.useState([]);

  const show = React.useCallback((title, { tone = "success", message, duration = 2600 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list.slice(-2), { id, title, tone, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), duration);
  }, []);

  const api = React.useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View pointerEvents="none" style={[s.host, { top: insets.top + space.sm }]}>
        {toasts.map((t) => {
          const tone = TONES[t.tone] ?? TONES.info;
          return (
            <Animated.View
              key={t.id}
              entering={FadeInUp.springify().damping(18)}
              exiting={FadeOutUp.duration(motion.base)}
              layout={LinearTransition.springify().damping(20)}
              style={s.toast}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              <Icon name={tone.icon} size={18} color={tone.color} />
              <View style={s.body}>
                <Text variant="callout">{t.title}</Text>
                {t.message ? (
                  <Text variant="caption" color="textMuted" style={s.message}>
                    {t.message}
                  </Text>
                ) : null}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const useStyles = makeStyles((c, t) => ({
  host: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    alignItems: "center",
    gap: space.sm,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    maxWidth: 440,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    ...t.shadow.lg,
  },
  body: {
    flexShrink: 1,
  },
  message: {
    marginTop: 2,
  },
}));
