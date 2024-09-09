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
  const { logMessage } = req.body;

  try {
    if (!logMessage) {
      return res.status(400).json({ error: "Log message is required" });
    }

    await addDoc(collection(db, "logs"), {
      message: logMessage,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Log added successfully" });
  } catch (error) {
    console.error("Error adding log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
