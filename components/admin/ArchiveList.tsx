// components/ArchiveList.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArchiveItem } from "@/types/archive";
import { moveDocument } from "@/lib/firebase/firestoreUtils";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();

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

  const handlePermanentDelete = async (item: ArchiveItem) => {
    if (
      !window.confirm(
        `정말로 '${item.title}' 파일을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    if (!user) {
      // 사용자 로그인 상태 확인
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 1. Storage에서 파일 삭제 (프록시 함수 호출)
      if (item.storagePath) {
        const token = await user.getIdToken(); // 사용자 인증 토큰 가져오기
        const encodedPath = encodeURIComponent(item.storagePath);

        // 👇 여기에 배포된 삭제 함수 URL을 입력하세요.
        const proxyUrl = `https://asia-northeast3-studia-32dc7.cloudfunctions.net/deleteStorageObject?filePath=${encodedPath}`;

        const response = await fetch(proxyUrl, {
          method: "DELETE", // 또는 'POST'
          headers: {
            Authorization: `Bearer ${token}`, // 헤더에 인증 토큰 추가
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Storage 파일 삭제에 실패했습니다."
          );
        }
      }

      // 2. Firestore에서 문서 삭제 (기존과 동일)
      await deleteDoc(doc(db, archivesProp, item.id));

      await fetchArchives();
      alert("영구 삭제되었습니다.");
    } catch (err: any) {
      alert(`영구 삭제 실패: ${err.message}`);
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
    <section className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 capitalize text-gray-800">
        {archivesProp} ({archives.length}개)
      </h2>

      {archives.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-2xl">😶</p>
          <p className="mt-2">등록된 문제세트가 없습니다.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archives.map((item) => (
            // ✅ 이 부분의 className을 수정했습니다.
            <li
              key={item.id}
              className="bg-white p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.1)] transition-shadow flex flex-col"
            >
              {/* 정보 영역 */}
              <div className="flex-grow">
                <p className="text-lg font-semibold text-gray-800 mb-1 break-words">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600">
                  업로더: <span className="font-medium">{item.uploader}</span>
                </p>
                <p className="text-sm text-gray-600">
                  문항 수: {item.questionsCount}
                </p>
                <p className="text-sm text-gray-700 mt-2 break-words">
                  {item.description}
                </p>
              </div>

              {/* 버튼 영역 */}
              <div className="border-t mt-3 pt-3 flex justify-end items-center gap-2">
                {/* 이동/복구 버튼 */}
                <button
                  onClick={() => handleMove(item.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                >
                  {moveButtonTextMap[archivesProp]}
                </button>

                {/* 삭제 버튼 */}
                {deleteButtonTextMap[archivesProp] && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
                  >
                    {deleteButtonTextMap[archivesProp]}
                  </button>
                )}

                {/* 영구 삭제 버튼 */}
                {archivesProp.startsWith("deleted") && (
                  <button
                    onClick={() => handlePermanentDelete(item)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    🔥 영구 삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
