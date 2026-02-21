import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getColors } from "../themes/colors";

const THEME_KEY = "@app_theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState("light");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then((stored) => {
            if (stored === "light" || stored === "dark") setThemeState(stored);
            setReady(true);
        });
    }, []);

    const setTheme = (value) => {
        const next = value === "dark" ? "dark" : "light";
        setThemeState(next);
        AsyncStorage.setItem(THEME_KEY, next);
    };

    const colors = getColors(theme);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colors, ready }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}
