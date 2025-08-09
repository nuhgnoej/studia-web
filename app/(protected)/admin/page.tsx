// app/(protected)/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveList from "@/components/ArchiveList";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/PageHeader";

export default function HomePage() {
  const router = useRouter();
  const { isAdmin, ready } = useAuth();

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
    if (!ready) return;
    if (isAdmin !== true) {
      router.replace("/dashboard");
      return;
    }
  }, [ready, isAdmin, router]);

  if (!ready) {
    return <LoadingIndicator />;
  }
  if (!ready || isAdmin !== true) return <LoadingIndicator />;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <PageHeader title="📊 관리자 대시보드" />

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
