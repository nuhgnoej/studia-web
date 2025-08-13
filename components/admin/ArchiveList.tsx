// components/ArchiveList.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { ArchiveItem } from "@/types/archive";
import { moveDocument } from "@/lib/firebase/firestoreUtils";

type CollectionName =
  | "officialArchives"
  | "communityArchives"
  | "deletedOfficialArchives"
  | "deletedCommunityArchives";

type Props = {
  archivesProp: CollectionName;
  refreshKey: number;
  triggerRefresh: (collectionName: CollectionName) => void;
};

const moveButtonTextMap: Record<string, string> = {
  communityArchives: "📤 공식으로 이동",
  officialArchives: "📤 커뮤니티로 이동",
  deletedCommunityArchives: "↩️ 커뮤니티로 복구",
  deletedOfficialArchives: "↩️ 공식으로 복구",
};

const deleteButtonTextMap: Record<string, string> = {
  communityArchives: "🗑️ 삭제",
  officialArchives: "🗑️ 삭제",
};

export default function ArchiveList({
  archivesProp,
  refreshKey,
  triggerRefresh,
}: Props) {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, archivesProp));
      const items: ArchiveItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ArchiveItem, "id">),
      }));
      setArchives(items);
    } catch (err) {
      console.error("📛 Firestore fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [refreshKey]);

  const handleMove = async (id: string) => {
    let toCollection: string;

    switch (archivesProp) {
      case "communityArchives":
        toCollection = "officialArchives";
        break;
      case "officialArchives":
        toCollection = "communityArchives";
        break;
      case "deletedCommunityArchives":
        toCollection = "communityArchives";
        break;
      case "deletedOfficialArchives":
        toCollection = "officialArchives";
        break;
      default:
        alert("이동 대상 컬렉션을 찾을 수 없습니다.");
        return;
    }

    try {
      await moveDocument(archivesProp, toCollection, id);
      await fetchArchives();
      triggerRefresh(toCollection as CollectionName);
    } catch (err) {
      alert("문서 이동 실패");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    let toCollection: string;

    switch (archivesProp) {
      case "communityArchives":
        toCollection = "deletedCommunityArchives";
        break;
      case "officialArchives":
        toCollection = "deletedOfficialArchives";
        break;
      default:
        alert("영구 삭제는 firebase 콘솔에서..");
        return;
    }

    try {
      await moveDocument(archivesProp, toCollection, id);
      // setArchives((prev) => prev.filter((a) => a.id !== id));
      await fetchArchives();
      triggerRefresh(toCollection as CollectionName);
    } catch (err) {
      alert("문서 이동 실패");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-600 animate-pulse py-6">
        📦 문제세트 불러오는 중...
      </div>
    );
  }

  return (
    <section className="mt-8 mb-12">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 capitalize text-gray-800">
        {archivesProp}
      </h2>

      {archives.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-2xl">😶</p>
          <p className="mt-2">등록된 문제세트가 없습니다.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {archives.map((item) => (
            <li
              key={item.id}
              className="relative p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              {/* 버튼 영역 */}
              <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                <button
                  onClick={() => handleMove(item.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {moveButtonTextMap[archivesProp]}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  {deleteButtonTextMap[archivesProp]}
                </button>
              </div>

              <p className="text-lg font-semibold text-gray-800 mb-1">
                {item.title}
              </p>
              <p className="text-sm text-gray-600">
                업로더: <span className="font-medium">{item.uploader}</span>
              </p>
              <p className="text-sm text-gray-600">
                문항 수: {item.questionsCount}
              </p>
              <p className="text-sm text-gray-700 mt-2">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
