export type ProfileTabKey = "performances" | "realisations" | "favorites";

export type ProfilePost = {
  id: string;
  title: string;
  category: ProfileTabKey;
  imageUri: string;
};

export type ProfileTab = {
  key: ProfileTabKey;
  label: string;
};
