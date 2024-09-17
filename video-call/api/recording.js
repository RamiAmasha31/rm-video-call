// api/recording.js

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";
import { AssemblyAI } from "assemblyai";

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
const storage = getStorage(firebaseApp);
// Initialize AssemblyAI
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});
/**
 * Handles the process of transcribing audio, generating a PDF of the transcription, and updating user logs in Firestore with the transcription URL.
 *
 * @function handler
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.callId - The ID of the call for which the transcription is being processed.
 * @param {string} req.body.url - The URL of the audio file to be transcribed.
 *
 * @returns {void} Returns a JSON response.
 * - **Success:**
 *   - Status 201 with a success message and the download URL of the generated PDF.
 * - **Errors:**
 *   - 400: When `callId` or `url` is missing.
 *   - 404: When the meeting with the given `callId` is not found.
 *   - 500: When the transcript data is invalid or an internal server error occurs.
 *
 * @throws {Object}
 * - 500: If there is an issue during transcription, PDF creation, file upload, or updating user logs.
 */
export default async function handler(req, res) {
  const { callId, url } = req.body;
  try {
    if (!callId || !url) {
      return res.status(400).json({ error: "Call ID and URL are required" });
    }

    // Parameters for transcription
    const params = {
      audio_url: url,
      speaker_labels: true,
    };
    const transcriptData = await client.transcripts.transcribe(params);

    // Check if utterances exist and is an array
    if (!Array.isArray(transcriptData.utterances)) {
      return res.status(500).json({ error: "Transcript data is invalid" });
    }

    // Create PDF
    const pdfDoc = new PDFDocument();
    const pdfBuffer = [];
    pdfDoc.on("data", (chunk) => pdfBuffer.push(chunk));
    pdfDoc.on("end", async () => {
      const pdfFile = Buffer.concat(pdfBuffer);

      // Upload PDF to Firebase Storage
      const storageRef = ref(
        storage,
        `transcriptions/transcription_${callId}.pdf`
      );
      await uploadBytes(storageRef, pdfFile, {
        contentType: "application/pdf",
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Get participants for the call
      const meetingQuery = query(
        collection(db, "meetings"),
        where("callId", "==", callId)
      );
      const meetingSnapshot = await getDocs(meetingQuery);

      if (meetingSnapshot.empty) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      const meetingData = meetingSnapshot.docs[0].data();
      const participants = meetingData.participants || [];

      // Update each participant's logs field in Firestore
      for (const userId of participants) {
        // Query for the user document
        const userQuery = query(
          collection(db, "users"),
          where("userId", "==", userId)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          const logs = userData.logs || [];

          // Add the download URL to the logs
          logs.push(downloadURL);

          await updateDoc(userDoc.ref, { logs });
        } else {
          console.warn(`User with ID ${userId} does not exist.`);
        }
      }

      // Respond with success
      res
        .status(201)
        .json({ success: "Recording data saved successfully", downloadURL });
    });

    pdfDoc.fontSize(12).text(`Transcription for Call ID: ${callId}`, {
      underline: true,
      align: "center",
    });
    pdfDoc.moveDown();

    // Add utterances to PDF
    for (let utterance of transcriptData.utterances) {
      pdfDoc
        .fontSize(10)
        .text(`Speaker ${utterance.speaker}: ${utterance.text}`, {
          align: "left",
        });
      pdfDoc.moveDown();
    }

    pdfDoc.end();
  } catch (error) {
    console.error("Error saving recording data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
