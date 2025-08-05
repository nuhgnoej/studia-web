// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingIndicator from "@/components/LoadingIndicator";
import LogoutButton from "@/components/Logout";

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    } else if (isAdmin === true) {
      router.replace("/admin");
    } else if (isAdmin === false) {
      setLoading(false);
    }
  }, [user, isAdmin]);

  if (loading) return <LoadingIndicator />;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Studia 홈페이지</h1>
        <LogoutButton />
      </div>

      <div className="space-y-12">추후 구현 예정...</div>
    </main>
  );
}
