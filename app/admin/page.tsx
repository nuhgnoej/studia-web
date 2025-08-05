// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import ArchiveList from "@/components/ArchiveList";
import LogoutButton from "@/components/Logout";
import LoadingIndicator from "@/components/LoadingIndicator";

const ADMIN_EMAIL = "admin@example.com";

export default function HomePage() {
  const router = useRouter();
  const auth = getAuth();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [refreshFlags, setRefreshFlags] = useState({
    officialArchives: 0,
    communityArchives: 0,
    deletedOfficialArchives: 0,
    deletedCommunityArchives: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const triggerRefresh = (collectionName: keyof typeof refreshFlags) => {
    setRefreshFlags((prev) => ({
      ...prev,
      [collectionName]: prev[collectionName] + 1,
    }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);

      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        router.replace("/login");
        return;
      }

      setUser(user);
      setAuthorized(true);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingIndicator />;
  }
  if (!authorized) {
    return <p className="p-8 text-gray-600">인증 확인 중...</p>;
  }

  return (
    <main className="p-8">
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
