import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useAuth } from "../context/AuthContext";
import { DEMO_USER, isLocalBackend } from "../data";
import { makeStyles, space } from "../theme";
import { Button, Card, Icon, PressableScale, Screen, Text, TextField, useToast } from "../ui";
import { Logo } from "../components/Logo";
import { haptics } from "../utils/haptics";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const enter = (i) => FadeInDown.delay(80 + i * 60).duration(520);

export function LoginScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const passwordRef = React.useRef(null);

  const canSubmit = EMAIL_REGEX.test(email.trim()) && password.length > 0 && !loading;

  async function submit(creds = { email, password }, setBusy = setLoading) {
    setError(null);
    setBusy(true);
    const { error: err } = await signIn(creds.email, creds.password);
    setBusy(false);
    if (err) {
      haptics.error();
      setError(err.message || "Couldn't sign you in.");
    } else {
      haptics.success();
    }
  }

  async function forgotPassword() {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Enter your email above, then tap “Forgot password?”.");
      return;
    }
    const { error: err } = await resetPassword(email.trim());
    if (err) toast.show("Can't reset right now", { tone: "info", message: err.message, duration: 5000 });
    else toast.show("Check your inbox", { message: "We sent you a reset link." });
  }

  return (
    <Screen edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(500)}>
            <Logo />
          </Animated.View>

          <View style={s.main}>
            <Animated.View entering={enter(0)}>
              <Text variant="display">Welcome back</Text>
              <Text variant="body" color="textMuted" style={s.lede}>
                What's happening around campus, as it happens.
              </Text>
            </Animated.View>

            <Animated.View entering={enter(1)} style={s.form}>
              <TextField
                label="Email"
                icon="mail"
                placeholder="you@myumanitoba.ca"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />
              <TextField
                ref={passwordRef}
                label="Password"
                icon="lock"
                placeholder="Your password"
                value={password}
                secure
                onChangeText={(v) => {
                  setPassword(v);
                  setError(null);
                }}
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={() => canSubmit && submit()}
                editable={!loading}
                style={s.passwordField}
              />
              <PressableScale onPress={forgotPassword} style={s.forgot} hitSlop={8} accessibilityRole="button">
                <Text variant="callout" color="textMuted">
                  Forgot password?
                </Text>
              </PressableScale>

              {error ? (
                <Animated.View entering={FadeIn} style={s.error}>
                  <Icon name="alert-circle" size={16} color="danger" />
                  <Text variant="footnote" color="danger" style={s.errorText}>
                    {error}
                  </Text>
                </Animated.View>
              ) : null}

              <Button title="Sign in" onPress={() => submit()} loading={loading} disabled={!canSubmit} />
            </Animated.View>

            {isLocalBackend ? (
              <Animated.View entering={enter(2)}>
                <Card style={s.demo}>
                  <View style={s.demoHead}>
                    <Icon name="hard-drive" size={16} color="accent" />
                    <Text variant="overline" color="accent">
                      Demo mode
                    </Text>
                  </View>
                  <Text variant="footnote" color="textMuted" style={s.demoText}>
                    No server needed — accounts and alerts live on this device, with sample alerts around Fort Garry campus.
                  </Text>
                  <Button
                    title="Continue with demo account"
                    variant="secondary"
                    size="md"
                    icon="arrow-right"
                    loading={demoLoading}
                    onPress={() => submit(DEMO_USER, setDemoLoading)}
                  />
                </Card>
              </Animated.View>
            ) : null}
          </View>

          <Animated.View entering={enter(3)} style={s.footer}>
            <Text variant="callout" color="textMuted">
              New to Nitrogen?
            </Text>
            <PressableScale onPress={() => navigation.navigate("Signup")} hitSlop={8} accessibilityRole="link">
              <Text variant="callout" color="accent">
                Create an account
              </Text>
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: space.xxl,
    paddingTop: space.xl,
    paddingBottom: space.xl,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: space.huge,
  },
  lede: {
    marginTop: space.sm,
  },
  form: {
    marginTop: space.xxxl,
  },
  passwordField: {
    marginBottom: space.sm,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: space.xl,
  },
  error: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    marginBottom: space.lg,
  },
  errorText: {
    flex: 1,
  },
  demo: {
    marginTop: space.xxl,
  },
  demoHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  demoText: {
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: space.xs + 2,
  },
}));
