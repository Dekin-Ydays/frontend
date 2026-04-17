import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>
      <Stack.Screen
        name="conversation"
        options={({ route }) => {
          const params = route.params as
            | { userName?: string; avatarUri?: string; isOnline?: string }
            | undefined;
          return {
            header: () => (
              <TopHeader
                backButton
                userItem={
                  params
                    ? {
                        avatarUri: params.avatarUri ?? "",
                        userName: params.userName ?? "",
                        message: params.isOnline === "true" ? "En ligne" : "",
                        isOnline: params.isOnline === "true",
                      }
                    : undefined
                }
              />
            ),
          };
        }}
      />
    </Stack>
  );
}
