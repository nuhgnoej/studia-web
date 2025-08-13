// app/after-login/page.tsx
"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";

function AfterLoginInner() {
  const { ready, user, isAdmin } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  useEffect(() => {
    if (!ready) return;

    // 로그인 안 된 경우 → 홈으로
    if (!user) {
      router.replace("/");
      return;
    }

    // 오픈 리다이렉트 방지: 내부 경로만 허용
    const isSafe = next && next.startsWith("/") && !next.startsWith("//");

    // 자기 자신으로 이동 방지
    const isSelf = next === "/after-login";

    // 관리자가 아닌데 admin 페이지를 요청한 경우
    const wantsAdmin = next === "/admin";

    if (isSafe && !isSelf) {
      if (wantsAdmin && !isAdmin) {
        router.replace("/studio");
      } else {
        router.replace(next as string);
      }
    } else {
      router.replace(isAdmin ? "/admin" : "/studio");
    }
  }, [ready, user, isAdmin, next, router]);

  return <LoadingIndicator />;
}

export default function AfterLogin() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <AfterLoginInner />
    </Suspense>
  );
}
