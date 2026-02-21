import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { AuthBackground } from "../components/AuthBackground";
import { DARK_COLORS } from "../themes/colors";

export function LoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error.message);
  }

  async function handleForgotPassword() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email required", "Enter your email above first.");
      return;
    }
    setResetSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
    setResetSending(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "We sent you a link to reset your password."
      );
    }
  }

  const canSubmit = email.trim() && password && !loading;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AuthBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>Nitrogen</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={DARK_COLORS.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!loading}
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor={DARK_COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.eyeBtn}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={DARK_COLORS.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={resetSending}
              style={styles.forgotWrap}
            >
              <Text style={styles.forgot}>
                {resetSending ? "Sending..." : "Forgot password?"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={!canSubmit}
              activeOpacity={0.85}
              style={[styles.cta, !canSubmit && styles.ctaDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Log in</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>
              Don't have an account?{" "}
              <Text style={styles.linkAccent}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK_COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  brand: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: DARK_COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: DARK_COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: DARK_COLORS.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  eyeBtn: {
    padding: 12,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgot: {
    fontSize: 14,
    color: DARK_COLORS.accent,
    fontWeight: "500",
  },
  cta: {
    backgroundColor: DARK_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DARK_COLORS.divider,
  },
  dividerText: {
    fontSize: 13,
    color: DARK_COLORS.muted,
    marginHorizontal: 16,
  },
  linkWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  link: {
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
  linkAccent: {
    color: DARK_COLORS.accent,
    fontWeight: "600",
  },
});
