import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { AssemblyAI } from "assemblyai";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { StreamChat } from "stream-chat";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiKey = "rgkeykz9gwms";
const apiSecret =
  "pdp3t3ctp7y2qnv2syhrxdta6fq2v2nruaadjrqgjync2auwbkrce8bp78a3ym6b";
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

const client = new AssemblyAI({
  apiKey: "1a5a346f633e470e9f016aa179de9fca",
});

const app = express();
const port = process.env.PORT || 3002;
app.use("/files", express.static(path.join(__dirname, "public")));

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Middleware to parse JSON bodies

const firebaseConfig = {
  apiKey: "AIzaSyB599j7kOPQ9mWNHUdx4hh8wdKyI5T-i1A",
  authDomain: "finalproject-56ffd.firebaseapp.com",
  projectId: "finalproject-56ffd",
  storageBucket: "finalproject-56ffd.appspot.com",
  messagingSenderId: "208463639673",
  appId: "1:208463639673:web:de2802c7be88673caf50a8",
  measurementId: "G-HV2K04FDW0",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Query Firestore for the user document based on email
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Assuming there's only one user document that matches the query
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const { password: hashedPassword, userId, token } = userData;

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return success response with user data
    res.status(200).json({ userId, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Hash the password before saving
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = email.split("@")[0];

    // Generate Stream token
    const tokenResponse = await serverClient.createToken(userId);

    // Save user details and token in Firebase Firestore
    await addDoc(collection(db, "users"), {
      userId,
      password: hashedPassword,
      email,
      token: tokenResponse,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Create meeting endpoint
app.post("/api/meeting", async (req, res) => {
  const { callId, userId } = req.body;
  try {
    if (!callId || !userId) {
      return res
        .status(400)
        .json({ error: "Call ID and User ID are required" });
    }

    const meeting = {
      callId,
      participants: [userId], // Initialize with the creator's ID
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
});

// Add participant to meeting endpoint
app.post("/api/meeting/add-participant", async (req, res) => {
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
});

// Fetch participants for a specific call ID
app.get("/api/meeting/:callId/participants", async (req, res) => {
  const { callId } = req.params;

  try {
    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
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
    const meetingData = meetingDoc.data();

    // Respond with the list of participants
    res.status(200).json(meetingData.participants || []);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/recording", async (req, res) => {
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

    // Fetch transcription
    const { id: transcriptId } = await client.transcripts.create(params);

    // Poll for transcription status until it's completed
    let transcriptStatus = "queued";
    let transcriptData;
    while (transcriptStatus === "queued" || transcriptStatus === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Polling interval
      transcriptData = await client.transcripts.get(transcriptId);
      transcriptStatus = transcriptData.status;
    }

    if (transcriptStatus === "failed") {
      return res.status(500).json({ error: "Error transcribing audio" });
    }

    // Create PDF
    const pdfDoc = new PDFDocument();
    const publicDir = path.join(process.cwd(), "public");
    const pdfPath = path.join(publicDir, `transcription_${callId}.pdf`);
    pdfDoc.pipe(fs.createWriteStream(pdfPath));

    pdfDoc.fontSize(12).text(`Transcription for Call ID: ${callId}`, {
      underline: true,
      align: "center",
    });
    pdfDoc.moveDown();

    // Add utterances to PDF
    for (const utterance of transcriptData.utterances) {
      pdfDoc
        .fontSize(10)
        .text(`Speaker ${utterance.speaker}: ${utterance.text}`, {
          align: "left",
        });
      pdfDoc.moveDown();
    }

    pdfDoc.end();

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

    // Update each participant's logs field
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

        // Add the transcription file path to the logs
        logs.push(`/transcription_${callId}.pdf`);

        await updateDoc(userDoc.ref, { logs });
      } else {
        console.warn(`User with ID ${userId} does not exist.`);
      }
    }

    // Respond with success
    res
      .status(201)
      .json({ success: "Recording data saved successfully", pdfPath });
  } catch (error) {
    console.error("Error saving recording data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Fetch logs for a specific user ID
app.get("/api/logs/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Query the Firestore for the user document
    const userQuery = query(
      collection(db, "users"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    // Assuming there's only one document with the matching userId
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const logs = userData.logs || [];

    // Respond with the list of log file paths
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT || 3002, () => {
  console.log(`Server running on port ${process.env.PORT || 3002}`);
});
