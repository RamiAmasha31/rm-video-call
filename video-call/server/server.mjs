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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import necessary functions from Firebase Storage
import { AssemblyAI } from "assemblyai";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize StreamChat
const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);
// console.log(process.env.FIREBASE_API_KEY);
// Initialize AssemblyAI
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 3002;
app.use(express.static(path.join(__dirname, "../dist")));

// Configure CORS
app.use(
  cors({
    origin: "*", // Allow all origins, or specify the domain if you want to restrict
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp); // Initialize Firebase Storage

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
    console.log(userData);
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
});

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

    // Respond with the list of download URLs
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT || 3002, () => {
  console.log(`Server running on port ${process.env.PORT || 3002}`);
});
