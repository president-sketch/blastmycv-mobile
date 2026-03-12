import React from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge, SubmissionStatusBadge } from "@/components/StatusBadge";

interface Order {
  id: string;
  packageName: string;
  cvTitle: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  blastCount: number;
  sentCount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<Order>(`${ENDPOINTS.orders}/${id}`),
    enabled: !!id,
  });

  const { data: submissionsData } = useQuery({
    queryKey: ["submissions", id],
    queryFn: () =>
      api.get<{ submissions: Submission[]; total: number }>(ENDPOINTS.submissions),
    enabled: !!id,
  });

  const submissions = (submissionsData?.submissions ?? []).filter((s) => s.orderId === id);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: topPad }]}>
        <Feather name="loader" size={32} color={Colors.primary} />
      </View>
    );
  }

  if (!order) return null;

  const progress = order.blastCount > 0
    ? Math.round((order.sentCount / order.blastCount) * 100)
    : 0;

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{order.packageName}</Text>
          <Text style={styles.headerSub}>CV: {order.cvTitle}</Text>
          <View style={styles.headerBadge}>
            <OrderStatusBadge status={order.status} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Blast Progress</Text>
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressSent}>{order.sentCount} sent</Text>
              <Text style={styles.progressTotal}>of {order.blastCount}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
            </View>
            <Text style={styles.progressPct}>{progress}% complete</Text>
          </View>
          <View style={styles.statsRow}>
            <StatItem label="Total Amount" value={`${order.currency} ${Number(order.totalAmount).toFixed(2)}`} />
            <StatItem label="Created" value={formatDate(order.createdAt)} />
            <StatItem label="Updated" value={formatDate(order.updatedAt)} />
          </View>
        </Card>

        {order.notes && (
          <Card style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Feather name="file-text" size={16} color={Colors.primary} />
              <Text style={styles.cardTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{order.notes}</Text>
          </Card>
        )}

        <View style={styles.submissionsSection}>
          <Text style={styles.sectionTitle}>
            Submissions ({submissions.length})
          </Text>
          {submissions.length === 0 ? (
            <Card>
              <View style={styles.noSubmissions}>
                <Feather name="send" size={28} color={Colors.textMuted} />
                <Text style={styles.noSubTitle}>No submissions yet</Text>
                <Text style={styles.noSubDesc}>
                  Submissions will appear here once your CV starts being sent
                </Text>
              </View>
            </Card>
          ) : (
            submissions.map((sub) => (
              <Card key={sub.id} style={styles.subCard}>
                <View style={styles.subTop}>
                  <View style={styles.subInfo}>
                    <Text style={styles.companyName}>{sub.companyName}</Text>
                    {sub.recruiterName && (
                      <Text style={styles.recruiterName}>{sub.recruiterName}</Text>
                    )}
                    {sub.jobTitle && (
                      <Text style={styles.jobTitle}>{sub.jobTitle}</Text>
                    )}
                  </View>
                  <SubmissionStatusBadge status={sub.status} />
                </View>
                <View style={styles.subBottom}>
                  {sub.industry && (
                    <View style={styles.industryTag}>
                      <Feather name="briefcase" size={12} color={Colors.textMuted} />
                      <Text style={styles.industryText}>{sub.industry}</Text>
                    </View>
                  )}
                  <Text style={styles.sentAt}>
                    {new Date(sub.sentAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short",
                    })}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: { marginBottom: 16, padding: 4, alignSelf: "flex-start" },
  headerContent: { gap: 6 },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  headerBadge: { marginTop: 4 },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  statsCard: { gap: 16 },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  progressSection: { gap: 8 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  progressSent: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  progressTotal: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  progressPct: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 16,
    gap: 8,
  },
  statItem: { flex: 1, gap: 4 },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  notesCard: { gap: 8 },
  notesHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  notesText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  submissionsSection: { gap: 12 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  noSubmissions: { alignItems: "center", gap: 8, padding: 16 },
  noSubTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  noSubDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  subCard: { padding: 14, gap: 8 },
  subTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  subInfo: { flex: 1, gap: 2 },
  companyName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  recruiterName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  jobTitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  subBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  industryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  industryText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  sentAt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
