// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const router = useRouter();
  const { logout, user, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  return (
    <div className="flex justify-between p-4">
      <p>{user?.email || "email unknown"}</p>
      <p>{profile?.displayName || "unknown"}</p>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-red-500 border px-3 py-1 rounded"
      >
        로그아웃
      </button>
    </div>
  );
}
