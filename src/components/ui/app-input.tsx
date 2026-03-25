import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";

/*
// Tailwind styles
*/
const styles = {
  baseInput:
    "h-16 w-full rounded-2xl bg-white/10 border border-white/5 px-4 font-montserrat text-white placeholder:text-gray outline-none focus:border-secondary",
  transition: "transition-all duration-300",
} as const;

/*
// Main component
*/
type AppInputType = "text" | "password" | "email" | "number" | "phone" | "url";

type AppInputProps = Omit<TextInputProps, "className"> & {
  type?: AppInputType;
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
  number: {
    keyboardType: "numeric",
  },
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
  className,
  ...props
}: AppInputProps) {
  return (
    <TextInput
      {...typeProps[type]}
      {...props}
      className={`${styles.baseInput} ${styles.transition} ${className ?? ""}`}
    />
  );
}
