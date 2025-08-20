// components/admin/StorageUploader.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, functions } from "@/lib/firebase/firebase";
import { QuizData } from "@/types/question";
import { httpsCallable } from "firebase/functions";

// onCall 함수에 대한 참조 (기존과 동일)
const getUploadUrlCallable = httpsCallable<
  { fileName: string; contentType: string },
  { uploadUrl: string; storagePath: string }
>(functions, "getSignedUploadUrl");

type CollectionName = "officialArchives" | "communityArchives";

type Props = {
  triggerRefresh: (collectionName: CollectionName) => void;
};

export default function StorageUploader({ triggerRefresh }: Props) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [targetCollection, setTargetCollection] =
    useState<CollectionName>("communityArchives");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // ✅ 메시지 타입을 관리할 상태 추가
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMessage(""); // 새 파일 선택 시 메시지 초기화
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !user) {
      setMessage("파일을 선택하고 로그인 상태를 확인해주세요.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("업로드 중입니다...");
    setMessageType("info");

    try {
      // 1. 서명된 업로드 URL 요청
      const result = await getUploadUrlCallable({
        fileName: file.name,
        contentType: file.type,
      });
      const { uploadUrl, storagePath } = result.data;

      setMessage("파일 전송 시작...");

      // 2. Storage에 파일 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("파일 스토리지 업로드에 실패했습니다.");
      }

      setMessage("DB 정보 기록 중...");

      // 3. Firestore에 메타데이터 생성
      const fileContent = await file.text();
      const quizData: QuizData = JSON.parse(fileContent);
      const metadata = quizData.metadata;

      const docData = {
        title: metadata.title,
        description: metadata.description,
        questionsCount: metadata.num_questions,
        uploader: user.displayName || user.email,
        uploaderId: user.uid,
        storagePath: storagePath,
        createdAt: serverTimestamp(),
        downloadCount: 0,
      };

      await addDoc(collection(db, targetCollection), docData);

      setMessage(`✅ 성공! '${file.name}' 파일이 등록되었습니다.`);
      setMessageType("success");
      setFile(null);
      (e.target as HTMLFormElement).reset();
      triggerRefresh(targetCollection);
    } catch (err: any) {
      console.error("📛 업로드 실패:", err);
      setMessage(`❌ 오류: ${err.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 메시지 색상을 결정하는 헬퍼 객체
  const messageColor = {
    info: "text-gray-600",
    success: "text-green-600",
    error: "text-red-600",
  };

  return (
    // ✅ 1. 다른 관리 탭과 통일된 카드 디자인 적용
    <div className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        새 아카이브 업로드 (JSON)
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ✅ 2. 라디오 버튼 대신 Select 드롭다운으로 변경 */}
        <div>
          <label
            htmlFor="collection-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            업로드 위치
          </label>
          <select
            id="collection-select"
            value={targetCollection}
            onChange={(e) =>
              setTargetCollection(e.target.value as CollectionName)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="communityArchives">커뮤니티 아카이브</option>
            <option value="officialArchives">공식 아카이브</option>
          </select>
        </div>

        {/* ✅ 3. 파일 선택 버튼 UI 개선 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label
            htmlFor="file-upload"
            className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm text-center"
          >
            {file ? `선택: ${file.name}` : "JSON 파일 선택"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="submit"
            disabled={loading || !file}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "업로드"}
          </button>
        </div>
      </form>
      {/* ✅ 4. 메시지 색상 동적 변경 */}
      {message && (
        <p className={`mt-4 text-sm font-medium ${messageColor[messageType]}`}>
          {message}
        </p>
      )}
    </div>
  );
}
