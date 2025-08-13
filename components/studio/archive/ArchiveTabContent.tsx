import { useState } from "react";
import OfficialArchive from "../OfficialArchive";
import CommunityArchive from "../CommunityArchive";
import { styles } from "./Studio.styles";

export const ArchiveTabContent = () => {
  const [activeSubTab, setActiveSubTab] = useState("official");
  return (
    <div>
      <div style={styles.subTabContainer}>
        <button
          onClick={() => setActiveSubTab("official")}
          style={{
            ...styles.subTabButton,
            ...(activeSubTab === "official" ? styles.activeSubTabButton : {}),
          }}
        >
          오피셜 아카이브
        </button>
        <button
          onClick={() => setActiveSubTab("community")}
          style={{
            ...styles.subTabButton,
            ...(activeSubTab === "community" ? styles.activeSubTabButton : {}),
          }}
        >
          커뮤니티 아카이브
        </button>
      </div>
      {activeSubTab === "official" ? <OfficialArchive /> : <CommunityArchive />}
    </div>
  );
};
