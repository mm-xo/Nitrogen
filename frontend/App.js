import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { StyleSheet, View } from 'react-native';
export default function App() {
  return (
    <LocationProvider>
      <View style={styles.container}>
        <ExpoLocation />
        <StatusBar style="auto" />
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


