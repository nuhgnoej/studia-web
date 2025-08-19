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

// --- 스타일 객체 ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: "#f7f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: "24px",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0px 16px 40px rgba(0, 0, 0, 0.1)",
    maxWidth: "1200px", // 너비를 조금 더 넓게 조정
    margin: "0 auto",
    width: "100%",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#202124",
    marginBottom: "8px",
    textAlign: "center",
  },
  description: {
    fontSize: "14px",
    color: "#5f6368",
    marginBottom: "24px",
    textAlign: "center",
  },
  tableContainer: {
    marginTop: "24px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    tableLayout: "fixed", // 테이블 레이아웃 고정
  },
  th: {
    padding: "12px 16px",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
    color: "#5f6368",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
    fontSize: "14px",
    color: "#3c4043",
    // 대부분의 셀에서 줄바꿈 방지
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis", // 내용이 넘칠 경우 ...으로 표시
  },
  // 내용(text) 셀 전용 스타일
  contentCell: {
    whiteSpace: "pre-wrap", // 줄바꿈 허용
    wordBreak: "break-word",
  },
};

export default function FeedbackBoardTab() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null); // 함수 시작 시 에러 초기화
      try {
        // 'createdAt' 필드를 기준으로 내림차순(최신순)으로 정렬하는 쿼리를 추가했습니다.
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>사용자 피드백 목록</h1>
        <p style={styles.description}>
          앱 사용자들이 남긴 피드백을 최신순으로 확인합니다.
        </p>
        <div style={styles.tableContainer}>
          {error ? (
            <p style={{ textAlign: "center", color: "#d93025" }}>{error}</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "10px" }}>No.</th>
                  <th style={{ ...styles.th, width: "100%" }}>내용</th>
                  <th style={{ ...styles.th, width: "190px" }}>작성일</th>
                  <th style={{ ...styles.th, width: "80px" }}>플랫폼</th>
                  <th style={{ ...styles.th, width: "70px" }}>앱 버전</th>
                  <th style={{ ...styles.th, width: "240px" }}>사용자 ID</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback, index) => (
                  <tr key={feedback.id}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={{ ...styles.td, ...styles.contentCell }}>
                      {feedback.text}
                    </td>
                    <td style={styles.td}>
                      {feedback.createdAt.toDate().toLocaleString()}
                    </td>
                    <td style={styles.td}>{feedback.platform}</td>
                    <td style={styles.td}>{feedback.appVersion}</td>
                    <td style={styles.td}>{feedback.userId || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
