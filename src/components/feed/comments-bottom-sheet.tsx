import { View } from "react-native";
import { MOCK_COMMENTS } from "@/mocks/comments";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CommentsSection } from "./comments-section";

type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CommentsBottomSheet({ visible, onClose }: CommentsBottomSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="bg-[rgba(14,14,14,0.97)] rounded-t-[40px] overflow-hidden">
        <CommentsSection comments={MOCK_COMMENTS} />
      </View>
    </BottomSheet>
  );
}
