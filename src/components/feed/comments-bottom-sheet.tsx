import { MOCK_COMMENTS } from "@/mocks/comments";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CommentsSection } from "./comments-section";

type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CommentsBottomSheet({ visible, onClose }: CommentsBottomSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Commentaires">
      <CommentsSection comments={MOCK_COMMENTS} />
    </BottomSheet>
  );
}
