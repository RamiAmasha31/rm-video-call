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
/**
 * Creates a new meeting and adds it to Firestore.
 *
 * @function handler
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.callId - The ID of the meeting to be created.
 * @param {string} req.body.userId - The ID of the user to be added as a participant.
 *
 * @returns {void} Returns a JSON response.
 * - **Success:**
 *   - Status 201 with the meeting details including `callId`, `type`, and `docId`.
 * - **Errors:**
 *   - 400: When `callId` or `userId` is missing.
 *   - 500: When an internal server error occurs.
 */
export default async function handler(req, res) {
  const { callId, userId } = req.body;
  try {
    if (!callId || !userId) {
      return res
        .status(400)
        .json({ error: "Call ID and User ID are required" });
    }

    const meeting = {
      callId,
      participants: [userId],
      type: "default",
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "meetings"), meeting);

    res
      .status(201)
      .json({ callDetails: { id: callId, type: "default", docId: docRef.id } });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
