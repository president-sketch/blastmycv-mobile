import React, { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

interface GradientHeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  rightElement?: ReactNode;
  compact?: boolean;
}

export function GradientHeader({
  title,
  subtitle,
  children,
  rightElement,
  compact = false,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: topPad + (compact ? 12 : 20) }]}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          {title && (
            <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>
        {rightElement && <View style={styles.right}>{rightElement}</View>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  inner: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  left: { flex: 1 },
  right: { marginLeft: 16 },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  compactTitle: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});
