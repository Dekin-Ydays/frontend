import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Send } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { Icon } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  overlay: "flex-1 justify-end bg-black/50",
  backdrop: "absolute inset-0",
  sheet:
    "bg-[rgba(14,14,14,0.97)] rounded-t-[40px] px-5 pt-5 pb-6 gap-5 max-h-[70%]",
  handle: "self-center w-10 h-1.5 bg-white/40 rounded-full mb-1",
  header: "border-b border-white/20 pb-3",
  commentRow: "flex-row gap-2.5",
  commentMeta: "flex-1 gap-1",
  commentName: "font-montserrat-bold text-sm",
  commentDate: "text-xs !text-[#bdbdbd]",
  commentText: "text-sm",
  commentActions: "flex-row items-center justify-between mt-1",
  replyText: "!text-secondary text-sm",
  likeRow: "flex-row items-center gap-1",
  likeCount: "text-xs !text-[#bdbdbd]",
  inputBar: "flex-row items-center gap-2.5 mt-2",
  textInput:
    "flex-1 h-[52px] rounded-full bg-white/10 border border-white/5 px-5 text-white font-montserrat text-sm",
  sendButton:
    "h-[52px] w-[52px] rounded-full bg-white/10 border border-white/5 items-center justify-center",
} as const;

/*
// Mock data
*/
type CommentData = {
  id: string;
  avatarUri: string;
  name: string;
  date: string;
  text: string;
  likes: string;
};

const AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80",
] as const;

const initialComments: CommentData[] = [
  {
    id: "1",
    avatarUri: AVATARS[0],
    name: "Jean-Baptiste Sainte-Beuve",
    date: "11/07/2026",
    text: "J'ai apprécié la danse mais bon tjr pas à mon niveau quoi...",
    likes: "45k",
  },
  {
    id: "2",
    avatarUri: AVATARS[2],
    name: "Quantix",
    date: "21/08/2023",
    text: "C quoi ça de la danse ??",
    likes: "10",
  },
  {
    id: "3",
    avatarUri: AVATARS[0],
    name: "Jean-Baptiste Sainte-Beuve",
    date: "11/07/2026",
    text: "J'ai apprécié la danse mais bon tjr pas à mon niveau quoi...",
    likes: "45k",
  },
  {
    id: "4",
    avatarUri: AVATARS[2],
    name: "Quantix",
    date: "21/08/2023",
    text: "C quoi ça de la danse ??",
    likes: "10",
  },
];

/*
// Secondary components
*/
function CommentItem({ item }: { item: CommentData }) {
  return (
    <View className={styles.commentRow}>
      <ProfilePicture uri={item.avatarUri} size={46} />
      <View className={styles.commentMeta}>
        <AppText className={styles.commentName}>{item.name}</AppText>
        <AppText className={styles.commentDate}>{item.date}</AppText>
        <AppText className={styles.commentText}>{item.text}</AppText>
        <View className={styles.commentActions}>
          <Pressable>
            <AppText className={styles.replyText}>Répondre</AppText>
          </Pressable>
          <View className={styles.likeRow}>
            <Icon icon={Send} size={16} color="#bdbdbd" />
            <AppText className={styles.likeCount}>{item.likes}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const renderComment: ListRenderItem<CommentData> = ({ item }) => (
  <CommentItem item={item} />
);

/*
// Main component
*/
type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CommentsBottomSheet({
  visible,
  onClose,
}: CommentsBottomSheetProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={styles.overlay}
      >
        <Pressable className={styles.backdrop} onPress={onClose} />
        <View className={styles.sheet}>
          <View className={styles.handle} />

          {/* Header */}
          <View className={styles.header}>
            <AppText>Commentaires</AppText>
          </View>

          {/* Comment list */}
          <FlatList
            data={initialComments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-5" />}
          />

          {/* Input bar */}
          <View className={styles.inputBar}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Votre commentaire..."
              placeholderTextColor="#919191"
              className={styles.textInput}
              underlineColorAndroid="transparent"
            />
            <Pressable className={styles.sendButton}>
              <Icon icon={Send} size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
