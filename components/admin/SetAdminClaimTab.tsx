"use client";
import React, { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import { useWindowSize } from "@/hooks/useWindowSize";

// --- 타입 정의 ---
// 함수에 전달할 데이터 타입
interface GrantAdminRequest {
  email: string;
}
interface RevokeAdminRequest {
  uid: string;
}

// 함수로부터 받을 데이터 타입
interface FunctionResponse {
  message: string;
}

// 관리자 목록을 가져오는 함수로부터 받을 데이터 타입
interface AdminUser {
  uid: string;
  email: string;
  tokenIsAdmin: boolean;
  firestoreIsAdmin: boolean;
}

// --- Callable 함수 참조 생성 ---
const grantAdminCallable = httpsCallable<GrantAdminRequest, FunctionResponse>(
  functions,
  "setAdminClaim" // 기존 함수 이름 유지
);
const revokeAdminCallable = httpsCallable<RevokeAdminRequest, FunctionResponse>(
  functions,
  "revokeAdminClaim" // 새로 만들 함수
);
const listAdminsCallable = httpsCallable<void, AdminUser[]>(
  functions,
  "listAdminUsers" // 새로 만들 함수
);

// --- 스타일 객체 ---
const styles: { [key: string]: React.CSSProperties } = {
  // 전체 컨테이너 및 카드 스타일은 이전과 유사하게 유지
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
    maxWidth: "800px",
    margin: "0 auto 24px auto", // 카드 간 간격 추가
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
  inputGroup: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flexGrow: 1,
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
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
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#e0e0e0",
    cursor: "not-allowed",
  },
  message: {
    marginTop: "20px",
    fontSize: "14px",
    minHeight: "20px",
    textAlign: "center",
  },
  messageSuccess: { color: "#1e8e3e" },
  messageError: { color: "#d93025" },
  // 테이블 스타일
  tableContainer: {
    marginTop: "24px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
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
  },
  statusIndicator: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  statusSuccess: { backgroundColor: "#1e8e3e" },
  statusMismatch: { backgroundColor: "#f9ab00" }, // 노란색 경고
  revokeButton: {
    backgroundColor: "#d93025",
    padding: "8px 16px",
  },
};

const mobileStyles: { [key: string]: React.CSSProperties } = {
  container: { padding: "16px" },
  card: { padding: "20px" },
  title: { fontSize: "20px" },
  inputGroup: { flexDirection: "column" },
  button: { width: "100%" },
  th: { padding: "8px", fontSize: "10px" },
  td: { padding: "8px", fontSize: "12px" },
};

export default function AdminManagementTab() {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  // --- 상태 관리 ---
  const [email, setEmail] = useState("");
  const [grantMessage, setGrantMessage] = useState("");
  const [grantMessageType, setGrantMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [isGranting, setIsGranting] = useState(false);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // --- 데이터 로딩 ---
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsListLoading(true);
      setListError("");
      try {
        const result = await listAdminsCallable();
        setAdmins(result.data);
      } catch (error: any) {
        console.error("관리자 목록 로딩 실패:", error);
        setListError("관리자 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsListLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // --- 핸들러 함수 ---
  const handleGrantAdmin = async () => {
    if (!email) {
      setGrantMessage("이메일을 입력해주세요.");
      setGrantMessageType("error");
      return;
    }
    setIsGranting(true);
    setGrantMessage("관리자 권한을 부여하는 중입니다...");
    setGrantMessageType("");

    try {
      const result = await grantAdminCallable({ email });
      setGrantMessage(result.data.message);
      setGrantMessageType("success");
      // 성공 시 목록 새로고침
      const updatedAdmins = await listAdminsCallable();
      setAdmins(updatedAdmins.data);
    } catch (error: any) {
      setGrantMessage(`오류: ${error.message}`);
      setGrantMessageType("error");
    } finally {
      setIsGranting(false);
      setEmail("");
    }
  };

  const handleRevokeAdmin = async (uid: string) => {
    if (admins.length <= 1) {
      alert("최소 한 명의 관리자 계정은 존재해야 합니다.");
      return;
    }

    if (!window.confirm("정말로 이 사용자의 관리자 권한을 회수하시겠습니까?")) {
      return;
    }

    try {
      await revokeAdminCallable({ uid });
      setAdmins(admins.filter((admin) => admin.uid !== uid));
      alert("권한이 성공적으로 회수되었습니다.");
    } catch (error: any) {
      console.error("권한 회수 실패:", error);
      alert(`오류 발생: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isMobile ? mobileStyles.container : {}),
      }}
    >
      {/* 권한 부여 카드 */}
      <div style={{ ...styles.card, ...(isMobile ? mobileStyles.card : {}) }}>
        <h1
          style={{ ...styles.title, ...(isMobile ? mobileStyles.title : {}) }}
        >
          관리자 권한 부여
        </h1>
        <p style={styles.description}>
          사용자 이메일을 입력하여 관리자(admin) 역할을 부여합니다.
        </p>
        <div
          style={{
            ...styles.inputGroup,
            ...(isMobile ? mobileStyles.inputGroup : {}),
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="사용자 이메일"
            style={styles.input}
            disabled={isGranting}
          />
          <button
            onClick={handleGrantAdmin}
            disabled={isGranting}
            style={{
              ...styles.button,
              ...(isGranting ? styles.buttonDisabled : {}),
              ...(isMobile ? mobileStyles.button : {}),
            }}
          >
            {isGranting ? "처리 중..." : "권한 부여"}
          </button>
        </div>
        {grantMessage && (
          <p
            style={{
              ...styles.message,
              ...(grantMessageType === "success" ? styles.messageSuccess : {}),
              ...(grantMessageType === "error" ? styles.messageError : {}),
            }}
          >
            {grantMessage}
          </p>
        )}
      </div>

      {/* 관리자 목록 카드 */}
      <div style={{ ...styles.card, ...(isMobile ? mobileStyles.card : {}) }}>
        <h1
          style={{ ...styles.title, ...(isMobile ? mobileStyles.title : {}) }}
        >
          관리자 목록
        </h1>
        <p style={styles.description}>
          현재 관리자 권한을 가진 사용자 목록입니다.
        </p>
        <div style={styles.tableContainer}>
          {isListLoading ? (
            <p>목록을 불러오는 중입니다...</p>
          ) : listError ? (
            <p style={styles.messageError}>{listError}</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th
                    style={{
                      ...styles.th,
                      ...(isMobile ? mobileStyles.th : {}),
                    }}
                  >
                    Email
                  </th>
                  {/* ✅ 모바일에선 UID 컬럼 숨기기 */}
                  {!isMobile && <th style={styles.th}>UID</th>}
                  <th
                    style={{
                      ...styles.th,
                      ...(isMobile ? mobileStyles.th : {}),
                    }}
                  >
                    상태
                  </th>
                  <th
                    style={{
                      ...styles.th,
                      ...(isMobile ? mobileStyles.th : {}),
                    }}
                  >
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.uid}>
                    <td
                      style={{
                        ...styles.td,
                        ...(isMobile ? mobileStyles.td : {}),
                      }}
                    >
                      {admin.email}
                    </td>
                    {/* ✅ 모바일에선 UID 컬럼 숨기기 */}
                    {!isMobile && <td style={styles.td}>{admin.uid}</td>}
                    <td
                      style={{
                        ...styles.td,
                        ...(isMobile ? mobileStyles.td : {}),
                      }}
                    >
                      {/* 토큰/DB 상태를 하나로 합쳐서 간소화 */}
                      <span
                        style={{
                          ...styles.statusIndicator,
                          ...(admin.tokenIsAdmin && admin.firestoreIsAdmin
                            ? styles.statusSuccess
                            : styles.statusMismatch),
                        }}
                      ></span>
                      {admin.tokenIsAdmin && admin.firestoreIsAdmin
                        ? "일치"
                        : "불일치"}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...(isMobile ? mobileStyles.td : {}),
                      }}
                    >
                      <button
                        onClick={() => handleRevokeAdmin(admin.uid)}
                        style={{ ...styles.button, ...styles.revokeButton }}
                      >
                        회수
                      </button>
                    </td>
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
