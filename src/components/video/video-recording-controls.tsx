import { Image, Pressable, View } from "react-native";
import { RefreshDouble } from "iconoir-react-native";
import { BottomBar } from "@/components/ui/bottom-bar";

type VideoRecordingControlsProps = {
  thumbnailUri: string;
  onRecord: () => void;
  onFlip?: () => void;
};

export function VideoRecordingControls({
  thumbnailUri,
  onRecord,
  onFlip,
}: VideoRecordingControlsProps) {
  return (
    <BottomBar className="!justify-between">
      <View className="rounded-full border-2 border-white overflow-hidden h-16 w-16">
        <Image
          source={{ uri: thumbnailUri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <Pressable
        className="h-16 w-16 rounded-full bg-dangerous items-center justify-center"
        onPress={onRecord}
      >
        <View className="h-12 w-12 rounded-full bg-dangerous" />
      </Pressable>

      <Pressable
        className="h-16 w-16 rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center"
        onPress={onFlip}
      >
        <RefreshDouble className="size-8 text-white" />
      </Pressable>
    </BottomBar>
  );
}
