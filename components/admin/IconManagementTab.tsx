// components/admin/IconManagementTab.tsx
"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface QTag {
  id: string;
  tagId: string;
  name_ko: string;
  name_en: string;
  iconURL: string;
  createdAt: any;
}

export default function IconManagementTab() {
  const [qTags, setQTags] = useState<QTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [koreanTag, setKoreanTag] = useState("");
  const [englishTag, setEnglishTag] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "qTags"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tagsData: QTag[] = [];
        querySnapshot.forEach((doc) => {
          tagsData.push({ id: doc.id, ...doc.data() } as QTag);
        });
        setQTags(tagsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching qTags: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("먼저 파일을 선택해주세요.");
      return;
    }
    if (!koreanTag || !englishTag) {
      alert("한글 및 영어 태그를 모두 입력해주세요.");
      return;
    }

    const file = selectedFile;
    const tagId = file.name.split(".").slice(0, -1).join(".");
    const storageRef = ref(storage, `qTagIcons/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "qTags"), {
          tagId: tagId,
          name_ko: koreanTag,
          name_en: englishTag,
          iconURL: downloadURL,
          createdAt: serverTimestamp(),
        });

        setUploading(false);
        setProgress(0);
        setKoreanTag("");
        setEnglishTag("");
        setSelectedFile(null);

        const fileInput = document.getElementById(
          "icon-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        alert("업로드가 완료되었습니다!");
      }
    );
  };

  const handleDelete = async (tag: QTag) => {
    if (!window.confirm(`'${tag.tagId}' 아이콘을 정말 삭제하시겠습니까?`))
      return;
    try {
      if (tag.iconURL) {
        const storageRef = ref(storage, tag.iconURL);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, "qTags", tag.id));
      alert("삭제가 완료되었습니다.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <section className="bg-slate-50 p-6 min-h-full">
      <div className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          새 아이콘 업로드
        </h2>

        <div className="space-y-4 mb-4">
          <input
            type="text"
            placeholder="한글 태그 (예: 리액트)"
            value={koreanTag}
            onChange={(e) => setKoreanTag(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          <input
            type="text"
            placeholder="영어 태그 (예: React)"
            value={englishTag}
            onChange={(e) => setEnglishTag(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <input
          type="file"
          id="icon-upload"
          accept="image/png"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor="icon-upload"
          className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm"
        >
          {selectedFile
            ? `선택된 파일: ${selectedFile.name}`
            : "1. PNG 파일 선택"}
        </label>

        <button
          onClick={handleFileUpload}
          disabled={uploading || !selectedFile || !koreanTag || !englishTag}
          className="ml-4 px-6 py-2.5 bg-blue-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "업로드 중..." : "2. 업로드 시작"}
        </button>

        {uploading && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <p className="text-sm text-center mt-1 text-gray-600">
              {progress}%
            </p>
          </div>
        )}
      </div>

      {/* 아이콘 목록 렌더링 (렌더링 부분만 새 구조에 맞게 수정) */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          아이콘 목록 ({qTags.length}개)
        </h2>
        {loading ? (
          <p>목록을 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {qTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-white rounded-2xl p-4 flex flex-col items-center justify-between shadow-[0px_8px_24px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow duration-300 aspect-square"
              >
                <div className="flex-grow flex items-center justify-center w-full">
                  {tag.iconURL ? (
                    <img
                      src={tag.iconURL}
                      alt={tag.name_ko}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-4xl">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="w-full text-center mt-3">
                  <p
                    className="font-semibold text-sm truncate w-full"
                    title={tag.name_ko}
                  >
                    {tag.name_ko} ({tag.name_en})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* Timestamp 객체를 날짜 문자열로 변환 */}
                    {tag.createdAt?.toDate().toLocaleDateString("ko-KR")}
                  </p>
                  <button
                    onClick={() => handleDelete(tag)}
                    className="mt-2 text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
