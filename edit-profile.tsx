import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Haptics from "expo-haptics";

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    jobTitle: user?.jobTitle ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const updated = await api.put<any>(ENDPOINTS.user.profile, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        location: form.location.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      updateUser({ ...user!, ...updated });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Text style={styles.headerSub}>Update your personal information</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="First Name"
                icon="user"
                value={form.firstName}
                onChangeText={(v) => update("firstName", v)}
                error={errors.firstName}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Last Name"
                value={form.lastName}
                onChangeText={(v) => update("lastName", v)}
                error={errors.lastName}
              />
            </View>
          </View>
          <Input
            label="Phone"
            icon="phone"
            placeholder="+1 234 567 8900"
            value={form.phone}
            onChangeText={(v) => update("phone", v)}
            keyboardType="phone-pad"
          />
          <Input
            label="Job Title"
            icon="briefcase"
            placeholder="e.g. Senior Software Engineer"
            value={form.jobTitle}
            onChangeText={(v) => update("jobTitle", v)}
          />
          <Input
            label="Location"
            icon="map-pin"
            placeholder="e.g. London, UK"
            value={form.location}
            onChangeText={(v) => update("location", v)}
          />
          <Input
            label="Bio (optional)"
            icon="edit-3"
            placeholder="Tell recruiters about yourself..."
            value={form.bio}
            onChangeText={(v) => update("bio", v)}
            multiline
          />
          <Button
            label="Save Changes"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 28, gap: 6 },
  backBtn: { marginBottom: 12, padding: 4, alignSelf: "flex-start" },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  kav: { flex: 1 },
  form: { padding: 24, gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
});
