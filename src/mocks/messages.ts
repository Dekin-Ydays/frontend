import type { MessageListItemProps } from "@/components/messages/message-list-item";
import { MOCK_AVATARS } from "./avatars";

/** Données de prévisualisation pour la liste des conversations */
export const MOCK_CONVERSATIONS: Omit<MessageListItemProps, "onPress">[] = [
  {
    avatarUri: MOCK_AVATARS[0],
    userName: "Jean-Baptiste Sainte-Beuve",
    messagePreview: "A partagé une vidéo avec vous...",
    isOnline: true,
  },
  {
    avatarUri: MOCK_AVATARS[1],
    userName: "Maxou le fou",
    messagePreview: "Hey broo alors le 6?",
  },
  {
    avatarUri: MOCK_AVATARS[2],
    userName: "Quantix",
    messagePreview: "OUH OUH AHAH",
  },
  {
    avatarUri: MOCK_AVATARS[0],
    userName: "Jean-Baptiste Sainte-Beuve",
    messagePreview: "A partagé une vidéo avec vous...",
  },
  {
    avatarUri: MOCK_AVATARS[1],
    userName: "Maxou le fou",
    messagePreview: "Hey broo alors le 6?",
  },
  {
    avatarUri: MOCK_AVATARS[2],
    userName: "Quantix",
    messagePreview: "OUH OUH AHAH",
  },
  {
    avatarUri: MOCK_AVATARS[0],
    userName: "Jean-Baptiste Sainte-Beuve",
    messagePreview: "A partagé une vidéo avec vous...",
    isOnline: true,
  },
  {
    avatarUri: MOCK_AVATARS[1],
    userName: "Maxou le fou",
    messagePreview: "Hey broo alors le 6?",
  },
  {
    avatarUri: MOCK_AVATARS[2],
    userName: "Quantix",
    messagePreview: "OUH OUH AHAH",
  },
];
