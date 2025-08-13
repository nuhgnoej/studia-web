import { useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";
import { ArchiveData } from "@/types/archive";
import { cardStyles } from "./Studio.styles";

// Props 타입을 명확히 정의합니다.
// 다운로드 성공 시 호출될 콜백 함수를 props로 받습니다.
interface ArchiveCardProps {
  archive: ArchiveData;
  onDownloadSuccess?: (downloadedData: any) => void;
}

// 아이콘 컴포넌트는 재사용을 위해 분리해두는 것이 좋습니다. (기존 코드와 동일)
const DownloadIcon = () => (
  <svg
    /* SVG 내용 */ className="h-4 w-4 mr-1 inline-block"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);
const QuestionIcon = () => (
  <svg
    /* SVG 내용 */ className="h-4 w-4 mr-1 inline-block"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const ArchiveCard = ({
  archive,
  onDownloadSuccess,
}: ArchiveCardProps) => {
  // 날짜 포맷팅 로직은 간결하게 유지합니다.
  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(archive.createdAt.toDate());

  // 카드 전체의 로딩 상태를 관리합니다.
  const [isLoading, setIsLoading] = useState(false);

  // 웹 환경에 맞는 다운로드 핸들러
  const handleDownload = async () => {
    // storagePath가 없으면 함수를 실행하지 않습니다.
    if (!archive.storagePath) {
      console.error("다운로드 경로를 찾을 수 없습니다.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Firebase Storage에서 파일의 다운로드 URL을 가져옵니다.
      const fileRef = ref(storage, archive.storagePath);
      const url = await getDownloadURL(fileRef);

      // 2. fetch API를 사용해 해당 URL에서 JSON 파일 내용을 직접 가져옵니다.
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`다운로드 서버 응답 오류: ${response.statusText}`);
      }
      const jsonData = await response.json();

      // 3. 가져온 데이터를 Blob으로 변환하고, 메모리에 링크를 생성하여 다운로드를 실행합니다.
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${archive.title}.json`; // 파일명 지정

      // 링크를 DOM에 추가했다가 제거하는 방식은 모든 브라우저에서 안정적으로 동작합니다.
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 메모리 누수 방지를 위해 생성된 URL을 해제합니다.
      URL.revokeObjectURL(blobUrl);

      // 4. 다운로드 성공 콜백이 있다면 실행합니다.
      if (onDownloadSuccess) {
        onDownloadSuccess(jsonData);
      }
    } catch (err) {
      console.error("다운로드 처리 중 오류가 발생했습니다.", err);
      // 사용자에게 오류를 알려주는 UI 로직을 추가할 수 있습니다. (예: alert, toast)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={cardStyles.card}>
      <h3 style={cardStyles.title}>{archive.title}</h3>
      <p style={cardStyles.description}>{archive.description}</p>
      <div style={cardStyles.metaContainer}>
        <span style={cardStyles.metaItem}>
          <QuestionIcon /> {archive.questionsCount} 문항
        </span>
        <span style={cardStyles.metaItem}>
          <DownloadIcon /> {archive.downloadCount}
        </span>
        <span style={cardStyles.metaItem}>업로더: {archive.uploader}</span>
      </div>
      <div style={cardStyles.footer}>
        <span>{formattedDate}</span>
        <button
          onClick={handleDownload}
          disabled={isLoading}
          style={cardStyles.downloadButton}
        >
          {isLoading ? "다운로드 중..." : "다운로드"}
        </button>
      </div>
    </div>
  );
};
