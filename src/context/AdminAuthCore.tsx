import { createContext } from "react";
import { User } from "./types";

export interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, department: string) => Promise<boolean>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);
