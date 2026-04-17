import type { ReactNode } from "react";
import { BottomBar } from "./bottom-bar";

type BottomActionBarProps = {
  children: ReactNode;
};

export function BottomActionBar({ children }: BottomActionBarProps) {
  return (
    <BottomBar paddingExtra={12} className="justify-center px-5">
      {children}
    </BottomBar>
  );
}
