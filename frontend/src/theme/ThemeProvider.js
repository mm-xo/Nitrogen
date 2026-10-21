import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, Platform, StyleSheet, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { palettes, shadows } from "./tokens";

const PREFERENCE_KEY = "@nitrogen/theme-preference";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState("system");

  const applyPreference = useCallback((next) => {
    setPreferenceState(next);
    // Keep native chrome (keyboard, pickers, alerts) in step with the in-app theme.
    if (Platform.OS !== "web" && Appearance.setColorScheme) {
      Appearance.setColorScheme(next === "system" ? null : next);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(PREFERENCE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark") applyPreference(stored);
      })
      .catch(() => {});
  }, [applyPreference]);

  const setPreference = useCallback(
    (next) => {
      applyPreference(next);
      AsyncStorage.setItem(PREFERENCE_KEY, next).catch(() => {});
    },
    [applyPreference]
  );

  const scheme = preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  const value = useMemo(
    () => ({
      scheme,
      isDark: scheme === "dark",
      colors: palettes[scheme],
      shadow: shadows[scheme],
      preference,
      setPreference,
    }),
    [scheme, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

// const useStyles = makeStyles((c, t) => ({ ... }));  — styles rebuilt only when the scheme flips.
export function makeStyles(factory) {
  return function useStyles() {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme.colors, theme)), [theme]);
  };
}
