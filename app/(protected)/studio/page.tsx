"use client";
import React, { useState } from "react";
import JsonEditor from "@/components/studio/JsonEditor";
import PageHeader from "@/components/PageHeader";
import Community from "@/components/studio/Community";
import { ArchiveTabContent } from "@/components/studio/archive/ArchiveTabContent";

// --- 탭 데이터 구조 변경 ---
const TABS = [
  { id: "jsonEditor", label: "JSON 편집기", component: <JsonEditor /> },
  { id: "archive", label: "아카이브", component: <ArchiveTabContent /> },
  { id: "community", label: "커뮤니티", component: <Community /> },
];

// --- 스타일 객체 ---
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
    paddingLeft: "4px", // 전체적인 정렬을 위한 약간의 패딩
  },
  subTabButton: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid #dadce0",
    borderRadius: "20px", // Pill 모양
    backgroundColor: "#ffffff",
    color: "#3c4043",
    fontSize: "14px",
    transition: "background-color 0.3s, color 0.3s",
  },
  activeSubTabButton: {
    backgroundColor: "#e8f0fe", // 활성 하위 탭 배경색 (연한 파랑)
    color: "#1967d2", // 활성 하위 탭 글자색 (진한 파랑)
    borderColor: "#d2e3fc",
  },
};

export default function Studio() {
  const [activeTab, setActiveTab] = useState("jsonEditor");

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto">
      <PageHeader title="Studia for Web" />
      <div style={styles.tabContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.activeTabButton : {}),
            }}
          >
            {tab.label}
            {activeTab === tab.id && <div style={styles.activeTabIndicator} />}
          </button>
        ))}
      </div>
      <div style={styles.tabContent}>
        {TABS.find((tab) => tab.id === activeTab)?.component}
      </div>
    </main>
  );
}
