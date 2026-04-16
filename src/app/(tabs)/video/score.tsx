import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ShareIos } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { useBottomBar } from "@/components/nav/bottom-bar-context";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-5 pt-24 gap-y-6",
  progressTrack: "h-8 w-full rounded-full bg-white/10",
  progressFill: "h-8 rounded-full bg-secondary w-[64%]",
} as const;

export default function ScoreResultScreen() {
  const router = useRouter();
  const { hide, show } = useBottomBar();
  const score = 90;

  useEffect(() => {
    hide();
    return show;
  }, [hide, show]);
  const scoreLabel =
    score >= 95 ? "Parfait !" : score >= 80 ? "Presque parfait" : "Bonne tentative !";

  return (
    <View className={styles.screen}>
      <View className={styles.content}>
        <View className="gap-y-1.5">
          <AppText variant="bolderLargeText">Score {score}%</AppText>
          <AppText variant="secondaryText">{scoreLabel}</AppText>
        </View>

        <View className={styles.progressTrack}>
          <View
            className={styles.progressFill}
            style={{ width: `${score}%` }}
          />
        </View>
      </View>

      <BottomActionBar>
        <Button variant="primary" label="Partager" Icon={ShareIos} onPress={() => router.push("/(tabs)/share" as any)} />
      </BottomActionBar>
    </View>
  );
}
