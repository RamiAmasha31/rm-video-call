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
import { v4 as uuidv4 } from "uuid"; // For unique job ID

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

export default async function handler(req, res) {
  const { callId, url } = req.body;

  if (!callId || !url) {
    return res.status(400).json({ error: "Call ID and URL are required" });
  }

  try {
    // Respond immediately
    res.status(202).json({ message: "Processing started", jobId: uuidv4() });

    // Process transcription and PDF generation asynchronously
    (async () => {
      try {
        // Parameters for transcription
        const params = {
          audio_url: url,
          speaker_labels: true,
        };

        // Start transcription
        const transcriptData = await client.transcripts.transcribe(params);

        if (!Array.isArray(transcriptData.utterances)) {
          throw new Error("Transcript data is invalid");
        }

        // Create PDF
        const pdfDoc = new PDFDocument();
        const pdfBuffer = [];
        pdfDoc.on("data", (chunk) => pdfBuffer.push(chunk));
        pdfDoc.on("end", async () => {
          try {
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

            // Update participants' logs in Firestore
            const meetingQuery = query(
              collection(db, "meetings"),
              where("callId", "==", callId)
            );
            const meetingSnapshot = await getDocs(meetingQuery);

            if (meetingSnapshot.empty) {
              throw new Error("Meeting not found");
            }

            const meetingData = meetingSnapshot.docs[0].data();
            const participants = meetingData.participants || [];

            for (const userId of participants) {
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

            console.log("Recording data saved successfully");
          } catch (err) {
            console.error("Error processing PDF or updating Firestore:", err);
          }
        });

        pdfDoc
          .fontSize(12)
          .text(`Transcription for Call ID: ${callId}`, {
            underline: true,
            align: "center",
          });
        pdfDoc.moveDown();

        for (const utterance of transcriptData.utterances) {
          pdfDoc
            .fontSize(10)
            .text(`Speaker ${utterance.speaker}: ${utterance.text}`, {
              align: "left",
            });
          pdfDoc.moveDown();
        }

        pdfDoc.end();
      } catch (err) {
        console.error("Error in transcription or PDF generation:", err);
      }
    })();
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
