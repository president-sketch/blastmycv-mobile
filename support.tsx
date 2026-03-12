import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import * as Haptics from "expo-haptics";

type Category = "general" | "billing" | "technical" | "order";

const CATEGORIES: { label: string; value: Category; icon: keyof typeof Feather.glyphMap }[] = [
  { label: "General", value: "general", icon: "help-circle" },
  { label: "Billing", value: "billing", icon: "credit-card" },
  { label: "Technical", value: "technical", icon: "settings" },
  { label: "Order Issue", value: "order", icon: "package" },
];

const FAQ = [
  {
    q: "How long does a CV blast take?",
    a: "Typically 1-3 business days after your order is confirmed.",
  },
  {
    q: "Can I track who received my CV?",
    a: "Yes, visit Orders to see submission tracking in real time.",
  },
  {
    q: "What file formats are supported?",
    a: "We support PDF, DOC, and DOCX formats up to 10MB.",
  },
  {
    q: "Can I update my CV after ordering?",
    a: "Orders use the CV at the time of submission. Upload a new CV for future orders.",
  },
];

export default function SupportScreen() {
  const [category, setCategory] = useState<Category>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = "Subject is required";
    if (!message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(ENDPOINTS.support.contact, {
        subject: subject.trim(),
        message: message.trim(),
        category,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Request Submitted",
        "Our team will get back to you within 24 hours.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.headerIcon}>
          <Feather name="headphones" size={32} color={Colors.white} />
        </View>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSub}>We typically respond within 24 hours</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Card style={styles.faqCard}>
            {FAQ.map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  style={styles.faqItem}
                >
                  <Text style={styles.faqQuestion} numberOfLines={expandedFaq === i ? undefined : 1}>
                    {item.q}
                  </Text>
                  <Feather
                    name={expandedFaq === i ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.textMuted}
                  />
                </Pressable>
                {expandedFaq === i && (
                  <Text style={styles.faqAnswer}>{item.a}</Text>
                )}
              </View>
            ))}
          </Card>

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionSubtitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={[
                  styles.categoryChip,
                  category === cat.value && styles.categoryActive,
                ]}
              >
                <Feather
                  name={cat.icon}
                  size={16}
                  color={category === cat.value ? Colors.white : Colors.primary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.value && styles.categoryActiveLabel,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Subject"
            icon="edit-2"
            placeholder="Brief description of your issue"
            value={subject}
            onChangeText={setSubject}
            error={errors.subject}
          />

          <View style={styles.textareaWrap}>
            <Text style={styles.textareaLabel}>Message</Text>
            <View style={[styles.textarea, errors.message ? styles.textareaError : null]}>
              <Feather name="message-square" size={16} color={Colors.textMuted} style={styles.textareaIcon} />
              <Input
                placeholder="Describe your issue in detail..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                style={{ flex: 1, minHeight: 100, textAlignVertical: "top", paddingTop: 8 } as any}
              />
            </View>
            {errors.message && <Text style={styles.fieldError}>{errors.message}</Text>}
          </View>

          <Button
            label="Send Message"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 28, gap: 8 },
  backBtn: { marginBottom: 12, padding: 4, alignSelf: "flex-start" },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
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
  kav: { flex: 1 },
  content: { padding: 20, gap: 16 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    marginTop: -8,
  },
  faqCard: { padding: 8 },
  faqItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 12,
    gap: 8,
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: -8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  categoryActiveLabel: { color: Colors.white },
  textareaWrap: { gap: 6 },
  textareaLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  textarea: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    minHeight: 120,
    alignItems: "flex-start",
    gap: 8,
  },
  textareaError: { borderColor: Colors.error },
  textareaIcon: { marginTop: 2 },
  fieldError: {
    fontSize: 12,
    color: Colors.error,
    fontFamily: "Inter_400Regular",
  },
});
