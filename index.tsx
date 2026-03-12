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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: orders, isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<{ orders: any[]; total: number }>(ENDPOINTS.orders),
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      api.get<{ notifications: any[]; unreadCount: number }>(
        ENDPOINTS.notifications
      ),
  });

  const activeOrders = orders?.orders?.filter(
    (o) => o.status === "pending" || o.status === "processing"
  );

  const recentOrders = orders?.orders?.slice(0, 3) ?? [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Good {getGreeting()},{"\n"}
              <Text style={styles.name}>
                {user?.firstName ?? "there"}
              </Text>
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/notifications" as any)}
            style={styles.notifBtn}
          >
            <Feather name="bell" size={22} color={Colors.white} />
            {(notifications?.unreadCount ?? 0) > 0 && (
              <View style={styles.notifDot} />
            )}
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Total Blasts"
            value={String(user?.totalBlasts ?? 0)}
            icon="send"
          />
          <StatCard
            label="Active Orders"
            value={String(activeOrders?.length ?? 0)}
            icon="activity"
          />
          <StatCard
            label="CVs Uploaded"
            value="—"
            icon="file-text"
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={ordersLoading}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.qaGrid}>
            <QuickActionCard
              icon="zap"
              label="Blast CV"
              description="Send to recruiters"
              onPress={() => router.push("/(tabs)/packages")}
            />
            <QuickActionCard
              icon="upload"
              label="Upload CV"
              description="Add new CV"
              onPress={() => router.push("/(tabs)/cvs")}
            />
            <QuickActionCard
              icon="bar-chart-2"
              label="View Orders"
              description="Track progress"
              onPress={() => router.push("/(tabs)/orders")}
            />
            <QuickActionCard
              icon="help-circle"
              label="Support"
              description="Get help"
              onPress={() => router.push("/support" as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Pressable onPress={() => router.push("/(tabs)/orders")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {ordersLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : recentOrders.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyInner}>
                <Feather name="package" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptyDesc}>
                  Choose a package to blast your CV to recruiters
                </Text>
                <Button
                  label="Browse Packages"
                  onPress={() => router.push("/(tabs)/packages")}
                  size="sm"
                  style={{ marginTop: 8 }}
                />
              </View>
            </Card>
          ) : (
            recentOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } } as any)}
              >
                <Card style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderName} numberOfLines={1}>
                      {order.packageName}
                    </Text>
                    <OrderStatusBadge status={order.status} />
                  </View>
                  <Text style={styles.orderCV} numberOfLines={1}>
                    CV: {order.cvTitle}
                  </Text>
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderMeta}>
                      {order.sentCount}/{order.blastCount} sent
                    </Text>
                    <Text style={styles.orderAmount}>
                      {order.currency} {Number(order.totalAmount).toFixed(2)}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: keyof typeof Feather.glyphMap }) {
  return (
    <View style={styles.statCard}>
      <Feather name={icon} size={18} color="rgba(255,255,255,0.8)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickActionCard({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.qaCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
    >
      <View style={styles.qaIcon}>
        <Feather name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
      <Text style={styles.qaDesc}>{description}</Text>
    </Pressable>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 24, paddingBottom: 100 },
  quickActions: { gap: 12 },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  qaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  qaCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  qaLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  qaDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  emptyCard: { alignItems: "center", padding: 32 },
  emptyInner: { alignItems: "center", gap: 10 },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  orderCard: { marginBottom: 4 },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  orderName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    flex: 1,
  },
  orderCV: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  orderAmount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
});
