import { Pressable, Image, View } from "react-native";
import { Plus } from "iconoir-react-native";
import { Icon } from "@/components/ui/icon";

const styles = {
  container: "relative",
  image: "bg-white/10",
  addButton:
    "absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-dark bg-primary",
} as const;

type ProfilePictureProps = {
  uri: string;
  size?: number;
  showAddButton?: boolean;
  onPressAdd?: () => void;
};

export function ProfilePicture({
  uri,
  size = 72,
  showAddButton = false,
  onPressAdd,
}: ProfilePictureProps) {
  return (
    <View className={styles.container} style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        className={styles.image}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />

      {showAddButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une photo de profil"
          onPress={onPressAdd}
          className={styles.addButton}
        >
          <Icon icon={Plus} size={18} color="#0E0E0E" />
        </Pressable>
      ) : null}
    </View>
  );
}
