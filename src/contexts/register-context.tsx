import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type RegisterData = {
  email: string;
  firstName: string;
  lastName: string;
  pseudo: string;
  birthDate: string;
  password: string;
};

type RegisterContextType = {
  data: RegisterData;
  update: (fields: Partial<RegisterData>) => void;
};

const RegisterContext = createContext<RegisterContextType | null>(null);

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegisterData>({
    email: "",
    firstName: "",
    lastName: "",
    pseudo: "",
    birthDate: "",
    password: "",
  });

  const update = (fields: Partial<RegisterData>) =>
    setData((prev) => ({ ...prev, ...fields }));

  return (
    <RegisterContext.Provider value={{ data, update }}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error("useRegister must be used within RegisterProvider");
  return ctx;
}
