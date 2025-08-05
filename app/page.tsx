// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingIndicator from "@/components/LoadingIndicator";
import LogoutButton from "@/components/Logout";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isLoggedIn, isAdmin } = useAuth();

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn) {
      setRedirecting(true);
      router.replace("/login");
      return;
    }

    if (isAdmin) {
      setRedirecting(true);
      router.replace("/admin");
      return;
    }
  }, [loading, isLoggedIn, isAdmin, router]);

  if (loading || redirecting) return <LoadingIndicator />;
  if (!isLoggedIn || isAdmin) return null; // 분기 처리 중

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Studia 홈페이지</h1>
        <h2>Welcome, {user?.email}</h2>
        <h2>Welcome, {user?.displayName}</h2>
        <LogoutButton />
      </div>

      <div className="space-y-12">추후 구현 예정...</div>
    </main>
  );
}
