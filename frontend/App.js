import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from './src/themes/colors';
import { SPACING } from './src/themes/layout';
import ExpoLocation from './src/Expo-Location';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoLocation()}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md

  },
});
