import * as React from "react";
import { View, Text } from "react-native";

export function LoginScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 24, fontWeight: "600" }}>Login</Text>
                <Button title="Log in (fake)" onPress={onLogin} />
                {/* TODO Auth (supabase?) */}
        </View>
    );
}