// components/admin/FeedbackBoardTab.tsx
"use client";

import { db } from "@/lib/firebase/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import LoadingIndicator from "../LoadingIndicator";

// --- 타입 정의 ---
interface Feedback {
  id: string;
  text: string;
  userId: string | null;
  createdAt: Timestamp;
  platform: string;
  appVersion: string;
}

export default function FeedbackBoardTab() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const feedbackCollectionRef = collection(db, "feedback");
        const q = query(feedbackCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const feedbackList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Feedback[];

        setFeedbacks(feedbackList);
      } catch (e: any) {
        console.error("Error fetching documents: ", e);
        setError("피드백 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <section className="bg-slate-50 p-4 md:p-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            사용자 피드백 목록
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            앱 사용자들이 남긴 피드백을 최신순으로 확인합니다.
          </p>
        </div>

        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] p-6 flex flex-col"
              >
                {/* 피드백 내용 */}
                <p className="text-gray-800 text-base mb-4 flex-grow whitespace-pre-wrap break-words">
                  {feedback.text}
                </p>

                {/* 메타 정보 */}
                <div className="border-t border-gray-200 pt-4 mt-auto text-xs text-gray-500 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">작성일</span>
                    <span>{feedback.createdAt.toDate().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">플랫폼</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {feedback.platform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">앱 버전</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {feedback.appVersion}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">
                      사용자 ID
                    </span>
                    <span
                      className="truncate max-w-[150px]"
                      title={feedback.userId || "N/A"}
                    >
                      {feedback.userId || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
