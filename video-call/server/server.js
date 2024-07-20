const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} = require("firebase/firestore");

const app = express();
const port = process.env.PORT || 3002;

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

    // Query Firestore for the user document based on email and password
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", email),
      where("password", "==", password)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Assuming there's only one user document that matches the query
    const userData = querySnapshot.docs[0].data();
    const { userId, token } = userData;

    // Return success response with user data
    res.status(200).json({ userId, token });
  } catch (error) {
    console.error("Error during login:", error);
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
  const { meetingId, userId } = req.body;
  try {
    if (!meetingId || !userId) {
      return res
        .status(400)
        .json({ error: "Meeting ID and User ID are required" });
    }

    const meetingRef = doc(db, "meetings", meetingId);
    const meetingDoc = await getDoc(meetingRef);

    if (!meetingDoc.exists()) {
      return res.status(404).json({ error: "Meeting not found" });
    }

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

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
