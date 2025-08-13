import { ArchiveData } from "@/types/archive";
import { cardStyles } from "./Studio.styles";

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-1 inline-block"
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
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-1 inline-block"
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

export const ArchiveCard = ({ archive }: { archive: ArchiveData }) => {
  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(archive.createdAt.toDate());

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
        <button style={cardStyles.downloadButton}>다운로드</button>
      </div>
    </div>
  );
};

