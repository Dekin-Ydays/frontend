import type { AppIconComponent } from "@/components/ui/app-icon";
import { EditPencil, MoreHoriz, ArrowLeft } from "iconoir-react-native";
import { Pressable, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "../ui/app-text";
import { AppIcon } from "../ui/app-icon";
import { UserItem, type UserItemProps } from "@/components/profile/user-item";
import { TopBar } from "../ui/top-bar";

/*
// Secondary components
*/
type IconButtonProps = {
  icon: AppIconComponent;
  onPress?: () => void;
  label: string;
};

function IconButton({ icon, onPress, label }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <AppIcon icon={icon} size="lg" color="#FFFFFF" />
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
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <TopBar className="!from-secondary/10 !to-secondary/0 bg-dark">
      <View className="flex-row items-center gap-5">
        {backButton && (
          <IconButton icon={ArrowLeft} onPress={handleBack} label="Retour" />
        )}
        {userItem && <UserItem {...userItem} />}
        {title && <AppText variant="title">{title}</AppText>}
      </View>
      {(editButton || moreButton || avatarUri) && (
        <View className="flex-row items-center gap-3">
          {editButton && (
            <IconButton icon={EditPencil} onPress={onEdit} label="Modifier" />
          )}
          {moreButton && (
            <IconButton icon={MoreHoriz} onPress={onMore} label="Plus" />
          )}
          {avatarUri && (
            <Image
              source={{ uri: avatarUri }}
              className="h-12 w-12 rounded-full bg-secondary"
            />
          )}
        </View>
      )}
    </TopBar>
  );
}
