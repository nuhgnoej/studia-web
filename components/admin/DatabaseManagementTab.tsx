"use client";
import { useState } from "react";
import ArchiveList from "@/components/admin/ArchiveList";
import StorageUploader from "@/components/admin/StorageUploader";

export default function DatabaseManagementTab() {
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

  return (
    <div className="space-y-12">
      <StorageUploader triggerRefresh={triggerRefresh} />
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
  );
}
