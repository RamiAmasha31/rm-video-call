import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
  const { callId } = req.query;

  try {
    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
    }

    const meetingQuery = query(
      collection(db, "meetings"),
      where("callId", "==", callId)
    );
    const querySnapshot = await getDocs(meetingQuery);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const meetingDoc = querySnapshot.docs[0];
    const meetingData = meetingDoc.data();

    res.status(200).json(meetingData.participants || []);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
