import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    if (!email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Invalid email"); return; }
    setError("");
    setLoading(true);
    try {
      await api.post(ENDPOINTS.auth.forgotPassword, { email: email.trim() });
      setSent(true);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong");
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
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.white} />
        </Pressable>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSub}>
          Enter your email and we'll send reset instructions
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.form, { paddingBottom: bottomPad + 24 }]}>
          {sent ? (
            <View style={styles.sentBox}>
              <View style={styles.sentIcon}>
                <Feather name="check-circle" size={40} color={Colors.success} />
              </View>
              <Text style={styles.sentTitle}>Check Your Email</Text>
              <Text style={styles.sentDesc}>
                We've sent password reset instructions to{" "}
                <Text style={styles.sentEmail}>{email}</Text>
              </Text>
              <Button
                label="Back to Sign In"
                onPress={() => router.replace("/(auth)/login")}
                variant="outline"
                fullWidth
                size="lg"
                style={{ marginTop: 8 }}
              />
            </View>
          ) : (
            <>
              <Input
                label="Email Address"
                icon="mail"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
              />
              <Button
                label="Send Reset Link"
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                size="lg"
              />
              <Pressable
                onPress={() => router.back()}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>Back to Sign In</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backBtn: {
    marginBottom: 16,
    padding: 4,
    alignSelf: "flex-start",
  },
  logo: {
    width: 200,
    height: 68,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  headerSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    lineHeight: 22,
  },
  kav: { flex: 1 },
  form: {
    padding: 24,
    gap: 16,
  },
  sentBox: {
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  sentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  sentTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  sentDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  sentEmail: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  backLink: {
    alignItems: "center",
    padding: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
});
