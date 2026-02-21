import * as React from "react";
import { View, Text } from "react-native";
import { COLORS } from "../themes/colors";
import { AuthBackground } from "../components/AuthBackground";

export function SettingsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
            <AuthBackground />
            <Text style={{ fontSize: 22, color: COLORS.textPrimary }}>Settings</Text>
        </View>
    );
}