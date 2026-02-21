import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { AuthBackground } from "../components/AuthBackground";
import { DARK_COLORS } from "../themes/colors";

function getAuthErrorMessage(error) {
  const msg = error?.message || "";
  if (msg.includes("already registered") || msg.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (msg.includes("Password")) return "Password is too weak. Use at least 6 characters.";
  return msg || "Sign up failed. Please try again.";
}

function FieldError({ error }) {
  if (!error) return null;
  return <Text style={styles.fieldError}>{error}</Text>;
}

export function SignupScreen() {
  const navigation = useNavigation();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [student_email, setStudentEmail] = useState("");
  const [account_type, setAccountType] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@myumanitoba\.ca$/i;

  function validate() {
    const e = {};
    if (!first_name.trim()) e.first_name = "Required";
    else if (first_name.trim().length > 50) e.first_name = "Max 50 characters";
    if (!last_name.trim()) e.last_name = "Required";
    else if (last_name.trim().length > 50) e.last_name = "Max 50 characters";
    if (!student_email.trim()) e.student_email = "Required";
    else if (!STUDENT_EMAIL_REGEX.test(student_email.trim())) e.student_email = "Must be @myumanitoba.ca";
    if (!password) e.password = "Required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const canSubmit =
    first_name.trim() &&
    last_name.trim() &&
    STUDENT_EMAIL_REGEX.test(student_email.trim()) &&
    password.length >= 6 &&
    password === confirmPassword &&
    !loading;

  async function handleSignUp() {
    if (!validate() || !canSubmit) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: student_email.trim(),
      password,
      options: {
        data: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          account_type,
        },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", getAuthErrorMessage(error));
      return;
    }

    if (!!data?.session) {
      Alert.alert("Welcome", "Account created successfully.");
    } else {
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. Please verify and sign in."
      );
    }

    navigation.navigate("Login");
  }

  const inputStyle = (hasError) => [
    styles.input,
    hasError && styles.inputError,
  ];

  const passwordRowStyle = [styles.passwordRow, !!errors.password && styles.inputError];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AuthBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>Nitrogen</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join Nitrogen to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, !!errors.first_name && styles.inputError]}
                placeholder="First name"
                placeholderTextColor={DARK_COLORS.muted}
                value={first_name}
                onChangeText={(v) => {
                  setFirstName(v);
                  setErrors((e) => ({ ...e, first_name: undefined }));
                }}
                autoCapitalize="words"
                editable={!loading}
              />
              <TextInput
                style={[styles.input, styles.halfInput, !!errors.last_name && styles.inputError]}
                placeholder="Last name"
                placeholderTextColor={DARK_COLORS.muted}
                value={last_name}
                onChangeText={(v) => {
                  setLastName(v);
                  setErrors((e) => ({ ...e, last_name: undefined }));
                }}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            <FieldError error={errors.first_name || errors.last_name} />

            <TextInput
              style={inputStyle(!!errors.student_email)}
              placeholder="Student email (@myumanitoba.ca)"
              placeholderTextColor={DARK_COLORS.muted}
              value={student_email}
              onChangeText={(v) => {
                setStudentEmail(v);
                setErrors((e) => ({ ...e, student_email: undefined }));
              }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!loading}
            />
            <FieldError error={errors.student_email} />

            <Text style={styles.label}>Account type</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[styles.segmentedBtn, account_type === "student" && styles.segmentedBtnActive]}
                onPress={() => setAccountType("student")}
                disabled={loading}
              >
                <Text style={[styles.segmentedText, account_type === "student" && styles.segmentedTextActive]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentedBtn, account_type === "community" && styles.segmentedBtnActive]}
                onPress={() => setAccountType("community")}
                disabled={loading}
              >
                <Text style={[styles.segmentedText, account_type === "community" && styles.segmentedTextActive]}>Community</Text>
              </TouchableOpacity>
            </View>

            <View style={passwordRowStyle}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor={DARK_COLORS.muted}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((e) => ({
                    ...e,
                    password: undefined,
                    confirmPassword: v !== confirmPassword ? "Passwords don't match" : undefined,
                  }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
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
            <FieldError error={errors.password} />

            <TextInput
              style={inputStyle(!!errors.confirmPassword)}
              placeholder="Confirm password"
              placeholderTextColor={DARK_COLORS.muted}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setErrors((e) => ({
                  ...e,
                  confirmPassword: v !== password ? "Passwords don't match" : undefined,
                }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!loading}
            />
            <FieldError error={errors.confirmPassword} />

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={!canSubmit}
              activeOpacity={0.85}
              style={[styles.cta, !canSubmit && styles.ctaDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Sign up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkAccent}>Log in</Text>
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
    paddingTop: 40,
    paddingBottom: 32,
  },
  brand: {
    alignItems: "center",
    marginBottom: 32,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: DARK_COLORS.text,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  inputError: {
    borderColor: DARK_COLORS.error,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    marginBottom: 4,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  eyeBtn: {
    padding: 12,
  },
  label: {
    fontSize: 14,
    color: DARK_COLORS.muted,
    marginBottom: 8,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    backgroundColor: DARK_COLORS.inputBg,
    alignItems: "center",
  },
  segmentedBtnActive: {
    borderColor: DARK_COLORS.accent,
    backgroundColor: "rgba(236, 72, 153, 0.15)",
  },
  segmentedText: {
    fontSize: 16,
    color: DARK_COLORS.muted,
  },
  segmentedTextActive: {
    color: DARK_COLORS.accent,
    fontWeight: "600",
  },
  fieldError: {
    fontSize: 12,
    color: DARK_COLORS.error,
    marginBottom: 12,
    marginLeft: 2,
  },
  cta: {
    backgroundColor: DARK_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
