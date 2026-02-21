import * as React from "react";
import { useState, useEffect } from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { AuthBackground } from "../components/AuthBackground";
import { DARK_COLORS } from "../themes/colors";
import { withTimeout } from "../utils/promiseUtils";

const PHONE_REGEX = /^\+1[0-9]{10}$/;

function FieldError({ error }) {
  if (!error) return null;
  return <Text style={styles.fieldError}>{error}</Text>;
}

export function ProfileScreen() {
  const { session, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errors, setErrors] = useState({});

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [student_email, setStudentEmail] = useState("");
  const [account_type, setAccountType] = useState("student");
  const [preferred_name, setPreferredName] = useState("");
  const [program, setProgram] = useState("");
  const [year_of_study, setYearOfStudy] = useState("");
  const [faculty, setFaculty] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");

  const userId = session?.user?.id;

  const loadProfile = React.useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await withTimeout(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        15000,
        "Profile load timed out. Check your connection."
      );

      setLoading(false);
      if (error) {
        setFetchError(error?.message || "Could not load profile.");
        return;
      }
      if (!data) {
        // Profile may not exist (e.g. user created before trigger) – show form with email from auth
        setStudentEmail(session?.user?.email ?? "");
        setAccountType("student");
        setFirstName("");
        setLastName("");
        setPreferredName("");
        setProgram("");
        setYearOfStudy("");
        setFaculty("");
        setPhoneNumber("");
        setBio("");
        return;
      }
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setStudentEmail(data.student_email ?? session?.user?.email ?? "");
      setAccountType(data.account_type ?? "student");
      setPreferredName(data.preferred_name ?? "");
      setProgram(data.program ?? "");
      setYearOfStudy(data.year_of_study != null ? String(data.year_of_study) : "");
      setFaculty(data.faculty ?? "");
      setPhoneNumber(data.phone_number ?? "");
      setBio(data.bio ?? "");
    } catch (err) {
      setLoading(false);
      setFetchError(err?.message || "Could not load profile.");
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile, retryCount]);

  function validate() {
    const e = {};
    if (!first_name.trim()) e.first_name = "Required";
    else if (first_name.trim().length > 50) e.first_name = "Max 50 characters";
    if (!last_name.trim()) e.last_name = "Required";
    else if (last_name.trim().length > 50) e.last_name = "Max 50 characters";
    if (preferred_name.trim().length > 50) e.preferred_name = "Max 50 characters";
    if (year_of_study) {
      const y = parseInt(year_of_study, 10);
      if (isNaN(y) || y < 1 || y > 5) e.year_of_study = "Must be 1–5";
    }
    if (phone_number.trim()) {
      if (!PHONE_REGEX.test(phone_number.trim())) e.phone_number = "Format: +1XXXXXXXXXX";
    }
    if (bio.trim().length > 500) e.bio = "Max 500 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const canSave =
    first_name.trim() &&
    last_name.trim() &&
    !saving &&
    !loading;

  async function handleSave() {
    if (!validate() || !canSave || !userId) return;

    setSaving(true);
    setErrors({});

    // Email is read-only; use existing value, never from user input
    const payload = {
      id: userId,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      student_email: student_email.trim() || session?.user?.email || null,
      preferred_name: preferred_name.trim() || null,
      program: program.trim() || null,
      year_of_study: year_of_study ? parseInt(year_of_study, 10) : null,
      faculty: faculty.trim() || null,
      phone_number: phone_number.trim() || null,
      bio: bio.trim() || null,
      account_type,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      Alert.alert("Error", error?.message || "Could not update profile.");
      return;
    }

    Alert.alert("Saved", "Your profile has been updated.");
    setIsEditing(false);
  }

  async function handleLogout() {
    await signOut();
  }

  const inputStyle = (hasError) => [
    styles.input,
    hasError && styles.inputError,
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AuthBackground />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DARK_COLORS.accent} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AuthBackground />
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setFetchError(null);
              setRetryCount((c) => c + 1);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtnError}
            onPress={handleLogout}
          >
            <Text style={styles.retryText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Default view: basic info only
  if (!isEditing) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AuthBackground />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>Nitrogen</Text>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Your Nitrogen profile</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First name</Text>
              <Text style={styles.infoValue}>{first_name || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last name</Text>
              <Text style={styles.infoValue}>{last_name || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{student_email || "—"}</Text>
            </View>
            <Text style={styles.emailHint}>Email cannot be changed</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editBtn}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#fff" />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Edit view: full form
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
            <Text style={styles.title}>Edit profile</Text>
            <Text style={styles.subtitle}>Update your personal information</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Basic info</Text>
            <View style={styles.row}>
              <TextInput
                style={[inputStyle(!!errors.first_name), styles.halfInput]}
                placeholder="First name"
                placeholderTextColor={DARK_COLORS.muted}
                value={first_name}
                onChangeText={(v) => {
                  setFirstName(v);
                  setErrors((e) => ({ ...e, first_name: undefined }));
                }}
                autoCapitalize="words"
                editable={!saving}
              />
              <TextInput
                style={[inputStyle(!!errors.last_name), styles.halfInput]}
                placeholder="Last name"
                placeholderTextColor={DARK_COLORS.muted}
                value={last_name}
                onChangeText={(v) => {
                  setLastName(v);
                  setErrors((e) => ({ ...e, last_name: undefined }));
                }}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>
            <FieldError error={errors.first_name || errors.last_name} />

            <TextInput
              style={[inputStyle(!!errors.preferred_name), { marginBottom: 4 }]}
              placeholder="Preferred name (optional)"
              placeholderTextColor={DARK_COLORS.muted}
              value={preferred_name}
              onChangeText={(v) => {
                setPreferredName(v);
                setErrors((e) => ({ ...e, preferred_name: undefined }));
              }}
              autoCapitalize="words"
              editable={!saving}
            />
            <FieldError error={errors.preferred_name} />

            <Text style={styles.sectionTitle}>University</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              placeholder="Student email"
              placeholderTextColor={DARK_COLORS.muted}
              value={student_email}
              editable={false}
            />
            <Text style={styles.readOnlyHint}>Student email cannot be changed</Text>

            <TextInput
              style={inputStyle(false)}
              placeholder="Program (optional)"
              placeholderTextColor={DARK_COLORS.muted}
              value={program}
              onChangeText={setProgram}
              autoCapitalize="words"
              editable={!saving}
            />

            <TextInput
              style={inputStyle(false)}
              placeholder="Faculty (optional)"
              placeholderTextColor={DARK_COLORS.muted}
              value={faculty}
              onChangeText={setFaculty}
              autoCapitalize="words"
              editable={!saving}
            />

            <Text style={styles.label}>Year of study (optional)</Text>
            <View style={styles.yearRow}>
              {[1, 2, 3, 4, 5].map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.yearBtn,
                    year_of_study === String(y) && styles.yearBtnActive,
                  ]}
                  onPress={() => {
                    setYearOfStudy(year_of_study === String(y) ? "" : String(y));
                    setErrors((e) => ({ ...e, year_of_study: undefined }));
                  }}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.yearText,
                      year_of_study === String(y) && styles.yearTextActive,
                    ]}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FieldError error={errors.year_of_study} />

            <Text style={styles.label}>Account type</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[styles.segmentedBtn, account_type === "student" && styles.segmentedBtnActive]}
                onPress={() => setAccountType("student")}
                disabled={saving}
              >
                <Text style={[styles.segmentedText, account_type === "student" && styles.segmentedTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentedBtn, account_type === "community" && styles.segmentedBtnActive]}
                onPress={() => setAccountType("community")}
                disabled={saving}
              >
                <Text style={[styles.segmentedText, account_type === "community" && styles.segmentedTextActive]}>
                  Community
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Contact & bio</Text>
            <TextInput
              style={inputStyle(!!errors.phone_number)}
              placeholder="Phone (+1XXXXXXXXXX)"
              placeholderTextColor={DARK_COLORS.muted}
              value={phone_number}
              onChangeText={(v) => {
                setPhoneNumber(v);
                setErrors((e) => ({ ...e, phone_number: undefined }));
              }}
              keyboardType="phone-pad"
              editable={!saving}
            />
            <FieldError error={errors.phone_number} />

            <TextInput
              style={[inputStyle(!!errors.bio), styles.bioInput]}
              placeholder="Bio (optional, max 500 chars)"
              placeholderTextColor={DARK_COLORS.muted}
              value={bio}
              onChangeText={(v) => {
                setBio(v);
                setErrors((e) => ({ ...e, bio: undefined }));
              }}
              multiline
              editable={!saving}
            />
            <FieldError error={errors.bio} />

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.85}
              style={[styles.cta, !canSave && styles.ctaDisabled]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Save changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={styles.cancelBtn}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            disabled={saving}
          >
            <Text style={styles.logoutText}>Log out</Text>
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: DARK_COLORS.muted,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 16,
    color: DARK_COLORS.accent,
    fontWeight: "600",
  },
  logoutBtnError: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  infoCard: {
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: DARK_COLORS.muted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: DARK_COLORS.text,
    fontWeight: "500",
  },
  emailHint: {
    fontSize: 11,
    color: DARK_COLORS.muted,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DARK_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 8,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  brand: {
    alignItems: "center",
    marginBottom: 28,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_COLORS.muted,
    marginBottom: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: DARK_COLORS.muted,
    marginBottom: 8,
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
  readOnlyInput: {
    opacity: 0.85,
  },
  readOnlyHint: {
    fontSize: 11,
    color: DARK_COLORS.muted,
    marginBottom: 16,
  },
  yearRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  yearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    backgroundColor: DARK_COLORS.inputBg,
    alignItems: "center",
  },
  yearBtnActive: {
    borderColor: DARK_COLORS.accent,
    backgroundColor: "rgba(236, 72, 153, 0.15)",
  },
  yearText: {
    fontSize: 16,
    color: DARK_COLORS.muted,
  },
  yearTextActive: {
    color: DARK_COLORS.accent,
    fontWeight: "600",
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
  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  fieldError: {
    fontSize: 12,
    color: DARK_COLORS.error,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: DARK_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
  divider: {
    height: 1,
    backgroundColor: DARK_COLORS.divider,
    marginVertical: 16,
  },
  logoutBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
});
