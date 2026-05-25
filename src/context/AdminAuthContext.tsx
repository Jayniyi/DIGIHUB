import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { AdminAuthContext } from "./AdminAuthCore";

// we now rely on Firebase auth and a `role` field stored in Firestore

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, signIn, signUp, logout: baseLogout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // whenever our generic user changes, compute admin status
  useEffect(() => {
    setIsAuthenticated(user?.role === "admin");
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const u = await signIn(email, password);
      if (u.role !== "admin") {
        // immediately sign the user back out, they are not permitted here
        await baseLogout();
        console.warn("user logged in but is not admin", u);
        return false;
      }
      return true;
    } catch (e: any) {
      console.error("admin login failed", e);
      return false;
    }
  };

  const register = async (email: string, password: string, department: string) => {
    try {
      // first create the account; we need to be authenticated to query for
      // existing CEO documents, otherwise the pre‑check would throw a
      // permission error when run anonymously.
      const u = await signUp(email, password, { role: "admin", adminRole: department });

      // after signup we are authenticated as the new admin; perform the CEO
      // uniqueness check now that reads will succeed. If we discover another
      // CEO (other than ourselves) we throw and allow caller to deal with it.
      if (department === "CEO") {
        const q = query(
          collection(db, "users"),
          where("role", "==", "admin"),
          where("adminRole", "==", "CEO")
        );
        const snap = await getDocs(q);
        const others = snap.docs.filter((d) => d.id !== u.uid);
        if (others.length > 0) {
          // rollback: remove the user we just created so there isn't a stray
          // admin account with CEO role. We don't have direct access to the
          // auth admin SDK here, so just sign them out and leave the Firestore
          // document; you may want a Cloud Function to clean this up.
          await baseLogout();
          throw new Error("A CEO account already exists");
        }
      }

      return u.role === "admin";
    } catch (e) {
      console.error("admin registration error", e);
      return false;
    }
  };

  const logout = () => {
    // simply call the shared logout; onAuth state listener in AuthContext
    // will clear the `user` and trigger isAuthenticated update.
    baseLogout();
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, login, logout, register }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

