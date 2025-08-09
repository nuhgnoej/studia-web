// app/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { useAuth } from "@/context/AuthContext";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const { ready, user } = useAuth();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 경우 우회
  useEffect(() => {
    if (!ready) return;
    if (user) {
      router.replace(
        next ? `/after-login?next=${encodeURIComponent(next)}` : "/after-login"
      );
    }
  }, [ready, user, next, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, pw);
      // ✅ 로그인 성공 시 next 전달
      router.replace(
        next ? `/after-login?next=${encodeURIComponent(next)}` : "/after-login"
      );
    } catch (err) {
      console.error(err);
      setError("로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          🔐 Studia 로그인
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />

          <button
            onClick={handleLogin}
            disabled={loading || !email || !pw}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "로그인"
            )}
          </button>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                또는 소셜 로그인
              </span>
            </div>
          </div>

          <SocialLoginButtons onError={setError} />
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
