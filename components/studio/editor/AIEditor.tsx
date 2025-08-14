"use client";

import { useState } from "react";
import { model } from "@/lib/firebase/firebase";

export default function AIEditor() {
  // 1. 상태 변수 재구성
  const [prompt, setPrompt] = useState(""); // 사용자가 입력할 프롬프트를 위한 상태
  const [resultText, setResultText] = useState(""); // API 결과 텍스트를 위한 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. 버튼 클릭 시 실행될 핸들러 함수 생성
  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지
    if (!prompt || isLoading) return; // 프롬프트가 없거나 로딩 중이면 실행 안 함

    setIsLoading(true);
    setError("");
    setResultText(""); // 이전 결과 지우기

    try {
      // 입력받은 prompt를 사용해 API 호출
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setResultText(text); // 결과를 상태에 저장
    } catch (e: any) {
      setError("콘텐츠 생성에 실패했습니다: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. UI 구조 변경
  return (
    <div>
      <h2>AI 자동 생성</h2>
      <p>
        원하는 내용을 입력하고 버튼을 누르면 AI가 JSON 형식으로 문제를 생성해
        줍니다.
      </p>

      {/* 입력을 위한 폼 요소 추가 */}
      <form onSubmit={handleGenerate} style={styles.form}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="여기에 변환하고 싶은 학습 내용을 입력하세요..."
          style={styles.textarea}
          disabled={isLoading}
        />
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? "생성 중..." : "JSON 생성"}
        </button>
      </form>

      {/* 결과 표시 영역 */}
      <div style={styles.resultContainer}>
        {isLoading && <p>AI가 열심히 작업 중입니다...</p>}
        {error && <p style={styles.errorText}>{error}</p>}
        {resultText && (
          <div>
            <h3>생성된 JSON 결과:</h3>
            <pre style={styles.pre}>
              <code>{JSON.stringify(JSON.parse(resultText), null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },
  textarea: {
    width: "100%",
    minHeight: "150px",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  button: {
    alignSelf: "flex-start",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#1a73e8",
    color: "white",
    cursor: "pointer",
  },
  resultContainer: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f7f9fc",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    minHeight: "100px",
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid #e0e0e0",
  },
  errorText: {
    color: "#d93025",
  },
};
