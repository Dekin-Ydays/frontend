import { useState } from "react";
import { View } from "react-native";
import { ShareIos } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/buttons/button";
import { BottomBar } from "@/components/ui/bottom-bar";
import { ShareBottomSheet } from "@/components/feed/share-bottom-sheet";

export default function ScoreResultScreen() {
  const score = 90;
  const [shareVisible, setShareVisible] = useState(false);

  const scoreLabel =
    score >= 95
      ? "Parfait !"
      : score >= 80
        ? "Presque parfait"
        : "Bonne tentative !";

  return (
    <View className="flex-1 bg-dark">
      <View className="px-5 gap-y-6">
        <View className="gap-y-1.5">
          <AppText variant="bolderLargeText">Score {score}%</AppText>
          <AppText variant="secondaryText">{scoreLabel}</AppText>
        </View>

        <View className="h-8 w-full rounded-full bg-white/10">
          <View
            className="h-8 rounded-full bg-secondary w-[64%]"
            style={{ width: `${score}%` }}
          />
        </View>
      </View>

      <BottomBar>
        <Button
          variant="primary"
          label="Partager"
          Icon={ShareIos}
          onPress={() => setShareVisible(true)}
        />
      </BottomBar>

      <ShareBottomSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
    </View>
  );
}
