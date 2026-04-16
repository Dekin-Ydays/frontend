import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View } from "react-native";
import { ShareIos } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { useBottomBar } from "@/components/nav/bottom-bar-context";
import { ShareBottomSheet } from "@/components/ui/share-bottom-sheet";



export default function ScoreResultScreen() {
  const { hide, show } = useBottomBar();
  const score = 90;
  const [shareVisible, setShareVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      hide();
      return show;
    }, [hide, show])
  );
  const scoreLabel =
    score >= 95 ? "Parfait !" : score >= 80 ? "Presque parfait" : "Bonne tentative !";

  return (
    <View className="flex-1 bg-dark">
      <View className="px-5 pt-24 gap-y-6">
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

      <BottomActionBar>
        <Button variant="primary" label="Partager" Icon={ShareIos} onPress={() => setShareVisible(true)} />
      </BottomActionBar>

      <ShareBottomSheet visible={shareVisible} onClose={() => setShareVisible(false)} />
    </View>
  );
}
