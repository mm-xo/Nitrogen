import * as React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View, Button } from 'react-native';
import { COLORS } from "./src/themes/colors";
import { SPACING } from "./src/themes/layout";
// import { useRouter } from "expo-router";
import { AppNavigator } from "./src/navigation/AppNavigator";

import ExpoLocation from "./src/location/Expo-Location";
import { LocationProvider } from "./src/context/Locationcontext";
import { StatusBar } from "expo-status-bar";


export default function App() {
  // const router = useRouter();

  return (
    <LocationProvider>
      <ExpoLocation />
      <NavigationContainer>
        <AppNavigator/>
      </NavigationContainer>
    </LocationProvider>

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


