import type { TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";
import { useState } from "react";
import { Eye, EyeClosed } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";

type AppInputType = "text" | "password" | "email" | "number" | "phone" | "url";

type AppInputProps = Omit<TextInputProps, "className"> & {
  type?: AppInputType;
  label?: string;
  labelClassName?: string;
  className?: string;
};

const typeProps: Record<AppInputType, Partial<TextInputProps>> = {
  text: {},
  password: {
    secureTextEntry: true,
    autoCapitalize: "none",
    autoCorrect: false,
    textContentType: "password",
    autoComplete: "password",
  },
  email: {
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
    textContentType: "emailAddress",
    autoComplete: "email",
  },
  number: { keyboardType: "numeric" },
  phone: {
    keyboardType: "phone-pad",
    textContentType: "telephoneNumber",
    autoComplete: "tel",
  },
  url: {
    keyboardType: "url",
    autoCapitalize: "none",
    autoCorrect: false,
    textContentType: "URL",
    autoComplete: "url",
  },
};

export function AppInput({
  type = "text",
  label,
  labelClassName,
  className,
  ...props
}: AppInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordType = type === "password";

  const input = (
    <View className="relative">
      <TextInput
        {...typeProps[type]}
        {...props}
        secureTextEntry={
          isPasswordType ? !isPasswordVisible : props.secureTextEntry
        }
        className={`h-16 w-full rounded-2xl bg-white/10 border border-white/5 backdrop-blur-sm px-5 font-montserrat text-white placeholder:text-gray outline-none focus:border-secondary transition-all duration-300 ${isPasswordType ? "pr-14" : ""} ${className ?? ""}`}
      />
      {isPasswordType && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isPasswordVisible
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
          onPress={() => setIsPasswordVisible((v) => !v)}
          className="absolute right-4 h-16 justify-center"
        >
          <AppIcon
            icon={isPasswordVisible ? Eye : EyeClosed}
            size="lg"
            color="#FFFFFF"
          />
        </Pressable>
      )}
    </View>
  );

  if (!label) return input;

  return (
    <View className="flex-col gap-2.5">
      <AppText className={`text-sm text-lightgray ${labelClassName ?? ""}`}>
        {label}
      </AppText>
      {input}
    </View>
  );
}
