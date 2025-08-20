"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/PageHeader";

import SetAdminClaimTab from "@/components/admin/SetAdminClaimTab";
import DatabaseManagementTab from "@/components/admin/DatabaseManagementTab";
import FeedbackBoardTab from "@/components/admin/FeedbackBoardTab";
import IconManagementTab from "@/components/admin/IconManagementTab";
import QuizBGImgManagementTab from "@/components/admin/QuizBGImgManagementTab";

// 탭 버튼 스타일 (예시)
const tabStyles = {
  base: "px-4 py-2 font-semibold border-b-2 transition-colors duration-200",
  active: "border-blue-500 text-blue-600",
  inactive: "border-transparent text-gray-500 hover:text-gray-700",
};

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, ready } = useAuth();
  const [activeTab, setActiveTab] = useState("dbManagement");

  useEffect(() => {
    if (ready && !isAdmin) {
      router.replace("/studio");
    }
  }, [ready, isAdmin, router]);

  if (!ready || !isAdmin) {
    return <LoadingIndicator />;
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <PageHeader title="📊 관리자 대시보드" />

      {/* 탭 네비게이션 */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("dbManagement")}
            className={`${tabStyles.base} ${
              activeTab === "dbManagement"
                ? tabStyles.active
                : tabStyles.inactive
            }`}
          >
            데이터베이스 관리
          </button>
          <button
            onClick={() => setActiveTab("setAdmin")}
            className={`${tabStyles.base} ${
              activeTab === "setAdmin" ? tabStyles.active : tabStyles.inactive
            }`}
          >
            관리자 권한 설정
          </button>
          <button
            onClick={() => setActiveTab("feedbackboard")}
            className={`${tabStyles.base} ${
              activeTab === "feedbackboard"
                ? tabStyles.active
                : tabStyles.inactive
            }`}
          >
            유저 피드백 게시판
          </button>
          <button
            onClick={() => setActiveTab("iconManagement")}
            className={`${tabStyles.base} ${
              activeTab === "iconManagement"
                ? tabStyles.active
                : tabStyles.inactive
            }`}
          >
            아이콘 이미지 관리
          </button>
          <button
            onClick={() => setActiveTab("quizBGImgManagement")}
            className={`${tabStyles.base} ${
              activeTab === "quizBGImgManagement"
                ? tabStyles.active
                : tabStyles.inactive
            }`}
          >
            퀴즈 백그라운드 이미지 관리
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === "dbManagement" && <DatabaseManagementTab />}
        {activeTab === "setAdmin" && <SetAdminClaimTab />}
        {activeTab === "feedbackboard" && <FeedbackBoardTab />}
        {activeTab === "iconManagement" && <IconManagementTab />}
        {activeTab === "quizBGImgManagement" && <QuizBGImgManagementTab />}
      </div>
    </main>
  );
}
