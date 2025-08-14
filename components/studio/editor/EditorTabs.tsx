import { useState } from "react";
import JsonEditor from "./JsonEditor";
import AIEditor from "./AIEditor";

export default function EditorTabs() {
  const [activeSubTab, setActiveSubTab] = useState("json");

  const EDITOR_TABS = [
    { id: "json", label: "JSON 수동 편집", component: <JsonEditor /> },
    { id: "ai", label: "AI 자동 생성", component: <AIEditor /> },
  ];

  return (
    <div>
      <div style={styles.subTabContainer}>
        {EDITOR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              ...styles.subTabButton,
              ...(activeSubTab === tab.id ? styles.activeSubTabButton : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{EDITOR_TABS.find((tab) => tab.id === activeSubTab)?.component}</div>
    </div>
  );
}

// --- 스타일 객체 (기존과 동일) ---
const styles: { [key: string]: React.CSSProperties } = {
  // 메인 탭 스타일
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #e0e0e0",
    marginBottom: "24px",
  },
  tabButton: {
    padding: "12px 20px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#5f6368",
    fontSize: "16px",
    fontWeight: 500,
    position: "relative",
    transition: "color 0.3s",
  },
  activeTabButton: {
    color: "#1a73e8",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3px",
    backgroundColor: "#1a73e8",
    borderRadius: "3px 3px 0 0",
  },
  tabContent: {
    padding: "16px 0",
  },
  // 하위 탭(Pill 스타일) 스타일
  subTabContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    paddingLeft: "4px",
  },
  subTabButton: {
    padding: "8px 16px",
    cursor: "pointer",
    borderColor: "#d2e3fc",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    color: "#3c4043",
    fontSize: "14px",
    transition: "background-color 0.3s, color 0.3s",
  },
  activeSubTabButton: {
    backgroundColor: "#e8f0fe",
    color: "#1967d2",
    borderColor: "#d2e3fc",
  },
};
