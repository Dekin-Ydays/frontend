import { Redirect } from "expo-router";
import type { Href } from "expo-router";

export default function FeedIndex() {
  return <Redirect href={"/feed/for-you" as Href} />;
}
