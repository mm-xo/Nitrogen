import * as React from "react";
import {View, Text } from "react-native"

export function SettingsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 22 }}>Settings</Text>
        </View>
    );
}