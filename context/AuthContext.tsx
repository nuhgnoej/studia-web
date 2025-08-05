// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types/userProfile";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (u) => {
  //     setUser(u);
  //     setLoading(true);

  //     if (u) {
  //       try {
  //         const docRef = doc(db, "Users", u.uid);
  //         const docSnap = await getDoc(docRef);

  //         if (docSnap.exists()) {
  //           setProfile(docSnap.data() as UserProfile);
  //           setIsAdmin(profile?.isAdmin === true);
  //         } else {
  //           setProfile(null);
  //           setIsAdmin(false);
  //         }
  //       } catch (err) {
  //         console.error("프로필 로딩 오류:", err);
  //         setProfile(null);
  //       }
  //     } else {
  //       setProfile(null);
  //     }

  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("🔔 인증 상태 변경:", u?.uid || "로그아웃됨");
      setUser(u);
      setLoading(true);

      if (u) {
        try {
          const docRef = doc(db, "users", u.uid);
          const docSnap = await getDoc(docRef);
          console.log("📄 Firestore 응답:", docSnap.exists());

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            console.log("✅ 사용자 프로필 로드 성공:", data);
            setProfile(data);
            setIsAdmin(data.isAdmin === true);
          } else {
            console.warn("❌ 사용자 프로필 없음 (Users 문서 존재하지 않음)");
            setProfile(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("🔥 Firestore에서 프로필 로딩 실패:", err);
          setProfile(null);
          setIsAdmin(false);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isLoggedIn: !loading && user !== null,
        isAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
