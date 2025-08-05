// types/userProfile.ts

export interface UserProfile {
  displayName: string;
  bio?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string; // or Timestamp
  isAdmin?: boolean;
}
