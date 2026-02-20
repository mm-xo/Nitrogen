import * as React from "react";

import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from "./src/themes/colors";
import { SPACING } from "./src/themes/layout";
import ExpoLocation from "./src/location/Expo-Location";
import { LocationProvider } from "./src/context/Locationcontext";
import { StatusBar } from "expo-status-bar";


export default function App() {
  return (
    <LocationProvider>
      <View>
        <Text>Hello World</Text>
        {/* <ExpoLocation /> */}
        {/* <StatusBar style="auto" /> */}
      </View>
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


