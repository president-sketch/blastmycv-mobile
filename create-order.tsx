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
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import * as Haptics from "expo-haptics";

interface CV {
  id: string;
  title: string;
  fileName: string;
  isActive: boolean;
}

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  blastCount: number;
}

export default function CreateOrderScreen() {
  const { packageId } = useLocalSearchParams<{ packageId: string }>();
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const qc = useQueryClient();

  const { data: cvsData, isLoading: cvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: () => api.get<{ cvs: CV[]; total: number }>(ENDPOINTS.cvs),
  });

  const { data: pkgData, isLoading: pkgLoading } = useQuery({
    queryKey: ["package", packageId],
    queryFn: async () => {
      const raw = await api.get<any>(ENDPOINTS.packages);
      const list: any[] = Array.isArray(raw) ? raw : (raw.packages ?? [raw]);
      const match = list.find((p: any) => String(p.id) === String(packageId)) ?? list[0];
      if (!match) return null;
      return {
        id: String(match.id),
        name: match.name ?? "",
        price: parseFloat(match.price ?? "0"),
        currency: match.currency ?? "GBP",
        blastCount: match.blastCount ?? match.blast_count ??
          parseInt(String(match.employersReached ?? "0").replace(/[^0-9]/g, ""), 10) ?? 0,
      } as Package;
    },
    enabled: !!packageId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { packageId: string; cvId: string; notes?: string }) =>
      api.post<any>(ENDPOINTS.orders, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/order/[id]",
        params: { id: data.id },
      } as any);
    },
    onError: (e: any) => {
      Alert.alert("Order Failed", e.message ?? "Could not place order");
    },
  });

  const handleSubmit = () => {
    if (!selectedCvId) {
      Alert.alert("Select CV", "Please select a CV to blast");
      return;
    }
    Alert.alert(
      "Confirm Order",
      `Place order for ${pkgData?.blastCount ?? "?"} blasts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () =>
            createMutation.mutate({
              packageId: packageId!,
              cvId: selectedCvId,
              notes: notes.trim() || undefined,
            }),
        },
      ]
    );
  };

  const cvs = cvsData?.cvs ?? [];
  const pkg = pkgData;

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
        <Text style={styles.headerTitle}>Create Order</Text>
        {pkg && (
          <Text style={styles.headerSub}>
            {pkg.name} — {pkg.blastCount} blasts · {pkg.currency} {Number(pkg.price).toFixed(2)}
          </Text>
        )}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {pkgLoading ? (
          <SkeletonCard />
        ) : pkg ? (
          <Card variant="elevated" style={styles.pkgSummary}>
            <View style={styles.pkgRow}>
              <View style={styles.pkgIcon}>
                <Feather name="zap" size={22} color={Colors.primary} />
              </View>
              <View style={styles.pkgInfo}>
                <Text style={styles.pkgName}>{pkg.name}</Text>
                <Text style={styles.pkgDetail}>{pkg.blastCount} CV blasts</Text>
              </View>
              <Text style={styles.pkgPrice}>
                {pkg.currency} {Number(pkg.price).toFixed(2)}
              </Text>
            </View>
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>Select CV</Text>
        {cvsLoading ? (
          <SkeletonCard />
        ) : cvs.length === 0 ? (
          <Card style={styles.noCvCard}>
            <View style={styles.noCvContent}>
              <Feather name="file-text" size={28} color={Colors.textMuted} />
              <Text style={styles.noCvTitle}>No CVs Uploaded</Text>
              <Button
                label="Upload CV"
                onPress={() => router.push("/(tabs)/cvs")}
                size="sm"
                variant="outline"
                style={{ marginTop: 8 }}
              />
            </View>
          </Card>
        ) : (
          cvs.map((cv) => (
            <Pressable
              key={cv.id}
              onPress={() => setSelectedCvId(cv.id)}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card
                style={[
                  styles.cvCard,
                  selectedCvId === cv.id && styles.cvCardSelected,
                ]}
              >
                <View style={styles.cvRow}>
                  <View style={[styles.cvIcon, selectedCvId === cv.id && styles.cvIconSelected]}>
                    <Feather
                      name="file-text"
                      size={20}
                      color={selectedCvId === cv.id ? Colors.white : Colors.primary}
                    />
                  </View>
                  <View style={styles.cvInfo}>
                    <Text style={styles.cvTitle}>{cv.title}</Text>
                    <Text style={styles.cvFileName} numberOfLines={1}>{cv.fileName}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selectedCvId === cv.id && styles.radioSelected,
                    ]}
                  >
                    {selectedCvId === cv.id && (
                      <Feather name="check" size={14} color={Colors.white} />
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}

        <Text style={styles.sectionTitle}>Additional Notes (optional)</Text>
        <View style={styles.notesContainer}>
          <Input
            icon="edit-3"
            placeholder="Any specific instructions for your blast..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <Button
          label="Place Order"
          onPress={handleSubmit}
          loading={createMutation.isPending}
          fullWidth
          size="lg"
          disabled={!selectedCvId || !packageId}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
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
  content: { padding: 20, gap: 16 },
  pkgSummary: { padding: 16 },
  pkgRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pkgIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  pkgInfo: { flex: 1, gap: 2 },
  pkgName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  pkgDetail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  pkgPrice: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 4,
  },
  noCvCard: { alignItems: "center", padding: 24 },
  noCvContent: { alignItems: "center", gap: 10 },
  noCvTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  cvCard: { padding: 14 },
  cvCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  cvRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cvIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cvIconSelected: { backgroundColor: Colors.primary },
  cvInfo: { flex: 1, gap: 2 },
  cvTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  cvFileName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  notesContainer: { gap: 8 },
});
