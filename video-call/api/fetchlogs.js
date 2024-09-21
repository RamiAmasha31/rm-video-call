// api/fetchLogs.js

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

/**
 * API handler function to fetch user logs from Firebase Firestore.
 *
 * This function handles incoming API requests to fetch logs for a specific user
 * based on the provided `userId`. It retrieves the user document from the Firestore
 * collection and returns the logs associated with that user.
 *
 * @param {Object} req - The request object, containing query parameters.
 * @param {Object} res - The response object used to send back the result.
 *
 * @returns {Object} - A JSON response containing the logs or an error message.
 *
 * @throws {Object} - If the user ID is not provided or the user is not found,
 *                     the response will include a 400 or 404 status code respectively.
 *                     In case of an internal server error, a 500 status code with
 *                     error details will be returned.
 */
export default async function handler(req, res) {
  const { userId } = req.query;
  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userQuery = query(
      collection(db, "users"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const logs = userData.logs || [];

    // Map logs to include both URL and createdAt timestamp
    const formattedLogs = logs.map((log) => ({
      url: log.url,
      createdAt: log.createdAt,
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
