import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type BottomBarContextValue = {
  isVisible: boolean;
  hide: () => void;
  show: () => void;
};

const BottomBarContext = createContext<BottomBarContextValue>({
  isVisible: true,
  hide: () => {},
  show: () => {},
});

export function BottomBarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const hide = useCallback(() => setIsVisible(false), []);
  const show = useCallback(() => setIsVisible(true), []);

  return (
    <BottomBarContext.Provider value={{ isVisible, hide, show }}>
      {children}
    </BottomBarContext.Provider>
  );
}

export function useBottomBar() {
  return useContext(BottomBarContext);
}
