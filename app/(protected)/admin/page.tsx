// // app/(protected)/admin/page.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import ArchiveList from "@/components/ArchiveList";
// import LoadingIndicator from "@/components/LoadingIndicator";
// import { useAuth } from "@/context/AuthContext";
// import PageHeader from "@/components/PageHeader";

// export default function AdminPage() {
//   const router = useRouter();
//   const { isAdmin, ready } = useAuth();

//   const [refreshFlags, setRefreshFlags] = useState({
//     officialArchives: 0,
//     communityArchives: 0,
//     deletedOfficialArchives: 0,
//     deletedCommunityArchives: 0,
//   });

//   const triggerRefresh = (collectionName: keyof typeof refreshFlags) => {
//     setRefreshFlags((prev) => ({
//       ...prev,
//       [collectionName]: prev[collectionName] + 1,
//     }));
//   };

//   useEffect(() => {
//     if (!ready) return;
//     if (isAdmin !== true) {
//       router.replace("/dashboard");
//       return;
//     }
//   }, [ready, isAdmin, router]);

//   if (!ready) {
//     return <LoadingIndicator />;
//   }
//   if (!ready || isAdmin !== true) return <LoadingIndicator />;

//   return (
//     <main className="p-8 max-w-5xl mx-auto">
//       <PageHeader title="📊 관리자 대시보드" />

//       <div className="space-y-12">
//         <ArchiveList
//           archivesProp="officialArchives"
//           refreshKey={refreshFlags.officialArchives}
//           triggerRefresh={triggerRefresh}
//         />
//         <ArchiveList
//           archivesProp="communityArchives"
//           refreshKey={refreshFlags.communityArchives}
//           triggerRefresh={triggerRefresh}
//         />
//         <ArchiveList
//           archivesProp="deletedOfficialArchives"
//           refreshKey={refreshFlags.deletedOfficialArchives}
//           triggerRefresh={triggerRefresh}
//         />
//         <ArchiveList
//           archivesProp="deletedCommunityArchives"
//           refreshKey={refreshFlags.deletedCommunityArchives}
//           triggerRefresh={triggerRefresh}
//         />
//       </div>
//     </main>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/PageHeader";

import SetAdminClaimTab from "@/components/admin/SetAdminClaimTab";
import DatabaseManagementTab from "@/components/admin/DatabaseManagementTab";

// 탭 버튼 스타일 (예시)
const tabStyles = {
  base: "px-4 py-2 font-semibold border-b-2 transition-colors duration-200",
  active: "border-blue-500 text-blue-600",
  inactive: "border-transparent text-gray-500 hover:text-gray-700",
};

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, ready } = useAuth();
  const [activeTab, setActiveTab] = useState("dbManagement"); // 'dbManagement' or 'setAdmin'

  // 관리자 권한 확인 로직은 그대로 유지
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
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === "dbManagement" && <DatabaseManagementTab />}
        {activeTab === "setAdmin" && <SetAdminClaimTab />}
      </div>
    </main>
  );
}
