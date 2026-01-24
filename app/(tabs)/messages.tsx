import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { AppText } from "@/components/ui/app-text";
import { Home } from "iconoir-react-native";

export default function MessagesScreen() {
  return (
    <View className="flex-1 bg-dark text-dark px-4 gap-2 py-6">
      <AppText variant="title">Messages</AppText>
      <AppText className="mt-2">Vos conversations apparaîtront ici</AppText>
      <Button Icon={Home} label="primary" variant="primary" />
      <Button Icon={Home} label="secondary" variant="secondary" />
      <Button Icon={Home} label="primaryrounded" variant="primaryRounded" />
      <Button Icon={Home} label="secondaryrounded" variant="secondaryRounded" />
    </View>
  );
}
