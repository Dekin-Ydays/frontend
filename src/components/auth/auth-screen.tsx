import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { TopHeader } from "@/components/nav/top-header";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";

type AuthScreenProps = {
  title: string;
  backButton?: boolean;
  contentClassName?: string;
  bottomBar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthScreen({
  title,
  backButton,
  contentClassName = "px-5 pt-24 pb-36 gap-y-6",
  bottomBar,
  footer,
  children,
}: AuthScreenProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <TopHeader title={title} backButton={backButton} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className={contentClassName}>{children}</View>
      </ScrollView>
      {bottomBar && <BottomActionBar>{bottomBar}</BottomActionBar>}
      {footer}
    </KeyboardAvoidingView>
  );
}
