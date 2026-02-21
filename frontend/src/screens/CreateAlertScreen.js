import * as React from "react";
import { Picker } from "@react-native-picker/picker";
import { Button, Text, TextInput, View } from "react-native";
import { COLORS } from '../themes/colors';
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CATEGORY_ICONS } from "../constants/icons";
// import { CATEGORYICON } from "../components/CategoryIcon";

// import { SPACING } from '../src/themes/layout';


export function CreateAlertScreen() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [error, setError] = useState("");
    const [category, setCategory] = useState("safety");
    const categoryLabel = { safety: "Safety", food: "Food", events: "Events" };


    const onSubmit = () => {
        if (!category) {
            setError("Pick a category");
            return;
        }
        if (!title.trim()) {
            setError("Title required");
            return;
        }
        setError("");


        // router.push({
        //     pathname: "/success",
        //     params: { category }
        // });
    };

    const inputStyle = {
        fontSize: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 16,
        color: "#1e293b",
    };

    return (
        <View style={{ padding: 20, paddingTop: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b", marginBottom: 6 }}>
                Title
            </Text>
            <TextInput
                style={inputStyle}
                placeholder="Enter alert title"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b", marginBottom: 6 }}>
                Description
            </Text>
            <TextInput
                style={[inputStyle, { minHeight: 100, textAlignVertical: "top" }]}
                placeholder="Describe the alert..."
                placeholderTextColor="#94a3b8"
                value={desc}
                onChangeText={setDesc}
                multiline
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 }}>
                <MaterialCommunityIcons
                    name={CATEGORY_ICONS[category]}
                    size={20}
                    color={COLORS.primary}
                />
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}>
                    Category
                </Text>
            </View>
            <View style={{ marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
                <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value)}
                    style={{ paddingVertical: 8 }}
                >
                    <Picker.Item label="Safety" value="safety" />
                    <Picker.Item label="Food" value="food" />
                    <Picker.Item label="Events" value="events" />
                </Picker>
            </View>
            {error ? <Text style={{ color: "#dc2626", marginBottom: 12, fontSize: 14 }}>{error}</Text> : null}

            <Button title="Submit" onPress={onSubmit} />
        </View>
    );
}