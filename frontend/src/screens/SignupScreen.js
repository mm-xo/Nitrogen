import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAuth } from "../context/AuthContext";
import { makeStyles, space } from "../theme";
import {
  Button,
  IconButton,
  PressableScale,
  Screen,
  SegmentedControl,
  Text,
  TextField,
  useToast,
} from "../ui";
import { haptics } from "../utils/haptics";

const STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@myumanitoba\.ca$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const enter = (i) => FadeInDown.delay(60 + i * 50).duration(480);

function friendlyAuthError(error) {
  const msg = error?.message || "";
  if (/already (registered|exists)/i.test(msg)) return "An account with this email already exists.";
  if (/password/i.test(msg)) return "Password is too weak. Use at least 6 characters.";
  return msg || "Sign up failed. Please try again.";
}

export function SignupScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const { signUp } = useAuth();

  const [accountType, setAccountType] = React.useState("student");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const isStudent = accountType === "student";
  const emailOk = (isStudent ? STUDENT_EMAIL_REGEX : EMAIL_REGEX).test(email.trim());

  function validate() {
    const e = {};
    if (!firstName.trim()) e.firstName = "Required";
    else if (firstName.trim().length > 50) e.firstName = "Max 50 characters";
    if (!lastName.trim()) e.lastName = "Required";
    else if (lastName.trim().length > 50) e.lastName = "Max 50 characters";
    if (!email.trim()) e.email = "Required";
    else if (!emailOk) e.email = isStudent ? "Use your @myumanitoba.ca address" : "Enter a valid email";
    if (password.length < 6) e.password = "At least 6 characters";
    if (confirmPassword !== password) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) {
      haptics.warning();
      return;
    }
    setLoading(true);
    const { session, error } = await signUp(email.trim(), password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      account_type: accountType,
    });
    setLoading(false);

    if (error) {
      haptics.error();
      setErrors({ form: friendlyAuthError(error) });
      return;
    }
    haptics.success();
    if (session) {
      toast.show(`Welcome, ${firstName.trim()}`);
    } else {
      toast.show("Check your email", { message: "Confirm your address, then sign in." });
      navigation.navigate("Login");
    }
  }

  const clear = (key) => setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={s.topBar}>
        <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={enter(0)}>
            <Text variant="display">Create account</Text>
            <Text variant="body" color="textMuted" style={s.lede}>
              Post and follow alerts around Fort Garry campus.
            </Text>
          </Animated.View>

          <Animated.View entering={enter(1)} style={s.segment}>
            <SegmentedControl
              value={accountType}
              onChange={(v) => {
                setAccountType(v);
                clear("email");
              }}
              options={[
                { value: "student", label: "Student", icon: "book" },
                { value: "community", label: "Community", icon: "globe" },
              ]}
            />
          </Animated.View>

          <Animated.View entering={enter(2)}>
            <View style={s.nameRow}>
              <TextField
                label="First name"
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  clear("firstName");
                }}
                error={errors.firstName}
                autoCapitalize="words"
                autoComplete="given-name"
                editable={!loading}
                style={s.half}
              />
              <TextField
                label="Last name"
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  clear("lastName");
                }}
                error={errors.lastName}
                autoCapitalize="words"
                autoComplete="family-name"
                editable={!loading}
                style={s.half}
              />
            </View>

            <TextField
              label={isStudent ? "Student email" : "Email"}
              icon="mail"
              placeholder={isStudent ? "name@myumanitoba.ca" : "you@example.com"}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clear("email");
              }}
              error={errors.email}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!loading}
            />
            <TextField
              label="Password"
              icon="lock"
              hint="At least 6 characters"
              value={password}
              secure
              onChangeText={(v) => {
                setPassword(v);
                clear("password");
              }}
              error={errors.password}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!loading}
            />
            <TextField
              label="Confirm password"
              icon="lock"
              value={confirmPassword}
              secure
              onChangeText={(v) => {
                setConfirmPassword(v);
                clear("confirmPassword");
              }}
              error={errors.confirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!loading}
              onSubmitEditing={submit}
            />

            {errors.form ? (
              <Text variant="footnote" color="danger" style={s.formError}>
                {errors.form}
              </Text>
            ) : null}

            <Button title="Create account" onPress={submit} loading={loading} style={s.cta} />
          </Animated.View>

          <View style={s.footer}>
            <Text variant="callout" color="textMuted">
              Already have an account?
            </Text>
            <PressableScale onPress={() => navigation.navigate("Login")} hitSlop={8} accessibilityRole="link">
              <Text variant="callout" color="accent">
                Sign in
              </Text>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  lede: {
    marginTop: space.sm,
  },
  segment: {
    marginTop: space.xxl,
    marginBottom: space.xxl,
  },
  nameRow: {
    flexDirection: "row",
    gap: space.md,
  },
  half: {
    flex: 1,
  },
  formError: {
    marginBottom: space.lg,
  },
  cta: {
    marginTop: space.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: space.xs + 2,
    marginTop: space.xxxl,
  },
}));
