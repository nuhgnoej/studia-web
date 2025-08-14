"use client";

import { useState } from "react";
import { model } from "@/lib/firebase/firebase";
import getFinalPrompt from "@/lib/prompt";

// 1. 비용 계산을 위한 상수를 정의합니다.
const INPUT_PRICE_PER_1K_TOKENS_USD = 0.075;
const OUTPUT_PRICE_PER_1K_TOKENS_USD = 0.3;
const USD_TO_KRW_RATE = 1380;

interface TokenUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export default function AIEditor() {
  // 1. 상태 변수 재구성
  const [userInput, setUserInput] = useState("");
  const [resultText, setResultText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  // 2. 버튼 클릭 시 실행될 핸들러 함수 생성
  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput || isLoading) return;

    setIsLoading(true);
    setError("");
    setResultText("");
    setTokenUsage(null);
    setEstimatedCost(null);

    try {
      // 입력받은 prompt를 사용해 API 호출
      const finalPrompt = getFinalPrompt(userInput);
      const result = await model.generateContent(finalPrompt);
      console.dir(result);
      const response = result.response;
      const text = response.text();
      setResultText(text);
      if (response.usageMetadata) {
        const usage = response.usageMetadata;
        setTokenUsage({
          promptTokenCount: usage.promptTokenCount,
          candidatesTokenCount: usage.candidatesTokenCount,
          totalTokenCount: usage.totalTokenCount,
        });
        const inputCost =
          (usage.promptTokenCount / 1000) * INPUT_PRICE_PER_1K_TOKENS_USD;
        const outputCost =
          (usage.candidatesTokenCount / 1000) * OUTPUT_PRICE_PER_1K_TOKENS_USD;
        const totalCostUSD = inputCost + outputCost;
        const totalCostKRW = totalCostUSD * USD_TO_KRW_RATE;
        setEstimatedCost(totalCostKRW);
      }
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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
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
            {tokenUsage && (
              <>
                <div style={styles.tokenUsage}>
                  <span>입력: {tokenUsage.promptTokenCount}</span>
                  <span> | </span>
                  <span>출력: {tokenUsage.candidatesTokenCount}</span>
                  <span> | </span>
                  <strong>총합: {tokenUsage.totalTokenCount} 토큰</strong>
                </div>
                {estimatedCost !== null && (
                  <strong style={styles.costText}>
                    (약 ₩{Math.ceil(estimatedCost).toLocaleString()})
                  </strong>
                )}
              </>
            )}
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
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  tokenUsage: {
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#5f6368",
    backgroundColor: "#e8f0fe",
    padding: "4px 8px",
    borderRadius: "4px",
  },
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
  costText: {
    color: "#1a73e8", // 파란색으로 강조
    fontWeight: 600,
  },
};
