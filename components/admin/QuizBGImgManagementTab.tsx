// components/admin/QuizBGImgManagementTab.tsx
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

// 배경 이미지 문서의 타입을 정의합니다.
interface QuizBG {
  id: string; // Firestore 문서 ID
  imageURL: string;
  createdAt: any; // Timestamp 타입
  tag_ko?: string;
  tag_en?: string;
  tag_ko_lowercase?: string;
  tag_en_lowercase?: string;
}

export default function QuizBGImgManagementTab() {
  const [backgrounds, setBackgrounds] = useState<QuizBG[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [koreanTag, setKoreanTag] = useState("");
  const [englishTag, setEnglishTag] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "quizBackgrounds"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const backgroundsData: QuizBG[] = [];
        querySnapshot.forEach((doc) => {
          backgroundsData.push({ id: doc.id, ...doc.data() } as QuizBG);
        });
        setBackgrounds(backgroundsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching quiz backgrounds: ", error);
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
    if (!koreanTag && !englishTag) {
      alert("한글 또는 영어 태그 중 하나 이상을 입력해주세요.");
      return;
    }

    const file = selectedFile;
    const storageRef = ref(storage, `quizBackgrounds/${file.name}`);
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

        const docData: { [key: string]: any } = {
          imageURL: downloadURL,
          createdAt: serverTimestamp(),
        };

        if (koreanTag) {
          docData.tag_ko = koreanTag;
          docData.tag_ko_lowercase = koreanTag.toLowerCase();
        }
        if (englishTag) {
          docData.tag_en = englishTag;
          docData.tag_en_lowercase = englishTag.toLowerCase();
        }

        await addDoc(collection(db, "quizBackgrounds"), docData);

        setUploading(false);
        setProgress(0);
        setKoreanTag("");
        setEnglishTag("");
        setSelectedFile(null);
        const fileInput = document.getElementById(
          "bg-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        alert("업로드가 완료되었습니다!");
      }
    );
  };

  const handleDelete = async (bg: QuizBG) => {
    const tagName = bg.tag_ko || bg.tag_en || "이름 없는 이미지";
    if (!window.confirm(`'${tagName}' 이미지를 정말 삭제하시겠습니까?`)) return;
    try {
      if (bg.imageURL) {
        const storageRef = ref(storage, bg.imageURL);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, "quizBackgrounds", bg.id));
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
    <section className="bg-slate-50 p-4 md:p-6 min-h-full">
      <div className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] mb-8 max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          새 배경 이미지 업로드
        </h2>

        <div className="space-y-4 mb-4">
          <input
            type="text"
            placeholder="한글 태그 (선택)"
            value={koreanTag}
            onChange={(e) => setKoreanTag(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          <input
            type="text"
            placeholder="영어 태그 (선택)"
            value={englishTag}
            onChange={(e) => setEnglishTag(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="file"
            id="bg-upload"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="bg-upload"
            className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm text-center"
          >
            {selectedFile
              ? `선택된 파일: ${selectedFile.name}`
              : "1. 이미지 파일 선택"}
          </label>

          <button
            onClick={handleFileUpload}
            disabled={uploading || !selectedFile || (!koreanTag && !englishTag)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? "업로드 중..." : "2. 업로드 시작"}
          </button>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center mt-1 text-gray-600">
              {progress}%
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          배경 이미지 목록 ({backgrounds.length}개)
        </h2>
        {loading ? (
          <p>목록을 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className="relative rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow duration-300 overflow-hidden aspect-[2/3]"
              >
                {bg.imageURL ? (
                  <img
                    src={bg.imageURL}
                    alt={bg.tag_ko || bg.tag_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100 text-slate-400">
                    🖼️
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                  <div className="text-white [text-shadow:0_1px_3px_rgb(0,0,0,0.5)]">
                    <p
                      className="font-bold text-base truncate"
                      title={bg.tag_ko || bg.tag_en}
                    >
                      {bg.tag_ko || ""} ({bg.tag_en || ""})
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      {bg.createdAt?.toDate().toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(bg)}
                    className="mt-3 self-start text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors pointer-events-auto"
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
