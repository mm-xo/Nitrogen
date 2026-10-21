import * as React from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";

import { ALERT_LIMITS, backend } from "../data";
import { CATEGORY_LIST, getCategory } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { isWithinCampus, jitteredCampusPoint } from "../location/Distance";
import { makeStyles, radius, space, useTheme } from "../theme";
import { Button, Chip, Icon, IconButton, PressableScale, Text, TextField, useToast } from "../ui";
import { DateTimeField } from "../components/DateTimeField";
import { formatClock, formatDateTime, formatDistance } from "../utils/format";
import { haptics } from "../utils/haptics";

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "2 hr", minutes: 120 },
  { label: "4 hr", minutes: 240 },
  { label: "8 hr", minutes: 480 },
];

const minutesFromNow = (m) => new Date(Date.now() + m * 60_000);

function FieldLabel({ children, right }) {
  const s = useStyles();
  return (
    <View style={s.fieldLabel}>
      <Text variant="overline" color="textSubtle">
        {children}
      </Text>
      {right}
    </View>
  );
}

function LocationStatus({ state, distance, onRetry, onUseCampus, onUseDevice }) {
  const s = useStyles();
  const { colors } = useTheme();
  const content = {
    campus: {
      icon: "map-pin",
      tone: "accent",
      title: "Pinned near campus centre",
      body: "Test location — handy on simulators or off campus.",
      action: onUseDevice ? { label: "Use my location", onPress: onUseDevice } : null,
    },
    onCampus: {
      icon: "check-circle",
      tone: "success",
      title: "You're on campus",
      body: "The alert will be pinned where you are now.",
    },
    offCampus: {
      icon: "alert-triangle",
      tone: "warning",
      title: `You're ${formatDistance(distance)} from campus`,
      body: "Alerts can only be posted on Fort Garry campus.",
      action: { label: "Pin to campus instead", onPress: onUseCampus },
    },
    denied: {
      icon: "map-pin",
      tone: "textMuted",
      title: "Location is off",
      body: "Turn on location access, or pin the alert to campus.",
      action: { label: "Pin to campus instead", onPress: onUseCampus },
      secondary: { label: "Try again", onPress: onRetry },
    },
    pending: {
      icon: null,
      tone: "textMuted",
      title: "Finding your location…",
      body: "Hang tight, this usually takes a second.",
      action: { label: "Pin to campus instead", onPress: onUseCampus },
    },
  }[state];

  return (
    <Animated.View key={state} entering={FadeIn.duration(220)} style={s.locationCard}>
      <View style={s.locationRow}>
        {content.icon ? (
          <Icon name={content.icon} size={18} color={content.tone} />
        ) : (
          <ActivityIndicator size="small" color={colors.textMuted} />
        )}
        <View style={s.flex}>
          <Text variant="callout">{content.title}</Text>
          <Text variant="caption" color="textMuted" style={s.locationBody}>
            {content.body}
          </Text>
        </View>
      </View>
      {content.action || content.secondary ? (
        <View style={s.locationActions}>
          {content.secondary ? (
            <Button title={content.secondary.label} variant="secondary" size="sm" full={false} onPress={content.secondary.onPress} />
          ) : null}
          {content.action ? (
            <Button title={content.action.label} variant="secondary" size="sm" full={false} onPress={content.action.onPress} />
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

export function CreateAlertScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const { coordinates, locationError, requestLocationRetry } = useLocation();

  const [category, setCategory] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [duration, setDuration] = React.useState(120);
  const [customEnd, setCustomEnd] = React.useState(() => minutesFromNow(180));
  const [photo, setPhoto] = React.useState(null);
  const [pinToCampus, setPinToCampus] = React.useState(false);
  const [campusPoint] = React.useState(() => jitteredCampusPoint());
  const [attempted, setAttempted] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const { within, distanceM } = isWithinCampus(coordinates);
  const locationState = pinToCampus
    ? "campus"
    : coordinates
      ? within
        ? "onCampus"
        : "offCampus"
      : locationError
        ? "denied"
        : "pending";
  const point = pinToCampus ? campusPoint : coordinates;
  const locationOk = locationState === "campus" || locationState === "onCampus";

  const expiresAt = duration === "custom" ? customEnd : minutesFromNow(duration);

  const t = title.trim();
  const m = message.trim();
  const errors = {
    category: !category ? "Pick a category" : null,
    title:
      t.length < ALERT_LIMITS.titleMin ? `At least ${ALERT_LIMITS.titleMin} characters` : null,
    message:
      m.length < ALERT_LIMITS.messageMin ? `At least ${ALERT_LIMITS.messageMin} characters` : null,
    expires: expiresAt.getTime() <= Date.now() + 60_000 ? "Pick a time in the future" : null,
    ...serverErrors,
  };
  const valid = Object.values(errors).every((e) => !e) && locationOk;
  const show = (key, dirty) => (attempted || dirty ? errors[key] : null);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.show("Photo access is off", { tone: "info", message: "Allow photo access in Settings to attach one." });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      setPhoto({ uri: a.uri, base64: a.base64 ?? null, mimeType: a.mimeType ?? null });
      haptics.soft();
    }
  }

  async function submit() {
    setAttempted(true);
    if (!valid) {
      haptics.warning();
      return;
    }
    setSubmitting(true);
    try {
      const photoUrl = photo
        ? await backend.storage.uploadPhoto({ ...photo, userId: user.id })
        : null;
      await backend.alerts.create({
        user_id: user.id,
        title: t,
        message: m,
        category: getCategory(category).db,
        latitude: point.lat,
        longitude: point.lng,
        expires_at: expiresAt.toISOString(),
        photo_url: photoUrl,
      });
      haptics.success();
      toast.show("Alert posted", { message: "It's live on the map and feed." });
      navigation.goBack();
    } catch (e) {
      haptics.error();
      if (e?.code === "outside_campus") {
        toast.show("Outside campus", { tone: "error", message: e.message });
      } else if (e?.field) {
        setServerErrors({ [e.field]: e.message });
      } else {
        toast.show("Couldn't post alert", { tone: "error", message: e?.message });
      }
      setSubmitting(false);
    }
  }

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: Platform.OS === "ios" ? space.lg : insets.top + space.sm }]}>
        <Text variant="title">New alert</Text>
        <IconButton icon="x" variant="tinted" size={34} accessibilityLabel="Close" onPress={() => navigation.goBack()} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(40).duration(400)}>
            <FieldLabel>Category</FieldLabel>
            <View style={s.categories}>
              {CATEGORY_LIST.map((c) => (
                <Chip
                  key={c.value}
                  label={c.label}
                  icon={c.icon}
                  color={c.color}
                  selected={category === c.value}
                  onPress={() => {
                    setCategory(c.value);
                    setServerErrors({});
                  }}
                />
              ))}
            </View>
            {show("category", false) ? (
              <Text variant="caption" color="danger" style={s.inlineError}>
                {errors.category}
              </Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(90).duration(400)} style={s.block}>
            <TextField
              label="Title"
              placeholder="What's happening?"
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                setServerErrors({});
              }}
              maxLength={ALERT_LIMITS.titleMax}
              showCount
              error={show("title", t.length > 0)}
              returnKeyType="next"
              editable={!submitting}
            />
            <TextField
              label="Details"
              placeholder="Where exactly, until when, who to ask…"
              value={message}
              onChangeText={(v) => {
                setMessage(v);
                setServerErrors({});
              }}
              maxLength={ALERT_LIMITS.messageMax}
              showCount
              multiline
              error={show("message", m.length > 0)}
              editable={!submitting}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(400)} layout={LinearTransition} style={s.block}>
            <FieldLabel
              right={
                <Text variant="caption" color="textMuted">
                  Ends {duration === "custom" ? formatDateTime(expiresAt) : `at ${formatClock(expiresAt)}`}
                </Text>
              }
            >
              Duration
            </FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.bleed} contentContainerStyle={s.durations}>
              {DURATIONS.map((d) => (
                <Chip key={d.minutes} label={d.label} size="sm" selected={duration === d.minutes} onPress={() => setDuration(d.minutes)} />
              ))}
              <Chip label="Custom" icon="calendar" size="sm" selected={duration === "custom"} onPress={() => setDuration("custom")} />
            </ScrollView>
            {duration === "custom" ? (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={s.custom}>
                <DateTimeField value={customEnd} onChange={setCustomEnd} minimumDate={new Date()} />
              </Animated.View>
            ) : null}
            {show("expires", duration === "custom") ? (
              <Text variant="caption" color="danger" style={s.inlineError}>
                {errors.expires}
              </Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(190).duration(400)} layout={LinearTransition} style={s.block}>
            <FieldLabel>Photo · optional</FieldLabel>
            {photo ? (
              <Animated.View entering={FadeIn.duration(250)} style={s.photoWrap}>
                <Image source={{ uri: photo.uri }} style={s.photo} />
                <IconButton
                  icon="x"
                  size={30}
                  variant="floating"
                  accessibilityLabel="Remove photo"
                  onPress={() => setPhoto(null)}
                  style={s.photoRemove}
                />
              </Animated.View>
            ) : (
              <PressableScale onPress={pickPhoto} haptic style={s.addPhoto} accessibilityRole="button" accessibilityLabel="Add photo">
                <Icon name="image" size={20} color="textMuted" />
                <Text variant="callout" color="textMuted">
                  Add a photo
                </Text>
              </PressableScale>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(400)} layout={LinearTransition} style={s.block}>
            <FieldLabel>Location</FieldLabel>
            <LocationStatus
              state={locationState}
              distance={distanceM}
              onRetry={requestLocationRetry}
              onUseCampus={() => {
                haptics.tap();
                setPinToCampus(true);
              }}
              onUseDevice={coordinates ? () => setPinToCampus(false) : null}
            />
          </Animated.View>
        </ScrollView>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <Button
            title="Post alert"
            icon="send"
            onPress={submit}
            loading={submitting}
            disabled={attempted && !valid}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.xxxl,
  },
  block: {
    marginTop: space.xxl,
  },
  fieldLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.md,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  inlineError: {
    marginTop: space.sm,
  },
  bleed: {
    marginHorizontal: -space.xl,
  },
  durations: {
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  custom: {
    marginTop: space.md,
  },
  addPhoto: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    height: 72,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: c.borderStrong,
  },
  photoWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: c.surfaceAlt,
  },
  photoRemove: {
    position: "absolute",
    top: space.sm,
    right: space.sm,
  },
  locationCard: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  locationRow: {
    flexDirection: "row",
    gap: space.md,
  },
  locationBody: {
    marginTop: 2,
  },
  locationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: space.sm,
    marginTop: space.md,
  },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.bg,
  },
}));
