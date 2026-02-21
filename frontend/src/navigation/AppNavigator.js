import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { MapScreen } from "../screens/MapScreen";
import { Alerts } from "../screens/Alerts";
import { SettingsScreen } from "../screens/SettingsScreen";
import { CreateAlertScreen } from "../screens/CreateAlertScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tabs.Navigator>
            <Tabs.Screen name="Map" component={MapScreen} />
            <Tabs.Screen name="Alerts" component={Alerts} />
            <Tabs.Screen name="Settings" component={SettingsScreen} />
        </Tabs.Navigator>
    );
}

export function AppNavigator() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" }}>
                <ActivityIndicator size="large" color="#ec4899" />
            </View>
        );
    }

    return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0f172a" },
          }}
        >
        {!session ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
        ) : (
            <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="CreateAlert" component={CreateAlertScreen} />
            </>
        )}
        </Stack.Navigator>
    );
}