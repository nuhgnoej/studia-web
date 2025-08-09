// app/after-login/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";

export default function AfterLogin() {
  const { ready, user, isAdmin } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (next) router.replace(next);
    else router.replace(isAdmin ? "/admin" : "/dashboard");
  }, [ready, user, isAdmin, next, router]);

  return <LoadingIndicator />;
}
