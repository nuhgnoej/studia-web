import { db } from "@/lib/firebase/firebase";
import { ArchiveData } from "@/types/archive";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ArchiveCard } from "./ArchiveCard";
import { cardStyles } from "./Studio.styles";
import { useAuth } from "@/context/AuthContext";

export const ArchiveList = ({ collectionName }: { collectionName: string }) => {
  const { user } = useAuth();

  const [archives, setArchives] = useState<ArchiveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const archivesData = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ArchiveData)
        );
        setArchives(archivesData);
      } catch (err) {
        console.error(`Firestore fetch error from ${collectionName}:`, err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchArchives();
    } else {
      setLoading(false);
      setArchives([]);
    }
  }, [collectionName, user]);

  if (loading) return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (archives.length === 0) return <p>아카이브가 없습니다.</p>;

  return (
    <div style={cardStyles.grid}>
      {archives.map((archive) => (
        <ArchiveCard key={archive.id} archive={archive} />
      ))}
    </div>
  );
};
