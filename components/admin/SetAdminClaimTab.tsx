"use client";
import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase"; // 위에서 설정한 functions 인스턴스

// 함수에 전달할 데이터의 타입
interface RequestData {
  email: string;
}

// 함수로부터 받을 데이터의 타입
interface ResponseData {
  message: string;
}

// 클라이언트 측에서 함수를 호출할 때 사용하는 Callable 함수 참조를 생성합니다.
const setAdminClaimCallable = httpsCallable<RequestData, ResponseData>(functions, "setAdminClaim");

export default function SetAdminClaimTab() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const handleSetAdmin = async () => {
    setMessage("관리자 권한 부여 중...");
    try {
      // 클라우드 함수 호출
      const result = await setAdminClaimCallable({ email });
      setMessage(`성공: ${result.data.message}`);
    } catch (error: any) {
      // 권한 없음 등의 오류 처리
      setMessage(`오류: ${error.message}`);
      console.error("관리자 권한 부여 실패:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>관리자 권한 부여</h1>
      <p>특정 사용자에게 관리자 권한을 부여합니다.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="사용자 이메일 입력"
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleSetAdmin}>권한 부여</button>
      <p>{message}</p>
    </div>
  );
}
