// api/add-participant.js

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
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
/**
 * Adds a participant to a meeting by updating the participants list in Firestore.
 *
 * @function handler
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.callId - The ID of the meeting to which the participant will be added.
 * @param {string} req.body.userId - The ID of the user to be added as a participant.
 *
 * @returns {void} Returns a JSON response.
 *
 * @throws {Object}
 * - 400: When `callId` or `userId` is missing.
 * - 404: When the meeting with the given `callId` is not found.
 * - 500: When an internal server error occurs.
 */

export default async function handler(req, res) {
  const { callId, userId } = req.body;
  try {
    if (!callId || !userId) {
      return res
        .status(400)
        .json({ error: "Call ID and User ID are required" });
    }

    // Search for the document where callId matches
    const meetingQuery = query(
      collection(db, "meetings"),
      where("callId", "==", callId)
    );
    const querySnapshot = await getDocs(meetingQuery);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Assuming there's only one document with the matching callId
    const meetingDoc = querySnapshot.docs[0];
    const meetingRef = meetingDoc.ref;
    const meetingData = meetingDoc.data();
    const participants = meetingData.participants || [];

    // Avoid duplicate entries
    if (!participants.includes(userId)) {
      participants.push(userId);
      await updateDoc(meetingRef, { participants });
    }

    res.status(200).json({ success: "Participant added successfully" });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
