// components/SocialLoginButtons.tsx
"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { ensureUserDocument } from "@/lib/firestoreUtils";
import { useAuth } from "@/hooks/useAuth";

export default function SocialLoginButtons({
  onError,
}: {
  onError?: (msg: string) => void;
}) {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await ensureUserDocument();
      if (user?.uid) {
        await refreshProfile(user.uid);
      }
      router.push("/mid");
    } catch (err) {
      console.error(err);
      onError?.("Google 로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => alert("카카오 로그인 구현 예정");
  const handleNaverLogin = () => alert("네이버 로그인 구현 예정");

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-lg py-2 flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <img src="/logos/google.png" alt="Google" className="w-5 h-5" />
        <span className="text-sm text-gray-800 font-medium">
          Google로 로그인
        </span>
      </button>

      {/* Kakao */}
      <button
        onClick={handleKakaoLogin}
        className="w-full bg-[#FEE500] hover:bg-[#ffdd00] text-black rounded-lg py-2 flex items-center justify-center space-x-2"
      >
        <img src="/logos/kakao.png" alt="Kakao" className="w-5 h-5" />
        <span className="text-sm font-medium">카카오로 로그인</span>
      </button>

      {/* Naver */}
      <button
        onClick={handleNaverLogin}
        className="w-full bg-[#03C75A] hover:bg-[#02b14c] text-white rounded-lg py-2 flex items-center justify-center space-x-2"
      >
        <img src="/logos/naver.png" alt="Naver" className="w-5 h-5" />
        <span className="text-sm font-medium">네이버로 로그인</span>
      </button>
    </div>
  );
}
