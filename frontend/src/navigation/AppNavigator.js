import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { LoginScreen } from "../screens/LoginScreen";
import { MapScreen } from "../screens/MapScreen";
import { CreateAlertScreen } from "../screens/CreateAlertScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tabs.Navigator>
            <Tabs.screen name="Map" component={MapScreen} />
            <Tabs.screen name="CreateAlert" component={CreateAlertScreen} />
            <Tabs.screen name="Settings" component={SettingsScreen} />
        </Tabs.Navigator>
    );
}

export function AppNavigator() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
        {!isLoggedIn ? (
            <Stack.Screen name="Login">
                {() => <LoginScreen onLogin={() => setIsLoggedIn(true)}/>}
            </Stack.Screen>
        ) : (
                <Stack.Screen name="MainTabs" component={MainTabs} />
    )}
    </Stack.Navigator>
    );
}