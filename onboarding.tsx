import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: "zap" as const,
    title: "Blast Your CV\nto Hundreds",
    description:
      "Send your CV to hundreds of recruiters and employers in your industry with a single click.",
    gradient: [Colors.primary, Colors.primaryDark] as [string, string],
  },
  {
    id: "2",
    icon: "target" as const,
    title: "Targeted\nIndustry Reach",
    description:
      "Choose from packages tailored to your industry. We ensure your CV lands in the right hands.",
    gradient: ["#1A56DB", "#0EA5E9"] as [string, string],
  },
  {
    id: "3",
    icon: "bar-chart-2" as const,
    title: "Track Every\nSubmission",
    description:
      "Real-time tracking shows you exactly where your CV was sent and how recruiters responded.",
    gradient: ["#0EA5E9", "#38BDF8"] as [string, string],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.slide, { width }]}
          >
            <View style={[styles.slideContent, { paddingTop: topPad + 40 }]}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          </LinearGradient>
        )}
      />
      <View style={[styles.bottom, { paddingBottom: bottomPad + 24 }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
        <Button
          label={currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
        <Pressable onPress={() => router.push("/(auth)/login")} style={styles.skipBtn}>
          <Text style={styles.skipText}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  slide: {
    flex: 1,
    minHeight: Dimensions.get("window").height * 0.65,
  },
  slideContent: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    gap: 20,
  },
  logo: {
    width: 220,
    height: 90,
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    lineHeight: 42,
  },
  slideDescription: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
  },
  bottom: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
