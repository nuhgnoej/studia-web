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

// ✅ 1. 인터페이스를 최종 데이터 구조에 맞게 수정
interface QTag {
  id: string;
  tag_ko?: string;
  tag_en?: string;
  tag_ko_lowercase?: string;
  tag_en_lowercase?: string;
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
    if (!koreanTag && !englishTag) {
      alert("한글 또는 영어 태그 중 하나 이상을 입력해주세요.");
      return;
    }

    const file = selectedFile;
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

        const docData: { [key: string]: any } = {
          iconURL: downloadURL,
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

        await addDoc(collection(db, "qTags"), docData);

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
    // ✅ 2. 올바른 필드 이름을 사용하도록 수정
    const tagName = tag.tag_ko || tag.tag_en || "이름 없는 태그";
    if (!window.confirm(`'${tagName}' 아이콘을 정말 삭제하시겠습니까?`)) return;
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
    <section className="bg-slate-50 p-4 md:p-6 min-h-full">
      <div className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] mb-8 max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          새 아이콘 업로드
        </h2>

        {/* --- 태그 입력 및 버튼 부분 (기존과 동일) --- */}
        <div className="space-y-4 mb-4">{/*...*/}</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/*...*/}
        </div>

        {/* ✅ 3. 프로그레스 바의 JSX 구조 수정 */}
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
          아이콘 목록 ({qTags.length}개)
        </h2>
        {loading ? (
          <p>목록을 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {qTags.map((tag) => (
              <div
                key={tag.id}
                className="relative bg-white rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow duration-300 overflow-hidden aspect-square"
              >
                {/* 배경 아이콘 */}
                {tag.iconURL ? (
                  <img
                    src={tag.iconURL}
                    alt={tag.tag_ko || tag.tag_en} // ✅ 올바른 필드 이름 사용
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100 rounded-lg text-slate-400">
                    🖼️
                  </div>
                )}
                {/* 정보 오버레이 */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                  <div className="text-white [text-shadow:0_1px_3px_rgb(0,0,0,0.5)]">
                    <p
                      className="font-bold text-sm truncate"
                      title={tag.tag_ko || tag.tag_en}
                    >
                      {/* ✅ 올바른 필드 이름 사용 */}
                      {tag.tag_ko || ""} ({tag.tag_en || ""})
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      {tag.createdAt?.toDate().toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(tag)}
                    className="mt-2 self-start text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors pointer-events-auto"
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
