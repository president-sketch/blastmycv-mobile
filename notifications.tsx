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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { GradientHeader } from "@/components/GradientHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "submission" | "system" | "promotion";
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  order: "package",
  submission: "send",
  system: "info",
  promotion: "tag",
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      api.get<{ notifications: Notification[]; unreadCount: number }>(
        ENDPOINTS.notifications
      ),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`${ENDPOINTS.notifications}/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.notifications ?? [];

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Notifications"
        subtitle={
          (data?.unreadCount ?? 0) > 0
            ? `${data?.unreadCount} unread`
            : "All caught up"
        }
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          notifications.length === 0 && !isLoading && styles.emptyContent,
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
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title="No Notifications"
            description="You'll see updates about your orders and submissions here"
          />
        ) : (
          notifications.map((notif) => (
            <Pressable
              key={notif.id}
              onPress={() => {
                if (!notif.isRead) markReadMutation.mutate(notif.id);
              }}
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
            >
              <Card
                style={[
                  styles.notifCard,
                  !notif.isRead && styles.unreadCard,
                ]}
              >
                <View style={styles.notifContent}>
                  <View
                    style={[
                      styles.iconWrap,
                      !notif.isRead && styles.unreadIcon,
                    ]}
                  >
                    <Feather
                      name={TYPE_ICONS[notif.type] ?? "bell"}
                      size={18}
                      color={notif.isRead ? Colors.textMuted : Colors.primary}
                    />
                  </View>
                  <View style={styles.notifText}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, !notif.isRead && styles.unreadTitle]} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <Text style={styles.notifTime}>{formatTime(notif.createdAt)}</Text>
                  </View>
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
  content: { padding: 20, gap: 10, paddingBottom: 100 },
  emptyContent: { flex: 1, justifyContent: "center" },
  notifCard: { padding: 14 },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  notifContent: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadIcon: { backgroundColor: Colors.primaryMuted },
  notifText: { flex: 1, gap: 4 },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
    flex: 1,
  },
  unreadTitle: { fontFamily: "Inter_700Bold" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notifMessage: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
