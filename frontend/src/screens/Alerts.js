import * as React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CreateAlertScreen } from "../screens/CreateAlertScreen";


export function Alerts() {
    const navigation = useNavigation();

   return (
    <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 22 }}>Alerts</Text>
        </View>
        <View style={{ position: "absolute", right: 20, bottom: 24 }}>
            <Button
                title="+"
                onPress={() => navigation.getParent()?.navigate("CreateAlert")}
            />
        </View>
    </View>
);
}