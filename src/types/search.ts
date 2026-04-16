export type SearchFilter = "Profils" | "Danses" | "Autre";

export type SearchProfileItem = {
  id: string;
  avatarUri: string;
  userName: string;
  stats: string;
};

export type SearchDanceItem = {
  id: string;
  title: string;
  imageUri: string;
};
