import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({ label, variant = "primary", size = "md" }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], size === "sm" && styles.small]}>
      <Text style={[styles.label, styles[`${variant}Label`], size === "sm" && styles.smallLabel]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  smallLabel: {
    fontSize: 10,
  },
  primary: { backgroundColor: Colors.primaryMuted },
  primaryLabel: { color: Colors.primary },
  success: { backgroundColor: Colors.successLight },
  successLabel: { color: Colors.success },
  warning: { backgroundColor: Colors.warningLight },
  warningLabel: { color: Colors.warning },
  error: { backgroundColor: Colors.errorLight },
  errorLabel: { color: Colors.error },
  info: { backgroundColor: Colors.infoLight },
  infoLabel: { color: Colors.info },
  neutral: { backgroundColor: Colors.surfaceSecondary },
  neutralLabel: { color: Colors.textSecondary },
});
