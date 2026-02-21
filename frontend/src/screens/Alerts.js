import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../themes/colors";
import { SPACING, RADIUS } from "../themes/layout";

export function Alerts() {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: SPACING.lg,
                }}
            >
                <View
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: COLORS.card,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: SPACING.md,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <MaterialCommunityIcons
                        name="bell-outline"
                        size={36}
                        color={COLORS.textSecondary}
                    />
                </View>
                <Text
                    style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: COLORS.textPrimary,
                        marginBottom: SPACING.sm,
                    }}
                >
                    Alerts
                </Text>
                <Text
                    style={{
                        fontSize: 15,
                        color: COLORS.textSecondary,
                        textAlign: "center",
                        maxWidth: 260,
                    }}
                >
                    No alerts yet. Tap the button below to create one.
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => navigation.getParent()?.navigate("CreateAlert")}
                activeOpacity={0.85}
                style={{
                    position: "absolute",
                    right: SPACING.lg,
                    bottom: SPACING.lg + 56,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: COLORS.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}
