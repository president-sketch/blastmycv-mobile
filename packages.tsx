import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { GradientHeader } from "@/components/GradientHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  blastCount: number;
  industries?: string[];
  features?: string[];
  isPopular?: boolean;
  isActive: boolean;
}

function parseEmployersReached(val: string | number | undefined): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, ""), 10) || 0;
}

function normalizePackage(raw: any): Package {
  return {
    id: String(raw.id),
    name: raw.name ?? "",
    description: raw.description ?? "",
    price: parseFloat(raw.price ?? "0"),
    currency: raw.currency ?? "GBP",
    blastCount: raw.blastCount ?? raw.blast_count ?? parseEmployersReached(raw.employersReached),
    industries: raw.industries ?? raw.countries ?? [],
    features: raw.features ?? [],
    isPopular: raw.isPopular ?? raw.is_popular ?? false,
    isActive: raw.isActive ?? raw.is_active ?? true,
  };
}

export default function PackagesScreen() {
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const raw = await api.get<any>(ENDPOINTS.packages);
      const list: any[] = Array.isArray(raw) ? raw : (raw.packages ?? []);
      return { packages: list.map(normalizePackage) };
    },
  });

  const packages = data?.packages ?? [];

  return (
    <View style={styles.container}>
      <GradientHeader
        title="CV Blast Packages"
        subtitle="Choose your reach and get noticed"
      />
      <ScrollView
        contentContainerStyle={[styles.content, packages.length === 0 && !isLoading && styles.emptyContent]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : packages.length === 0 ? (
          <EmptyState
            icon="package"
            title="No Packages Available"
            description="Check back soon for available CV blast packages"
          />
        ) : (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={() => setSelectedPkg(pkg)}
            />
          ))
        )}
      </ScrollView>

      {selectedPkg && (
        <PackageDetailModal
          pkg={selectedPkg}
          onClose={() => setSelectedPkg(null)}
          onOrder={() => {
            setSelectedPkg(null);
            router.push({
              pathname: "/create-order",
              params: { packageId: selectedPkg.id },
            } as any);
          }}
        />
      )}
    </View>
  );
}

function PackageCard({ pkg, onSelect }: { pkg: Package; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <Card variant={pkg.isPopular ? "elevated" : "default"} style={styles.pkgCard}>
        {pkg.isPopular && (
          <View style={styles.popularBanner}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        <View style={styles.pkgTop}>
          <View style={styles.pkgLeft}>
            <Text style={styles.pkgName}>{pkg.name}</Text>
            <Text style={styles.pkgDesc} numberOfLines={2}>{pkg.description}</Text>
          </View>
          <View style={styles.pkgPrice}>
            <Text style={styles.priceAmount}>
              {pkg.currency} {Number(pkg.price).toFixed(0)}
            </Text>
          </View>
        </View>
        <View style={styles.pkgMeta}>
          <View style={styles.blastCount}>
            <Feather name="send" size={14} color={Colors.primary} />
            <Text style={styles.blastText}>{pkg.blastCount} blasts</Text>
          </View>
          {pkg.industries?.slice(0, 2).map((ind) => (
            <Badge key={ind} label={ind} variant="neutral" size="sm" />
          ))}
        </View>
        <Button
          label="Select Package"
          onPress={onSelect}
          size="sm"
          style={styles.selectBtn}
        />
      </Card>
    </Pressable>
  );
}

function PackageDetailModal({
  pkg,
  onClose,
  onOrder,
}: {
  pkg: Package;
  onClose: () => void;
  onOrder: () => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={[styles.modalSheet, { paddingBottom: bottomPad + 16 }]}>
          <View style={styles.modalHandle} />
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalName}>{pkg.name}</Text>
            <Text style={styles.modalDesc}>{pkg.description}</Text>
            <View style={styles.modalPrice}>
              <Text style={styles.modalPriceText}>
                {pkg.currency} {Number(pkg.price).toFixed(2)}
              </Text>
              <Text style={styles.modalPriceLabel}>
                {pkg.blastCount} CV blasts included
              </Text>
            </View>
          </LinearGradient>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {pkg.features && pkg.features.length > 0 && (
              <View style={styles.featureList}>
                <Text style={styles.featureTitle}>What's included</Text>
                {pkg.features.map((feat, i) => (
                  <View key={i} style={styles.featureItem}>
                    <View style={styles.featureCheck}>
                      <Feather name="check" size={14} color={Colors.primary} />
                    </View>
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            )}
            {pkg.industries && pkg.industries.length > 0 && (
              <View style={styles.industrySection}>
                <Text style={styles.featureTitle}>Industries Covered</Text>
                <View style={styles.industryTags}>
                  {pkg.industries.map((ind) => (
                    <Badge key={ind} label={ind} variant="primary" />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelBtn}
            />
            <Button
              label="Order Now"
              onPress={onOrder}
              style={styles.orderBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 100 },
  emptyContent: { flex: 1, justifyContent: "center" },
  pkgCard: { overflow: "hidden", padding: 0 },
  popularBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    alignItems: "center",
  },
  popularText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pkgTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
    gap: 12,
  },
  pkgLeft: { flex: 1, gap: 4 },
  pkgName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  pkgDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  pkgPrice: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  priceAmount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  pkgMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  blastCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  blastText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  selectBtn: {
    margin: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    padding: 20,
    gap: 8,
  },
  modalName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  },
  modalPrice: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  modalPriceText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  modalPriceLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  modalBody: { padding: 20 },
  featureList: { gap: 12, marginBottom: 20 },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  featureItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  industrySection: { gap: 10, marginBottom: 16 },
  industryTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: { flex: 1 },
  orderBtn: { flex: 2 },
});
