// lib/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { QuizDataSchema } from "../schema";

const firebaseConfig = {
  apiKey: "AIzaSyBgS2-Ek5go3oQuRhcjoKlLe9e198nLEbI",
  authDomain: "studia-32dc7.firebaseapp.com",
  projectId: "studia-32dc7",
  storageBucket: "studia-32dc7.firebasestorage.app",
  messagingSenderId: "258669826284",
  appId: "1:258669826284:web:8f1877d8a20b3c8ba9d5c9",
  measurementId: "G-Z8FMQV0ME3",
};

// Initialize Firebase
export const app = getApps()[0] ?? initializeApp(firebaseConfig);

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
export const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: QuizDataSchema,
  },
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-northeast3");
