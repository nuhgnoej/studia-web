import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";

export async function moveDocument(
  fromCollection: string,
  toCollection: string,
  docId: string
): Promise<void> {
  try {
    const fromRef = doc(db, fromCollection, docId);
    const toRef = doc(db, toCollection, docId);

    const snapshot = await getDoc(fromRef);
    if (!snapshot.exists()) {
      throw new Error("문서를 찾을 수 없습니다.");
    }

    const data = snapshot.data() as DocumentData;

    // 복사
    await setDoc(toRef, data);

    // 원본 삭제
    await deleteDoc(fromRef);

    console.log(`📁 ${fromCollection} → ${toCollection} 이동 완료`);
  } catch (err) {
    console.error("📛 문서 이동 실패:", err);
    throw err;
  }
}
