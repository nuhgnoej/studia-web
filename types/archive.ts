import { Timestamp } from "firebase-admin/firestore";

export type ArchiveItem = {
  id: string;
  title: string;
  uploader: string;
  description: string;
  questionsCount: number;
};

export interface ArchiveData {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  downloadCount: number;
  uploader: string;
  createdAt: Timestamp;
}
