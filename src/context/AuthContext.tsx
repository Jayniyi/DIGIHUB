import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../firebaseconfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as fbUpdatePassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// shape of the user object we expose
interface User {
  uid: string;
  email: string | null;
  role: "admin" | "user";
  fullName?: string;
  businessName?: string;
  phoneNumber?: string;
  adminRole?: string; // only present for admins
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    extras?: { fullName?: string; businessName?: string; phoneNumber?: string; role?: "admin" | "user"; adminRole?: string }
  ) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  signInWithPhone: (phone: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (current: string, next: string) => Promise<void>;
  updateProfile: (updates: { fullName?: string; businessName?: string; phoneNumber?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // helper to convert Firebase user + firestore doc -> our User
  const buildUser = async (fbUser: FirebaseUser): Promise<User> => {
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? (snap.data() as any) : {};
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      role: (data.role as "admin" | "user") || "user",
      fullName: data.fullName,
      businessName: data.businessName,
      phoneNumber: data.phoneNumber,
      adminRole: data.adminRole,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const u = await buildUser(fbUser);
          setUser(u);
        } catch (err) {
          console.error("failed to fetch user data", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (
    email: string,
    password: string,
    extras: { fullName?: string; businessName?: string; phoneNumber?: string; role?: "admin" | "user"; adminRole?: string } = {}
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    const userDoc = {
      email,
      role: extras.role || "user",
      fullName: extras.fullName || null,
      businessName: extras.businessName || null,
      phoneNumber: extras.phoneNumber || null,
      adminRole: extras.adminRole || null,
    };
    try {
      await setDoc(doc(db, "users", fbUser.uid), userDoc);
    } catch (err: any) {
      // log and rethrow so callers (like AdminAuthContext) can act accordingly
      console.error("failed to write user profile", err);
      throw err;
    }
    const u = await buildUser(fbUser);
    setUser(u);
    return u;
  };

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const u = await buildUser(cred.user);
    console.debug("signIn returned user", u);
    setUser(u);
    return u;
  };

  const signInWithPhone = async (phone: string) => {
    // invisible reCAPTCHA container must exist in the DOM (Auth page adds it)
    // RecaptchaVerifier typing can be strict; cast to any to avoid TS mismatch
    // invisible reCAPTCHA container must exist in the DOM (Auth page adds it)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const verifier = new (RecaptchaVerifier as any)("recaptcha-container", { size: "invisible" }, auth);
    const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
    const code = window.prompt("Enter the verification code sent to your phone");
    if (!code) throw new Error("Verification code required");
    const cred = await confirmation.confirm(code);
    const u = await buildUser(cred.user);
    setUser(u);
    return u;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const fbUser = cred.user;
    // if new user create a doc (additional fields will be collected later)
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { email: fbUser.email, role: "user", fullName: null, businessName: null, phoneNumber: null });
    }
    const u = await buildUser(fbUser);
    setUser(u);
    return u;
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    const cred = await signInWithPopup(auth, provider);
    const fbUser = cred.user;
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { email: fbUser.email, role: "user", fullName: null, businessName: null, phoneNumber: null });
    }
    const u = await buildUser(fbUser);
    setUser(u);
    return u;
  };

  const updatePassword = async (current: string, next: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("No authenticated user");
    }
    const cred = EmailAuthProvider.credential(auth.currentUser.email, current);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await fbUpdatePassword(auth.currentUser, next);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateProfile = async (updates: { fullName?: string; businessName?: string; phoneNumber?: string }) => {
    if (!user) throw new Error("Not authenticated");
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { ...updates }, { merge: true });
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signInWithPhone,
        resetPassword,
        updatePassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
