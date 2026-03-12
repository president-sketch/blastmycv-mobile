import React, { useState } from "react";
import {
  Alert,
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
import * as DocumentPicker from "expo-document-picker";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { GradientHeader } from "@/components/GradientHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import * as Haptics from "expo-haptics";

interface CV {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CVsScreen() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cvs"],
    queryFn: () => api.get<{ cvs: CV[]; total: number }>(ENDPOINTS.cvs),
  });

  const deleteMutation = useMutation({
    mutationFn: (cvId: string) => api.delete(`${ENDPOINTS.cvs}/${cvId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cvs"] }),
  });

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "application/pdf",
      } as any);
      formData.append("title", asset.name.replace(/\.[^/.]+$/, ""));

      await api.postMultipart<CV>(ENDPOINTS.cvs, formData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await qc.invalidateQueries({ queryKey: ["cvs"] });
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message ?? "Could not upload CV");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (cv: CV) => {
    Alert.alert("Delete CV", `Delete "${cv.title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(cv.id),
      },
    ]);
  };

  const cvs = data?.cvs ?? [];

  return (
    <View style={styles.container}>
      <GradientHeader
        title="My CVs"
        subtitle={`${data?.total ?? 0} document${(data?.total ?? 0) !== 1 ? "s" : ""}`}
        rightElement={
          <Button
            label={uploading ? "Uploading..." : "Upload"}
            onPress={handleUpload}
            loading={uploading}
            variant="ghost"
            size="sm"
            style={styles.uploadBtn}
          />
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, cvs.length === 0 && !isLoading && styles.emptyContent]}
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
        ) : cvs.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No CVs Yet"
            description="Upload your CV to start blasting it to recruiters and employers"
            actionLabel="Upload CV"
            onAction={handleUpload}
          />
        ) : (
          cvs.map((cv) => (
            <CVCard
              key={cv.id}
              cv={cv}
              onDelete={() => handleDelete(cv)}
              deleting={deleteMutation.isPending && deleteMutation.variables === cv.id}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function CVCard({
  cv,
  onDelete,
  deleting,
}: {
  cv: CV;
  onDelete: () => void;
  deleting: boolean;
}) {
  const ext = cv.fileName.split(".").pop()?.toUpperCase() ?? "PDF";

  return (
    <Card style={styles.cvCard}>
      <View style={styles.cvTop}>
        <View style={styles.cvIcon}>
          <Feather name="file-text" size={24} color={Colors.primary} />
        </View>
        <View style={styles.cvInfo}>
          <View style={styles.cvTitleRow}>
            <Text style={styles.cvTitle} numberOfLines={1}>{cv.title}</Text>
            {cv.isActive && <Badge label="Active" variant="success" size="sm" />}
          </View>
          <Text style={styles.cvMeta}>
            {cv.fileName} • {formatSize(cv.fileSize)}
          </Text>
          <Text style={styles.cvDate}>Uploaded {formatDate(cv.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.cvActions}>
        <View style={styles.extBadge}>
          <Text style={styles.extText}>{ext}</Text>
        </View>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
          disabled={deleting}
        >
          <Feather name="trash-2" size={18} color={Colors.error} />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 12, paddingBottom: 100 },
  emptyContent: { flex: 1, justifyContent: "center" },
  uploadBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cvCard: { padding: 16, gap: 12 },
  cvTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  cvIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cvInfo: { flex: 1, gap: 4 },
  cvTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  cvTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    flex: 1,
  },
  cvMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  cvDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  cvActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  extBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  extText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  deleteBtn: {
    padding: 8,
  },
});
