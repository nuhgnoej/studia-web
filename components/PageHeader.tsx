// components/PageHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type PageHeaderProps = {
  title: string;
};

export default function PageHeader({ title }: PageHeaderProps) {
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
    // ✅ 1. 모바일에서는 세로, 데스크톱에서는 가로로 배치
    <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      {/* 제목 */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>

      {/* ✅ 2. 사용자 정보 및 로그아웃 버튼을 현대적인 카드로 변경 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm w-full md:w-auto flex items-center gap-4">
        <div className="flex-grow">
          <p className="text-sm text-gray-500">환영합니다 👋</p>
          <p className="text-base font-semibold text-gray-900 truncate">
            {profile?.displayName || "사용자"} 님
          </p>
          <p className="text-xs text-gray-600 truncate">
            {user?.email || "email unknown"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex-shrink-0 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-200"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
