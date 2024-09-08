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

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 3002;
app.use(express.static(path.join(__dirname, "public")));

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Middleware to parse JSON bodies

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

    // Fetch meeting details
    const meetingQuery = query(
      collection(db, "meetings"),
      where("callId", "==", callId)
    );
    const querySnapshot = await getDocs(meetingQuery);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const meetingDoc = querySnapshot.docs[0];
    const meetingRef = meetingDoc.ref;
    const meetingData = meetingDoc.data();
    const recordings = meetingData.recordings || [];

    // Add new recording
    recordings.push(url);
    await updateDoc(meetingRef, { recordings });

    res.status(200).json({ success: "Recording added successfully" });
  } catch (error) {
    console.error("Error adding recording:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
