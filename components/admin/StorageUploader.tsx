"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // 사용자 정보를 가져오기 위함
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage, functions } from "@/lib/firebase/firebase";
import { QuizData } from "@/types/question";
import { httpsCallable } from "firebase/functions";

// onCall 함수에 대한 참조를 생성합니다.
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !user) {
      setMessage("파일을 선택하고 로그인 상태를 확인해주세요.");
      return;
    }

    setLoading(true);
    setMessage("업로드 중입니다...");

    try {
      // 1. (onCall) 서명된 업로드 URL을 요청합니다.
      const result = await getUploadUrlCallable({
        fileName: file.name,
        contentType: file.type,
      });
      const { uploadUrl, storagePath } = result.data;

      setMessage("업로드 URL 수신 완료, 파일 전송 시작...");

      // 2. (fetch) 받아온 URL로 파일을 직접 Storage에 업로드합니다.
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("파일 스토리지 업로드에 실패했습니다.");
      }

      setMessage("파일 업로드 완료, DB 정보 기록 중...");

      // 3. Firestore에 메타데이터 문서 생성 (이전과 거의 동일)
      const fileContent = await file.text();
      const quizData: QuizData = JSON.parse(fileContent);
      const metadata = quizData.metadata;

      const docData = {
        title: metadata.title,
        description: metadata.description,
        questionsCount: metadata.num_questions,
        uploader: user.displayName || user.email,
        uploaderId: user.uid,
        storagePath: storagePath, // 함수로부터 받은 경로 사용
        createdAt: serverTimestamp(),
        downloadCount: 0,
      };

      await addDoc(collection(db, targetCollection), docData);

      setMessage(`✅ 성공! '${file.name}' 파일이 등록되었습니다.`);
      setFile(null);
      (e.target as HTMLFormElement).reset();
      triggerRefresh(targetCollection);
    } catch (err: any) {
      console.error("📛 업로드 실패:", err);
      setMessage(`❌ 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-gray-50 border rounded-xl mb-12">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        새 아카이브 업로드
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            JSON 파일 선택
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-700">
            업로드 위치
          </span>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="communityArchives"
                checked={targetCollection === "communityArchives"}
                onChange={(e) =>
                  setTargetCollection(e.target.value as CollectionName)
                }
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">커뮤니티</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="officialArchives"
                checked={targetCollection === "officialArchives"}
                onChange={(e) =>
                  setTargetCollection(e.target.value as CollectionName)
                }
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">공식</span>
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "업로드"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </section>
  );
}
