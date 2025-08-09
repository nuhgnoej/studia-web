// app/(protected)/layout.tsx
"use client";

import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router]);

  if (!ready || !user) return <LoadingIndicator />;

  return <>{children}</>;
}
