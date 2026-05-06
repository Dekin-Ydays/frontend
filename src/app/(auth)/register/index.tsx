import { Redirect } from "expo-router";
import type { Href } from "expo-router";

export default function RegisterIndex() {
  return <Redirect href={"/register/step-1" as Href} />;
}
