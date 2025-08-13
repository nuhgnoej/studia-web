import { db } from "@/lib/firebase/firebase"; // Firestore 인스턴스
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type ArchiveMeta = {
  title: string;
  uploader: string;
  description: string;
  questionsCount: number;
  storagePath: string;
};

export async function saveArchiveMetadata(meta: ArchiveMeta) {
  try {
    const docRef = await addDoc(collection(db, "communityArchives"), {
      ...meta,
      createdAt: serverTimestamp(),
      downloadCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("메타데이터 저장 실패:", error);
    throw error;
  }
}
