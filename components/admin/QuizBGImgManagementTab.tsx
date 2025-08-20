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
  bgId: string; // 파일명 기반 고유 ID
  name_ko: string;
  name_en: string;
  imageURL: string; // iconURL -> imageURL로 변경
  createdAt: any; // Timestamp 타입
}

export default function QuizBGImgManagementTab() {
  const [backgrounds, setBackgrounds] = useState<QuizBG[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [koreanName, setKoreanName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Firestore에서 배경 이미지 목록 실시간 데이터 가져오기
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

  // 파일 업로드 핸들러
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("먼저 파일을 선택해주세요.");
      return;
    }
    if (!koreanName || !englishName) {
      alert("한글 및 영어 이름을 모두 입력해주세요.");
      return;
    }

    const file = selectedFile;
    const bgId = file.name.split(".").slice(0, -1).join(".");
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
        await addDoc(collection(db, "quizBackgrounds"), {
          bgId: bgId,
          name_ko: koreanName,
          name_en: englishName,
          imageURL: downloadURL,
          createdAt: serverTimestamp(),
        });

        setUploading(false);
        setProgress(0);
        setKoreanName("");
        setEnglishName("");
        setSelectedFile(null);
        const fileInput = document.getElementById('bg-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        alert("업로드가 완료되었습니다!");
      }
    );
  };

  // 배경 이미지 삭제 핸들러
  const handleDelete = async (bg: QuizBG) => {
    if (!window.confirm(`'${bg.name_ko}' 이미지를 정말 삭제하시겠습니까?`)) return;
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
    <section className="bg-slate-50 p-6 min-h-full">
      <div className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          새 배경 이미지 업로드
        </h2>
        
        <div className="space-y-4 mb-4">
          <input
            type="text"
            placeholder="한글 이름 (예: 우주 풍경)"
            value={koreanName}
            onChange={(e) => setKoreanName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          <input
            type="text"
            placeholder="영어 이름 (예: Space Landscape)"
            value={englishName}
            onChange={(e) => setEnglishName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>

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
          className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm"
        >
          {selectedFile ? `선택된 파일: ${selectedFile.name}` : "1. 이미지 파일 선택"}
        </label>

        <button
          onClick={handleFileUpload}
          disabled={uploading || !selectedFile || !koreanName || !englishName}
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

      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          배경 이미지 목록 ({backgrounds.length}개)
        </h2>
        {loading ? (
          <p>목록을 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className="bg-white rounded-2xl p-4 flex flex-col justify-between shadow-[0px_8px_24px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow duration-300"
              >
                {/* 배경 이미지는 16:9 비율이 적합 */}
                <div className="w-full aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden">
                  {bg.imageURL ? (
                    <img
                      src={bg.imageURL}
                      alt={bg.name_ko}
                      className="w-full h-full object-cover" // contain -> cover로 변경
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="w-full text-center">
                  <p className="font-semibold text-sm truncate w-full" title={bg.name_ko}>
                    {bg.name_ko} ({bg.name_en})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {bg.createdAt?.toDate().toLocaleDateString("ko-KR")}
                  </p>
                  <button
                    onClick={() => handleDelete(bg)}
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