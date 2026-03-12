import React from "react";
import {
  Linking,
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
import { Card } from "@/components/ui/Card";

const APP_VERSION = "1.0.0";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
        <View style={styles.logoWrap}>
          <Feather name="zap" size={40} color={Colors.white} />
        </View>
        <Text style={styles.logoText}>BlastMyCV</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            BlastMyCV connects job seekers with recruiters and employers across industries.
            We take the effort out of job searching by blasting your CV to hundreds of
            relevant contacts in your sector so you can focus on preparing for interviews.
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <InfoRow icon="shield" label="Privacy Policy" onPress={() => Linking.openURL("https://blastmycv.com/privacy")} />
          <View style={styles.divider} />
          <InfoRow icon="file-text" label="Terms of Service" onPress={() => Linking.openURL("https://blastmycv.com/terms")} />
          <View style={styles.divider} />
          <InfoRow icon="globe" label="Visit Website" onPress={() => Linking.openURL("https://blastmycv.com")} />
          <View style={styles.divider} />
          <InfoRow icon="mail" label="Contact Us" onPress={() => router.push("/support" as any)} />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with care for job seekers worldwide
          </Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} BlastMyCV. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, onPress }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.infoRow, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.infoIcon}>
        <Feather name={icon} size={18} color={Colors.primary} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Feather name="external-link" size={14} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    position: "absolute",
    left: 24,
    top: 0,
    padding: 4,
    marginTop: 16,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  version: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  content: { padding: 20, gap: 16 },
  missionCard: { gap: 10 },
  missionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  missionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  infoCard: { padding: 8, gap: 0 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
  footer: { alignItems: "center", gap: 4, paddingTop: 8 },
  footerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  copyright: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
