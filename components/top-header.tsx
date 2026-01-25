import type { ComponentType } from "react";
import { Pressable, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavArrowLeft, MoreHoriz, EditPencil } from "iconoir-react-native";
import { AppText } from "./ui/app-text";
import { UserItem, type UserItemProps } from "./user-item";

/*
// Tailwind styles
*/
const styles = {
  bar: "absolute top-0 left-0 right-0 bg-gradient-to-t from-secondary/0 to-secondary/80 h-24 flex-row items-center justify-between px-4",
  row: "flex-row items-center gap-3",
  icon: "h-8 w-8 text-white",
  avatar: "h-12 w-12 rounded-full bg-secondary",
} as const;

/*
// Secondary components
*/
type IconButtonProps = {
  Icon: ComponentType<{ className?: string }>;
  onPress?: () => void;
  label: string;
};

function IconButton({ Icon, onPress, label }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Icon className={styles.icon} />
    </Pressable>
  );
}

/*
// Main component
*/
type TopHeaderProps = {
  title?: string;
  backButton?: boolean;
  onBack?: () => void;

  editButton?: boolean;
  onEdit?: () => void;
  moreButton?: boolean;
  onMore?: () => void;
  userItem?: UserItemProps;
  avatarUri?: string;
};

export function TopHeader({
  title,
  backButton = false,
  onBack,
  editButton = false,
  onEdit,
  moreButton = false,
  onMore,
  userItem,
  avatarUri,
}: TopHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View className={styles.bar} style={{ paddingTop: insets.top }}>
      <View className={styles.row}>
        {backButton && (
          <IconButton Icon={NavArrowLeft} onPress={handleBack} label="Retour" />
        )}
        {userItem && <UserItem {...userItem} />}
        {title && <AppText variant="title">{title}</AppText>}
      </View>
      {(editButton || moreButton || avatarUri) && (
        <View className={styles.row}>
          {editButton && (
            <IconButton Icon={EditPencil} onPress={onEdit} label="Modifier" />
          )}
          {moreButton && (
            <IconButton Icon={MoreHoriz} onPress={onMore} label="Plus" />
          )}
          {avatarUri && (
            <Image source={{ uri: avatarUri }} className={styles.avatar} />
          )}
        </View>
      )}
    </View>
  );
}
