import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { makeStyles, space } from "../theme";
import { Button, Chip, IconButton, Screen, SegmentedControl, Text, TextField, useToast } from "../ui";
import { haptics } from "../utils/haptics";

const PHONE_REGEX = /^\+1[0-9]{10}$/;
const BIO_MAX = 500;

export function EditProfileScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { profile, user, saveProfile } = useAuth();

  const [form, setForm] = React.useState(() => ({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    preferred_name: profile?.preferred_name ?? "",
    program: profile?.program ?? "",
    faculty: profile?.faculty ?? "",
    year_of_study: profile?.year_of_study ? String(profile.year_of_study) : "",
    account_type: profile?.account_type ?? "student",
    phone_number: profile?.phone_number ?? "",
    bio: profile?.bio ?? "",
  }));
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate() {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    else if (form.first_name.trim().length > 50) e.first_name = "Max 50 characters";
    if (!form.last_name.trim()) e.last_name = "Required";
    else if (form.last_name.trim().length > 50) e.last_name = "Max 50 characters";
    if (form.preferred_name.trim().length > 50) e.preferred_name = "Max 50 characters";
    if (form.phone_number.trim() && !PHONE_REGEX.test(form.phone_number.trim())) {
      e.phone_number = "Use the format +1XXXXXXXXXX";
    }
    if (form.bio.trim().length > BIO_MAX) e.bio = `Max ${BIO_MAX} characters`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) {
      haptics.warning();
      return;
    }
    setSaving(true);
    try {
      await saveProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        preferred_name: form.preferred_name.trim() || null,
        student_email: profile?.student_email || user?.email || null,
        program: form.program.trim() || null,
        faculty: form.faculty.trim() || null,
        year_of_study: form.year_of_study ? parseInt(form.year_of_study, 10) : null,
        account_type: form.account_type,
        phone_number: form.phone_number.trim() || null,
        bio: form.bio.trim() || null,
      });
      haptics.success();
      toast.show("Profile saved");
      navigation.goBack();
    } catch (e) {
      haptics.error();
      toast.show("Couldn't save", { tone: "error", message: e?.message });
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headline">Edit profile</Text>
        <View style={s.topBarSpacer} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text variant="overline" color="textSubtle" style={s.group}>
            Basics
          </Text>
          <View style={s.row}>
            <TextField label="First name" value={form.first_name} onChangeText={set("first_name")} error={errors.first_name} autoCapitalize="words" style={s.half} />
            <TextField label="Last name" value={form.last_name} onChangeText={set("last_name")} error={errors.last_name} autoCapitalize="words" style={s.half} />
          </View>
          <TextField
            label="Preferred name"
            placeholder="Optional"
            value={form.preferred_name}
            onChangeText={set("preferred_name")}
            error={errors.preferred_name}
            autoCapitalize="words"
          />
          <TextField label="Email" value={profile?.student_email || user?.email || ""} editable={false} hint="Your sign-in email can't be changed." />

          <Text variant="overline" color="textSubtle" style={s.group}>
            University
          </Text>
          <Text variant="callout" color="textMuted" style={s.label}>
            Account type
          </Text>
          <SegmentedControl
            value={form.account_type}
            onChange={set("account_type")}
            style={s.segment}
            options={[
              { value: "student", label: "Student" },
              { value: "community", label: "Community" },
            ]}
          />
          <TextField label="Program" placeholder="e.g. Computer Science" value={form.program} onChangeText={set("program")} autoCapitalize="words" />
          <TextField label="Faculty" placeholder="e.g. Science" value={form.faculty} onChangeText={set("faculty")} autoCapitalize="words" />
          <Text variant="callout" color="textMuted" style={s.label}>
            Year of study
          </Text>
          <View style={s.years}>
            {["1", "2", "3", "4", "5"].map((y) => (
              <Chip
                key={y}
                label={`Year ${y}`}
                size="sm"
                selected={form.year_of_study === y}
                onPress={() => set("year_of_study")(form.year_of_study === y ? "" : y)}
              />
            ))}
          </View>

          <Text variant="overline" color="textSubtle" style={s.group}>
            Contact
          </Text>
          <TextField
            label="Phone"
            placeholder="+1XXXXXXXXXX"
            value={form.phone_number}
            onChangeText={set("phone_number")}
            error={errors.phone_number}
            keyboardType="phone-pad"
          />
          <TextField
            label="Bio"
            placeholder="A line about you"
            value={form.bio}
            onChangeText={set("bio")}
            error={errors.bio}
            multiline
            maxLength={BIO_MAX}
            showCount
          />
        </ScrollView>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <Button title="Save changes" onPress={save} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  topBarSpacer: {
    width: 40,
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
  },
  group: {
    marginTop: space.xl,
    marginBottom: space.md,
  },
  row: {
    flexDirection: "row",
    gap: space.md,
  },
  half: {
    flex: 1,
  },
  label: {
    marginBottom: space.sm,
  },
  segment: {
    marginBottom: space.lg,
  },
  years: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.lg,
  },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.bg,
  },
}));
