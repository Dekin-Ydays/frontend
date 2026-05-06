import { AppText } from "@/components/ui/app-text";

type ChatTimestampProps = {
  time: string;
};

export function ChatTimestamp({ time }: ChatTimestampProps) {
  return (
    <AppText variant="secondaryText" className="text-right text-xs">
      {time}
    </AppText>
  );
}
