import { useEffect } from "react";
import { View } from "react-native";
import { MOCK_COMMENTS } from "@/mocks/comments";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CommentsSection } from "./comments-section";
import { useBottomBar } from "@/components/nav/bottom-bar-context";

type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CommentsBottomSheet({
  visible,
  onClose,
}: CommentsBottomSheetProps) {
  const { hide, show } = useBottomBar();

  useEffect(() => {
    if (visible) {
      hide();
      return show;
    }
    show();
  }, [visible, hide, show]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="bg-[rgba(14,14,14,0.97)] rounded-t-[40px] overflow-hidden">
        <CommentsSection comments={MOCK_COMMENTS} />
      </View>
    </BottomSheet>
  );
}
