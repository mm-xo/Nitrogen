import * as React from "react";
import { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
    StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../themes/colors";
import { SPACING, RADIUS } from "../themes/layout";
import { getAlerts } from "../map/AlterPins";
import { AuthBackground } from "../components/AuthBackground";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../constants/categories";

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

function AlertRow({ item }) {
    const label = CATEGORY_LABELS[item.category] ?? item.category;
    const icon = CATEGORY_ICONS[item.category] ?? "bell-outline";

    return (
        <View style={styles.row}>
            {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={styles.thumb} />
            ) : (
                <View style={styles.thumbPlaceholder}>
                    <MaterialCommunityIcons
                        name={icon}
                        size={24}
                        color={COLORS.textSecondary}
                    />
                </View>
            )}
            <View style={styles.rowContent}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.rowMessage} numberOfLines={2}>
                    {item.message}
                </Text>
                <View style={styles.rowMeta}>
                    <Text style={styles.rowCategory}>{label}</Text>
                    <Text style={styles.rowTime}>{formatDate(item.created_at)}</Text>
                </View>
            </View>
        </View>
    );
}

export function Alerts() {
    const navigation = useNavigation();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadAlerts = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (e) {
            setError(e?.message ?? "Could not load alerts.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAlerts();
        }, [loadAlerts])
    );

    if (loading && alerts.length === 0) {
        return (
            <View style={[styles.centered, styles.container]}>
                <AuthBackground />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.emptyText}>Loading alerts…</Text>
                <TouchableOpacity
                    onPress={() => navigation.getParent()?.navigate("CreateAlert")}
                    activeOpacity={0.85}
                    style={styles.fab}
                >
                    <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AuthBackground />
            {error ? (
                <View style={styles.centered}>
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={48}
                        color={COLORS.danger}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => loadAlerts()} style={styles.retryBtn}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : alerts.length === 0 ? (
                <View style={styles.centered}>
                    <View style={styles.emptyIconWrap}>
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={36}
                            color={COLORS.textSecondary}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>Alerts</Text>
                    <Text style={styles.emptyText}>
                        No alerts yet. Tap the button below to create one.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(a) => a.id}
                    renderItem={({ item }) => <AlertRow item={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadAlerts(true)}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            )}

            <TouchableOpacity
                onPress={() => navigation.getParent()?.navigate("CreateAlert")}
                activeOpacity={0.85}
                style={styles.fab}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg + 70,
    },
    row: {
        flexDirection: "row",
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    thumb: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.background,
    },
    thumbPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
    },
    rowContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.textPrimary,
    },
    rowMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    rowMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
    rowCategory: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: "500",
    },
    rowTime: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyIconWrap: {
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
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: "center",
        maxWidth: 260,
    },
    errorText: {
        fontSize: 15,
        color: COLORS.danger,
        textAlign: "center",
        marginTop: SPACING.sm,
    },
    retryBtn: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
    },
    retryBtnText: {
        color: "#FFF",
        fontWeight: "600",
    },
    fab: {
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
    },
});
