import * as React from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Constants from "expo-constants";

import { backend, isLocalBackend } from "../data";
import { useAuth } from "../context/AuthContext";
import { useAlerts } from "../hooks/useAlerts";
import { makeStyles, radius, space, useTheme } from "../theme";
import { Avatar, Badge, Button, Row, Screen, Section, SegmentedControl, Text, useToast } from "../ui";
import { useTabBarSpace } from "../navigation/TabBar";
import { confirm } from "../utils/dialogs";
import { displayName, isExpired } from "../utils/format";
import { haptics } from "../utils/haptics";

const enter = (i) => FadeInDown.delay(i * 50).duration(420);

function Stat({ value, label }) {
  const s = useStyles();
  return (
    <View style={s.stat}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

export function ProfileScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const { preference, setPreference } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { alerts, now } = useAlerts({ userId: user?.id });
  const bottomSpace = useTabBarSpace();

  const name = displayName(profile, user?.email);
  const live = alerts.filter((a) => !isExpired(a, now)).length;
  const isStudent = (profile?.account_type ?? "student") === "student";

  async function handleSignOut() {
    const ok = await confirm({ title: "Sign out?", confirmLabel: "Sign out", destructive: true });
    if (ok) {
      haptics.soft();
      await signOut();
    }
  }

  async function resetDemo() {
    const ok = await confirm({
      title: "Reset demo alerts?",
      message: "Restores the sample alerts. Alerts you've posted in demo mode are removed.",
      confirmLabel: "Reset",
      destructive: true,
    });
    if (!ok) return;
    await backend.resetAlerts();
    haptics.success();
    toast.show("Demo alerts restored");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={[s.content, { paddingBottom: bottomSpace }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)} style={s.identity}>
          <Avatar name={name} size={72} />
          <Text variant="title" style={s.name}>
            {name}
          </Text>
          <Text variant="footnote" color="textMuted">
            {profile?.student_email || user?.email}
          </Text>
          <View style={s.badges}>
            <Badge label={isStudent ? "Student" : "Community"} tone="accent" icon={isStudent ? "book" : "globe"} />
            {profile?.year_of_study ? <Badge label={`Year ${profile.year_of_study}`} /> : null}
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)} style={s.stats}>
          <Stat value={alerts.length} label="Posted" />
          <View style={s.statDivider} />
          <Stat value={live} label="Live now" />
          <View style={s.statDivider} />
          <Stat value={alerts.length - live} label="Ended" />
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <Section title="About you">
            <Row icon="briefcase" label="Program" value={profile?.program || "—"} />
            <Row icon="home" label="Faculty" value={profile?.faculty || "—"} />
            <Row icon="phone" label="Phone" value={profile?.phone_number || "—"} />
            <Row icon="edit-3" label="Edit profile" onPress={() => navigation.navigate("EditProfile")} />
          </Section>
          {profile?.bio ? (
            <Text variant="footnote" color="textMuted" style={s.bio}>
              “{profile.bio}”
            </Text>
          ) : null}

          <Section title="Appearance">
            <View style={s.appearance}>
              <SegmentedControl
                value={preference}
                onChange={setPreference}
                options={[
                  { value: "system", label: "Auto", icon: "smartphone" },
                  { value: "light", label: "Light", icon: "sun" },
                  { value: "dark", label: "Dark", icon: "moon" },
                ]}
              />
            </View>
          </Section>

          <Section
            title="App"
            footer={
              isLocalBackend
                ? "Demo mode keeps everything on this device. Set EXPO_PUBLIC_BACKEND=supabase to use a hosted project."
                : null
            }
          >
            <Row icon="database" label="Data" value={isLocalBackend ? "On-device demo" : "Supabase"} />
            {isLocalBackend ? <Row icon="rotate-ccw" label="Reset demo alerts" onPress={resetDemo} /> : null}
            <Row icon="info" label="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
          </Section>

          <Button title="Sign out" icon="log-out" variant="danger" onPress={handleSignOut} />
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
  },
  identity: {
    alignItems: "center",
  },
  name: {
    marginTop: space.lg,
    marginBottom: space.xxs,
  },
  badges: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.md,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space.xxl,
    marginBottom: space.xxl,
    paddingVertical: space.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: c.border,
  },
  bio: {
    marginTop: -space.md,
    marginBottom: space.xxl,
    marginHorizontal: space.xs,
  },
  appearance: {
    padding: space.md,
  },
}));
