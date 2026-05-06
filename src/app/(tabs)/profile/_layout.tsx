import { Stack, useRouter } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function ProfileLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        header: () => (
          <TopHeader
            title="MON PROFIL"
            moreButton
            onMore={() => router.push("/profile/settings")}
          />
        ),
      }}
    />
  );
}
