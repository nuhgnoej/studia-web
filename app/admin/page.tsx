// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveList from "@/components/ArchiveList";
import LogoutButton from "@/components/Logout";
// import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";

const ADMIN_EMAIL = "admin@example.com";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [refreshFlags, setRefreshFlags] = useState({
    officialArchives: 0,
    communityArchives: 0,
    deletedOfficialArchives: 0,
    deletedCommunityArchives: 0,
  });

  const triggerRefresh = (collectionName: keyof typeof refreshFlags) => {
    setRefreshFlags((prev) => ({
      ...prev,
      [collectionName]: prev[collectionName] + 1,
    }));
  };

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      router.replace("/");
      return;
    }
  }, []);

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 관리자 대시보드</h1>
        <LogoutButton />
      </div>

      <div className="space-y-12">
        <ArchiveList
          archivesProp="officialArchives"
          refreshKey={refreshFlags.officialArchives}
          triggerRefresh={triggerRefresh}
        />
        <ArchiveList
          archivesProp="communityArchives"
          refreshKey={refreshFlags.communityArchives}
          triggerRefresh={triggerRefresh}
        />
        <ArchiveList
          archivesProp="deletedOfficialArchives"
          refreshKey={refreshFlags.deletedOfficialArchives}
          triggerRefresh={triggerRefresh}
        />
        <ArchiveList
          archivesProp="deletedCommunityArchives"
          refreshKey={refreshFlags.deletedCommunityArchives}
          triggerRefresh={triggerRefresh}
        />
      </div>
    </main>
  );
}
