import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default async function handler(req, res) {
  const { callId, recordingUrl } = req.body;

  try {
    if (!callId || !recordingUrl) {
      return res
        .status(400)
        .json({ error: "Call ID and Recording URL are required" });
    }

    await addDoc(collection(db, "recordings"), {
      callId,
      recordingUrl,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Recording added successfully" });
  } catch (error) {
    console.error("Error adding recording:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
