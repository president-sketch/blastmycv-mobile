import React, { useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Card } from "@/components/ui/Card";
import { SubmissionStatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface Submission {
  id: string;
  orderId: string;
  companyName: string;
  recruiterName?: string;
  jobTitle?: string;
  industry?: string;
  status: "sent" | "opened" | "replied" | "rejected";
  sentAt: string;
}

type FilterStatus = "all" | "sent" | "opened" | "replied" | "rejected";

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Opened", value: "opened" },
  { label: "Replied", value: "replied" },
  { label: "Rejected", value: "rejected" },
];

export default function SubmissionsScreen() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["submissions"],
    queryFn: () =>
      api.get<{ submissions: Submission[]; total: number }>(ENDPOINTS.submissions),
  });

  const submissions = (data?.submissions ?? []).filter(
    (s) => filter === "all" || s.status === filter
  );

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
        <Text style={styles.headerTitle}>Submission History</Text>
        <Text style={styles.headerSub}>
          {data?.total ?? 0} total submissions
        </Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.filterChip, filter === f.value && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterActiveText]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          submissions.length === 0 && !isLoading && styles.emptyContent,
        ]}
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
          </>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon="send"
            title="No Submissions Found"
            description="Your CV submissions will appear here after placing an order"
          />
        ) : (
          submissions.map((sub) => (
            <Card key={sub.id} style={styles.subCard}>
              <View style={styles.subTop}>
                <View style={styles.companyIcon}>
                  <Feather name="briefcase" size={20} color={Colors.primary} />
                </View>
                <View style={styles.subInfo}>
                  <Text style={styles.companyName}>{sub.companyName}</Text>
                  {sub.recruiterName && (
                    <Text style={styles.recruiterName}>{sub.recruiterName}</Text>
                  )}
                </View>
                <SubmissionStatusBadge status={sub.status} />
              </View>
              <View style={styles.subDetails}>
                {sub.jobTitle && (
                  <View style={styles.detailRow}>
                    <Feather name="briefcase" size={13} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{sub.jobTitle}</Text>
                  </View>
                )}
                {sub.industry && (
                  <View style={styles.detailRow}>
                    <Feather name="tag" size={13} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{sub.industry}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Feather name="clock" size={13} color={Colors.textMuted} />
                  <Text style={styles.detailText}>
                    {new Date(sub.sentAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 28, gap: 6 },
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
  filterBar: { maxHeight: 56, backgroundColor: Colors.surface },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  filterActiveText: { color: Colors.white },
  content: { padding: 20, gap: 12, paddingBottom: 60 },
  emptyContent: { flex: 1, justifyContent: "center" },
  subCard: { gap: 12 },
  subTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  companyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  subInfo: { flex: 1, gap: 2 },
  companyName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  recruiterName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  subDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
