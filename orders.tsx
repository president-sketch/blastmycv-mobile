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
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { GradientHeader } from "@/components/GradientHeader";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Order {
  id: string;
  packageName: string;
  cvTitle: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  blastCount: number;
  sentCount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

type FilterStatus = "all" | "pending" | "processing" | "completed" | "cancelled";

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "processing" },
  { label: "Pending", value: "pending" },
  { label: "Done", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersScreen() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<{ orders: Order[]; total: number }>(ENDPOINTS.orders),
  });

  const orders = (data?.orders ?? []).filter(
    (o) => filter === "all" || o.status === filter
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        title="My Orders"
        subtitle={`${data?.total ?? 0} total orders`}
      />

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
            <Text
              style={[styles.filterText, filter === f.value && styles.filterActiveText]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.content, orders.length === 0 && !isLoading && styles.emptyContent]}
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
        ) : orders.length === 0 ? (
          <EmptyState
            icon="package"
            title="No Orders Found"
            description={
              filter === "all"
                ? "Start by blasting your CV with one of our packages"
                : `No ${filter} orders found`
            }
            actionLabel={filter === "all" ? "Browse Packages" : undefined}
            onAction={filter === "all" ? () => router.push("/(tabs)/packages") : undefined}
          />
        ) : (
          orders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() =>
                router.push({
                  pathname: "/order/[id]",
                  params: { id: order.id },
                } as any)
              }
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName} numberOfLines={1}>
                      {order.packageName}
                    </Text>
                    <Text style={styles.orderCV} numberOfLines={1}>
                      {order.cvTitle}
                    </Text>
                  </View>
                  <OrderStatusBadge status={order.status} />
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${order.blastCount > 0
                            ? Math.round((order.sentCount / order.blastCount) * 100)
                            : 0}%` as any,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {order.sentCount} / {order.blastCount} sent
                  </Text>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  <Text style={styles.orderAmount}>
                    {order.currency} {Number(order.totalAmount).toFixed(2)}
                  </Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  content: { padding: 20, gap: 12, paddingBottom: 100 },
  emptyContent: { flex: 1, justifyContent: "center" },
  orderCard: { gap: 12 },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderInfo: { flex: 1, gap: 2 },
  orderName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  orderCV: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  progressSection: { gap: 4 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    gap: 8,
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    flex: 1,
  },
  orderAmount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
});
