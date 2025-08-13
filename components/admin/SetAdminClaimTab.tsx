"use client";
import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase"; // functions 인스턴스 경로

// 함수에 전달할 데이터의 타입
interface RequestData {
  email: string;
}

// 함수로부터 받을 데이터의 타입
interface ResponseData {
  message: string;
}

// Callable 함수 참조 생성 (타입 적용)
const setAdminClaimCallable = httpsCallable<RequestData, ResponseData>(
  functions,
  "setAdminClaim"
);

// 스타일 객체
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    // backgroundColor: "#f7f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0px 16px 40px rgba(0, 0, 0, 0.2)",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#202124",
    marginBottom: "8px",
  },
  description: {
    fontSize: "14px",
    color: "#5f6368",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    marginBottom: "16px",
    boxSizing: "border-box", // 패딩과 보더가 너비에 포함되도록 설정
  },
  button: {
    backgroundColor: "#1a73e8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.3s, box-shadow 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#e0e0e0",
    cursor: "not-allowed",
  },
  message: {
    marginTop: "20px",
    fontSize: "14px",
    minHeight: "20px", // 메시지 영역 높이 고정
  },
  messageSuccess: {
    color: "#1e8e3e", // Green
  },
  messageError: {
    color: "#d93025", // Red
  },
};

export default function SetAdminClaimTab() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSetAdmin = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("관리자 권한을 부여하는 중입니다...");
    setMessageType("");

    try {
      const result = await setAdminClaimCallable({ email });
      setMessage(`성공: ${result.data.message}`);
      setMessageType("success");
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
      setMessageType("error");
      console.error("관리자 권한 부여 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>관리자 권한 부여</h1>
        <p style={styles.description}>
          사용자 이메일을 입력하여 관리자(admin) 역할을 부여합니다.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="사용자 이메일"
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={handleSetAdmin}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? "처리 중..." : "권한 부여"}
        </button>
        <p
          style={{
            ...styles.message,
            ...(messageType === "success" ? styles.messageSuccess : {}),
            ...(messageType === "error" ? styles.messageError : {}),
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
