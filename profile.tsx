import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.jobTitle && (
            <Text style={styles.jobTitle}>{user.jobTitle}</Text>
          )}
        </View>

        {user?.location && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.locationText}>{user.location}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatItem label="Total Blasts" value={String(user?.totalBlasts ?? 0)} icon="send" />
          <View style={styles.statDivider} />
          <StatItem label="Active Orders" value={String(user?.activeOrders ?? 0)} icon="activity" />
          <View style={styles.statDivider} />
          <StatItem label="Member Since" value={user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : "—"} icon="calendar" />
        </View>

        <MenuSection title="Account">
          <MenuItem
            icon="user"
            label="Edit Profile"
            onPress={() => router.push("/edit-profile" as any)}
          />
          <MenuItem
            icon="lock"
            label="Change Password"
            onPress={() => router.push("/change-password" as any)}
          />
          <MenuItem
            icon="bell"
            label="Notifications"
            onPress={() => router.push("/(tabs)/notifications" as any)}
          />
        </MenuSection>

        <MenuSection title="Services">
          <MenuItem
            icon="file-text"
            label="My CVs"
            onPress={() => router.push("/(tabs)/cvs")}
          />
          <MenuItem
            icon="package"
            label="Browse Packages"
            onPress={() => router.push("/(tabs)/packages")}
          />
          <MenuItem
            icon="bar-chart-2"
            label="My Orders"
            onPress={() => router.push("/(tabs)/orders")}
          />
          <MenuItem
            icon="clock"
            label="Submission History"
            onPress={() => router.push("/submissions" as any)}
          />
        </MenuSection>

        <MenuSection title="Support">
          <MenuItem
            icon="help-circle"
            label="Contact Support"
            onPress={() => router.push("/support" as any)}
          />
          <MenuItem
            icon="info"
            label="About BlastMyCV"
            onPress={() => router.push("/about" as any)}
          />
        </MenuSection>

        <Button
          label="Sign Out"
          onPress={handleLogout}
          loading={loggingOut}
          variant="outline"
          fullWidth
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: keyof typeof Feather.glyphMap }) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon} size={18} color={Colors.primary} style={{ marginBottom: 4 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.menuCard}>
        {children}
      </Card>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.menuIcon, destructive && styles.menuIconDestructive]}>
        <Feather
          name={icon}
          size={18}
          color={destructive ? Colors.error : Colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>
        {label}
      </Text>
      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 32 },
  avatarSection: { alignItems: "center", gap: 8, marginBottom: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 4,
  },
  initials: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  jobTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  content: { padding: 20, gap: 20 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    paddingLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: { padding: 4, gap: 0 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconDestructive: { backgroundColor: Colors.errorLight },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  menuLabelDestructive: { color: Colors.error },
  logoutBtn: {
    borderColor: Colors.error,
  },
});
