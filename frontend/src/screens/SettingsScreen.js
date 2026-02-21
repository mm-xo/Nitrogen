import * as React from "react";
import { View, Text, ScrollView, Switch } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SPACING, RADIUS } from "../themes/layout";

export function SettingsScreen() {
    const { session } = useAuth();
    const { theme, setTheme, colors } = useTheme();

    const email = session?.user?.email ?? "—";
    const isDark = theme === "dark";

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.lg + 80 }}
            showsVerticalScrollIndicator={false}
        >
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: SPACING.sm,
                    marginLeft: SPACING.xs,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                }}
            >
                Profile
            </Text>
            <View
                style={{
                    borderRadius: RADIUS.md,
                    overflow: "hidden",
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                {/* Email row */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: SPACING.md,
                        paddingHorizontal: SPACING.lg,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight,
                    }}
                >
                    <MaterialCommunityIcons
                        name="email-outline"
                        size={22}
                        color={colors.primary}
                        style={{ marginRight: SPACING.md }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                            Logged in as
                        </Text>
                        <Text
                            style={{ fontSize: 16, color: colors.textPrimary, fontWeight: "500" }}
                            numberOfLines={1}
                        >
                            {email}
                        </Text>
                    </View>
                </View>
                {/* Dark mode row */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: SPACING.md,
                        paddingHorizontal: SPACING.lg,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <MaterialCommunityIcons
                            name="theme-light-dark"
                            size={22}
                            color={colors.primary}
                            style={{ marginRight: SPACING.md }}
                        />
                        <Text style={{ fontSize: 16, color: colors.textPrimary, fontWeight: "500" }}>
                            Dark mode
                        </Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={(value) => setTheme(value ? "dark" : "light")}
                        trackColor={{ false: colors.borderLight, true: colors.primary }}
                        thumbColor="#FFF"
                    />
                </View>
            </View>
        </ScrollView>
    );
}
