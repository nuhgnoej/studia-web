// components/SocialLoginButtons.tsx
"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";

export default function SocialLoginButtons({
  onError,
}: {
  onError?: (msg: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
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
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-lg py-2 flex items-center justify-center space-x-2"
      >
        <img src="/logos/google.png" alt="Google" className="w-5 h-5" />
        <span className="text-sm text-gray-800 font-medium">
          Google로 로그인
        </span>
      </button>

      <button
        onClick={handleKakaoLogin}
        className="w-full bg-[#FEE500] hover:bg-[#ffdd00] text-black py-2 rounded-lg text-sm font-medium"
      >
        카카오로 로그인
      </button>

      <button
        onClick={handleNaverLogin}
        className="w-full bg-[#03C75A] hover:bg-[#02b14c] text-white py-2 rounded-lg text-sm font-medium"
      >
        네이버로 로그인
      </button>
    </div>
  );
}
