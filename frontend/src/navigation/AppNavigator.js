import * as React from "react";
import { Platform, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Animated, { FadeIn } from "react-native-reanimated";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme";
import { Logo } from "../components/Logo";
import { TabBar } from "./TabBar";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { MapScreen } from "../screens/MapScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { AlertDetailScreen } from "../screens/AlertDetailScreen";
import { MyAlertsScreen } from "../screens/MyAlertsScreen";
import { CreateAlertScreen } from "../screens/CreateAlertScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const push = Platform.select({ android: "ios_from_right", default: "default" });

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Tabs.Screen name="Map" component={MapScreen} />
      <Tabs.Screen name="Feed" component={FeedScreen} />
      <Tabs.Screen name="Mine" component={MyAlertsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function Splash() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
      <Animated.View entering={FadeIn.duration(400)}>
        <Logo size="lg" />
      </Animated.View>
    </View>
  );
}

export function AppNavigator() {
  const { session, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) return <Splash />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: push,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!session ? (
        <Stack.Group screenOptions={{ animation: Platform.OS === "android" ? "fade_from_bottom" : "default" }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Group>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={MainTabs} options={{ animation: "fade" }} />
          <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen
            name="CreateAlert"
            component={CreateAlertScreen}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
