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
      router.push("/");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded border mb-6">
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">환영합니다 👋</p>
        <p className="text-lg font-semibold text-gray-800">
          {profile?.displayName || "사용자"} 님
        </p>
        <p className="text-sm text-gray-600">
          {user?.email || "email unknown"}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-red-500 border px-3 py-1 rounded"
      >
        로그아웃
      </button>
    </div>
  );
}
