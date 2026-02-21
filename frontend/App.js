import "./global.css";
import * as React from "react";

import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();
import { StyleSheet, Text, View, Button } from 'react-native';
import { COLORS } from "./src/themes/colors";
import { SPACING } from "./src/themes/layout";
// import { useRouter } from "expo-router";
import { AppNavigator } from "./src/navigation/AppNavigator";

import ExpoLocation from "./src/location/Expo-Location";
import { LocationProvider } from "./src/context/Locationcontext";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

function AppContent() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <LocationProvider>
      <ExpoLocation />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </LocationProvider>
    </>
  );
}

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
});


