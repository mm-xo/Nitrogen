import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { LoginScreen } from "../screens/LoginScreen";
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
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
        {!isLoggedIn ? (
            <Stack.Screen name="Login">
                {() => <LoginScreen onLogin={() => setIsLoggedIn(true)}/>}
            </Stack.Screen>
        ) : (
            <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="CreateAlert" component={CreateAlertScreen} />
            </>
    )}
    </Stack.Navigator>
    );
}