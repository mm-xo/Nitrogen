import * as React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { MapScreen } from "../screens/MapScreen";
import { Alerts } from "../screens/Alerts";
import { SettingsScreen } from "../screens/SettingsScreen";
import { CreateAlertScreen } from "../screens/CreateAlertScreen";
import { COLORS } from "../themes/colors";
import { SPACING } from "../themes/layout";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tabs.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    backgroundColor: COLORS.card,
                    borderTopColor: "#E5E7EB",
                    borderTopWidth: 1,
                    paddingTop: SPACING.sm,
                    height: 120,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                },
                tabBarIconStyle: { marginBottom: -2 },
            }}
        >
            <Tabs.Screen
                name="Map"
                component={MapScreen}
                options={{
                    title: "Map",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="map-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Alerts"
                component={Alerts}
                options={{
                    title: "Alerts",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs.Navigator>
    );
}

export function AppNavigator() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: COLORS.background,
                }}
            >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                    style={{
                        marginTop: SPACING.lg,
                        fontSize: 15,
                        color: COLORS.textSecondary,
                        fontWeight: "500",
                    }}
                >
                    Loading…
                </Text>
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: "slide_from_right",
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
                    <Stack.Screen
                        name="CreateAlert"
                        component={CreateAlertScreen}
                        options={{
                            headerShown: true,
                            title: "Create Alert",
                            headerStyle: {
                                backgroundColor: COLORS.primary,
                            },
                            headerTintColor: "#FFF",
                            headerTitleStyle: {
                                fontSize: 18,
                                fontWeight: "600",
                            },
                            headerBackTitle: "Back",
                            contentStyle: { backgroundColor: COLORS.background },
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
