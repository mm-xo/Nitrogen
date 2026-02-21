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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { decode } from "base64-arraybuffer";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/Locationcontext";
import { supabase } from "../../lib/supabase";
import { isWithinCampus, CAMPUS_CENTER } from "../location/Distance";
import { withTimeout } from "../utils/promiseUtils";
import { CATEGORY_ICONS } from "../constants/icons";
import { DARK_COLORS } from "../themes/colors";

const DB_CATEGORY_MAP = {
  safety: "Safety",
  food: "Food",
  social: "Social",
  academic: "Academic",
  sports: "Sports",
  lostfound: "LostFound",
  events: "Events",
};

const TITLE_MIN = 3;
const TITLE_MAX = 100;
const DESC_MIN = 10;
const DESC_MAX = 1000;

function isSimulatorCoords(lat, lng) {
  return Math.abs(lat - 37.42) < 0.1 && Math.abs(lng + 122.08) < 0.1;
}

function FieldError({ error }) {
  if (!error) return null;
  return <Text style={styles.fieldError}>{error}</Text>;
}

function getDefaultExpiresAt() {
  const d = new Date();
  d.setHours(d.getHours() + 2);
  return d;
}

function formatExpiresAt(date) {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function getDurationHours(expiresAt) {
  const hours = Math.max(1, Math.round((expiresAt - Date.now()) / (1000 * 60 * 60)));
  return Math.min(hours, 32767); // smallint max
}

export function CreateAlertScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const { coordinates, locationError, requestLocationRetry } = useLocation();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("safety");
  const [expiresAt, setExpiresAt] = useState(getDefaultExpiresAt());
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationDebug, setLocationDebug] = useState(null);
  const [useTestLocation, setUseTestLocation] = useState(false);
  const [showExpiresPicker, setShowExpiresPicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const CATEGORY_OPTIONS = [
    { value: "food", label: "Food", icon: "food" },
    { value: "safety", label: "Safety", icon: "alert-circle" },
    { value: "social", label: "Social", icon: "account-group" },
    { value: "academic", label: "Academic", icon: "school" },
    { value: "sports", label: "Sports", icon: "trophy" },
    { value: "lostfound", label: "Lost & Found", icon: "magnify" },
    { value: "events", label: "Events", icon: "bullhorn" },
  ];

  const titleValid = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
  const descValid = desc.length >= DESC_MIN && desc.length <= DESC_MAX;
  const { within: withinCampus } = isWithinCampus(useTestLocation ? { lat: CAMPUS_CENTER.lat, lng: CAMPUS_CENTER.lng } : coordinates);
  const canSubmit =
    titleValid &&
    descValid &&
    !!category &&
    (useTestLocation || (coordinates && withinCampus)) &&
    !locationError &&
    !loading;

  function validateRealtime(field, value) {
    setErrors((e) => {
      const next = { ...e };
      if (field === "title") {
        if (!value.trim()) next.title = null;
        else if (value.length < TITLE_MIN) next.title = `Min ${TITLE_MIN} characters`;
        else if (value.length > TITLE_MAX) next.title = `Max ${TITLE_MAX} characters`;
        else next.title = null;
      }
      if (field === "desc") {
        if (!value.trim()) next.desc = null;
        else if (value.length < DESC_MIN) next.desc = `Min ${DESC_MIN} characters`;
        else if (value.length > DESC_MAX) next.desc = `Max ${DESC_MAX} characters`;
        else next.desc = null;
      }
      return next;
    });
  }

  function getCoordsForSubmit() {
    if (useTestLocation) {
      return { latitude: CAMPUS_CENTER.lat, longitude: CAMPUS_CENTER.lng };
    }
    if (coordinates) {
      return { latitude: coordinates.lat, longitude: coordinates.lng };
    }
    return null;
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to photos to add an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setPhotoBase64(asset.base64 || null);
    }
  }

  function removePhoto() {
    setPhotoUri(null);
    setPhotoBase64(null);
  }

  async function uploadPhoto(uri, base64Data) {
    if (!uri && !base64Data) return null;
    const ext = (uri || "").split(".").pop() || "jpg";
    const fileName = `${session?.user?.id}-${Date.now()}.${ext}`;

    const arrayBuffer = base64Data ? decode(base64Data) : null;
    if (!arrayBuffer) return null;

    const { data, error } = await supabase.storage
      .from("alert-photos")
      .upload(fileName, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("alert-photos")
      .getPublicUrl(data.path);
    return urlData?.publicUrl || null;
  }

  function setOutsideCampusError(coords) {
    const lat = coords?.latitude ?? coords?.lat;
    const lng = coords?.longitude ?? coords?.lng;
    const sim = lat != null && lng != null && isSimulatorCoords(lat, lng);
    setLocationDebug(
      sim
        ? "Simulators use a fixed location (California). Use the button below to test with campus coordinates."
        : `GPS: ${lat?.toFixed(5)}, ${lng?.toFixed(5)}. You must be within campus (U of M Fort Garry) to create alerts.`
    );
  }

  async function onSubmit() {
    if (!canSubmit) return;

    const coords = getCoordsForSubmit();
    if (!coords) {
      Alert.alert(
        "Location required",
        "Please enable location access and wait for your position to load."
      );
      return;
    }

    setLoading(true);
    setErrors({});
    setLocationDebug(null);

    try {
      // Circle check: must be within campus radius (uses Distance.js)
      if (!useTestLocation) {
        const { within, distanceM } = isWithinCampus(coordinates);
        if (!within) {
          setLocationDebug(
            isSimulatorCoords(coordinates.lat, coordinates.lng)
              ? "Simulators use a fixed location (California). Use the button below to test with campus coordinates."
              : `You are ${Math.round(distanceM)}m from campus. Alerts can only be created on U of M Fort Garry campus.`
          );
          return;
        }
      }
      let photoUrl = null;
      if (photoUri || photoBase64) {
        try {
          photoUrl = await withTimeout(
            uploadPhoto(photoUri, photoBase64),
            20000,
            "Photo upload timed out"
          );
        } catch (err) {
          Alert.alert("Upload failed", err?.message || "Could not upload photo.");
          return;
        }
      }

      const dbCategory = DB_CATEGORY_MAP[category];
      const expiresAtStr = formatExpiresAt(expiresAt);
      const durationHours = getDurationHours(expiresAt);

      const { error } = await withTimeout(
        supabase.from("alerts").insert({
          user_id: session?.user?.id,
          title: title.trim(),
          message: desc.trim(),
          category: dbCategory,
          latitude: coords.latitude,
          longitude: coords.longitude,
          expires_at: expiresAtStr,
          alert_duration_hours: durationHours,
          photo_url: photoUrl,
          is_future_event: false,
        }),
        15000,
        "Could not create alert. Check your connection."
      );

      if (error) {
        const msg = (error?.message || "").toLowerCase();
        if (msg.includes("longitude_check") || msg.includes("latitude_check") || msg.includes("outside") || msg.includes("campus") || msg.includes("bounds")) {
          setOutsideCampusError(coords);
          setUseTestLocation(false);
          return;
        }
        if (msg.includes("title_check") || (msg.includes("title") && msg.includes("length"))) {
          setErrors((e) => ({ ...e, title: "Title must be 3–100 characters" }));
          return;
        }
        if (msg.includes("message_check") || (msg.includes("message") && msg.includes("length"))) {
          setErrors((e) => ({ ...e, desc: "Description must be 10–1000 characters" }));
          return;
        }
        if (msg.includes("category_check")) {
          setErrors((e) => ({ ...e, category: "Invalid category" }));
          return;
        }
        Alert.alert("Error", error?.message || "Could not create alert.");
        return;
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (hasError) => [
    styles.input,
    hasError && styles.inputError,
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={inputStyle(!!errors.title)}
            placeholder="Enter alert title"
            placeholderTextColor={DARK_COLORS.muted}
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              validateRealtime("title", v);
            }}
            editable={!loading}
          />
          <FieldError error={errors.title} />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[inputStyle(!!errors.desc), styles.descInput]}
            placeholder="Describe the alert..."
            placeholderTextColor={DARK_COLORS.muted}
            value={desc}
            onChangeText={(v) => {
              setDesc(v);
              validateRealtime("desc", v);
            }}
            multiline
            editable={!loading}
          />
          <FieldError error={errors.desc} />

          <View style={styles.row}>
            <MaterialCommunityIcons
              name={CATEGORY_ICONS[category]}
              size={20}
              color={DARK_COLORS.accent}
            />
            <Text style={styles.label}>Category</Text>
          </View>
          <TouchableOpacity
            style={[styles.pickerWrap, !!errors.category && styles.inputError]}
            onPress={() => setShowCategoryModal(true)}
            disabled={loading}
          >
            <View style={styles.pickerInner}>
              <MaterialCommunityIcons
                name={CATEGORY_ICONS[category]}
                size={20}
                color={DARK_COLORS.accent}
              />
              <Text style={styles.pickerText}>
                {CATEGORY_OPTIONS.find((o) => o.value === category)?.label || "Safety"}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={22}
                color={DARK_COLORS.muted}
              />
            </View>
          </TouchableOpacity>
          <Modal
            visible={showCategoryModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowCategoryModal(false)}
            >
              <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                <Text style={styles.modalTitle}>Select category</Text>
                {CATEGORY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.modalOption, category === opt.value && styles.modalOptionActive]}
                    onPress={() => {
                      setCategory(opt.value);
                      setErrors((e) => ({ ...e, category: null }));
                      setShowCategoryModal(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={22}
                      color={category === opt.value ? DARK_COLORS.accent : DARK_COLORS.muted}
                    />
                    <Text style={[styles.modalOptionText, category === opt.value && styles.modalOptionTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
          <FieldError error={errors.category} />

          <Text style={styles.label}>Expires at</Text>
          <TouchableOpacity
            style={styles.expiresRow}
            onPress={() => setShowExpiresPicker(true)}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={DARK_COLORS.muted}
            />
            <Text style={styles.expiresText}>
              {expiresAt.toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </Text>
          </TouchableOpacity>
          {showExpiresPicker && (
            <DateTimePicker
              value={expiresAt}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowExpiresPicker(Platform.OS === "ios");
                if (date) setExpiresAt(date);
              }}
            />
          )}

          <Text style={styles.label}>Photo (optional)</Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={removePhoto}
                disabled={loading}
              >
                <MaterialCommunityIcons name="close-circle" size={28} color={DARK_COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={pickPhoto}
              disabled={loading}
            >
              <MaterialCommunityIcons name="camera-plus-outline" size={32} color={DARK_COLORS.muted} />
              <Text style={styles.addPhotoText}>Add photo</Text>
            </TouchableOpacity>
          )}

          {locationError && (
            <>
              <Text style={styles.locationError}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={DARK_COLORS.error} />{" "}
                {locationError}
              </Text>
              <TouchableOpacity
                style={styles.retryLocationBtn}
                onPress={requestLocationRetry}
                disabled={loading}
              >
                <Text style={styles.retryText}>Retry location permission</Text>
              </TouchableOpacity>
            </>
          )}

          {locationDebug && (
            <>
              <Text style={styles.locationError}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={DARK_COLORS.error} />{" "}
                Outside campus
              </Text>
              <Text style={styles.locationDebug} selectable>
                {locationDebug}
              </Text>
              <TouchableOpacity
                style={styles.retryLocationBtn}
                onPress={() => {
                  setUseTestLocation(true);
                  setLocationDebug(null);
                }}
                disabled={loading}
              >
                <Text style={styles.retryText}>Use campus coordinates (for simulator/testing)</Text>
              </TouchableOpacity>
            </>
          )}

          {useTestLocation && (
            <Text style={styles.testLocationHint}>
              Using campus test location
            </Text>
          )}

          <TouchableOpacity
            onPress={onSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
            style={[styles.cta, !canSubmit && styles.ctaDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Submit</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
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
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_COLORS.muted,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    marginBottom: 4,
    color: DARK_COLORS.text,
  },
  inputError: {
    borderColor: DARK_COLORS.error,
  },
  descInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerWrap: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    backgroundColor: DARK_COLORS.inputBg,
  },
  pickerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: DARK_COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: DARK_COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DARK_COLORS.text,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionActive: {
    backgroundColor: "rgba(236, 72, 153, 0.15)",
  },
  modalOptionText: {
    fontSize: 16,
    color: DARK_COLORS.text,
  },
  modalOptionTextActive: {
    color: DARK_COLORS.accent,
    fontWeight: "600",
  },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
  expiresRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  expiresText: {
    fontSize: 16,
    color: DARK_COLORS.text,
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    marginBottom: 16,
    backgroundColor: DARK_COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: DARK_COLORS.border,
  },
  addPhotoText: {
    fontSize: 16,
    color: DARK_COLORS.muted,
  },
  photoPreview: {
    position: "relative",
    marginBottom: 16,
  },
  photoImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.card,
  },
  removePhotoBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  locationError: {
    fontSize: 13,
    color: DARK_COLORS.error,
    marginBottom: 4,
  },
  locationDebug: {
    fontSize: 11,
    color: DARK_COLORS.muted,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  testLocationHint: {
    fontSize: 12,
    color: DARK_COLORS.muted,
    marginBottom: 12,
  },
  retryLocationBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  retryText: {
    fontSize: 14,
    color: DARK_COLORS.accent,
    fontWeight: "600",
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
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 12,
  },
  cancelText: {
    fontSize: 15,
    color: DARK_COLORS.muted,
  },
});
